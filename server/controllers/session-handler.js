
/**
 *  @module			controllers/SessionHandler
 *  @description	Handles user login to the MUD, registers new users, emails reset password on request
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

module.exports = (function(){

	var extend = require('extend'),
		Class = require('class.extend'),
		_ = require('lodash'),
		bcrypt = require('bcrypt'),
		nodemailer = require('nodemailer'),
		passwordGen = require('password-generator'),
		config = require('../config/env'),
		dict = require('../dict/user-session'),
		db = require('./db'),
		globalEvents = require('./global-events'),
		NewUserRegistration = require('./new-user-registration');


	var SessionHandler = Class.extend({

		/**
		 * socket.io client object/connection
		 * @type {Object}
		 */
		socket: null, // added on init
		/**
		 * MongoDB connection
		 * @type {Object}
		 */
		db: db,
		/**
		 * Global events pub/sub object
		 * @type {Object}
		 */
		globalEvents: globalEvents,
		/**
		 * User data hash stored and manipulated here before returning to main app through global userAuth event
		 * @type {Object}
		 */
		userData: {},
		/**
		 * Password is not stored with userData in db, instead stored here before being salted/hashed
		 * @type {String}
		 */
		password: null, // password stored separately from user data


		/** PUBLIC **/

		init: function(socket){

			this.socket = socket;

			// setup
			this.socket.emit('message', dict.welcome);
			this.socket.emit('message', dict.requestName);

			// event listeners
			this.socket.once('message', this._checkIsUserRegistered.bind(this));
			this.socket.once('disconnect', this._onUserDisconnect.bind(this));
		},


		/** PRIVATE **/

		/**
		 * Check database for existing user name.
		 * If not registered, start registration process. If registered, request password.
		 * @param  {Object} data [input data from socket (looking for username)]
		 */
		_checkIsUserRegistered: function(data){
			var name = data.input,
				self = this,
				users = this.db.data.collection('users'),
				newUser;

			this.userData.name = name; // cache user name

			users.findOne( {name: name}, function(err, item) {
				if (!item){
					newUser = new NewUserRegistration(self.socket, self.userData.name);
				}else{
					self.userData = item;
					self._requestLogin();
				}
			});
		},

		/**
		 * Request password from user to login
		 */
		_requestLogin: function(){
			this.socket.emit('privateRequest', _.template(dict.requestPassword, { username: this.userData.name }));
			this.socket.once('message', this._checkPassword.bind(this));
		},

		/**
		 * check password against hash in database, request login again if incorrect, or call _resetPassword if user entered command 'reset password'
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_checkPassword: function(data){
			var message = data.input,
				match = bcrypt.compareSync(message, this.userData.hash);

			if(match){
				this.socket.emit('message', dict.correctPassword);
				this._authUser();

			}else if(message === 'reset password'){
				this._resetPassword();

			}else{
				this.socket.emit('message', dict.incorrectPassword);
				this._requestLogin();
			}
		},

		_resetPassword: function(){
			// reset password and send email using nodemailer
			var self = this,
				newPassword = passwordGen(10, false),
				users = this.db.data.collection('users'),
				hash = bcrypt.hashSync(newPassword, 10), // hash password
				smtpTransport = nodemailer.createTransport("SMTP",{
					host: config.resetPasswordEmail.host,
					port: config.resetPasswordEmail.port,
					auth: {
						user: config.resetPasswordEmail.name,
						pass: config.resetPasswordEmail.password
					}
				}),
				mailOptions = {
					from: config.resetPasswordEmail.name, // sender address
					to: this.userData.email, // list of receivers
					subject: dict.resetPasswordEmailSubject, // Subject line
					html: '<p>Hello ' + this.userData.name + ',</p><p>' + _.template( dict.resetPasswordEmailMessage, { password: newPassword } ) + '</p>'
				};

			this.socket.emit('message', _.template(dict.notifyPasswordReset, { email: this.userData.email }));

			this.userData.hash = hash;
			users.update({name: this.userData.name}, {$set: {hash: hash}}, function(err, updated){
				if( err || !updated ){
					//self.socket.emit('message', "User not updated");
				}else{
					//self.socket.emit('message', "User updated");
				}
			});

			smtpTransport.sendMail(mailOptions, function(error, response){
				if( error ){
					self.socket.emit('message', 'there was an error with sending the email, ' + JSON.stringify(error));
				}else{
					//self.socket.emit('message', "Message sent: " + response.message);
					self._requestLogin();
				}
				smtpTransport.close(); // shut down the connection pool, no more messages
			});
		},

		/**
		 * Trigger user registration event on global events object, so app controller can add user/socket to user pool.
		 * @return {[type]} [description]
		 */
		_authUser: function(){
			this.globalEvents.emit('userAuth', this.userData, this.socket);
		},

		/**
		 * fires when user disconnects socket - triggers userRejected event on global events object
		 * @return {[type]} [description]
		 */
		_onUserDisconnect: function(){
			this.globalEvents.emit('clientDisconnect', this.userData, this.socket);
		}

	});


	return SessionHandler;

}());
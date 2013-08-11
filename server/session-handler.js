/*global console: true */

/**
 *  SOCKET.IO MUD USER MODULE
 *
 *  @description user instance for client sessions on socket.io mud server app
 *
 *  @author CM
 *  
 *  @requires events
 *  @requires  util
 *  @requires  extend
 *  
 */

module.exports = (function(){

	var events = require('events'),
		util = require('util'),
		extend = require('extend'),
		bcrypt = require('bcrypt'),
		nodemailer = require('nodemailer'),
		passwordGen = require('password-generator'),
		config = require('./config/env'),
		userSchema = require('./config/user-schema'),
		dict = require('./dict/user-session');


	var SessionHandler = function(socket, db){

		this.socket = socket;
		this.db = db;

		events.EventEmitter.call(this);
		this.init();
	};

	// inherit eventEmitter class to emit events for use by app.js
	util.inherits(SessionHandler, events.EventEmitter);

	SessionHandler.prototype = extend({

		userData: {},
		password: null, // password stored separately from user data

		/** PUBLIC **/

		init: function(){

			// shared properties

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
				users = this.db.collection('users');

			this.userData.name = name; // cache user name

			users.findOne({name:name}, function(err, item) {
				if (!item){
					self.socket.emit('message', util.format(dict.newUserGreet, self.userData.name));
					self._requestNewPassword();
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
			this.socket.emit('privateRequest', util.format(dict.requestPassword, this.userData.name));
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
				users = this.db.collection('users'),
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
					html: '<p>Hello ' + this.userData.name + ',</p><p>' + util.format(dict.resetPasswordEmailMessage, newPassword) + '</p>'
				};

			this.socket.emit('message', util.format(dict.notifyPasswordReset, this.userData.email));
			this.socket.emit('message', 'test');

			this.userData.hash = hash;
			users.update({name: this.userData.name}, {$set: {hash: hash}}, function(err, updated){
				if( err || !updated ){
					self.socket.emit('message', "User not updated");
				}else{
					self.socket.emit('message', "User updated");
				}
			});

			smtpTransport.sendMail(mailOptions, function(error, response){
				if( error ){
					self.socket.emit('message', 'there was an error with sending the email, ' + JSON.stringify(error));
				}else{
					self.socket.emit('message', "Message sent: " + response.message);
					self._requestLogin();
				}
				smtpTransport.close(); // shut down the connection pool, no more messages
			});
		},

		/**
		 * Request new password from user
		 * On data received, call verify password
		 */
		_requestNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', dict.requestNewPassword);
			this.socket.once('message', function(data){
				if( !self._validateNewPassword(data.input) ){
					self._requestNewPassword();
				}else{
					self.password = data.input;
					self._verifyNewPassword();
				}
			});
		},

		/**
		 * check if password fulfills rules (currently just 8+ characters)
		 * @param  {String} password [new user password]
		 * @return {Boolean}          [true if password fulfills rules, false if not]
		 */
		_validateNewPassword: function(password){
			if( password.length < 8 ){
				this.socket.emit('message', dict.passwordLengthError);
				return false;
			}

			return true;
		},

		/**
		 * request verification of new password.
		 * On data received, check match. If matches, start user class selection
		 */
		_verifyNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', dict.verifyPassword);
			this.socket.once('message', function(data){
				if( data.input !== self.password ){
					self.socket.emit('message', dict.passwordMismatch);
					self._requestNewPassword();
				}else{
					self._requestEmailAddress();
				}
			});
		},

		/**
		 * request an email from the user.
		 */
		_requestEmailAddress: function(){
			var self = this;

			this.socket.emit('message', dict.requestEmailAddress);
			this.socket.once('message', function(data){
				self.userData.email = data.input;
				self._startUserClassSelection();
			});
		},

		/**
		 * List out available classes for user to choose
		 */
		_startUserClassSelection: function(){
			var self = this,
				classMsg = dict.classList + '<br />';

			for (var className in userSchema.classes){
				classMsg += '- ' + userSchema.classes[className].displayName + '<br />';
			}

			this.socket.emit('message', classMsg);
			this._requestClassName();
		},

		/**
		 * Request user choice for class.
		 * On data received, if class exists, continue registration. If user typed command 'info', show class description.
		 * If invalid class, request class again.
		 */
		_requestClassName: function(){
			var self = this;

			this.socket.emit('message', dict.chooseClass);
			this.socket.once('message', function(data){
				var command1 = data.input.substr(0, data.input.indexOf(' ')),
					command2 = data.input.substr(data.input.indexOf(' ') + 1).toLowerCase(),
					className;

				for( var n in userSchema.classes ){ // get real class object name if exists
					if( userSchema.classes[n].displayName.toLowerCase() === command2 ){
						className = n;
					}
				}

				if( command1 === 'info' && className){
					self._displayClassInfo(className);
				}else if( className && userSchema.classes.hasOwnProperty(className) ){
					self.userData.className = className;
					self._requestRequiredFields();
				}else{
					self.socket.emit('message', dict.invalidClass);
					self._requestClassName();
				}
			});
		},

		/**
		 * Display description for a class
		 * @param  {String} className [name of class (object name from userSchema.classes)]
		 */
		_displayClassInfo: function(className){
			var classObj,
				classInfoMsg = '';

			classObj = userSchema.classes[className];
			classInfoMsg += classObj.displayName + ': ';
			classInfoMsg += classObj.description;

			this.socket.emit('message', classInfoMsg);
			this._startUserClassSelection();
		},

		/**
		 * Request any values listed in userSchema.requiredFields, called recursively.
		 * Once all values have been requested, finish user registration process.
		 */
		_requestRequiredFields: function(){
			var self = this,
				reqFieldsIndex = 0,
				reqFieldsCount = userSchema.requiredFields.length;

			// send request to user for current req field
			function sendRequest(){
				self.socket.emit('message', userSchema.requiredFields[reqFieldsIndex].message);
				self.socket.once('message', onDataReceived);
			}

			// add response to this.userData, request next or finish registration
			function onDataReceived(data){
				self.userData[userSchema.requiredFields[reqFieldsIndex].name] = data.input;

				reqFieldsIndex++;

				if(reqFieldsIndex < reqFieldsCount){
					sendRequest();
				}else{
					self._registerNewUser();
					self.socket.emit('message', util.format(dict.newUserWelcome, self.userData.name));
				}
			}

			sendRequest();
		},

		/**
		 * Add any default user attributes, hash the chosen password, and add user to database.
		 */
		_registerNewUser: function(){
			var self = this,
				users = this.db.collection('users');

			this.userData.hash = bcrypt.hashSync(this.password, 10); // hash password
			extend(this.userData, userSchema.startingAttributes); // add default/starting character attributes

			users.save(this.userData, function(err, saved){
				if( err || !saved ) self.socket.emit('message', 'There was an error saving the new user.');
			});
			this._authUser();
		},

		/**
		 * Trigger user registration event on this, so app controller can add user/socket to user pool.
		 * @return {[type]} [description]
		 */
		_authUser: function(){
			this.emit('userAuth', this.userData, this.socket);
		},

		/**
		 * fires when user disconnects socket - triggers userRejected event so app can remove event handlers from SessionHandler instance (this)
		 * @return {[type]} [description]
		 */
		_onUserDisconnect: function(){
			this.emit('userRejected');
		}

	}, SessionHandler.prototype);


	return SessionHandler;

}());
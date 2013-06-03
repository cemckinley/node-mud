/*global console: true */

/**
 *  SOCKET.IO MUD USER MODULE
 *
 *  @description user instance for client sessions on socket.io mud server app
 *
 *  @author CM
 *  @requires
 *		- node -> events
 *		- node -> util
 *		- npm extend
 */

module.exports = (function(){

	var events = require('events'),
		util = require('util'),
		extend = require('extend'),
		bcrypt = require('bcrypt'),
		userSchema = require('./config/user-schema');


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

		/** PUBLIC **/

		init: function(){

			// shared properties

			// setup
			this.socket.emit('message', 'Welcome to The Agency.');
			this.socket.emit('message', 'What is your name, employee?');

			// event listeners
			this.socket.once('message', this._checkIsUserRegistered.bind(this));
		},


		/** PRIVATE **/

		_checkIsUserRegistered: function(data){
			var name = data.input,
				self = this,
				users = this.db.collection('users');

			this.userData.name = name; // cache user name

			users.findOne({username:name}, function(err, item) {
				if (!item){
					self.socket.emit('message', 'I see it\'s your first day at The Agency, ' + self.userData.name + '. Let\'s begin your paperwork.');
					self._requestNewPassword();
				}else{
					self._requestLogin();
				}
			});
		},

		_requestLogin: function(){
			this.socket.emit('privateRequest', 'Welcome back, ' +  this.userData.name + '. What is your password?');
			this.socket.once('message', this._checkPassword.bind(this));
		},

		_checkPassword: function(data){

		},

		_handlePassword: function(data){
			var password = data.input,
				isCorrect = this._checkUserPassword(password);

			if(password === 'email password'){
				// this.emailPassword(this.name);

				return;
			}

			if(isCorrect){
				this._authenticateUser();
			}else{
				this.socket.emit('message', 'Sorry, that is not the correct password. If you have forgotten your password you can type \'email password\'. Please enter your password again:');
				this.socket.once('message', this._handlePassword.bind(this));
			}
		},

		_requestNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', 'Please enter a password to use for logging in to our network:');
			this.socket.once('message', function(data){
				self.userData.password = data.input;
				self._verifyNewPassword();
			});
		},

		_verifyNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', 'Please verify your chosen password:');
			this.socket.once('message', function(data){
				if( data.input !== self.userData.password ){
					self.socket.emit('message', 'Sorry, your passwords do not match.');
					self._requestNewPassword();
				}else{
					self._startUserClassSelection();
				}
			});
		},

		_startUserClassSelection: function(){
			var self = this,
				classMsg = 'Our current job openings are for the following roles:<br />';

			for (var className in userSchema.classes){
				classMsg += ('- ' + className + '<br />');
			}

			this.socket.emit('message', classMsg);
			this._requestClassName();
		},

		_requestClassName: function(){
			var self = this;

			this.socket.emit('message', 'Which position are you here for? Type \'info [role]\' to review the role description.');
			this.socket.once('message', function(data){
				var userCommand = data.input.split(/ /g);

				if( userSchema.classes.hasOwnProperty(data.input) ){
					self.userData.className = data.input;
					self._requestRequiredFields();
				}else if(userCommand[0] === 'info'){
					self._displayClassInfo(userCommand[1]);
				}else{
					self.socket.emit('message', 'I\'m sorry, we don\'t have openings for that role.');
					self._requestClassName();
				}
			});
		},

		_displayClassInfo: function(className){
			var classObj,
				classInfoMsg = className + ': ';

			if( !userSchema.classes.hasOwnProperty(className) ){
				this.socket.emit('message', 'I\'m sorry, we don\'t have openings for that role.');
				this._requestClassName();
				return;
			}

			classObj = userSchema.classes[className];

			classInfoMsg += classObj.description;

			this.socket.emit('message', classInfoMsg);
			this._startUserClassSelection();
		},

		_requestRequiredFields: function(){

		},

		_registerNewUser: function(){

		}

	}, SessionHandler.prototype);


	return SessionHandler;

}());
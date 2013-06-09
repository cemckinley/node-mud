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

		/** PUBLIC **/

		init: function(){

			// shared properties

			// setup
			this.socket.emit('message', dict.welcome);
			this.socket.emit('message', dict.requestName);

			// event listeners
			this.socket.once('message', this._checkIsUserRegistered.bind(this));
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

			users.findOne({username:name}, function(err, item) {
				if (!item){
					self.socket.emit('message', util.format(dict.newUserGreet, self.userData.name));
					self._requestNewPassword();
				}else{
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
				this.socket.emit('message', dict.incorrectPassword);
				this.socket.once('message', this._handlePassword.bind(this));
			}
		},

		/**
		 * Request new password from user
		 * On data received, call verify password
		 */
		_requestNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', dict.requestNewPassword);
			this.socket.once('message', function(data){
				self.userData.password = data.input;
				self._verifyNewPassword();
			});
		},

		/**
		 * request verification of new password.
		 * On data received, check match. If matches, start user class selection
		 * @return {[type]} [description]
		 */
		_verifyNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', dict.verifyPassword);
			this.socket.once('message', function(data){
				if( data.input !== self.userData.password ){
					self.socket.emit('message', dict.passwordMismatch);
					self._requestNewPassword();
				}else{
					self._startUserClassSelection();
				}
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
				}
			}

			sendRequest();
		},

		/**
		 * Add any default user attributes, hash the chosen password, and add user to database.
		 * Trigger user registration event on this, so app controller can add user/socket to user pool.
		 */
		_registerNewUser: function(){

			extend(this.userData, userSchema.startingAttributes);

			this.socket.emit('message', JSON.stringify(this.userData));
		}

	}, SessionHandler.prototype);


	return SessionHandler;

}());
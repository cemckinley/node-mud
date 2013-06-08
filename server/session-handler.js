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

		_requestNewPassword: function(){
			var self = this;

			this.socket.emit('privateRequest', dict.requestNewPassword);
			this.socket.once('message', function(data){
				self.userData.password = data.input;
				self._verifyNewPassword();
			});
		},

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

		_startUserClassSelection: function(){
			var self = this,
				classMsg = dict.classList + '<br />';

			for (var className in userSchema.classes){
				classMsg += '- ' + userSchema.classes[className].displayName + '<br />';
			}

			this.socket.emit('message', classMsg);
			this._requestClassName();
		},

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

		_displayClassInfo: function(className){
			var classObj,
				classInfoMsg = '';

			classObj = userSchema.classes[className];
			classInfoMsg += classObj.displayName + ': ';
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
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
		extend = require('extend');


	var SessionHandler = function(socket){

		this.socket = socket;

		events.EventEmitter.call(this);
		this.init();
	};

	util.inherits(SessionHandler, events.EventEmitter);

	SessionHandler.prototype = extend({

		userData: {},

		init: function(){

			// shared properties

			// setup
			this.socket.emit('message', 'Welcome to The Agency.');
			this.socket.emit('message', 'What is your name, employee?');

			// event listeners
			this.socket.once('message', this._handleUserName.bind(this));
		},

		_handleUserName: function(data){
			var self = this,
				name = data.input,
				isRegistered = this._checkIsUserRegistered(name);

			this.name = name;

			if(isRegistered){
				this.socket.emit('message', 'Welcome back, ' +  name + '. What is your password?');
				this.socket.once('message', this._handlePassword.bind(this));

			}else{
				this.socket.emit('message', 'I see it\'s your first day at The Agency, ' + name + '. What would you like your password to be?');
				this.socket.once('message', function(data){
					self._registerUser(name, data.input);
				});
			}
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

		_checkIsUserRegistered: function(name){
			this.userData.userName = name;
			return true;
		},

		_checkUserPassword: function(password){
			return true;
		},

		_registerUser: function(name, password){
			this.userData.userName = name;
			this._authenticateUser();
		},

		_authenticateUser: function(){
			this.emit('authenticated', this.userData, this.socket);
		}

	}, SessionHandler.prototype);

	return SessionHandler;

}());
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
		bcrypt = require('bcrypt');


	var SessionHandler = function(socket, db){

		this.socket = socket;
		this.db = db;

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
			this.socket.once('message', this._checkIsUserRegistered.bind(this));
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

		_checkIsUserRegistered: function(data){
			var name = data.input,
				self = this,
				users = this.db.collection('users');

			this.userData.name = name; // cache user name

			users.findOne({username:name}, function(err, item) {

				if (!item){
					self._requestNewUser();
				}else{
					self._requestPassword();
				}
			});
		},

		_requestPassword: function(){
			this.socket.emit('privateRequest', 'Welcome back, ' +  this.userData.name + '. What is your password?');
			this.socket.once('message', this._checkPassword.bind(this));
		},

		_checkPassword: function(data){

		},

		_requestNewUser: function(){
			var self = this;

			this.socket.emit('privateRequest', 'I see it\'s your first day at The Agency, ' + this.userData.name + '. Please enter a password to begin the registration process:');
			this.socket.once('message', function(data){
				self.userData.password = data.input;
				self._startUserRegistration();
			});
		},

		_startUserRegistration: function(){

		}

	}, SessionHandler.prototype);

	return SessionHandler;

}());
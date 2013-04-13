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


	var User = function(socket){

		this.socket = socket;

		events.EventEmitter.call(this);
		this.init();
	};

	util.inherits(User, events.EventEmitter);

	User.prototype = extend({

		init: function(){

			// shared properties

			// setup
			this.socket.emit('message', 'Welcome to The Agency.');
			this.socket.emit('message', 'What is your name, employee?');

			// event listeners
			this.socket.once('message', this.handleUserName.bind(this));
		},

		handleUserName: function(data){
			var self = this,
				name = data.input,
				isRegistered = this.checkIsUserRegistered(name);

			this.name = name;

			if(isRegistered){
				this.socket.emit('message', 'Welcome back, ' +  name + '. What is your password?');
				this.socket.once('message', this.handlePassword.bind(this));

			}else{
				this.socket.emit('message', 'I see it\'s your first day at The Agency, ' + name + '. What would you like your password to be?');
				this.socket.once('message', function(data){
					self.registerUser(name, data.input);
				});
			}
		},

		handlePassword: function(data){
			var password = data.input,
				isCorrect = this.checkUserPassword(password);

			if(password === 'email password'){
				this.emailPassword(this.name);

				return;
			}

			if(isCorrect){
				this.emit('authenticated');
			}else{
				this.socket.emit('message', 'Sorry, that is not the correct password. If you have forgotten your password you can type \'email password\'. Please enter your password again:');
				this.socket.once('message', this.handlePassword.bind(this));
			}
		},

		checkIsUserRegistered: function(name){
			return true;
		},

		checkUserPassword: function(password){
			return true;
		},

		registerUser: function(name, password){
			this.emit('authenticated');
		},

		onClientMessage: function(data){
			this.socket.emit('message', 'Why hello! you want to: ' + data.input);
		}

	}, User.prototype);

	return User;

}());
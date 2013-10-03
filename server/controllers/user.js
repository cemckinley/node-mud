
/**
 *  @module			controllers/User
 *  @description	Class for user instances, handles client/user behavior/actions/movement based on websocket input
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

module.exports = (function(){

	var events = require('events'),
		extend = require('extend'),
		config = require('./config/env');


	var User = function(socket, userData){

		this.socket = socket;
		this.model = userData;

		events.EventEmitter.call(this);
		this.init();
	};

	// inherit eventEmitter class to emit events for use by rooms
	util.inherits(User, events.EventEmitter);

	User.prototype = extend({

		init: function(){

		}

	}, User.prototype);


	return User;

}());
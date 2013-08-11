/*global console: true */

/**
 *  USER CONTROLLER
 *
 *  @description Constructor for user instances that control user behavior and events
 *
 *  @author cemckinley <cemckinley@gamil.com>
 *  
 *  @requires events
 *  @requires  util
 *  @requires  extend
 *  
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
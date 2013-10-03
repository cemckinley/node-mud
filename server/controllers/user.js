
/**
 *  @module			controllers/User
 *  @description	Class for user instances, handles client/user behavior/actions/movement based on websocket input
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

module.exports = (function(){

	var extend = require('extend'),
		config = require('./config/env');


	var User = function(socket, userData){

		this.socket = socket;
		this.model = userData;

		this.init();
	};

	User.prototype = extend({

		// PROPERTIES

		/**
		 * socket.io client connection instance
		 * @type {Object}
		 */
		socket: null,
		/**
		 * client data model
		 * @type {Object}
		 */
		model: null,


		// METHODS

		init: function(){

		}

	}, User.prototype);


	return User;

}());
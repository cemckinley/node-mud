
/**
 *  @module			controllers/User
 *  @description	Class for user instances, handles client/user behavior/actions/movement based on websocket input
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var extend = require('extend'),
	Class = require('class.extend'),
	_ = require('lodash'),
	config = require('../config/env'),
	UserModel = require('../models/user-model');


var User = Class.extend({

	/* PUBLIC PROPERTIES */

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


	/* PUBLIC METHODS */

	init: function(socket, userData){
		var self = this;

		this.socket = socket;
		this.model = new UserModel(userData, {
			collection: 'users',
			success: function(){
				self.socket.emit( 'message', 'successful model creation' );
			},
			error: function(){
				self.socket.emit('message', 'error on model save');
			}
		});

		this.model.save();
	}

});


module.exports = User;
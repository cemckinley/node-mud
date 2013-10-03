
/**
 *  @module			models/BaseModel
 *  @description	Base model class, based loosely on Backbone model design
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */


module.exports = (function(){

	var Class = require('class.extend'),
		events = require('events'),
		extend = require('extend'),
		config = require('./config/env');


	var BaseModel = Class.extend({

		init: function(attributes, options){
			// do some stuff and then call super? need to check resig's docs
		},

		get: function(attribute){
			return this.attributes[attribute];
		}

	});

	// inherit eventEmitter class to emit events for use by app.js
	util.inherits(BaseModel, events.EventEmitter);

	return BaseModel;

}());
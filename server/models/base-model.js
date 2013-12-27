
/**
 *  @module			models/BaseModel
 *  @description	Base model class, based loosely on Backbone model design. Intended to work with MongoDB connection.
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */


module.exports = (function(){

	var Class = require('class.extend'),
		_ = require('loadash'),
		extend = require('extend'),
		config = require('./config/env');


	var BaseModel = Class.extend({

		/**
		 * Attributes hash for model data, ala Backbone Models
		 * @type {Object}
		 */
		attributes: {},
		/**
		 * MongoDB db connection instance
		 * @type {Object}
		 */
		db: null,
		/**
		 * Options hash
		 * @type {Object}
		 */
		options: {
			collection: 'all' // MongoDB collection name that the model belongs to
		},
		/**
		 * Eventing/pub sub object for communicating model events
		 * @type {EventEmitter}
		 */
		events: new EventEmitter(),


		init: function(attributes, db, options){
			this.attributes = extend(this.attributes, attributes);
			this.db = db;
			this.options = extend(this.options, options);
		},

		get: function(attribute){
			return this.attributes[attribute];
		},

		toJSON: function(){
			var json = _.clone(this.attributes);

			return json;
		},

		set: function(attributes, options){
			var changed = {};

			for(var key in attributes){
				if(attributes.hasOwnProperty(key)){
					this.attributes[key] = attributes[key];
					this.changed[key] = attributes[key];
				}
			}

			if(!options.silent) this.events.emit('change', changed, this);
		},

		save: function(){
			var collection = this.db.collection(this.options.collection);

			
		},

		success: function(){

		},

		error: function(){

		}

	});

	return BaseModel;

}());
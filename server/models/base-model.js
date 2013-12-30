
/**
 *  @module			models/BaseModel
 *  @description	Base model class, based loosely on Backbone model design. Intended to work with MongoDB collection.
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var Class = require('class.extend'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	extend = require('extend'),
	config = require('../config/env'),
	db = require('../controllers/db');


var BaseModel = Class.extend({

	/* PUBLIC PROPERTIES */

	/**
	 * Attributes hash for model data, ala Backbone Models
	 * @type {Object}
	 */
	attributes: {},
	/**
	 * MongoDB db connection instance
	 * @type {Object}
	 */
	db: db,
	/**
	 * Options hash
	 * @type {Object}
	 */
	options: {
		collection: 'all' // MongoDB collection name that the model belongs to
	},


	/* PUBLIC METHODS */

	init: function(attributes, options){
		this.attributes = extend(this.attributes, attributes);
		this.options = extend(this.options, options);
	},

	/**
	 * Get the value of a particular attribute
	 * @param  {String} attribute    name of the attribute to be returned
	 * @return {unknown?}            returned attribute value
	 */
	get: function(attribute){
		return this.attributes[attribute];
	},

	/**
	 * Return all attribute data as a new object
	 * @return {Object}    attribute data
	 */
	toJSON: function(){
		var json = _.clone(this.attributes);

		return json;
	},

	/**
	 * Set the value of particular attributes specified in an object
	 * @param {Object} attributes    Attributes object to extend attributes with
	 * @param {Object} options       Options object
	 */
	set: function(attributes, options){
		var changed = {};

		for(var key in attributes){
			if(attributes.hasOwnProperty(key)){
				this.attributes[key] = attributes[key];
				this.changed[key] = attributes[key];
			}
		}

		if(!options.silent) this.emit('change', changed, this);
	},

	/**
	 * Save the attribute data to the database collection
	 */
	save: function(){
		var self = this,
			collection = this.db.data.collection(this.options.collection);

		collection.save(this.attributes, function(err, saved){
			if( err || !saved ){
				self._onError();
			}else{
				self._onSuccess();
			}
		});
	},


	/* EVENT HANDLERS */

	/**
	 * Called when database save is successful
	 */
	_onSuccess: function(){
		this.emit('success', this);

		if( this.options.success && typeof this.options.success === 'function' ) this.options.success(this);
	},

	/**
	 * Called when database save is unsuccessful
	 */
	_onError: function(){
		this.emit('error', this);

		if( this.options.error && typeof this.options.error === 'function' ) this.options.error(this);
	}

});

// Mixin eventEmitter class to emit events from model
BaseModel.prototype = extend(BaseModel.prototype, EventEmitter.prototype);

module.exports = BaseModel;
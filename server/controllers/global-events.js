/**
 *  @module			globalEvents
 *  @description	Singleton, inherits from EventEmitter, to allow objects to pub/sub to global events in the MUD
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var util = require('util'),
	extend = require('extend'),
	EventEmitter = require('events').EventEmitter;


var globalEvents = function(){

	EventEmitter.call(this);
};

util.inherits(globalEvents, EventEmitter);

globalEvents.prototype = extend( globalEvents.prototype, {

	initialize: function(){
		
	}

});

module.exports = new globalEvents();
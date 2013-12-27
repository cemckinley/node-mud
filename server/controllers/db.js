/**
 *  @module			db
 *  @description	Creates new MongoDB connection to the mud database, so the connection can be included 
 *					as a module where needed, using a single connection pool
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var mongoClient = require('mongodb').MongoClient,
	config = require('../config/env');

var db = {

	/**
	 * MongoDB connection instance will be stored here
	 * @type {Object}
	 */
	data: null,

	connect: function(callback){
		var self = this;

		mongoClient.connect(config.db.location, function(err, database){
			if(err) { return console.dir(err); }

			self.data = database;
			
			if( typeof callback === 'function' ) callback();
		});
	}

};

module.exports = db;


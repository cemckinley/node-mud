/*global console: true */

/**
 *  SOCKET.IO MUD SERVER CONFIG
 *
 *  @description static environment variables and config values
 *
 *  @requires
 *  
 */

module.exports = (function(){

	var config = {

		/**
		 * websocket server settings
		 * @type {Object}
		 */
		socket: {
			port: 8002
		},

		/**
		 * ssl information, paths
		 * @type {Object}
		 */
		ssl: {
			keyPath: __dirname + '/keys/websocket-ssl.key',
			certPath: __dirname + '/keys/websocket-ssl.crt',
			passphrase: '123456'
		},

		/**
		 * database connection information
		 * @type {Object}
		 */
		db: {
			location: 'mongodb://localhost:27017/nodemuddb'
		}
	};

	return config;

}());
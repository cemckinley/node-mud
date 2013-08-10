/*global console: true */

/**
 * !!!IMPORTANT!!!
 * This is the env.js example file: rename to env.js to use with the project and populate with correct values.
 */

/**
 *  SOCKET.IO MUD SERVER ENVIRONMENT CONFIG DATA
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
			/**
			 * This is the port that the socket server will run on. Make sure your browser app is connecting to this port.
			 * @type {Integer}
			 */
			port: 8002
		},

		/**
		 * Paths to SSL key files and passphrase. You can use signed SSL keys or generate your own self-signed keys.
		 * @type {Object}
		 */
		ssl: {
			keyPath: __dirname + '/../keys/websocket-ssl.key',
			certPath: __dirname + '/../keys/websocket-ssl.crt',
			passphrase: '123456'
		},

		/**
		 * database connection information
		 * @type {Object}
		 */
		db: {
			/**
			 * This path should be the domain/url to your database. The default MondoDB port is 27017, followed in the path by the database name.
			 * @type {String}
			 */
			location: 'mongodb://localhost:27017/nodemuddb'
		},

		/**
		 * Settings for nodemailer - used to send resetpasswords to users
		 * @type {Object}
		 */
		resetPasswordEmail: {
			host: 'http://mail.yourwebhost.com',
			/**
			 * Port for the mail server. Your web host should have docs on which port to use for their mail server.
			 * @type {Number}
			 */
			port: 587,
			/**
			 * email 'from:' address
			 * @type {String}
			 */
			name: 'noreply@yourwebhost.com',
			/**
			 * password for the email account
			 * @type {String}
			 */
			password: 'password'
		}
	};

	return config;

}());
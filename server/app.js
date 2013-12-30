
/**
 *  @module			main application controller
 *  @description	Runs socket.io and static http server, listens for client connections and directs user/room instances. 
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var fs = require('fs'),
	https = require('https'),
	socketio = require('socket.io'),
	config = require('./config/env'),
	db = require('./controllers/db'),
	SessionHandler = require('./controllers/session-handler'),
	globalEvents = require('./controllers/global-events'),
	User = require('./controllers/user');


var nodeMud = (function(){

	/** properties **/

	var httpsOptions = {
			key: fs.readFileSync(config.ssl.keyPath),
			cert: fs.readFileSync(config.ssl.certPath),
			passphrase: config.ssl.passphrase
		},
		httpsServer = https.createServer(httpsOptions, _httpsHandler).listen(config.socket.port), // server for socket.io socket
		io = socketio.listen(httpsServer); // websocket


	/** functions **/

	function init(){

		db.connect();

		// event listeners
		io.sockets.on('connection', _onClientConnect);
		globalEvents.on('userAuth', _onClientAuth);
	}

	function _httpsHandler(req, res){
		res.writeHead(200);
		res.end();
	}

	function _onClientConnect(socket){
		var client = new SessionHandler(socket);
	}

	function _onClientAuth(userData, clientSocket){
		var user = new User(clientSocket, userData);

		clientSocket.emit('message', userData.name + 'successful user auth');
	}


	/** PUBLIC API **/

	return {
		init: init
	};

}());

nodeMud.init();
/*global console: true */

/**
 *  SOCKET.IO MUD SERVER
 *
 *  @description creates http server and adds socket.io instance
 *
 *  @author CM
 *  @requires
 *      - npm -> socket.io
 *      - node -> http
 *      - node -> fs
 *      - ./user.js
 */

var fs = require('fs'),
	https = require('https'),
	socketio = require('socket.io'),
	SessionHandler = require('./session-handler');


var wsDemoApp = (function(){

	/** properties **/

	var httpsOptions = {
			key: fs.readFileSync(__dirname + '/keys/websocket-ssl.key'),
			cert: fs.readFileSync(__dirname + '/keys/websocket-ssl.crt'),
			passphrase: '123456'
		},
		httpsServer = https.createServer(httpsOptions, _httpsHandler).listen(8002),
		io = socketio.listen(httpsServer);


	/** functions **/

	function init(){

		// event listeners
		io.sockets.on('connection', _onClientConnect);
	}

	function _httpsHandler(req, res){
		res.writeHead(200);
		res.end();
	}

	function _onClientConnect(socket){
		var client = new SessionHandler(socket);

		client.once('authenticated', _onClientAuth);
	}

	function _onClientAuth(clientData, clientSocket){
		clientSocket.emit('message', clientData.userName);
	}


	/** PUBLIC API **/

	return {
		init: init
	};

}());

wsDemoApp.init();
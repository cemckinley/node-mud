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

var wsDemoApp = (function(){

	var io = require('socket.io').listen(8002),
		fs = require('fs'),
		User = require('./user'),
		clients = [];

	function init(){

		// event listeners
		io.sockets.on('connection', onClientConnect);
	}

	function serverHandler (req, res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Hello World\n');
	}

	function onClientConnect(socket){
		var client = new User(socket);

		client.once('authenticated', function(){
			clients.push(client);
			client.socket.emit('message', 'Added to client pool.');
		});
	}


	return {
		init: init
	};

}());

wsDemoApp.init();
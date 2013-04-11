/*global console: true */

/**
 *  NODE SERVER APP
 *
 *  @description creates http server and adds socket.io instance
 *
 *  @author CM
 *  @requires
 *      - node -> socket.io
 *      - node -> http
 *      - node -> fs
 */

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs');

function handler (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}

app.listen(8002);

io.sockets.on('connection', function (socket) {

	socket.on('userCommand', function (data) {
		socket.emit('message', 'Why hello! you want to: ' + data.command);
	});
});
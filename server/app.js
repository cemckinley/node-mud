
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
	EventEmitter = require('events').EventEmitter,
	socketio = require('socket.io'),
	mongoClient = require('mongodb').MongoClient,
	config = require('./config/env'),
	SessionHandler = require('./controllers/session-handler');


var nodeMud = (function(){

	/** properties **/

	var httpsOptions = {
			key: fs.readFileSync(config.ssl.keyPath),
			cert: fs.readFileSync(config.ssl.certPath),
			passphrase: config.ssl.passphrase
		},
		httpsServer = https.createServer(httpsOptions, _httpsHandler).listen(config.socket.port), // server for socket.io socket
		globalEvents = new EventEmitter(),
		io = socketio.listen(httpsServer), // websocket
		database; // stores db connection


	/** functions **/

	function init(){

		// setup
		mongoClient.connect(config.db.location, _onDatabaseConnect);

		// event listeners
		io.sockets.on('connection', _onClientConnect);
		globalEvents.on('userAuth', _onClientAuth);
	}

	function _httpsHandler(req, res){
		res.writeHead(200);
		res.end();
	}

	function _onClientConnect(socket){
		var client = new SessionHandler(socket, database, globalEvents);
	}

	function _onClientAuth(userData, clientSocket){
		clientSocket.emit('message', userData.name + 'successful user auth');
	}

	function _onDatabaseConnect(err, db){
		if(err) { return console.dir(err); }

		database = db;
	}


	/** PUBLIC API **/

	return {
		init: init
	};

}());

nodeMud.init();
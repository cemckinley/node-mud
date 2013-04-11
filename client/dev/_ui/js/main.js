/*global console: true */
/*global Modernizr: true */
/*global $: true */
/*global io: true */

/**
 *  MAIN CONTROLLER
 *
 *  @description main/sitewide controller
 *
 *  @author CM
 *  @requires
 *      - jQuery 1.8
 */

var WSDEMO = WSDEMO || {};

WSDEMO.main = {

	init: function(){

		// el refs
		this.transcriptEl = $('#transcript');
		this.userInputEl = $('#userInput');

		// shared props
		this.config = {
			socketUrl: 'http://localhost:8002'
		};

		// controllers/instances
		this.socket = io.connect(this.config.socketUrl);

		// event listeners
		this.socket.on('connect', $.proxy(this.onServerConnect, this));
		this.socket.on('message', $.proxy(this.onServerMessage, this));
		this.socket.on('connect_failed', $.proxy(this.onServerMessage, this));
		this.userInputEl.on('keydown', $.proxy(this.onInputKeydown, this));

		// setup

	},

	/**
	 * runs when message received from server via websockets
	 * @param  {Object} data [json data from server]
	 */
	onServerConnect: function(data){
		this.updateTranscript('Connected to websocket.');
	},

	onServerMessage: function(message){
		this.updateTranscript(message);
	},

	/** 
	 * runs on user keydown in text input, submits input on enter key
	 * @param {Object} e [dom event]
	 */
	onInputKeydown: function(e){
		var userVal = this.userInputEl.val();

		if(userVal !== '' && e.keyCode === 13){ // if enter key			
			this.submitUserCommand(userVal);
			this.userInputEl.val('');
		}
	},

	submitUserCommand: function(commandStr){
		var data = {
			command: commandStr
		};

		this.socket.emit('userCommand', data);
	},

	/**
	 * update display of transcript
	 * @param  {String} output [string to add to transcript]
	 */
	updateTranscript: function(output){
		this.transcriptEl.append(output);
	}

};

$(function(){
	WSDEMO.main.init();
});
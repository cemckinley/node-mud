/*global console: true */
/*global Modernizr: true */
/*global Handlebars: true */
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
		this.templates = WSDEMO.templates;

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
	 */
	onServerConnect: function(){
	},

	onServerMessage: function(message){
		var ctx = {
			type: 'serverMessage',
			message: message
		};

		this.updateTranscript(ctx);
	},

	/** 
	 * runs on user keydown in text input, submits input on enter key
	 * @param {Object} e [dom event]
	 */
	onInputKeydown: function(e){
		var userVal = this.userInputEl.val();

		if(userVal !== '' && e.keyCode === 13){ // if enter key			
			this.sendMessage(userVal);
			this.userInputEl.val('');
		}
	},

	sendMessage: function(commandStr){
		var data = {
			input: commandStr
		};

		this.socket.emit('message', data);
	},

	/**
	 * update display of transcript
	 * @param  {Object} context with data for the transcript 'log' template
	 */
	updateTranscript: function(data){
		var html = this.templates.log(data);

		this.transcriptEl.append(html);
	}

};

$(function(){
	WSDEMO.main.init();
});
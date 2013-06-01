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

var NODEMUD = NODEMUD || {};

NODEMUD.main = {

	privateRequest: false, // flag set by 'privateRequest' event by server
	config: {
		socketUrl: 'https://localhost:8002'
	},
	templates: NODEMUD.templates,


	/* PUBLIC API */

	init: function(){

		// el refs
		this.transcriptEl = $('#transcript');
		this.userInputEl = $('#userInput');

		// controllers/instances
		this.socket = io.connect(this.config.socketUrl, {secure: true});

		// event listeners
		this.socket.on('connect', $.proxy(this._onServerConnect, this));
		this.socket.on('message', $.proxy(this._onServerMessage, this));
		this.socket.on('privateRequest', $.proxy(this._onServerPrivateRequest, this));
		this.socket.on('connect_failed', $.proxy(this._onServerMessage, this));
		this.userInputEl.on('keydown', $.proxy(this._onInputKeydown, this));
	},

	/**
	 * send user command to to server
	 * @param  {String} commandStr [user command]
	 */
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
	},


	/* PRIVATE */


	/* EVENT HANDLERS */

	/**
	 * runs when successfully connected to websocket server
	 */
	_onServerConnect: function(){
	},

	/**
	 * runs when socket emits a 'message' event
	 * @param  {String} message [server message]
	 */
	_onServerMessage: function(message){
		var ctx = {
			type: 'serverMessage',
			message: message
		};

		this.updateTranscript(ctx);
	},

	/**
	 * runs when socket emits a 'privateRequest' event, sets privateRequest flag to true and continues with normal message event
	 * @param  {String} message [server message]
	 */
	_onServerPrivateRequest: function(message){
		this.privateRequest = true;

		this._onServerMessage(message);
	},

	/** 
	 * runs on user keydown in text input, submits input on enter key
	 * @param {Object} e [dom event]
	 */
	_onInputKeydown: function(e){
		var userVal = this.userInputEl.val(),
			ctx = {
				type: 'userCommand',
				message: userVal
			};

		if(userVal !== '' && e.keyCode === 13){ // if enter key			
			this.sendMessage(userVal);
			this.userInputEl.val('');

			// if last server message was private request, don't display user's input (i.e. passwords)
			if( this.privateRequest === true ){
				this.privateRequest = false;
				ctx.message = '';
			}

			this.updateTranscript(ctx);
		}
	}

};

$(function(){
	NODEMUD.main.init();
});
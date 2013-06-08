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
	commandHistoryIndex: 0, // index in user command history
	commandHistory: [], // cache of submitted user commands
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
	 * update display of transcript, scroll log to new entry
	 * @param  {Object} context with data for the transcript 'log' template
	 */
	updateTranscript: function(data){
		var html = this.templates.log(data),
			scrollTop = this.transcriptEl.scrollTop();
			scrollHeight = this.transcriptEl.prop('scrollHeight'),
			shouldPinLog = (scrollHeight - this.transcriptEl.innerHeight()) - scrollTop < 20 ? true : false; // is user within 20px of bottom of logs

		this.transcriptEl.append(html);
		if(shouldPinLog){
			this.transcriptEl.scrollTop(this.transcriptEl.prop('scrollHeight'));
		}
	},


	/* PRIVATE */

	/**
	 * send value from user input to server, clear user input, set any private flags, update command history
	 */
	_dispatchUserInput: function(){
		var userVal = this.userInputEl.val(),
			ctx = {
				type: 'userCommand',
				message: userVal
			};

		this.sendMessage(userVal);
		this.userInputEl.val('');

		// if last server message was private request, don't display user's input (i.e. passwords)
		if( this.privateRequest === true ){
			this.privateRequest = false;
			ctx.message = '';
		}

		this.updateTranscript(ctx);
		this._updateCommandHistory(userVal);
	},

	/**
	 * reset command history index to zero and add command to history if its not the same as the previous command
	 * @param  {String} command [user command]
	 */
	_updateCommandHistory: function(command){
		this.commandHistoryIndex = 0;
		if(this.commandHistory[0] !== command){
			this.commandHistory.unshift(command);
		}
		if( this.commandHistory.length > 100 ){ this.commandHistory.pop(); } // limit history to 100 commands
	},

	/**
	 * get next or previous command from command history
	 * @param  {String} direction ['back' or 'forward' - direction to look in history]
	 */
	_retrieveCommand: function(direction){
		if( direction === 'back' ){
			this.commandHistoryIndex = Math.min(this.commandHistoryIndex + 1, this.commandHistory.length);
		}else if(direction === 'forward'){
			this.commandHistoryIndex = Math.max(this.commandHistoryIndex - 1, 0);
		}

		if(this.commandHistoryIndex > 0){
			this.userInputEl.val(this.commandHistory[this.commandHistoryIndex - 1]);
		}else{
			this.userInputEl.val('');
		}
	},


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
		if(this.userInputEl.val() !== '' && e.keyCode === 13){ // if enter key			
			this._dispatchUserInput();
		}else if(e.keyCode === 38){ // up arrow
			this._retrieveCommand('back');
		}else if(e.keyCode === 40){ // down arrow
			this._retrieveCommand('forward');
		}
	}

};

$(function(){
	NODEMUD.main.init();
});
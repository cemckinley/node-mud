/**
 *  @module			newUserRegistration
 *  @description	Handles registration of new user, creating new user account
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var	bcrypt = require('bcrypt'),
	extend = require('extend'),
	Class = require('class.extend'),
	_ = require('lodash'),
	userSchema = require('../config/new-user-schema'),
	dict = require('../dict/user-session'),
	globalEvents = require('./global-events');


var NewUserRegistration = Class.extend({

	/* PUBLIC PROPERTIES */

	/**
	 * User client socket instance, to communicate through
	 * Defined on instantiation
	 * @type {Object}
	 */
	socket: null,
	/**
	 * MUD Database connection instance
	 * @type {Object}
	 */
	db: null,
	/**
	 * User data hash stored and manipulated here before returning to main app through global userAuth event
	 * @type {Object}
	 */
	userData: {},
	/**
	 * Password is not stored with userData in db, instead stored here before being salted/hashed
	 * @type {String}
	 */
	password: null, // password stored separately from user data
	/**
	 * Global events pub/sub singleton for publishing global events to mud
	 * @type {Object}
	 */
	globalEvents: globalEvents,


	/* PUBLIC METHODS */

	/**
	 * init new user registration process
	 * @param {Object} socket   user socket connection instance
	 * @param {Object} db       database connection instance
	 * @param {String} userName username from initial greet during session handling
	 */
	init: function(socket, db, userName){
		this.socket = socket;
		this.db = db;

		this.userData.name = userName;


		this.socket.emit('message', _.template(dict.newUserGreet, { username: this.userData.name }));
		this._requestNewPassword();
	},


	/* PRIVATE METHODS */

	/**
	 * Request new password from user
	 * On data received, call verify password
	 */
	_requestNewPassword: function(){
		var self = this;

		this.socket.emit('privateRequest', dict.requestNewPassword);
		this.socket.once('message', function(data){
			if( !self._validateNewPassword(data.input) ){
				self._requestNewPassword();
			}else{
				self.password = data.input;
				self._verifyNewPassword();
			}
		});
	},

	/**
	 * check if password fulfills rules (currently just 8+ characters)
	 * @param  {String} password [new user password]
	 * @return {Boolean}          [true if password fulfills rules, false if not]
	 */
	_validateNewPassword: function(password){
		if( password.length < 8 ){
			this.socket.emit('message', dict.passwordLengthError);
			return false;
		}

		return true;
	},

	/**
	 * request verification of new password.
	 * On data received, check match. If matches, start user class selection
	 */
	_verifyNewPassword: function(){
		var self = this;

		this.socket.emit('privateRequest', dict.verifyPassword);
		this.socket.once('message', function(data){
			if( data.input !== self.password ){
				self.socket.emit('message', dict.passwordMismatch);
				self._requestNewPassword();
			}else{
				self._requestEmailAddress();
			}
		});
	},

	/**
	 * request an email from the user.
	 */
	_requestEmailAddress: function(){
		var self = this;

		this.socket.emit('message', dict.requestEmailAddress);
		this.socket.once('message', function(data){
			self.userData.email = data.input;
			self._startUserClassSelection();
		});
	},

	/**
	 * List out available classes for user to choose
	 */
	_startUserClassSelection: function(){
		var self = this,
			classMsg = dict.classList + '<br />';

		for (var className in userSchema.classes){
			classMsg += '- ' + userSchema.classes[className].displayName + '<br />';
		}

		this.socket.emit('message', classMsg);
		this._requestClassName();
	},

	/**
	 * Request user choice for class.
	 * On data received, if class exists, continue registration. If user typed command 'info', show class description.
	 * If invalid class, request class again.
	 */
	_requestClassName: function(){
		var self = this;

		this.socket.emit('message', dict.chooseClass);
		this.socket.once('message', function(data){
			var command1 = data.input.substr(0, data.input.indexOf(' ')),
				command2 = data.input.substr(data.input.indexOf(' ') + 1).toLowerCase(),
				className;

			for( var n in userSchema.classes ){ // get real class object name if exists
				if( userSchema.classes[n].displayName.toLowerCase() === command2 ){
					className = n;
				}
			}

			if( command1 === 'info' && className){
				self._displayClassInfo(className);
			}else if( className && userSchema.classes.hasOwnProperty(className) ){
				self.userData.className = className;
				self._requestRequiredFields();
			}else{
				self.socket.emit('message', dict.invalidClass);
				self._requestClassName();
			}
		});
	},

	/**
	 * Display description for a class
	 * @param  {String} className [name of class (object name from userSchema.classes)]
	 */
	_displayClassInfo: function(className){
		var classObj,
			classInfoMsg = '';

		classObj = userSchema.classes[className];
		classInfoMsg += classObj.displayName + ': ';
		classInfoMsg += classObj.description;

		this.socket.emit('message', classInfoMsg);
		this._startUserClassSelection();
	},

	/**
	 * Request any values listed in userSchema.requiredFields, called recursively.
	 * Once all values have been requested, finish user registration process.
	 */
	_requestRequiredFields: function(){
		var self = this,
			reqFieldsIndex = 0,
			reqFieldsCount = userSchema.requiredFields.length;

		// send request to user for current req field
		function sendRequest(){
			self.socket.emit('message', userSchema.requiredFields[reqFieldsIndex].message);
			self.socket.once('message', onDataReceived);
		}

		// add response to this.userData, request next or finish registration
		function onDataReceived(data){
			self.userData[userSchema.requiredFields[reqFieldsIndex].name] = data.input;

			reqFieldsIndex++;

			if(reqFieldsIndex < reqFieldsCount){
				sendRequest();
			}else{
				self._registerNewUser();
			}
		}

		sendRequest();
	},

	/**
	 * Add any default user attributes, hash the chosen password, and add user to database.
	 */
	_registerNewUser: function(){
		var self = this,
			users = this.db.collection('users');

		this.socket.emit('message', _.template(dict.newUserWelcome, { username: this.userData.name }));

		this.userData.hash = bcrypt.hashSync(this.password, 10); // hash password
		extend(this.userData, userSchema.startingAttributes); // add default/starting character attributes

		users.save(this.userData, function(err, saved){
			if( err || !saved ){
				self.socket.emit('message', 'There was an error saving the new user.');
			}else{
				// self.socket.emit('message', JSON.stringify(saved));
				self._authUser();
			}
		});
	},

	/**
	 * Trigger user registration event on global events object, so app controller can add user/socket to user pool.
	 */
	_authUser: function(){
		this.globalEvents.emit('userAuth', this.userData, this.socket);
	}

});


module.exports = NewUserRegistration;
/**
 *  @module			UserModel
 *  @description	User model class, extends BaseModel class
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

var BaseModel = require('./base-model');


var UserModel = BaseModel.extend({

	/* PUBLIC METHODS */

	/**
	 * Default attributes for each character
	 * Should be overwritten with saved attributes on init
	 * @type {Object}
	 */
	attributes: {
		name: 'Noname',
		description: 'A mysterious figure.',
		className: 'nomad',
		classDisplayName: 'Nomad',
		currentCoords: [0,0,0],
		level: 1,
		hp: 400,
		mana: 100,
		hunger: 100,
		thirst: 100,
		strength: 5,
		defense: 7,
		concentration: 9,
		speed: 6,
		inventory: [],
		equipped: {
			head: null,
			torso: null,
			shoulders: null,
			neck: null,
			arms: null,
			leftHand: null,
			rightHand: null,
			legs: null,
			feet: null
		},
		abilities: [],
		classDescription: 'A wanderer claiming membership to no group.'
	},

	init: function(attributes, options){

		this._super(attributes, options);
	}

});


module.exports = UserModel;
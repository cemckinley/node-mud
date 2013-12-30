
/**
 *  @module			config/new-user-schema
 *  @description	Outlines properties collected and required for new user registration, including user classes
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

module.exports = (function(){

	var userSchema = {

		/**
		 * array for any required attributes for a user, to be requested when a new user registers. Objects in the array
		 * should have name and message properties. The message is what displays to the user when the value is requested.
		 * @type {Array}
		 */
		requiredFields: [
			{
				name: 'description',
				message: 'Please enter a description of your role at the company, using a third-person point of view.'
			}
		],

		/**
		 * An object for each class available for the user to choose. Classes are what are used for combat and skills.
		 * @type {Object}
		 * @example
		 *	'troll' : {
		 *		displayName: 'Troll',
		 *		strength: 5, // value 1-10
		 *		defense: 5, // value 1-10
		 *		concentration: 5, // value 1-10
		 *		speed: 5, // value 1-10
		 *		startingItems: [
		 *			'item GUID' // array of item GUIDS that this class starts with
		 *		],
		 *		abilities: [
		 *			'ability name' // array of special abilities that this class has
		 *		]
		 *		description: 'A smelly foul creature.' // string to describe class
		 *	}
		 */
		classes: {
			'developer': {
				classDisplayName: 'Developer',
				strength: 5,
				defense: 7,
				concentration: 9,
				speed: 6,
				inventory: [],
				abilities: ['hack'],
				classDescription: 'Developers are highly intelligent and defensive, but are somewhat slow and their tendency to spend all day in front of a screen renders them weaker than others.'
			},
			'projectManager': {
				classDisplayName: 'Project Manager',
				strength: 7,
				defense: 9,
				concentration: 4,
				speed: 7,
				inventory: [],
				abilities: ['micromanage'],
				classDescription: 'Project Managers are highly defensive and have moderate strength and speed, but their concentration is limited due to frequent email and phone call interruptions.'
			}
		}

	};

	return userSchema;

}());

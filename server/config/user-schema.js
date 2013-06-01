/*global console: true */

/**
 *  SOCKET.IO MUD SERVER USER SCHEMA SETTINGS
 *
 *  @description object to define what data to request on new user registration
 *
 *  @requires
 *  
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
		 *	'Troll' : {
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
			'Developer': {
				strength: 5,
				defense: 7,
				concentration: 9,
				speed: 6,
				startingItems: [],
				abilities: ['hack'],
				description: 'Developers are highly intelligent and defensive, but are somewhat slow and their tendency to spend all day in front of a screen renders them weaker than others.'
			},
			'Project Manager': {
				strength: 7,
				defense: 9,
				concentration: 4,
				speed: 7,
				startingItems: [],
				abilities: ['micromanage'],
				description: 'Project Managers are highly defensive and have moderate strength and speed, but their concentration is limited due to frequent email and phone call interruptions.'
			}
		}

	};

	return userSchema;

}());

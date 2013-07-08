/*global console: true */

/**
 *  USER SESSION MESSAGES
 *
 *  @description dictionary of messages/strings for the user session controller
 *
 *  
 */

module.exports = (function(){

	var dict = {

		chooseClass: 'Which position are you here for? Hint: Type \'info [role]\' to review the role description.', // instruct user to type 'info [class]' to get info on a class
		classList: 'Our current job openings are for the following roles:',
		incorrectPassword: 'Sorry, that is not the correct password. If you have forgotten your password you can type \'reset password\' and a new password will be sent to the email associated with your account.', // instruct user to type 'reset password' to email new password
		correctPassword: 'Access granted. Enjoy your day at the Agency.',
		invalidClass: 'I\'m sorry, we don\'t have openings for that role.',
		newUserGreet: 'I see it\'s your first day at The Agency, %s. Let\'s begin your paperwork.', // %s flag: username
		passwordMismatch: 'Sorry, your passwords do not match.',
		requestName: 'What is your name, employee?',
		requestNewPassword: 'Please enter a password to use for logging in to our network:',
		passwordLengthError: 'Passwords must be at least 8 characters.',
		requestPassword: 'Welcome back, %s. What is your password?', // %s flag: username
		verifyPassword: 'Please verify your chosen password:',
		welcome: 'Welcome to The Agency.'

	};

	return dict;

}());
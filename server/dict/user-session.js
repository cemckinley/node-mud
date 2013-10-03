
/**
 *  @module			dict/user-session
 *  @description	UI strings used during user session handling
 *
 *  @author			cemckinley <cemckinley@gmail.com>
 *  @copyright		Copyright (c) 2013 Author, contributors
 *  @license		GPL v3
 */

module.exports = (function(){

	var dict = {

		chooseClass: 'Which position are you here for? Hint: Type \'info [role]\' to review the role description.', // instruct user to type 'info [class]' to get info on a class
		classList: 'Our current job openings are for the following roles:',
		correctPassword: 'Access granted. Enjoy your day at the Agency.',
		incorrectPassword: 'Sorry, that is not the correct password. If you have forgotten your password you can type \'reset password\' and a new password will be sent to the email associated with your account.', // instruct user to type 'reset password' to email new password
		invalidClass: 'I\'m sorry, we don\'t have openings for that role.',
		newUserGreet: 'I see it\'s your first day at The Agency, <%= username %>. Let\'s begin your paperwork.', // lodash template variable: username
		newUserWelcome: 'Welcome to The Agency, <%= username %>. Enjoy your first day.', // lodash template variable: username
		notifyPasswordReset: 'A new password has been generated and sent to <%= email %>', // lodash template variable: email
		passwordLengthError: 'Passwords must be at least 8 characters.',
		passwordMismatch: 'Sorry, your passwords do not match.',
		requestEmailAddress: 'Please enter an email address to associate with your account. This email will be used to send you a reset password, should you request it.',
		requestName: 'What is your name, employee?',
		requestNewPassword: 'Please enter a password to use for logging in to our network:',
		requestPassword: 'Welcome back, <%= username %>. What is your password?', // lodash template variable: username
		resetPasswordEmailMessage: 'You are receiving this email because you requested your password for your Agency login to be reset. Your new password is: <%= password %>. You can change your password again once logged in by typing "account" in the prompt.', // lodash template variable: password
		resetPasswordEmailSubject: 'Your requested password reset from The Agency',
		verifyPassword: 'Please verify your chosen password:',
		welcome: 'Welcome to The Agency.'

	};

	return dict;

}());
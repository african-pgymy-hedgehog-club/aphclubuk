'use strict';

/**
 * User controller to preform actions for a user
 * @name User
 * @param object session
 */
function User(session){
	this.session = session;
}

/**
 * Method to chcek if the user has the required access level
 * @param int requiredLevel
 * @return bool
 */
User.prototype.checkAccessLevel = function (requiredLevel) {
	var hasLevel = false;

	if (requiredLevel == this.session.accessLevel) {
		hasLevel = true;
	}

	return hasLevel;
}

module.exports = User;

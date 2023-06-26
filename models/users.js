/* jshint node: true */
'use strict';

var Model = require('./model.js');

/**
 * Class to preform database functionality on user type documents
 * @name Users
 * @paran nano db
 */
function Users(db){
	this.name = 'users';

	Model.call(this, db);
}

Users.prototype = Object.create(Model.prototype); // Inherit from Model Class/Object


/**
 * Method to log a user in using username and password
 * @param string username
 * @param string password
 * @param function cb (err first, object {username, accessLevel} second)
 */
Users.prototype.login = function (username, password, cb){
	this.view('login', [username, password], function (err, rows) {
		if (err) {
			return cb(err);
		}

		if (Array.isArray(rows) && rows[0].value.length === 2) {
			var userDetails = {
				username: rows[0].value[0],
				accessLevel: rows[0].value[1]
			};

			cb(err, userDetails);
		}
		else {
			return cb("Too many rows have been returned", rows);
		}
	});
};

module.exports = Users;

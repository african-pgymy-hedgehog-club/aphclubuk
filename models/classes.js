'use strict';

var util = require('util');
var Model = require('./model.js');

/**
 * Class to be used to preform database functionality on page type documents
 * @name Pages
 * @param nano db
 */
function Classes(db){
	this.name = 'classes';
	Model.call(this, db) // Call parent constructor
}

Classes.prototype = Object.create(Model.prototype); // Inherit from Moel Class/Object

/**
 * Method to check if a show has any classes an if not then delete it
 * @param int id
 * @param function cb
 */
Classes.prototype.delete = function (id, cb) {
	var self = this;
	this.view('entries', id, function (err, rows) {
		if(err){
			return cb(err);
		}

		if(!Array.isArray(rows) || (Array.isArray(rows) && rows.length === 0)){
			Model.prototype.delete.call(self, id, cb);
		}
		else{
			cb("Cannot delete class because it has entries");
		}
	});
};

module.exports = Classes;

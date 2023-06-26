'use strict';

var util = require('util');
var Model = require('./model.js');

/**
 * Class to be used to preform database functionality on page type documents
 * @name Pages
 * @param nano db
 */
function Shows(db){
	this.name = 'shows';
	Model.call(this, db) // Call parent constructor
}

Shows.prototype = Object.create(Model.prototype); // Inherit from Moel Class/Object

/**
 * Method to check if a show has any classes an if not then delete it
 * @param int id
 * @param function cb
 */
Shows.prototype.delete = function (id, cb) {
	var self = this;
	this.view('classes', id, function (err, rows) {
		if(err){
			next(err);
		}

		if(!Array.isArray(rows) || (Array.isArray(rows) && rows.length === 0)){
			Model.prototype.delete.call(self, id, cb);
		}
		else{
			cb("Cannot delete show because it has classes");
		}
	});
};

Shows.prototype.all = function (cb) {
	Model.prototype.view.call(this, 'all', function (err, rows) { // Retrieve all shows
		if (err) {
			return cb(err)
		}

		var shows = [];
		rows.forEach(function (row) {
			shows.push(row.value);
		});

		cb(err, shows);
	});
};

module.exports = Shows;

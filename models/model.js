/* jshint node: true */

'use strict';

var merge = require('merge');

/**
 * Base model class to contain generic database functionality
 * @name Model
 * @param nano db
 */
function Model(db){
	this.db = db;
}

/**
 * Method to retieve a single document from the database
 * @param string id
 * @param function cb
 */
Model.prototype.get = function (id, cb){
	this.db.get(id, cb);
};

/**
 * Method to retrieve rows from a view
 * @param string view
 * @param array params
 * @param function cb
 */
Model.prototype.view = function (view, params, cb){
	var path = '_design/' + this.name + '/_view/' + view;
	if (typeof (params) !== 'object') {
		if (typeof (params) === 'function') {
			cb = params;
			params = undefined;
		}
		else {
			params = { 'key': params };
		}
	}

	this.db.get(path, params, function (err, body) {
		if (err) {
			return cb(err);
		}
		cb(err, body.rows);
	});
};

/**
 * Method to update a document in the database
 * @param string id
 * @param object update
 * @param function cb
 */
Model.prototype.update = function (id, update, cb){
	var self = this;
	this.db.get(id, function (err, body) {
		if (err) {
			return cb(err);
		}

		if (typeof (body) !== 'object' || Array.isArray(body) || body.length === 0) {	// Check if body has retured a valid document
			return cb("A valid document was not returned. Document: " + body);
		}

		var updateObj = merge(body, update);
		self.db.insert(updateObj, function (err, body) {
			if (err) {
				return cb(err);
			}

			cb(err, body);
		});
	});
};

/**
 * Method to create a new document in th database
 * @param object doc
 * @param function cb
 */
Model.prototype.insert = function (doc, cb) {
	this.db.insert(doc, cb);
};

/**
 * Method to delete a document in the database
 * @param int id
 * @param function cb
 */
Model.prototype.delete = function (id, cb) {
	var self = this;
	this.get(id, function (err, body) {
		if(err){
			return cb(err);
		}

		if(typeof (body) !== 'object' || Array.isArray(body) || body.length === 0){
			return cb("A valid document was not returned. Document: " + body);
		}

		var revision = body._rev;
		self.db.destroy(id, revision, function (err, body) {
			cb(err, body);
		});
	});
};

module.exports = Model;

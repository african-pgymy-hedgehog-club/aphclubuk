'use strict';

var util = require('util');
var Model = require('./model.js');

/**
 * Class to be used to preform database functionality on page type documents
 * @name Pages
 * @param nano db
 */
function Entries(db){
	this.name = 'entries';
	Model.call(this, db) // Call parent constructor
}

Entries.prototype = Object.create(Model.prototype); // Inherit from Moel Class/Object

module.exports = Entries;

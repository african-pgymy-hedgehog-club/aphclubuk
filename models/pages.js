'use strict';

var util = require('util');
var Model = require('./model.js');
var merge = require('merge');
const async = require('async');

/**
 * Class to be used to preform database functionality on page type documents
 * @name Pages
 * @param nano db
 */
 module.exports = class Pages extends Model {
	constructor(db){
        super(db); // Call parent constructor
		this.name = 'pages';
	}

	activeNames (cb) {
		this.view('active_names', function (err, rows) {
			if(err){
				return cb(err);
			}

			var pages = [];
			async.eachSeries(rows, function (row, cb) {
				pages.push(row.value);
                cb();
			}, (err) => {
                if(err) {
                    return cb(err);
                }

                cb(err, pages);
			});
		});
	}

    /**
     * Create new subNav on a page object
     * @param {string} id
     * @param {int} subNav
     * @param {function} cb
     */
	addSubNav(id, subNav, cb) {
		this.get(id, (err, body) => {
		    if(err) {
                return cb(err);
            }

            if (typeof (body) !== 'object' || Array.isArray(body) || body.length === 0) {	// Check if body has retured a valid document
    			return cb("A valid document was not returned. Document: " + body);
    		}

            if(body.subNavs && Array.isArray(body.subNavs)) {
                body.subNavs.push(subNav);
            }
            else {
                body.subNavs = [
                    subNav
                ];
            }

            let updateObj = body;
            this.db.insert(updateObj, cb);
		});
	}

    /**
     * Update a subNav on a page object
     * @param {string} id
     * @param {int} subNavIndex
     * @param {object} update
     * @param {function} cb
     */
    updateSubNav(id, subNavIndex, update, cb) {
        this.get(id, (err, body) => {
            if(err) {
                return cb(err);
            }

            let subNav = body.subNavs[subNavIndex];
            subNav = merge(subNav, update);

            body.subNavs[subNavIndex] = subNav;

            this.update(id, body, cb);
        });
    }
};

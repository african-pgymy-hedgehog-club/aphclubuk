#!/usr/bin/node

/* jshint node: true */

var request = require('request');
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
var env = packageJson.env;
var couchURL = 'http://couchdb:5984';

var requestOptions = {
	method: "PUT",
	uri: couchURL + '/_config/admins/SC7639',
	json: '7639sonicadv!'
};

request(requestOptions, function (err, res) {
	if(err){
		console.log(err);
	}

    var debug = require('debug')('aphclubuk');
	var app = require('../app')(debug);

	app.set('port', process.env.PORT || 3000);

    var server = app.get('server').listen(app.get('port'), function() {
        debug('Express server listening on port ' + server.address().port);
    });
});

"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
var env = packageJson.env;
var Render = require('../render.js');
var edenString = require('eden-string');
var PagesModel = require('../models/pages.js');
var ShowsModel = require('../models/shows');
const EntriesModel = require('../models/entries');
var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res) {
	var page = new PagesModel(res.db);
	page.view('content', 'Home', function(err, rows) {
		if (err) {
			return next(err);
		}

		var content = rows[0].value;
		var render = new Render(res, 'index', { title: 'Home', 'env': env, content: content }, req.session);
		render.render();
	});
});

router.get('/email', function (req, res, next) {
	res.redirect('http://vps.sandedp.co.uk/webmail');
});

router.get('/home', function (req, res, next) {
	var page = new PagesModel(res.db);
	page.view('content', 'Home', function(err, rows) {
		if (err) {
			return next(err);
		}

		var content = rows[0].value;
		var render = new Render(res, 'index', { title: 'Home', 'env': env, content: content }, req.session);
		render.render();
	});
});

router.get('/shows', function (req, res, next) {
	var show = new ShowsModel(res.db);
	show.all(function (err, shows) {
		if (err) {
			return next(err);
		}

		var showActive = false;
		shows.forEach(function (show) {
			if(show.active){
				showActive = true;
				return false; // break out of loop
			}
		});

		var options = {
			'env': env,
			shows: shows,
			showActive: showActive
		};

		var render = new Render(res, 'shows', options, req.session);
		render.render();
	});
});

router.get('/show/enter', function (req, res, next) {
	var show = new ShowsModel(res.db);
	show.view('active', function (err, rows) {
		if(err){
			return next(err);
		}

		if(Array.isArray(rows) && rows.length > 0){ // IF there is an active show
			var showObj = rows[0].value;

			show.view('classes', rows[0].key, function (err, rows) {
				if(err){
					return next(err);
				}

				var classes = [];
				rows.forEach(function (row) {
					classes.push(row.value);
				});

				var date = showObj.date.split('/');
				var showDate = (date[2].indexOf(20) > -1 ? '' : '20') + date[2] + '-' + date[1] + '-' + date[0];
				var minDOB = moment(showDate).subtract(classes[0].minimumAge.date1, classes[0].minimumAge.date2).format('YYYY-MM-DD');
				var maxDOB = moment(showDate).subtract(classes[0].maximumAge.date1, classes[0].maximumAge.date2).format('YYYY-MM-DD');
				showObj.date = showDate;

				var options = {
					env: env,
					show: showObj,
					classes: classes,
					resources: {
						js: ['/js/components/datepicker.js', '/js/show-form-bundle.js', '/js/paypal-form.js', '/js/runtime.js']
					},
					maxDate: minDOB,
					minDate: maxDOB
				};

				var render = new Render(res, 'show-form', options, req.session);
				render.render();

			});
		}
		else{
			var option = {
				title: '',
				content: '<h1 class="uk-text-center">Show Entries are currently closed</h1>'
			};

			var render = new Render(res, 'index', option, req.session);
			render.render();
		}
	});
});

router.get('/shows/:id([a-z0-9]+)', function (req, res, next) {
	var show = new ShowsModel(res.db);
	show.get(req.params.id, function (err, show) {
		if (err) {
			return next(err);
		}

		var options = {
			show: show
		};

		var render = new Render(res, 'show-details', options, req.session);
		render.render();
	});
});

router.get('/entry/:id([a-z0-9]+)', function (req, res, next) {
	let entries = new EntriesModel(res.db);

	entries.get(req.params.id, function (err, entry) {
		if(err) {
			return next(err);
		}

		let options = {
			entry: entry
		};

		let render = new Render(res, 'entry', options, req.session);
		render.render();
	});
});

router.get('/:page([a-zA-Z0-9_]+)', function (req, res, next) {
	var title = edenString().ucWords(req.params.page.replace('_', ' '));
	var pageName = req.params.page;
	var page = new PagesModel(res.db);
	page.view('content', title, function (err, rows) {
		if (err) {
			return next(err);
		}

		if (Array.isArray(rows) && rows.length == 1) {
			var content = rows[0].value;
			var session = req.session;
			var render = new Render(res, 'index', { title: title, 'env': env, content: content }, session);
			render.render();
		}
		else {
			err = new Error("Failed to retrieve " + title + " page content");
			next(err);
		}
	});
});

router.get('/:page([a-zA-Z0-9_]+)/:subnav([a-zA-Z0-9_]+)', function (req, res, next) { // Render sub nav page
	var title = edenString().ucWords(req.params.subnav.replace('_', ' '));
	var pageName = req.params.page;
	var page = new PagesModel(res.db);
	page.view('subnav_content', title, function (err, rows) {
		if (err) {
			return next(err);
		}

		if (Array.isArray(rows) && rows.length == 1) {
			var content = rows[0].value;
			var session = req.session;
			var render = new Render(res, 'index', { title: title, 'env': env, content: content }, session);
			render.render();
		}
		else {
			err = new Error("Failed to retrieve " + title + " page content");
			next(err);
		}
	});
});

module.exports = router;

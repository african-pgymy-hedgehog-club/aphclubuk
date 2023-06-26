"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
var env = packageJson.env;
var Render = require('../render.js');
var UserModel = require('../models/users.js');
var PagesModel = require('../models/pages.js');
var ShowsModel = require('../models/shows.js');
var ClassesModel = require('../models/classes.js');
var UserController = require('../controllers/user.js');
var io = require('socket.io');
var async = require('async');

/* GET users listing. */
router.get('/', function (req, res) {
	var session = req.session;
	if (session.username) {
		res.redirect('/home');
	}
	else {
		var render = new Render(res, 'user', { title: 'Users', 'env': env, post: req.body });
		render.render();
	}
});

router.post('/login', function (req, res, next) {
	var session = req.session;
	var user = new UserModel(res.db);
	var params = req.body;

	user.login(params.username, params.password, function (err, user) {
		if (err) {
			return next(err);
		}

		if (!session.username) {
			session.username = user.username;
			session.accessLevel = user.accessLevel;
			session.save();
			res.redirect('/home');
		}
		else {
			res.redirect('/home');
		}

	});
});

router.all('/logout', function (req, res, next) {
	var session = req.session;
	session.destroy(function (err) {
		if (err) {
			return next(err);
		}

		res.redirect('/home');
	});
});

router.get('/pages', function (req, res, next) {
	const session = req.session;
	if(!session.username) {
		return res.redirect('/home');
	}

	var options = {
		env: env,
		title: 'User / Pages',
		resources: {
			js: ['/js/switch.js', '/js/add-page-form.js', '/js/pages-bundle.js', '/js/runtime.js']
		}
	};

	var user = new UserController(session);
	var access = user.checkAccessLevel(5);

	if (!access) {	// If the user doesn't have the required access level to access this page
		return res.redirect('/home');
	}

	// Retrieve all pages from couchdb
	var pages = new PagesModel(res.db);
	pages.view('all', function (err, rows) {
		if (err) {
			return next(err);
		}

		var pagesObj = [];
		async.eachSeries(rows, function(row, cb) {
			pagesObj.push(row.value);
			cb();
		},
		function (err) {
			if(err){
				return next(err);
			}


			options.pages = pagesObj;
			var render = new Render(res, 'pages', options, req.session);
			render.render();
		});
	});
});

router.get('/pages/:id([a-zA-Z0-9]+)', function (req, res, next) { // Get page content
	if(!req.session.username) {
		return res.redirect('/home');
	}

	var id = req.params.id;
	var page = new PagesModel(res.db);
	page.get(id, function (err, body) {
		if (err) {
			return next(err);
		}

		var options = {
			id: id,
			title: 'Pages / ' + body.name,
			env: env,
			content: body.content,
			resources: {
				js: ['/js/ckeditor/ckeditor.js', '/js/edit-page.js', '/js/components/notify.js']
			},
		};

		var render = new Render(res, 'edit_page', options, req.session);
		render.render();
	});
});

router.get('/pages/:id([a-zA-Z0-9]+)/:subnav([0-9]+)', (req, res, next) => { // Get page content for subNav pages
	if(!req.session.username) {
		return res.redirect('/home');
	}

	let id = req.params.id;
	let subNavIndex = req.params.subnav;

	let page = new PagesModel(res.db);
	page.get(id, (err, body) => {
		if(err) {
			return next(err);
		}


		let page = body.subNavs[subNavIndex];
		let options = {
			id: id,
			subNavIndex: subNavIndex,
			title: `Pages / ${body.name} / ${page.name}`,
			env: env,
			content: page.content,
			resources: {
				js: ['/js/ckeditor/ckeditor.js', '/js/edit-page.js', '/js/components/notify.js']
			},
		};

		let render = new Render(res, 'edit_page', options, req.session);
		render.render();
	});
});

router.post('/pages/:id([a-zA-Z0-9]+)', function (req, res, next) { // Save page content
	if(!req.session.username) {
		return res.redirect('/home');
	}

	var db = res.db;
	var page = new PagesModel(db);
	page.update(req.params.id, { content: req.body.content }, function (err, body) {
		if (err) {
			return next(err);
		}

		res.end('true');
	});
});

router.post('/pages/:id([a-zA-Z0-9]+)/:subnav([0-9]+)', (req, res, next) => { // Save page content for sub nav pages
	if(!req.session.username) {
		return res.redirect('/home');
	}

	let page = new PagesModel(res.db);
	page.updateSubNav(req.params.id, req.params.subnav, {
		content: req.body.content
	}, (err, body) => {
		if(err) {
			return next(err);
		}

		res.end('true');
	});
});

router.get('/shows', function(req, res, next){
	if(!req.session.username) {
		return res.redirect('/home');
	}

	var options = {
		env: env,
		resources: {
			js: [
				'/js/switch.js',
				'/js/add-show-form.js',
				'/js/shows-bundle.js',
				'/js/components/datepicker.min.js',
				'/js/components/autocomplete.min.js',
				'/js/components/timepicker.min.js',
				'/js/components/notify.min.js'
			]
		}
	};


	var show = new ShowsModel(res.db);
	show.all(function (err, shows) {
		if(err){
			return next(err);
		}

		options.shows = shows;

		var render = new Render(res, 'user-shows', options, req.session);
		render.render();
	});
});

router.get('/shows/:id([a-zA-Z0-9]+)', function(req, res, next){
	if(!req.session.username) {
		res.redirect('/home');
	}

	var id = req.params.id;
	var show = new ShowsModel(res.db);
	show.get(id, function (err, body) {
		if(err){
			return next(err);
		}

		var options = {
			id: id,
			title: 'Shows / ' + body.name,
			env: env,
			resources: {
				js: ['/js/classes-bundle.js', '/js/add-class-form.js', '/js/components/notify.min.js']
			},
			show: body
		};

		show.view('classes', id, function (err, rows) {
			if(err){
				return next(err);
			}

			var classes = [];
			rows.forEach(function (row) {
				classes.push(row.value);
			});
			options.classes = classes;

			var render = new Render(res, 'user-shows/classes', options, req.session);
			render.render();
		});
	});
});


router.get('/class/:id([a-zA-Z0-9]+)', function (req, res, next) {
	if(!req.session.username) {
		return res.redirect('/home');
	}

	var id = req.params.id;
	var clas = new ClassesModel(res.db);
	clas.get(id, function (err, body) {
		if(err){
			return next(err);
		}

		var options = {
			id: id,
			title: 'Class / ' + body.name,
			env: env,
			resources: {
				js: ['/js/entries-bundle.js']
			},
			clas: body
		};

		clas.view('entries', id, function (err, rows) {
			if(err){
				return next(err);
			}

			var entries = [];

			rows.forEach(function (row) {
				entries.push(row.value);
			});
			options.entries = entries;

			var render = new Render(res, 'user-shows/entries', options, req.session);
			render.render();
		});
	});
});

module.exports = router;

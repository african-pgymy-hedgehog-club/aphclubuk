/* jshint node: true */

'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var nib = require('nib');
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
var env = packageJson.env;
var nano = require('nano');
var couchURL = 'http://couchdb:5984';
var couch = nano(couchURL);
var db;
var PagesModel = require('./models/pages.js');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var Render = require('./render.js');
var async = require('async');

var app = express();

if(env == 'dev') {
	var server = require('http').createServer(app);
} else {
	var server = require('https').createServer({
		cert: fs.readFileSync("./certs/fullchain.pem"),
		key: fs.readFileSync("./certs/privkey.pem"),
		agent: false, 
		requestCert: true,
		rejectUnauthorized: false
	}, app);
}

var io = require('socket.io')(server);
var env = packageJson.env;
app.set('env', env);
app.set('io', io);
app.set('server', server);

var redisCon = {
	host: 'redis',
	port: 6379
};

var routes = require('./routes/index');
var users = require('./routes/users');
var sockets = require('./routes/socket')(app);
var paypal = require('./routes/paypal');

/**
 * Function that acts as a custom compile function to use nib with stylus
 * @param string str
 * @param string path
 * @return mixed
 */
function compileStylus(str, path) {
	return stylus(str).set('filname', path).use(nib());
}

/**
 * Function to retrieve authentication token and get authenticated databases instance
 * @param reqestObject req
 * @param responseObject res
 * @param function next
 */
function getDBAuth(req, res, next){
	couch.auth('SC7639', '7639sonicadv!', function (err, body, headers) {
		if (err) {
			return next(err);
		}

		db = nano({ url: couchURL, cookie: headers['set-cookie'] }).use('aphclubuk');
		res.db = db;
		app.set('db', db);
		next();
	});
}

/**
 * Function to get active pages from database as an array
 * @param reqestObject req
 * @param responseObject res
 * @param function next
 */
function getActivePages(req, res, next) {
	var pages = new PagesModel(db);
	pages.activeNames(function (err, activePages) {
		if (err) {
			return next(err);
		}

		res.activePages = activePages;
		app.set('activePages', activePages);
		next();
	});
}


// view engine setup
app.set('view engine', 'jade');
app.set('env' , packageJson.env);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware({
	src: path.join(__dirname, 'public'),
	compile: compileStylus,
	resave: false,
	saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(getDBAuth);
app.use(getActivePages);


app.use(session({ // Redis session store
	store: new redisStore(redisCon),
	secret: 'aphuk',
	resave: false,
	saveUninitialized: false
}));
app.use(function (res, req, next) { // Function to set request.session to app variable
	app.set('session', res.session);
	next();
});

app.use('/paypal', paypal);
app.use('/users', users);
app.use('/admin', users);
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		new Render(res, 'error', {
			message: err.message,
			error: err
		}).render();
	});
}
else{
	// production error fhandler
	// no stacktraces leaked to user
	app.use(function (err, req, res, next) {
		console.error(err);

		res.status(err.status || 500);
		new Render(res, 'error', {
			message: err.message,
			error: {}
		}).render();
	});
}
module.exports = app;

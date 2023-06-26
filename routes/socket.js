/* jshint node: true */

"use strict";

var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
var env = packageJson.env;
var Render = require('../render.js');
var PagesModel = require('../models/pages.js');
var ShowsModel = require('../models/shows.js');
var ClassesModel = require('../models/classes.js');
var EntriesModel = require('../models/entries.js');
var async = require('async');

function webSockets(app) {
    var io = app.get('io');
    io.set('match origin protocol', true);

    io.of('/users/pages').on('connection', function (socket) { // Socket io websocket connecton for /users/pages
        socket.on('error', function (err) {
            console.error(err.stack);
        });

        socket.on('sort', function (pagesList) { // On page sort update order of all page documents(rows)
            var i = -1;
            var pages = new PagesModel(app.get('db'));

            async.each(pagesList, function (page, cb) {
                ++i;
                pages.update(page.id, { order: i }, function (err) {
                    if (err) {
                        return console.error(err);
                    }

                    cb();

                });
            },
            function (err){
                if (err) {
                    return	console.log(err);
                }

                pages.view('active', function (err, rows) {
                    if (err) {
                        return console.error(err);
                    }
                    let activePages = [];

                    async.eachSeries(rows, (row, cb) => {
                        activePages.push(row.value);
                        cb();
                    }, (err) => {
                        if(err){
                            return console.error(err);
                        }

                        app.set('activePages', activePages);

                        var render = new Render(app, 'templates/navbar', {}, app.get('session'));
                        console.log(render);
                        socket.emit('nav', render.html());
                    });
                });
            });
        });

        socket.on('active', function(checked, id){ // On active page change update document(row)
            var page = new PagesModel(app.get('db'));
            page.update(id, { active: checked }, function (err) {
                if(err){
                    return console.error(err);
                }

                var pages = new PagesModel(app.get('db'));
                pages.activeNames(function(err, activePages){
                    if(err){
                        return console.error(err);
                    }

                    app.set('activePages', activePages);

                    var render = new Render(app, 'templates/navbar', {}, app.get('session'));
                    socket.emit('nav', render.html());
                });
            });
        });

        socket.on('active sub nav', function(checked, id){ // On active sub nav change update document(row)
            id = id.split('/');
            let subNavIndex = id[1];
            id = id[0];

            var page = new PagesModel(app.get('db'));
            page.updateSubNav(id, subNavIndex, { active: checked }, function (err) {
                if(err){
                    return console.error(err);
                }

                var pages = new PagesModel(app.get('db'));
                pages.activeNames(function(err, activePages){
                    if(err){
                        return console.error(err);
                    }

                    app.set('activePages', activePages);

                    var render = new Render(app, 'templates/navbar', {}, app.get('session'));
                    socket.emit('nav', render.html());
                });
            });
        });

        socket.on('add', function (name, active, order, parent) { // On add socket event create a new page document
            var pageDoc = {
                name: name,
                active: active,
            };

            let page = new PagesModel(app.get('db'));

            if(parent !== null){
                page.addSubNav(parent, pageDoc, (err) => {
                    if(err) {
                        return console.error(err);
                    }

                    socket.emit('reload');
                });
            }
            else {
                pageDoc.type = 'page';

                page.insert(pageDoc, function (err) {
                    if(err){
                        return console.error(err);
                    }

                    socket.emit('reload');
                });
            }
        });

        socket.on('delete', function (id) { // On delete socket event, delete page document
            var page = new PagesModel(app.get('db'));
            page.delete(id, function (err) {
                if(err){
                    return console.error(err);
                }

                socket.emit('reload');
            });
        });

        socket.on('delete sub nav', (id) => {
             id = id.split('/');
             let subNavIndex = id[1];
             id = id[0];

            let page = new PagesModel(app.get('db'));
            page.get(id, (err, body) => {
                if(err) {
                    return console.err(err);
                }

                let subNavs = body.subNavs;
                subNavs.splice(subNavIndex, 1);

                page.update(id, { subNavs: subNavs }, (err) => {
                    if(err) {
                        return console.error(err);
                    }

                    socket.emit('reload');
                });
            });
        });

        socket.on('get all pages', function () { // On get all pages event, retrieve all pages as an array
            var page = new PagesModel(app.get('db'));
            page.view('all', function (err, rows) {
                var allPages = [];
                rows.forEach(function (row) {
                    allPages.push(row.value);
                });

                socket.emit('form all pages', allPages);
            });
        });

        socket.on('get sub nav', function (id) { // On get sub nav event, retrieve all subnavs for parent id
            var page = new PagesModel(app.get('db'));
            page.view('subpages', id, function (err, rows) {
                if(err){
                    return console.error(err);
                }

                var subNav = [];
                rows.forEach(function (row) {
                    subNav.push(row.value);
                });

                socket.emit('display sub nav', subNav);
            });
        });
    });

    io.of('/users/shows').on('connection', function (socket) { // Socket io websocket connecton for /users/shows
        socket.on('error', function (err) {
            console.error(err);
        });

        socket.on('add', function (name, location, date, time) { // On add socket event, create a new show document
            var showDoc = {
                name: name,
                location: location,
                date: date,
                time: time,
                type: 'show',
                active: false
            };

            var show = new ShowsModel(app.get('db'));
            show.insert(showDoc, function (err) {
                if(err){
                    console.error(err);
                }

                show.all(function (err, shows) { // Retrieve all shows
                    if (err) {
                        return socket.emit('err', err);
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

                    options.shows = shows;

                    var render = new Render(app, 'shows-list', options, app.get('session'));
                    var html = render.html();
                    socket.emit('created show', html);
                });

            });
        });

         socket.on('delete', function (id) { // On delete socket event, delete a show by id
             var show = new ShowsModel(app.get('db'));
            show.delete(id, function (err) {
                if(err){
                    return socket.emit('err', err);
                }

                show.all(function (err, shows) {
                    if (err) {
                        return socket.emit('err', err);
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

                    options.shows = shows;

                    var render = new Render(app, 'shows-list', options, app.get('session'));
                    var html = render.html();

                    socket.emit('deleted show', html);
                });
            });
        });

        socket.on('update', function (id, name, value) { // On update socket event, update the document in the database
            var updateObj = {};
            updateObj[name] = value;
            var show = new ShowsModel(app.get('db'));
            show.update(id, updateObj, function (err) {
                if (err) {
                    return socket.emit('err', err);
                }

                socket.emit('reload');
            });
        });

        socket.on('active', function (active, id) { // On active socket event, update each show to be inactive and then update the show to active
            var show = new ShowsModel(app.get('db'));
            show.all(function (err, shows) {
                if (err) {
                    return socket.emit('err', err);
                }

                async.forEach(shows, function (showObj, cb) { // For each show update the show as inactive (active: false) except the show being set to active
                    if(showObj._id !== id){
                        show.update(showObj._id, {active: false}, function (err) {
                            if (err) {
                                return cb(err);
                            }

                            cb();
                        });
                    }
                    else{
                        cb(err);
                    }
                },
                function (err) { // Function to update show to active
                    if (err) {
                        return socket.emit('err', err);
                    }

                    show.update(id, {active: active}, function (err) {
                        if(err){
                            return socket.emit('err', err);
                        }

                        socket.emit('set active', id);
                    });
                });
            });
        });
    });

    io.of('/users/classes').on('connection', function (socket) { // Socket io connection for /user/show/showID (class)
        socket.on('error', function (err) {
            console.error(err);
        });

        socket.on('add', function (name, gender, minimumAge, maximumAge, price, showID) { // On add class socket event, create a new class document
            var classObj = {
                name: name,
                gender: gender,
                minimumAge: minimumAge,
                maximumAge: maximumAge,
                price: price,
                showID: showID,
                type: 'class'
            };

            var db = app.get('db');
            var clas = new ClassesModel(db);
            clas.insert(classObj, function (err) {
                if (err) {
                    return socket.on('err', err);
                }

                var show = new ShowsModel(db);
                show.view('classes', showID, function (err, rows) {
                    if (err) {
                        return socket.on('err', err);
                    }

                    var classes = [];
                    rows.forEach(function (row) {
                        classes.push(row.value);
                    });
                    var options = {};
                    options.classes = classes;

                    var render = new Render(app, 'user-shows/class-list', options, app.get('session'));
                    socket.emit('created class',  render.html());
                });
            });
        });

        socket.on('delete', function (id, showID) { // On delete socket event, delete a show by id
            var clas = new ClassesModel(app.get('db'));
            clas.delete(id, function (err) {
                if(err){
                    return socket.emit('err', err);
                }

                var show = new ShowsModel(app.get('db'));
                show.view('classes', showID, function (err, rows) {
                    if (err) {
                        return socket.on('err', err);
                    }

                    var classes = [];
                    rows.forEach(function (row) {
                        classes.push(row.value);
                    });
                    var options = {};
                    options.classes = classes;

                    var render = new Render(app, 'user-shows/class-list', options, app.get('session'));
                    socket.emit('deleted class',  render.html());
                });
            });
        });
    });

    io.of('/show/enter').on('connection', function (socket) { // Socket io websocket connection for /show/enter
        socket.on('error', function (err) {
            console.error(err);
        });

        socket.on('entry', function (classID, hog, owner) { // On entry docker event, add new entry to class
            var entryDoc = {
                classID: classID,
                hog: hog,
                owner: owner,
                type: 'entry'
            };

            var entries = new EntriesModel(app.get('db'));
            entries.insert(entryDoc, function (err, entry) {
                if (err) {
                    return socket.emit('err', err);
                }

                var classes = new ClassesModel(app.get('db'));
                classes.get(classID, function (err, clas) {
                    if (err) {
                        return socket.emit('err', err);
                    }

                    socket.emit('added entry', entry.id, hog.name, clas.name, clas.price);
                });
            });
        });
    });

    return io;
}

module.exports = webSockets;

module.exports = function (grunt) {

	var jsRoot = "public/js/";

	var browserifyOptions = {
		browserifyOptions: {
			debug: true
		},
		transform: [
			[{}, 'babelify', {
				loose: 'all'
			}],
			[{global: true}, 'envify']
		]
	};

	grunt.initConfig({

		browserify: {
			pages: {
				options: browserifyOptions,
				src: jsRoot + 'pages.js',
				dest: jsRoot + 'pages-bundle.js'
			},
			shows: {
				options: browserifyOptions,
				src: jsRoot + 'shows.js',
				dest: jsRoot + 'shows-bundle.js'
			},
			classes: {
				options: browserifyOptions,
				src: jsRoot + 'classes.js',
				dest: jsRoot + 'classes-bundle.js'
			},
			showForm: {
				options: browserifyOptions,
				src: jsRoot + 'show-form.js',
				dest: jsRoot + 'show-form-bundle.js'
			},
			entries: {
				options: browserifyOptions,
				src: jsRoot + 'entries.js',
				dest: jsRoot + 'entries-bundle.js'
			}
		},

		jade: {
			options: {
				pretty: true
			},
			template: {
				options: {
					client: true,
				},
				expand: true,
				cwd: 'views/client',
				src: ['*.jade'],
				dest: 'public/js/',
				ext: '.js'
			}
		},


		// Watches for changes and runs tasks
		// Livereload is setup for the 36729 port by default
		watch: {
			jsPages: {
				files: [jsRoot + 'pages.js'],
				tasks: ['browserify-pages'],
				options: {
					livereload: 36729
				}
			},
			jsShows: {
				files: [jsRoot + 'shows.js'],
				tasks: ['browserify-shows'],
				options: {
					livereload: 36729
				}
			},
			jsClasses:{
				files: [jsRoot + 'classes.js'],
				tasks: ['browserify-classes'],
				options:{
					livereload: 36729
				}
			},
			jadeClients: {
				files: ['views/client/*.jade'],
				tasks: ['jade'],
				options: {
					livereload: 36729
				}
			},
			jsShowForm: {
				files: [jsRoot + 'show-form.js'],
				tasks: ['browserify-showForm'],
				options: {
					livereload: 36729
				}
			},
			jsEntries: {
				files: [jsRoot + 'entries.js'],
				tasks: ['browserify-entries'],
				options: {
					livereload: 36729
				}
			}
		}
	});

	grunt.registerTask('jade', 'jade');
	grunt.registerTask('browserify-pages', ['browserify:pages']);
	grunt.registerTask('browserify-shows', ['browserify:shows']);
	grunt.registerTask('browserify-classes', ['browserify:classes']);
	grunt.registerTask('browserify-showForm', ['browserify:showForm']);
	grunt.registerTask('browserify-entries', ['browserify:entries']);
	grunt.registerTask('nodemon', ['nodemon']);
	// Default task
	grunt.registerTask('default', ['watch']);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-nodemon');

};

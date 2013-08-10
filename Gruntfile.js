/*global module:false*/


module.exports = function (grunt) {


var DEV_PATH = 'client/src';
var DIST_PATH = 'client/dist';
var TEMP_PATH = 'client/temp';
var TEST_PATH = 'client/test';
var SERVER_APP_PATH = 'server';

var path = require('path');
var lrSnippet = require('connect-livereload')();
var folderMount = function folderMount(connect, point) {
	return connect.static(path.resolve(point));
};

// Project configuration.
grunt.initConfig({
	qunit: {
		files: [TEST_PATH + '/**/*.html']
	},
	watch: {
		css: {
			files: [
				DEV_PATH + '/_ui/css/**/*.scss',
				DEV_PATH + '/_ui/css/**/*.css'
			],
			tasks: ['compass:dev', 'copy:devcss'],
            options: {
                livereload: true
            }
		},
		js: {
			files: [
				DEV_PATH + '/_ui/js/**/*.js'
			],
			tasks: ['copy:devjs'],
            options: {
                livereload: true
            }
		},
		hbs: {
			files: [
				DEV_PATH + '/_ui/hbs/**/*.hbs'
			],
			tasks: ['handlebars:dev'],
            options: {
                livereload: true
            }
		},
		serverjs: {
			files: [
				'server/**/*.js'
			],
			tasks: ['runscripts']
		},
		other: {
			files: [
				DEV_PATH + '/**/*.html',
				DEV_PATH + '/_ui/img/**/*'
			],
			tasks: ['copy:devall'],
            options: {
                livereload: true
            }
		}
	},
	connect: {
		dev: {
			options: {
				port: 8001,
				hostname: null, // setting hostname to null allows requests at port 8001 locally for any host name (i.e. localhost, network IP or machine name)
				base: TEMP_PATH,
				middleware: function(connect, options) {
					return [lrSnippet, folderMount(connect, TEMP_PATH)];
				}
			}
		}
	},
	jshint: {
		options: {
			curly: true,
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			undef: true,
			boss: true,
			eqnull: true,
			browser: true
		},
		files: grunt.file.expand([
			DEV_PATH + '/_ui/js/**/*.js',
			TEST_PATH + '/**/*.js',
			'!' + TEST_PATH + '/qunit.js',
			'!' + DEV_PATH + '/_ui/js/lib/**/*' // leave out 3rd party js in lib folder, since can't guarantee lint quality
		]),
		globals: {}
	},
	compass: {
		dev: {
			options: {
				cssDir: TEMP_PATH + '/_ui/css',
				sassDir: DEV_PATH + '/_ui/css',
				environment: 'development'
			}
		},
		dist: {
			options: {
				cssDir: DIST_PATH + '/_ui/css',
				sassDir: DEV_PATH + '/_ui/css',
				environment: 'production'
			}
		}
	},
	handlebars: {
		dev: {
			options: {
				namespace: 'NODEMUD.templates',
				processName: function(filename) {
					var name = filename.split('/hbs/')[1].split('.hbs')[0]; // remove from hbs dir up, and remove .hbs extension
					return name;
				}
			},
			files: [
				{
					dest: TEMP_PATH + '/_ui/js/templates.js',
					src: DEV_PATH + '/_ui/hbs/**/*.hbs'
				}
			]
		},
		dist: {
			options: {
				namespace: 'NODEMUD.templates'
			},
			files: [
				{
					dest: DIST_PATH + '/_ui/js/templates.js',
					src: DEV_PATH + '/_ui/hbs/**/*.hbs'
				}
			]
		}
	},
	runscripts: {
		websocket: [SERVER_APP_PATH + '/app.js'] // start server app node process
	},
	shell: {
		startMongo: {
			command: 'mongod --dbpath ./db', // start mongodb
			options: {
				async: true
			}
		}
	},


	// build config
	clean: {
		dev: [TEMP_PATH],
		dist: [DIST_PATH]
	},
	copy: {
		devcss: {
			files: [
				{
					expand: true,
					src: [
						'_ui/css/**/*.css'
					],
					dest: TEMP_PATH + '/',
					cwd: DEV_PATH + '/'
				}
			]
		},
		devjs: {
			files: [
				{
					expand: true,
					src: [
						'_ui/js/**/*.js'
					],
					dest: TEMP_PATH + '/',
					cwd: DEV_PATH + '/'
				}
			]
		},
		devall: {
			files: [
				{
					expand: true,
					src: [
						'**',
						'!**/*.scss', // copy over everything except scss, which will be processed/copied with compass
						'!**/hbs/**' // don't copy over handlebar directory, since they are precompiled into _ui/js/templates.js
					],
					dest: TEMP_PATH + '/',
					cwd: DEV_PATH + '/'
				}
			]
		},
		dist: {
			files: [
				{
					expand: true,
					src: [
						'client/**',
						'!_ui/css/**', // copy over everything except css, js, & handlebars dir which will be processed/copied with other tasks
						'!_ui/js/**',
						'!_ui/hbs/**'
					],
					dest: DIST_PATH + '/',
					cwd: DEV_PATH + '/'

				}
			]
		}
	},
	concat: {
		dist: {
			src: [DEV_PATH + '/_ui/js/**/*.js'],
			dest: DIST_PATH + '/_ui/js/scripts.js'
		}
	},
	uglify: {
		dist: {
			dest: DIST_PATH + '/_ui/js/scripts.min.js',
			src: [DIST_PATH + '/_ui/js/scripts.js']
		}
	},
	// replace js and css link build blocks within specified files with their concatenated versions
	replacelinks: {
		files: [
			DIST_PATH + '/*.html'
		]
	}
});

// grunt 3rd party plugins
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-handlebars');
grunt.loadNpmTasks('grunt-shell-spawn');

// custom/ported tasks
grunt.loadTasks('tasks/');

// Default task.
grunt.registerTask('run', ['jshint', 'clean:dev', 'copy:devall', 'compass:dev', 'handlebars:dev', 'shell', 'runscripts', 'connect:dev', 'watch']);
grunt.registerTask('build', ['jshint', 'clean:dist', 'copy:dist', 'compass:dist', 'handlebars:dist','concat', 'uglify', 'replacelinks']);
grunt.registerTask('test', ['jshint']);

};

/*global module:false*/


module.exports = function(grunt) {

var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

// Project configuration.
grunt.initConfig({
    qunit: {
        files: ['client/test/**/*.html']
    },
    regarde: {
        css: {
            files: [
                'client/dev/_ui/css/**/*.scss',
                'client/dev/_ui/css/**/*.css'
            ],
            tasks: ['compass:dev', 'copy:devcss', 'livereload']
        },
        js: {
            files: [
                'client/dev/_ui/js/**/*.js'
            ],
            tasks: ['copy:devjs', 'livereload']
        },
        hbs: {
            files: [
                'client/dev/_ui/hbs/**/*.hbs'
            ],
            tasks: ['handlebars:dev', 'livereload']
        },
        serverjs: {
            files: [
                'server/**/*.js'
            ],
            tasks: ['runscripts']
        },
        other: {
            files: [
                'client/dev/**/*.html',
                'client/dev/_ui/img/**/*'
            ],
            tasks: ['copy:devall', 'livereload']
        }
    },
    connect: {
        dev: {
            options: {
                port: 8001,
                hostname: null, // setting hostname to null allows requests at port 8001 locally for any host name (i.e. localhost, network IP or machine name)
                base: 'client/temp',
                middleware: function(connect, options) {
                    return [lrSnippet, folderMount(connect, 'client/temp')];
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
            'client/dev/_ui/js/**/*.js',
            'client/test/**/*.js',
            '!client/test/qunit.js',
            '!client/dev/_ui/js/lib/**/*' // leave out 3rd party js in lib folder, since can't guarantee lint quality
        ]),
        globals: {}
    },
    compass: {
        dev: {
            options: {
                cssDir: 'client/temp/_ui/css',
                sassDir: 'client/dev/_ui/css',
                environment: 'development'
            }
        },
        dist: {
            options: {
                cssDir: 'client/dist/_ui/css',
                sassDir: 'client/dev/_ui/css',
                environment: 'production'
            }
        }
    },
    handlebars: {
        dev: {
            options: {
                namespace: "NODEMUD.templates",
                processName: function(filename) {
                    var name = filename.split('/hbs/')[1].split('.hbs')[0]; // remove from hbs dir up, and remove .hbs extension
                    return name;
                }
            },
            files: {
                "client/temp/_ui/js/templates.js": "client/dev/_ui/hbs/**/*.hbs"
            }
        },
        dist: {
            options: {
                namespace: "NODEMUD.templates"
            },
            files: {
                "client/dist/_ui/js/templates.js": "client/dev/_ui/hbs/**/*.hbs"
            }
        }
    },
    runscripts: {
        websocket: ['server/app.js']
    },

    // build config
    clean: {
        dev: ["client/temp"],
        dist: ["client/dist"]
    },
    copy: {
        devcss: {
            files: [
                {
                    expand: true,
                    src: [
                        '_ui/css/**/*.css'
                    ],
                    dest: 'client/temp/',
                    cwd: 'client/dev/'
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
                    dest: 'client/temp/',
                    cwd: 'client/dev/'
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
                    dest: 'client/temp/',
                    cwd: 'client/dev/'
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
                    dest: 'client/dist/',
                    cwd: 'client/dev/'

                }
            ]
        }
    },
    concat: {
        dist: {
            src: ['client/dev/_ui/js/**/*.js'],
            dest: 'client/dist/_ui/js/scripts.js'
        }
    },
    uglify: {
        dist: {
            dest: 'client/dist/_ui/js/scripts.min.js',
            src: ['client/dist/_ui/js/scripts.js']
        }
    },
    // replace js and css link build blocks within specified files with their concatenated versions
    replacelinks: {
        files: [
            'client/dist/*.html'
        ]
    }
});

// grunt 3rd party plugins
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-livereload');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-qunit');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-regarde');
grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-handlebars');

// custom/ported tasks
grunt.loadTasks('tasks/');

// Default task.
grunt.registerTask('run', ['jshint', 'qunit', 'clean:dev', 'copy:devall', 'compass:dev', 'handlebars:dev', 'runscripts', 'livereload-start', 'connect:dev', 'regarde']);
grunt.registerTask('build', ['jshint', 'qunit', 'clean:dist', 'copy:dist', 'compass:dist', 'handlebars:dist','concat', 'uglify', 'replacelinks']);
grunt.registerTask('test', ['jshint', 'qunit']);

};

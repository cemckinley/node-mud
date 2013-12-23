/*global module:false*/


module.exports = function (grunt) {


var DEV_PATH = 'client/src';
var DIST_PATH = 'client/dist';
var TEMP_PATH = 'client/temp';
var TEST_PATH = 'client/test';
var SERVER_APP_PATH = 'server';
var SSL_KEY_PATH = SERVER_APP_PATH + '/keys/websocket-ssl.key';
var SSL_CERT_PATH = SERVER_APP_PATH + '/keys/websocket-ssl.crt';

var path = require('path');
var lrSnippet = require('connect-livereload')();
var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

// Project configuration.
grunt.initConfig({

    watch: {
        sass: {
            files: [
                DEV_PATH + '/_ui/css/**/*.scss'
            ],
            tasks: ['sass:dev'],
            options: {
                livereload: {
                    key: SSL_KEY_PATH,
                    cert: SSL_CERT_PATH
                }
            }
        },
        css: {
            files: [
                DEV_PATH + '/_ui/css/**/*.css'
            ],
            tasks: ['copy:devcss'],
            options: {
                livereload: {
                    key: SSL_KEY_PATH,
                    cert: SSL_CERT_PATH
                }
            }
        },
        js: {
            files: [
                DEV_PATH + '/_ui/js/**/*.js'
            ],
            tasks: ['copy:devjs'],
            options: {
                livereload: {
                    key: SSL_KEY_PATH,
                    cert: SSL_CERT_PATH
                }
            }
        },
        hbs: {
            files: [
                DEV_PATH + '/_ui/hbs/**/*.hbs'
            ],
            tasks: ['handlebars:dev'],
            options: {
                livereload: {
                    key: SSL_KEY_PATH,
                    cert: SSL_CERT_PATH
                }
            }
        },
        serverjs: {
            files: [
                'server/**/*.js'
            ],
            tasks: ['runscripts'],
            options: {
                spawn: false
            }
        },
        other: {
            files: [
                DEV_PATH + '/**/*.html',
                DEV_PATH + '/_ui/img/**/*'
            ],
            tasks: ['copy:devall'],
            options: {
                livereload: {
                    key: SSL_KEY_PATH,
                    cert: SSL_CERT_PATH
                }
            }
        }
    },

    connect: {
        dev: {
            options: {
                port: 8001,
                protocol: 'https',
                key: grunt.file.read(SSL_KEY_PATH).toString(),
                cert: grunt.file.read(SSL_CERT_PATH).toString(),
                ca: grunt.file.read(SERVER_APP_PATH + '/keys/websocket-ssl.csr').toString(),
                passphrase: '123456',
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
            browser: true,
            globals: {
                'console': true
            }
        },
        files: grunt.file.expand([
            DEV_PATH + '/_ui/js/**/*.js',
            TEST_PATH + '/**/*.js',
            '!' + TEST_PATH + '/qunit.js',
            '!' + DEV_PATH + '/_ui/js/lib/**/*' // leave out 3rd party js in lib folder, since can't guarantee lint quality
        ])
    },

    sass: {
        dev: {
            files: [{
                expand: true,
                cwd: DEV_PATH + '/_ui/css/',
                src: ['**/*.scss'],
                dest: TEMP_PATH + '/_ui/css/',
                ext: '.css'
            }],
            options: {
                style: 'compact',
                debug: true
            }
        },
        dist: {
            files: [{
                expand: true,
                cwd: DEV_PATH + '/_ui/css/',
                src: ['**/*.scss'],
                dest: DIST_PATH + '/_ui/css/',
                ext: '.css'
            }],
            options: {
                style: 'compact',
                debug: false
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
    },

    jasmine: {
        // client: {
        //  src: 'client/src/**/*.js',
        //  options: {
        //      specs: 'client/tests/*Test.js',
        //      vendor: 'client/src/js/lib/**/*.js'
        //      // helpers: 'client/tests/*Helper.js'
        //  }
        // },
        server: {
            src: 'server/src/**/*.js',
            options: {
                specs: 'server/tests/*Test.js'
                // helpers: 'spec/*Helper.js'
            }
        }
    }
});

// grunt 3rd party plugins
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-handlebars');
grunt.loadNpmTasks('grunt-shell-spawn');
grunt.loadNpmTasks('grunt-contrib-jasmine');

// custom/ported tasks
grunt.loadTasks('tasks/');

// Default task.
grunt.registerTask('run', ['jshint', 'clean:dev', 'copy:devall', 'sass:dev', 'handlebars:dev', 'shell', 'runscripts', 'connect:dev', 'watch']);
grunt.registerTask('build', ['jshint', 'clean:dist', 'copy:dist', 'sass:dist', 'handlebars:dist','concat', 'uglify', 'replacelinks']);
grunt.registerTask('test', ['jshint', 'jasmine:server' /*, 'jasmine:client' */]);

};

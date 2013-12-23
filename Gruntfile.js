/*global module:false*/


module.exports = function (grunt) {

var path = require('path');
var lrSnippet = require('connect-livereload')();
var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

// these vars are used as immediate values in the connect config object, so need to be
// defined before the whole grunt config object
var serverAppPath = './server';
var sslKeyPath = serverAppPath + '/keys/websocket-ssl.key';
var sslCertPath = serverAppPath + '/keys/websocket-ssl.crt';


grunt.initConfig({

    /* CONFIG VARS */

    port: 8001,
    livereloadPort: 1337,
    clientSrcPath: './client/src',
    clientTempPath: './client/temp',
    clientDistPath: './client/dist',
    clientTestDir: './client/test',
    serverAppPath: serverAppPath,
    sslKeyPath: sslKeyPath,
    sslCertPath: sslCertPath,


    /* TASK CONFIG */

    watch: {
        sass: {
            files: [
                '<%= clientSrcPath %>' + '/_ui/css/**/*.scss'
            ],
            tasks: ['sass:dev'],
            options: {
                livereload: {
                    key: '<%= sslKeyPath %>',
                    cert: '<%= sslCertPath %>'
                }
            }
        },
        css: {
            files: [
                '<%= clientSrcPath %>' + '/_ui/css/**/*.css'
            ],
            tasks: ['copy:devcss'],
            options: {
                livereload: {
                    key: '<%= sslKeyPath %>',
                    cert: '<%= sslCertPath %>'
                }
            }
        },
        js: {
            files: [
                '<%= clientSrcPath %>' + '/_ui/js/**/*.js'
            ],
            tasks: ['copy:devjs'],
            options: {
                livereload: {
                    key: '<%= sslKeyPath %>',
                    cert: '<%= sslCertPath %>'
                }
            }
        },
        hbs: {
            files: [
                '<%= clientSrcPath %>' + '/_ui/hbs/**/*.hbs'
            ],
            tasks: ['handlebars:dev'],
            options: {
                livereload: {
                    key: '<%= sslKeyPath %>',
                    cert: '<%= sslCertPath %>'
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
                '<%= clientSrcPath %>' + '/**/*.html',
                '<%= clientSrcPath %>' + '/_ui/img/**/*'
            ],
            tasks: ['copy:devall'],
            options: {
                livereload: {
                    key: '<%= sslKeyPath %>',
                    cert: '<%= sslCertPath %>'
                }
            }
        }
    },

    connect: {
        dev: {
            options: {
                port: '<%= port %>',
                protocol: 'https',
                key: grunt.file.read( sslKeyPath ).toString(),
                cert: grunt.file.read( sslCertPath ).toString(),
                ca: grunt.file.read( serverAppPath + '/keys/websocket-ssl.csr' ).toString(),
                passphrase: '123456',
                hostname: null, // setting hostname to null allows requests at port 8001 locally for any host name (i.e. localhost, network IP or machine name)
                base: '<%= clientTempPath %>',
                middleware: function(connect, options) {
                    return [lrSnippet, folderMount(connect, '<%= clientTempPath %>')];
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
            '<%= clientSrcPath %>' + '/_ui/js/**/*.js',
            '<%= clientTestDir %>' + '/**/*.js',
            '!' + '<%= clientTestDir %>' + '/qunit.js',
            '!' + '<%= clientSrcPath %>' + '/_ui/js/lib/**/*' // leave out 3rd party js in lib folder, since can't guarantee lint quality
        ])
    },

    sass: {
        dev: {
            files: [{
                expand: true,
                cwd: '<%= clientSrcPath %>' + '/_ui/css/',
                src: ['**/*.scss'],
                dest: '<%= clientTempPath %>' + '/_ui/css/',
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
                cwd: '<%= clientSrcPath %>' + '/_ui/css/',
                src: ['**/*.scss'],
                dest: '<%= clientDistPath %>' + '/_ui/css/',
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
                    dest: '<%= clientTempPath %>' + '/_ui/js/templates.js',
                    src: '<%= clientSrcPath %>' + '/_ui/hbs/**/*.hbs'
                }
            ]
        },
        dist: {
            options: {
                namespace: 'NODEMUD.templates'
            },
            files: [
                {
                    dest: '<%= clientDistPath %>' + '/_ui/js/templates.js',
                    src: '<%= clientSrcPath %>' + '/_ui/hbs/**/*.hbs'
                }
            ]
        }
    },

    runscripts: {
        websocket: ['<%= serverAppPath %>' + '/app.js'] // start server app node process
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
        dev: ['<%= clientTempPath %>'],
        dist: ['<%= clientDistPath %>']
    },

    copy: {
        devcss: {
            files: [
                {
                    expand: true,
                    src: [
                        '_ui/css/**/*.css'
                    ],
                    dest: '<%= clientTempPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/'
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
                    dest: '<%= clientTempPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/'
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
                    dest: '<%= clientTempPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/'
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
                    dest: '<%= clientDistPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/'

                }
            ]
        }
    },

    concat: {
        dist: {
            src: ['<%= clientSrcPath %>' + '/_ui/js/**/*.js'],
            dest: '<%= clientDistPath %>' + '/_ui/js/scripts.js'
        }
    },

    uglify: {
        dist: {
            dest: '<%= clientDistPath %>' + '/_ui/js/scripts.min.js',
            src: ['<%= clientDistPath %>' + '/_ui/js/scripts.js']
        }
    },

    // replace js and css link build blocks within specified files with their concatenated versions
    replacelinks: {
        files: [
            '<%= clientDistPath %>' + '/*.html'
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

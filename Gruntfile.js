/*global module:false*/


module.exports = function (grunt) {


// these vars are used as immediate function args in the connect config object, so need to be
// defined before the whole grunt config object
var serverAppPath = './server';
var sslKeyPath = serverAppPath + '/keys/websocket-ssl.key';
var sslCertPath = serverAppPath + '/keys/websocket-ssl.crt';
var sslCsrPath = serverAppPath + '/keys/websocket-ssl.csr';


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
    sslPassphrase: '123456',


    /* TASK CONFIG */

    watch: {
        options: {
            livereload: {
                key: '<%= sslKeyPath %>',
                cert: '<%= sslCertPath %>',
                port: '<%= livereloadPort %>'
            }
        },
        sass: {
            files: [
                '<%= clientSrcPath %>' + '/styles/**/*.scss'
            ],
            tasks: ['sass:dev'],
        },
        js: {
            files: [
                '<%= clientSrcPath %>' + '/js/**/*.js'
            ],
            tasks: ['copy:devjs']
        },
        html: {
            files: [
                '<%= clientSrcPath %>' + '/html/**/*.html'
            ],
            tasks: ['copy:devhtml']
        },
        assets: {
            files: [
                '<%= clientSrcPath %>' + '/assets/**/*'
            ],
            tasks: ['copy:devassets']
        },
        hbs: {
            files: [
                '<%= clientSrcPath %>' + '/hbs/**/*.hbs'
            ],
            tasks: ['handlebars:dev']
        },
        serverjs: {
            files: [
                'server/**/*.js'
            ],
            tasks: ['runscripts'],
            options: {
                spawn: false,
                livereload: false // app restart is handled via 'runscripts'
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
                ca: grunt.file.read( sslCsrPath ).toString(),
                passphrase: '<%= sslPassphrase %>',
                hostname: null, // setting hostname to null allows requests at port 8001 locally for any host name (i.e. localhost, network IP or machine name)
                base: '<%= clientTempPath %>',
                livereload: '<%= livereloadPort %>'
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
            '<%= clientSrcPath %>' + '/js/**/*.js',
            '<%= clientTestDir %>' + '/**/*.js',
            '!' + '<%= clientSrcPath %>' + '/js/lib/**/*' // leave out 3rd party js in lib folder, since can't guarantee lint quality
        ])
    },

    sass: {
        dev: {
            files: [{
                expand: true,
                cwd: '<%= clientSrcPath %>' + '/styles/',
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
                cwd: '<%= clientSrcPath %>' + '/styles/',
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
                    src: '<%= clientSrcPath %>' + '/hbs/**/*.hbs'
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
                    src: '<%= clientSrcPath %>' + '/hbs/**/*.hbs'
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
        devjs: {
            files: [
                {
                    expand: true,
                    src: [
                        '**/*.js'
                    ],
                    dest: '<%= clientTempPath %>' + '/_ui/js/',
                    cwd: '<%= clientSrcPath %>' + '/js/'
                }
            ]
        },
        devhtml: {
            files: [
                {
                    expand: true,
                    src: [
                        '**/*.html',
                    ],
                    dest: '<%= clientTempPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/html/'
                }
            ]
        },
        devassets: {
            files: [
                {
                    expand: true,
                    src: [
                        '**/*',
                    ],
                    dest: '<%= clientTempPath %>' + '/_ui/',
                    cwd: '<%= clientSrcPath %>' + '/assets/'
                }
            ]
        },
        // copy over everything except css, js, & handlebars dir which will be processed/copied with other tasks
        dist: {
            files: [
                {
                    expand: true,
                    src: [
                        '**/*.html'
                    ],
                    dest: '<%= clientDistPath %>' + '/',
                    cwd: '<%= clientSrcPath %>' + '/html/'

                },
                {
                    expand: true,
                    src: [
                        '**/*.js'
                    ],
                    dest: '<%= clientDistPath %>' + '/_ui/js/',
                    cwd: '<%= clientSrcPath %>' + '/js/'

                },
                {
                    expand: true,
                    src: [
                        '**/*'
                    ],
                    dest: '<%= clientDistPath %>' + '/_ui/',
                    cwd: '<%= clientSrcPath %>' + '/assets/'

                }
            ]
        }
    },

    concat: {
        dist: {
            src: ['<%= clientSrcPath %>' + '/js/**/*.js'],
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
            '<%= clientDistPath %>' + '/html/*.html'
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

// aliased tasks
grunt.registerTask('copy:dev', ['copy:devhtml', 'copy:devassets', 'copy:devjs']);

grunt.registerTask('run', ['jshint', 'clean:dev', 'copy:dev', 'sass:dev', 'handlebars:dev', 'shell', 'runscripts', 'connect:dev', 'watch']);
grunt.registerTask('build', ['jshint', 'clean:dist', 'copy:dist', 'sass:dist', 'handlebars:dist','concat', 'uglify', 'replacelinks']);
grunt.registerTask('test', ['jshint', 'jasmine:server' /*, 'jasmine:client' */]);

};

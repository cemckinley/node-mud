/*global module:false*/

/*** GRUNT PLUGINS: DEPENDENCIES: ***/
/*
    - grunt-contrib-compass (https://github.com/gruntjs/grunt-contrib-compass)
    - grunt-contrib-concat
    - grunt-contrib-uglify
    - grunt-contrib-jshint
    - grunt-contrib-qunit
    - grunt-contrib-connect
    - grunt-contrib-livereload
    - grunt-regarde
    - grunt-contrib-copy
*/

var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function(grunt) {

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
        other: {
            files: [
                'client/dev/**/*.html',
                'client/dev/_ui/img/**/*'
            ],
            tasks: ['copy:devall', 'livereload']
        }
    },
    connect: {
        options: {
            port: 8000,
            base: 'client/temp/'
        },
        livereload: {
            options: {
                port: 8001,
                middleware: function(connect, options) {
                    return [lrSnippet, folderMount(connect, 'client/temp/')];
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

    // build config
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
                        '!**/*.scss' // copy over everything except scss, which will be processed/copied with compass
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
                        '!_ui/css/**', // copy over everything except css and js, which will be processed/copied with compass and concat/min functions
                        '!_ui/js/**'
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

// custom/ported tasks
grunt.loadTasks('tasks/');

// Default task.
grunt.registerTask('run', ['jshint', 'qunit', 'copy:devall', 'compass:dev', 'livereload-start', 'connect', 'regarde']);
grunt.registerTask('build', ['jshint', 'qunit', 'copy:dist', 'compass:dist', 'concat', 'uglify', 'replacelinks']);
grunt.registerTask('test', ['jshint', 'qunit']);

};

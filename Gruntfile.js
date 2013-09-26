module.exports = function(grunt) {

    'use strict';

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var huskyConfig = grunt.file.readJSON('.grunt/husky.json'),
        clone = grunt.util._.clone,

    // Lookup of the Aura Extensions and injects them in the requirejs build
        auraExtensions = grunt.file.glob
            .sync('husky_extensions/**/*.js')
            .map(function(extension) {
                return extension.replace('.js', '');
            }),

        rJSConfig = (function() {
            var _c = huskyConfig.requireJS;
            _c.include = _c.include.concat(auraExtensions);
            _c.optimize = grunt.option('dev') ? "none" : "uglify";
            return _c;
        })();


    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            husky: {
                options: clone(rJSConfig, true)
            }
        },

        meta: {
            banner: '/* \n' +
                ' * <%= pkg.name %> v<%= pkg.version %>\n' +
                ' * <%= pkg.homepage %> \n' +
                ' * (c) <%= pkg.author.company %>\n' +
                ' * \n' +
                ' * This source file is subject to the MIT license that is bundled\n' +
                ' * with this source code in the file LICENSE.\n' +
                ' */\n\n'
        },

        watch: {
            options: {
                nospawn: true
            },
            compass: {
                files: ['scss/{,*/}*.{scss,sass}'],
                tasks: ['compass:dev', 'copy:dist']
            },
            jshint: {
                files: ['js/{,*/}*.{js,js}'],
                tasks: ['jshint']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                autoWatch: true
            },
            travis: {
                configFile: 'karma.travis.conf.js',
                autoWatch: true
            }
        },
        clean: {
            dist: ['dist', 'docs/packages/husky/'],
            temp: ['dist/temp'],
            bower_after: {
                files: {
                    src: [
                        'bower_components'
                    ]
                }
            },
            bower_before: {
                files: {
                    src: [
                        'vendor'
                    ]
                }
            }
        },
        compass: {
            dev: {
                options: {
                    sassDir: 'scss/',
                    specify: ['scss/husky.scss'],
                    cssDir: '.tmp/',
                    require: ['animation'],
                    relativeAssets: false
                }
            }
        },
        concat: {
            options: { banner: '<%= meta.banner %>' },
            dist: {
                src: ['js/{,*/}*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        cssmin: {
            options: { banner: '<%= meta.banner %>' },
            compress: {
                files: {
                    'dist/<%= pkg.name %>.min.css': ['.tmp/{,*/}*.css']
                }
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: './',
                        dest: '.tmp/',
                        src: [
                            'fonts/{,*/}*'
                        ]
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: './',
                        dest: 'dist',
                        src: [
                            'fonts/{,*/}*'
                        ]
                    }
                ]
            },
            doc: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: './',
                        dest: 'assets/js/husky/',
                        src: [
                            'dist/{,*/}*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: './',
                        dest: 'assets/js/husky/dist/',
                        src: [
                            'fonts/{,*/}*'
                        ]
                    }
                ]
            },
            bower: {
                files: [
                    // aura
                    {
                        expand: true,
                        cwd: 'bower_components/aura/lib/',
                        src: ['**'],
                        dest: 'vendor/aura/lib/'
                    },
                    // backbone
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            'bower_components/backbone/backbone.js',
                            'bower_components/backbone/backbone-min.js',
                            'bower_components/backbone/backbone-min.map'
                        ],
                        dest: 'vendor/backbone'
                    },
                    // eventemitter2
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/eventemitter2/lib/eventemitter2.js'],
                        dest: 'vendor/eventemitter2'
                    },
                    // globalize
                    {
                        expand: true,
                        cwd: 'bower_components/globalize/lib/',
                        src: ['**'],
                        dest: 'vendor/globalize/'
                    },
                    // husky-validation
                    {
                        expand: true,
                        cwd: 'bower_components/husky-validation/dist/',
                        src: ['**'],
                        dest: 'vendor/husky-validation/'
                    },
                    // jquery
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            'bower_components/jquery/jquery.js',
                            'bower_components/jquery/jquery.min.map',
                            'bower_components/jquery/jquery.min.js'
                        ],
                        dest: 'vendor/jquery'
                    },
                    // requirejs
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/requirejs/require.js'],
                        dest: 'vendor/requirejs'
                    },
                    // requirejs text
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/requirejs-text/text.js'],
                        dest: 'vendor/requirejs-text'
                    },
                    // underscore
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            'bower_components/underscore/underscore.js',
                            'bower_components/underscore/underscore-min.js',
                            'bower_components/underscore/underscore-min.map'
                        ],
                        dest: 'vendor/underscore'
                    }
                ]
            }
        },
        bower: {
            install: {
                options: {
                    copy: false,
                    layout: 'byComponent',
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false
                }
            }
        }
    });

    // register tasks
    grunt.registerTask('test', [
        'karma:unit'
    ]);

    // Travis CI task.
    grunt.registerTask('travis', [
        'karma:travis'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'requirejs:husky',
        'compass',
        'cssmin',
        'copy:dist',
        'copy:doc'
    ]);

    grunt.registerTask('update', [
        'clean:bower_before',
        'bower:install',
        'copy:bower',
        'clean:bower_after'
    ]);

    grunt.registerTask('default', [
        'copy:dev',
        'watch'
    ]);
};

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

        getConfig = function(dev) {
            var _c = clone(huskyConfig.requireJS);
            _c.include = _c.include.concat(auraExtensions);
            _c.optimize = !!dev ? "none" : "uglify";
            _c.out = "dist/" + (!!dev ? "husky.js" : "husky.min.js");
            return _c;
        },

        rJSConfig = getConfig(grunt.option('dev')),
        rJSConfigDev = getConfig(true);


    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            dist: {
                options: clone(rJSConfig, true)
            },
            dev: {
                options: clone(rJSConfigDev, true)
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
                tasks: ['compass:dev', 'copy:dist', 'cssmin']
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
            tmp: ['.tmp'],
            bower_after: {
                files: {
                    src: [
                        '.bower_components'
                    ]
                }
            },
            bower_before: {
                files: {
                    src: [
                        'bower_components'
                    ]
                }
            }
        },
        compass: {
            dev: {
                options: {
                    sassDir: 'scss/',
                    specify: 'scss/husky.scss',
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
                    },
                    {
                        expand: true,
                        cwd: '.tmp',
                        dest: 'dist',
                        src: [
                            '**'
                        ]
                    }
                ]
            },
            "requirejs_dist": {
                files: [
                    {
                        expand: true,
                        cwd: 'dist',
                        dest: 'dist/husky.min.js',
                        src: 'husky.js'
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
                        cwd: '.bower_components/aura/lib/',
                        src: ['**'],
                        dest: 'bower_components/aura/lib/'
                    },
                    // backbone
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/backbone/backbone.js',
                            '.bower_components/backbone/backbone-min.js',
                            '.bower_components/backbone/backbone-min.map'
                        ],
                        dest: 'bower_components/backbone/'
                    },
                    // eventemitter2
                    {
                        expand: true,
                        flatten: true,
                        src: ['.bower_components/eventemitter2/lib/eventemitter2.js'],
                        dest: 'bower_components/eventemitter2/lib/'
                    },
                    // globalize
                    {
                        expand: true,
                        cwd: '.bower_components/globalize/lib/',
                        src: ['**'],
                        dest: 'bower_components/globalize/lib/'
                    },
                    // husky-validation
                    {
                        expand: true,
                        cwd: '.bower_components/husky-validation/dist/',
                        src: ['**'],
                        dest: 'bower_components/husky-validation/dist/'
                    },
                    // jquery
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/jquery/jquery.js',
                            '.bower_components/jquery/jquery.min.map',
                            '.bower_components/jquery/jquery.min.js'
                        ],
                        dest: 'bower_components/jquery/'
                    },
                    // requirejs
                    {
                        expand: true,
                        flatten: true,
                        src: ['.bower_components/requirejs/require.js'],
                        dest: 'bower_components/requirejs/'
                    },
                    // requirejs text
                    {
                        expand: true,
                        flatten: true,
                        src: ['.bower_components/requirejs-text/text.js'],
                        dest: 'bower_components/requirejs-text/'
                    },
                    // underscore
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/underscore/underscore.js',
                            '.bower_components/underscore/underscore-min.js',
                            '.bower_components/underscore/underscore-min.map'
                        ],
                        dest: 'bower_components/underscore/'
                    },
                    // uri template
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/massiveart-uritemplate/bin/uritemplate-min.js',
                            '.bower_components/massiveart-uritemplate/bin/uritemplate.js'
                        ],
                        dest: 'bower_components/massiveart-uritemplate/'
                    },
                    // ck editor
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/ckeditor/ckeditor.js',
                            '.bower_components/ckeditor/adapters/jquery.js'
                        ],
                        dest: 'bower_components/ckeditor/'
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
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    base: '.'
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
        'clean:tmp',
        'clean:dist',
        'requirejs:dist',
        'requirejs:dev',
        'compass',
        'cssmin',
        'copy:dist',
        'copy:doc'
    ]);

    grunt.registerTask('build:css', [
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
        'compass',
        'cssmin',
        'copy:dist',
        'connect',
        'watch'
    ]);
};

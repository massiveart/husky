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
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                './husky_components/**/*.js',
                './husky_extensions/**/*.js',
                './lib/husky.js'
            ]
        },
        clean: {
            dist: ['dist', 'docs/packages/husky/'],
            temp: ['dist/temp'],
            tmp: ['.tmp'],
            hooks: ['.git/hooks/*'],
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
                    sourcemap: false,
                    sassDir: 'scss/',
                    specify: 'scss/husky.scss',
                    cssDir: '.tmp/',
                    relativeAssets: false
                }
            }
        },
        concat: {
            options: { banner: '<%= meta.banner %>' },
            dist: {
                src: ['js/{,*/}*.js'],
                dest: 'dist/husky.js'
            }
        },
        cssmin: {
            options: { banner: '<%= meta.banner %>' },
            compress: {
                files: {
                    'dist/husky.min.css': ['.tmp/{,*/}*.css']
                }
            }
        },
        exec: {
            hookrights: {
                command: 'chmod +x .git/hooks/pre-push'
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
            hooks: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            'bin/hooks/*'
                        ],
                        dest: '.git/hooks/'
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
                            'fonts/{,*/}*',
                            'vendor/jquery.minicolors.png',
                            'scss/variables.scss',
                            'scss/mixins.scss'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: './bower_components',
                        dest: 'dist/vendor',
                        src: [
                            'ckeditor/**'
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
            bower: {
                files: [
                    // aura
                    {
                        expand: true,
                        cwd: '.bower_components/aura/lib/',
                        src: ['**'],
                        dest: 'bower_components/aura/lib/'
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
					// typeahead.js
					{
						expand: true,
						flatten: true,
						src: [
							'.bower_components/typeahead.js/dist/typeahead.bundle.js',
							'.bower_components/typeahead.js/dist/typeahead.bundle.min.js'
						],
						dest: 'bower_components/typeahead.js'
					},
                    // tagmanager.js
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/tagmanager/tagmanager.js'
                        ],
                        dest: 'bower_components/tagmanager'
                    },
                    // dropzone.js
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/dropzone/dist/dropzone.js'
                        ],
                        dest: 'bower_components/dropzone'
                    },
                    // minicolors
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '.bower_components/jquery-minicolors/jquery.minicolors.js',
                            '.bower_components/jquery-minicolors/jquery.minicolors.css',
                            '.bower_components/jquery-minicolors/jquery.minicolors.png'
                        ],
                        dest: 'bower_components/jquery-minicolors'
                    },
                    // bootstrap-datepicker
                    {
                        expand: true,
                        cwd: '.bower_components/bootstrap-datepicker/js/',
                        src: ['**'],
                        dest: 'bower_components/bootstrap-datepicker/'
                    },
                    // ckeditor
                    {
                        expand: true,
                        cwd: '.bower_components/ckeditor',
                        src: ['**'],
                        dest: 'bower_components/ckeditor'
                    }
                ]
            },
            ckeditor_theme: {
                files: [
                    // ckeditor husky theme
                    {
                        expand: true,
                        cwd: 'husky_components/ckeditor',
                        src: ['skins/**'],
                        dest: 'bower_components/ckeditor'
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
                    cleanBowerDir: false,
					bowerOptions: {
						forceLatest: true
					}
                }
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: ['lib/', 'husky_extensions/', 'husky_components/'],
                    outdir: 'doc'
                }
            }
        },
        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 9001,
                    base: '.'

                }
            }
        }
    });

    grunt.registerTask('build', [
        'clean:tmp',
        'clean:dist',
        'requirejs:dist',
        'requirejs:dev',
        'compass',
        'cssmin',
        'copy:dist'
    ]);

    grunt.registerTask('jshint', [
        'jshint'
    ]);

    grunt.registerTask('build:docs', [
        'yuidoc'
    ]);

    grunt.registerTask('build:css', [
        'compass',
        'cssmin',
        'copy:ckeditor_theme',
        'copy:dist'
    ]);

    grunt.registerTask('update', [
        'clean:bower_before',
        'bower:install',
        'copy:bower',
        'copy:ckeditor_theme'
    ]);

    grunt.registerTask('update:theme', [
        'copy:ckeditor_theme'
    ]);

    grunt.registerTask('default', [
        'compass',
        'cssmin',
        'copy:dist',
        'connect',
        'watch'
    ]);

    grunt.registerTask('install:hooks', [
        'clean:hooks',
        'copy:hooks',
        'exec:hookrights'
    ]);
};

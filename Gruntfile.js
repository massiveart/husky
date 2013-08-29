'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                tasks: ['compass:dev']
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
            temp: ['dist/temp']
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
        uglify: {
            build: {
                files: {
                    'dist/<%= pkg.name %>.min.js': [
                        'js/{,*/}*.js']
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
                        dest: 'docs/packages/husky/',
                        src: [
                            'dist/{,*/}*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: './',
                        dest: 'docs/packages/husky/dist/',
                        src: [
                            'fonts/{,*/}*'
                        ]
                    }
                ]
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
        'uglify',
        'concat',
        'compass',
        'cssmin',
        'copy:dist',
        'copy:doc'
    ]);

    grunt.registerTask('default', [
        'copy:dev',
        'watch'
    ]);
};
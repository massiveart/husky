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
            }
        },
        clean: {
            dist: ['dist'],
            temp: ['dist/temp']
        },
        compass: {
            dev: {
                options: {
                    sassDir: 'scss',
                    cssDir: '.tmp/css',
                    fontsDir: 'fonts/',
                    generatedImagesDir: '.tmp/img/',
                    imagesDir: '/img',
                    outputStyle: 'compact',
                    require: ['animation']
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
                    'dist/<%= pkg.name %>.min.css': ['.tmp/css/{,*/}*.css']
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
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './',
                    dest: 'dist',
                    src: [
                        'fonts/{,*/}*'
                    ]
                }]
            }
        }
    });

    // register tasks
    grunt.registerTask('test', [
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'uglify',
        'concat',
        'compass',
        'cssmin',
        'copy:dist'
    ]);

    grunt.registerTask('default', [
        'watch'
    ]);
};
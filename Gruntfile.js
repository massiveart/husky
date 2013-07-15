'use strict';

module.exports = function(grunt) {

    // load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-karma');

    // project configuration
    grunt.initConfig({
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
        compass: {
            dev: {
                options: {
                    sassDir: 'scss',
                    cssDir: '.tmp/css',
                    generatedImagesDir: '.tmp/img/',
                    imagesDir: '/img',
                    outputStyle: 'compact'
                }
            }
        },
    });

    // register tasks
    grunt.registerTask('test', [
        'karma'
    ]);

    // grunt.registerTask('build', ['']);

    grunt.registerTask('default', [
        'watch'
    ]);
};
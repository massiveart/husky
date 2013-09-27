'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var requireJS = {
        baseUrl: '.',
        preserveLicenseComments: false,
        paths: {
            'form': 'js/form',
            'form/mapper': 'js/mapper',
            'form/validation': 'js/validation',
            'form/element': 'js/element',
            'form/util': 'js/util',

            'type/default': 'js/types/default',
            'type/string': 'js/types/string',
            'type/date': 'js/types/date',
            'type/decimal': 'js/types/decimal',
            'type/email': 'js/types/email',
            'type/url': 'js/types/url',
            'type/label': 'js/types/label',

            'validator/default': 'js/validators/default',
            'validator/min': 'js/validators/min',
            'validator/max': 'js/validators/max',
            'validator/minLength': 'js/validators/min-length',
            'validator/maxLength': 'js/validators/max-length',
            'validator/required': 'js/validators/required',
            'validator/unique': 'js/validators/unique',

            'globalize': 'bower_components/globalize/lib/globalize',
            'cultures': 'bower_components/globalize/lib/cultures'
        },
        include: [
            'form',

            'type/string',
            'type/date',
            'type/decimal',
            'type/email',
            'type/url',
            'type/label',

            'validator/min',
            'validator/max',
            'validator/minLength',
            'validator/maxLength',
            'validator/required',
            'validator/unique'
        ],
        out: 'dist/validation.js',
        optimize: grunt.option('dev') ? "none" : "uglify"
    };

    // project configuration
    grunt.initConfig({
        requirejs: {
            validation: {
                options: requireJS
            }
        }
    });

    grunt.registerTask('build', [
        'requirejs:validation'
    ]);
};

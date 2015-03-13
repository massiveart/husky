require.config({
    baseUrl: '../../../',
    paths: {
        "type/husky-input": "husky_components/input/input-type"
    }
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = Husky({debug: {enable: true}, culture: {name: 'en'}}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');

        app.sandbox.form.create('body');
    });

    $('#setData').on('click', function() {
        app.sandbox.form.setData('body', {
            time: '12:00:30'
        });
    }.bind(this));

    $('#getData').on('click', function() {
        console.log(app.sandbox.form.getData('body'));
    }.bind(this));

    $('#validate').on('click', function() {
        console.log(app.sandbox.form.validate('body'));
    }.bind(this));

    $('body').on('change', function() {
        console.log('something changed. you could now e.g. activate a save button');
    }.bind(this));
});

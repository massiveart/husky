require.config({
    baseUrl: '../../',
    paths: {
        "type/husky-input": "husky_components/input/input-type"
    }
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');

        app.sandbox.form.create('body');
    });

    $('#setData').on('click', function() {
        app.sandbox.form.setData('body', {
            password: 'asdfjklö',
            phone: 'invalid phone number',
            url: 'google.at',
            email: 'donald.duck@disney.com',
            date: '2014-01-03T00:00:00+0200',
            time: '09 - 51',
            color: '#CCCCCC'
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

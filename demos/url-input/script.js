require.config({
    baseUrl: '../../',
    paths: {
        'type/url-input': 'husky_components/url-input/url-input',
        'services/husky/url-validator': 'husky_services/url-validator'
    }
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = Husky({debug: {enable: true}}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');

        app.sandbox.form.create('body');
    });

    $('#setData').on('click', function() {
        app.sandbox.form.setData('body', {
            url: 'https://my-little-pony.com'
        });
    }.bind(this));

    $('#getData').on('click', function() {
        console.log(app.sandbox.form.getData('body'));
    }.bind(this));

    $('#validate').on('click', function() {
        console.log(app.sandbox.form.validate('body'));
    }.bind(this));
});

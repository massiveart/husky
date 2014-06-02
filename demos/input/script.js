require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');
    });
});

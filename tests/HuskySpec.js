define(['husky', 'jquery'], function(husky, $) {

    'use strict';

    var app;

    describe('Husky', function() {

        it('version check', function() {
            app = husky({ debug: { enable: true }});

            expect(app.version).toBe('0.1.0');
        });

        it('application start', function() {

            app = husky({ debug: { enable: true }});

            var promise = app.start();

            expect(promise.then).toBeDefined();

            promise.then(function() {
                app.logger.log('Aura started...');
            });
        });
    });

});
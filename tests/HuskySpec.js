define(['husky', 'jquery'], function(husky, $) {

    'use strict';

    var app;

    describe('Husky', function() {

        it('version check', function() {
            app = husky({ debug: { enable: true }});

            expect(app.version).toBe('0.1.0');

            app.stop();
        });

        it('start application', function() {

            app = husky({ debug: { enable: true }});

            app.start().then(function() {
                app.logger.log('Aura started...');
            });
        });
    });

});
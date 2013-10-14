define(['husky'], function(husky) {

    'use strict';

    var app;

    describe('Password-fields', function() {
        $('body').append('<div id="testing-password-field">');


        beforeEach(function() {
            var flag = false;
            runs(function() {
                app = husky({ debug: { enable: true }});
                app.start(document.body).then(function() {
                    app.sandbox.start([
                        { name: 'password-fields@husky', options: { el: '#testing-password-field', instanceName: 'test-instance' } }
                    ]);
                });
                _.delay(function() {
                    flag = true;
                }, 300);
            });

            waitsFor(function() {
                return flag;
            }, 'load component', 2000);
        });

        afterEach(function() {
        });

        /**
         check if the password-fields were initialized by checking
         if they appear in the dom
         */

        it('should be inserted into the dom', function() {
            expect($('.husky-password-fields').size()).toBe(1);
        });

        xit('should get success class', function() {

        });

        xit('should get error class', function() {

        });
    });
});

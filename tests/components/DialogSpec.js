define(['husky'], function(husky) {

    'use strict';

    var app, flag1 = false;

    describe('Dialog', function() {

        beforeEach(function() {
            flag1 = false;

            app = husky({ debug: { enable: true }});
            app.start(document.body).then(function() {
                app.sandbox.start([
                    {
                        name: 'dialog@husky',
                        options: {
                            el: 'body',
                            data: {
                                content: {
                                    title: "This is the headline!",
                                    content: "This is the content"
                                },
                                footer: {
                                    buttonCancelText: "Cancel",
                                    buttonSubmitText: "Save"
                                }
                            }
                        }
                    }
                ]);
            });

            _.delay(function() {
                flag1 = true;
            }, 300);

            waitsFor(function() {
                return flag1;
            }, 'Wait a little bit', 3000);
        });

        afterEach(function() {
            // TODO
        });

        it('should be initialized', function() {
            expect($('.husky-dialog').size()).toBe(1);
        });
    });
});

define(['husky'], function(husky) {

    'use strict';

    var app;

    describe('Dialog', function() {

        beforeEach(function() {
            $('body').append($('<div/>', {
                id: 'dialog'
            }));

            app.start().then(function() {
                app.sandbox.start([
                    {
                        name: 'dialog@husky',
                        options: {
                            el: '#dialog',
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
        });

        afterEach(function() {
            // TODO
        });

        it('should be initialized', function() {
            expect($('.husky-dialog').size()).toBe(1);
        });
    });
});

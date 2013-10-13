define(['husky'], function(husky) {

    'use strict';

    var app, $button;

    ddescribe('Button', function() {
        $('body').append('<div id="button">');
        app = husky({ debug: { enable: true }});

        beforeEach(function() {
            runs(function() {
                app.start(document.body).then(function() {
                    app.sandbox.start([
                        { name: 'button@husky', options: { el: '#button', text: 'myText', instanceName: 'instance' } }
                    ]);
                });
            });

            waitsFor(function() {
                return $('.icon-btn').size() === 1;
            }, 'load icon', 500);

            runs(function() {
                $button = $('.icon-btn');
            });
        });

        afterEach(function() {
        });

        it('should be inserted into the dom', function() {
            expect($button.size()).toBe(1);
        });

        it('has icon ok-circle', function() {
            var flag = false;
            runs(function() {
                app.sandbox.emit('husky.button.instance.set-content', 'test', 'circle-ok');

                _.delay(function() {
                    flag = true;
                }, 500);
            });

            waitsFor(function() {
                return flag;
            }, 'load component', 500);

            runs(function() {
                expect($('.icon-btn').find('.loading-content').find('.icon-circle-ok').size()).toBe(1);
            });
        });

        it('can be disabled', function() {
            var flag = false;
            runs(function() {
                app.sandbox.emit('husky.button.instance.state', 'disable');

                _.delay(function() {
                    flag = true;
                }, 500);
            });

            waitsFor(function() {
                return flag;
            }, 'load component', 500);

            runs(function() {
                expect($('.icon-btn.disable').size()).toBe(1);
            });
        });
    });
});

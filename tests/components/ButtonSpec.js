define(['husky'], function(husky) {

    'use strict';

    var app;

    ddescribe('Button', function() {
        $('body').append('<div id="button">');


        beforeEach(function() {
            var flag = false;
            runs(function() {
                app = husky({ debug: { enable: true }});
                app.start(document.body).then(function() {
                    app.sandbox.start([
                        { name: 'button@husky', options: { el: '#button', text: 'myText', instanceName: 'instance' } }
                    ]);
                });
                _.delay(function() {
                    flag = true;
                }, 300);
            });

            waitsFor(function() {
                return flag;
//                return $('.icon-btn').size() === 1;
            }, 'load icon', 500);

            runs(function() {

            });
        });

        afterEach(function() {
//            app.stop();
//            $('.icon-btn').remove();
        });

        it('should be inserted into the dom', function() {
            expect($('.icon-btn').size()).toBe(1);
        });

        it('has icon ok-circle', function() {
            var flag = false;
            runs(function() {
                app.sandbox.emit('husky.button.instance.set-content', 'myText', 'circle-ok');

                _.delay(function() {
                    flag = true;
                }, 300);
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
                }, 100);
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

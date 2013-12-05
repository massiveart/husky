define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer, $navigation;

    describe('Tabs', function() {

        beforeEach(function() {

            var respond = false;

            fakeServer = sinon.fakeServer.create();

            fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
                '{"id":"529f1f5b7783e","title":"Contacts","url":"details","items":[' +
                    '{"title":"Details","action":"details","id":"529f1f5b777f1"},' +
                    '{"title":"Permissions","action":"permissions","id":"529f1f5b7782f"}' +
                ']}'
            ]);


            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                $('body').off();
                $('body').html('');

                app.start(document.body).then(function() {

                    app.sandbox.start([
                        { name: 'tabs@husky', options: { el: 'body', url: '/navigation' } }
                    ]);

                    _.delay(function() {
                        fakeServer.respond();
                        respond = true;
                    }, 100);
                });

            });

            waitsFor(function() {
                return respond;
            }, 'Fake server should have respond!', 750);
        });

        afterEach(function() {
            fakeServer.restore();

            // check if any have failed
            if(this.results_.failedCount > 0) {
                // if so, change the function which should move to the next test
                jasmine.Queue.prototype.next_ = function () {
                    // to instead skip to the end
                    this.onComplete();
                };
            }
        });

        /**
         *
         * DOM related tests
         *
         */

        /**
            check if the tabs have been initialized by checking
            if they appear in the dom
         */
        it('should have class tabs-container', function() {
            var $tabs = $('.tabs-container');
            expect($tabs.size()).toEqual(1);
        });

        /**
         check if tabs container has ul
         */
        it('should contain an unordered list', function() {
            var $tabs = $('.tabs-container ul');
            expect($tabs.size()).toEqual(1);
        });

        /**
            check if number of list elements is 2
         */
        it('should contain 2 objects', function() {
            var $tabs = $('.tabs-container ul li');
            expect($tabs.size()).toEqual(2);
        });

        /**
            check if first element was selected
         */
        it('first element should be selected', function() {
            var $listElement = $('.tabs-container ul li').eq(0);
            expect($listElement.hasClass('is-selected')).toEqual(true);
        });

        /**
         check if elements contain links
         */
        it('should have class navigation-item-container', function() {
            var $listElements = $('.tabs-container ul li a');
            expect($listElements.size()).toEqual(2);
        });

        /**
             check title of element
         */
        it('elements should have the correct title', function() {
            var $listElement = $('.tabs-container ul li a');
            expect($listElement.eq(0).html()).toEqual('Details');
            expect($listElement.eq(1).html()).toEqual('Permissions');
        });



        /**
            check if data-id is set in dom
         */
        it('list should contain data id', function() {
            var $listElements = $('.tabs-container ul li'),
                i;
            for (i = 0; i < $listElements.size(); i++) {
                expect($listElements.eq(i).data('id')).not.toEqual('');
            }
        });




        /**
         *
         * Dom-event related tests
         *
         */



        /**
         check if class is-selected is set on navigation-sub-item after click
         */
        it('item should have class is-selected after click and first selected should not', function() {
            var $items = $('.tabs-container ul li');
            $items.eq(1).trigger('click');
            expect($items.eq(1).hasClass('is-selected')).toEqual(true);
            expect($items.eq(0).hasClass('is-selected')).toEqual(false);
        });



        /**
         *
         * Custom-event related tests
         *
         */

        /**
            check if select event is emitted
         */
        it('should emmit select event after click on item', function() {
            var emitted = false;

            runs(function() {
                app.sandbox.on('husky.tabs.item.select', function() {
                    emitted = true;
                });

                $('.tabs-container ul li').eq(0).trigger('click');
            });

            waitsFor(function() {
                return emitted;
            }, '"husky.tabs.item.select event wasn\'t emitted"', 500);

            runs(function() {
                expect(emitted).toBe(true);
            });
        });

    });
});

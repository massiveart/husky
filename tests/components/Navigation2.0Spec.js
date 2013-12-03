define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer, $navigation;

    describe('Navigation', function() {

        beforeEach(function() {

            var respond = false;

            fakeServer = sinon.fakeServer.create();

            fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
                '{"title":"Sulu 2.0", "id":"1", "items":[' +

                    '{"title":"Tools", "items":[' +

                        '{"title":"Dashboard", "icon":"dashboard", "id":"2", "hasSettings":"true"},' +

                        '{"title":"Contacts", "hasSettings":"true", "icon":"contact-book", "id":"3", "items":[' +
                            '{"title":"Companies", "action":"contacts\/contacts", "id":"4"},' +
                            '{"title":"People", "action":"contacts\/accounts", "id":"5"}' +
                        ']},' +

                        '{"title":"Media", "icon":"star", "hasSettings":"true", "id":"6", "items":[' +
                            '{"title":"Images", "id":"7", "action":"media\/images"},' +
                            '{"title":"Documents", "id":"8", "action":"media\/documents"},' +
                            '{"title":"Movies", "id":"9", "action":"media\/movies"}' +
                        ']},' +

                        '{"title":"Messages", "icon":"settings", "id":"10"},' +

                        '{"title":"Settings", "icon":"settings", "id":"11", "items":[' +
                            '{"title":"Roles &amp; Permissions", "action":"settings\/roles", "type":"content", "id":"12"},' +
                            '{"title":"Translate", "action":"settings\/translate", "id":"13"}' +
                        ']}' +
                    ']},' +

                    '{"title":"Web-Spaces", "items":[' +

                        '{"title":"Americas", "icon":"globe", "hasSettings":"true", "id":"14", "items":[' +
                            '{"title":"en_us", "action":"contacts\/contacts", "id":"15"},' +
                            '{"title":"en_cn", "action":"contacts\/contacts", "id":"16"},' +
                            '{"title":"es_mx", "action":"contacts\/accounts", "id":"17"}' +
                        ']},' +

                        '{"title":"Europe", "icon":"globe", "hasSettings":"true", "id":"18", "items":[' +
                            '{"title":"en_gb", "action":"contacts\/contacts", "id":"19"},' +
                            '{"title":"de_de", "action":"contacts\/contacts", "id":"20"},' +
                            '{"title":"de_at", "action":"contacts\/accounts", "id":"21"}' +
                        ']},' +

                        '{"title":"Asia", "icon":"globe", "id":"22", "items":[' +
                            '{"title":"cn_cn", "action":"contacts\/contacts", "id":"23"},' +
                            '{"title":"jp_jp", "action":"contacts\/accounts", "id":"24"}' +
                        ']}' +

                    ']}'+
                ']}'
            ]);


            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                $('body').off();
                app.start(document.body).then(function() {

                    app.sandbox.start([
                        { name: 'navigation@husky', options: { el: 'body', url: '/navigation' } }
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
                }
            }
        });

        /**
         *
         * DOM related tests
         *
         */

        /**
            check if the navigation was initialized by checking
            if it appears in the dom
         */
        it('should have class navigation-container', function() {
            $navigation = $('.navigation-container');
            expect($navigation.size()).toEqual(1);
        });

        /**
         check if navigation header was inserted into the dom
         */
        it('should have class navigation-header', function() {
            var $header = $('.navigation-header');
            expect($header.size()).toEqual(1);
        });

        /**
            check if navigation search was inserted into the dom
         */
        it('should have class navigation-search', function() {
            var $search = $('.navigation-search');
            expect($search.size()).toEqual(1);
        });

        /**
            check if the navigation item-container was inserted into the dom
         */
        it('should have class navigation-item-container', function() {
            var $navigationItem = $('.navigation-container');
            expect($navigationItem.size()).toEqual(1);
        });


        /**
            check if two sections have been inserted into the navigation-item-container
         */
        it('should have two sections in the navigation-item-container', function() {
            var $sections = $('.navigation-item-container .section');
            expect($sections.size()).toEqual(2);
        });

        /**
            check if section-head-title has been inserted into section
         */
        it('should have class section-headline-title', function() {
            var $headTitle = $('.section-headline-title');
            expect($headTitle.size()).toEqual(2);
        });

        /**
            check if two section-toggle items have been inserted into dom
         */
        it('should have class section-toggle', function() {
            var $toggle = $('.navigation-container .section-toggle');
            expect($toggle.size()).toEqual(2);
        });

        /**
             check if correct amount of section-items (lists) have been inserted
         */
        it('should have two section-items', function() {
            var $sectionItems = $('.navigation-container .section-items');
            expect($sectionItems.size()).toEqual(2);
        });

        /**
            check if navigation-sub-items have been added to dom
         */
        it('should have 15 js-navigation-sub-items', function() {
            var $subItems = $('.js-navigation-sub-item');
            expect($subItems.size()).toEqual(15);
        });

        /**
            check if navigation-item data-id is set in dom
         */
        it('should have class set data attribute for all navigation-items', function() {
            var $itemsWithData = $('.navigation-items[data-id]').size() + $('.js-navigation-sub-item[data-id]').size(),
                $itemsWithoutData = $('.navigation-items').size()  + $('.js-navigation-sub-item').size();
            expect($itemsWithData).toEqual($itemsWithoutData);
        });

        /**
            check if settings icons has been inserted into dom
         */
        it('should be started after app start and should have class', function() {
            var $iconElement = $('.navigation-items[data-id="2"] .navigation-settings-icon');
            expect($iconElement.size()).toEqual(1);
        });


        /**
         *
         * Dom-event related tests
         *
         */

        /**
            check if class of section changes to hide after click
         */
        it('should change value of section-toggle to show', function() {
            var flag = false;

            runs(function() {
                _.delay(function() {
                    $('.section').first().find('.section-toggle a').trigger('click');
                    flag = true;
                }, 100);

            });

            waitsFor(function() {
                return flag;
            }, 100);

            runs(function() {
                var $section = $('.section').first().find('.section-toggle a');
                expect($section.html()).toEqual('Show');
            });
        });

        /**
            check if class of navigation item changes to is-expanded after click
            and subnav is displayed
         */
        it('should have class is-expanded after click on navigation-items and show submenu', function() {
            var flag = false;

            runs(function() {
                _.delay(function() {
                    $('.navigation-items-toggle').eq(1).trigger('click');
                    flag = true;
                }, 200);

            });

            waitsFor(function() {
                return flag;
            }, 200);

            runs(function() {
                var $item = $('.navigation-items-toggle').eq(1);
                expect($item.parent().hasClass('is-expanded')).toEqual(true);
            });
        });

//        /**
//             check if class  is-expanded of navigation item is removed after click
//             and subnav is hidden
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });
//
//        /**
//         check if class is-selected is set on navigation-sub-item after click
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });
//
//        /**
//             check if class is-selected of navigation-sub-item is removed after click
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });
//
//
//        /**
//         *
//         * Custom-event related tests
//         *
//         */
//
//        /**
//            check if selected event is emitted
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });
//
//        /**
//            check if toggled event is emitted
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });
//
//        /**
//            check if initialized event is emitted
//         */
//        it('should be started after app start and should have class', function() {
//            $navigation = $('.navigation-container');
//            expect($navigation.size()).toEqual(1);
//        });

    });
});

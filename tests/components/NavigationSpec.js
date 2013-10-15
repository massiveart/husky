define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer, $navigation;

    describe('Navigation', function() {

        beforeEach(function() {

            var respond = false;

            fakeServer = sinon.fakeServer.create();

            fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
                '{"title":"Root","hasSub":true,"id":"5242c58c3a494","sub":{"items":[{"title":"Audits","icon":"check","action":"audit","hasSub":false,"type":"content","id":"5242c58c3a4f2"},{"title":"Profiles","icon":"adjust-alt","action":"profile","hasSub":false,"type":"content","id":"5242c58c3a53e"},{"title":"Portals","icon":"caution","hasSub":true,"id":"52f258bc2e47f","action":"/navigation/portals"},{"title":"Contacts","icon":"contact-book","hasSub":true,"id":"5242c58c3a591","sub":{"items":[{"title":"People","icon":"parents","action":"contacts\/people","hasSub":false,"type":"content","id":"5242c58c3a5f6"},{"title":"Companies","icon":"bank","action":"contacts\/companies","hasSub":false,"type":"content","id":"5242c58c3a64c"}]}},{"title":"Settings","icon":"cogwheels","hasSub":true,"id":"5242c58c3a69b","sub":{"items":[{"title":"Translate","icon":"book-open","action":"settings\/translate","hasSub":false,"type":"content","id":"5242c58c3a6dd"}]}}]}}'
            ]);

            fakeServer.respondWith('GET', '/navigation/portals', [200, { 'Content-Type': 'application/json' },
                '{"header": { "title":"Portals" }, "sub":{"items":[{"title":"Products","icon":"check","id":"products","hasSub":true,"action":"/portals/products"},{"title":"Portal 1","icon":"caution","id":"portal_1","hasSub":false,"action":"/portals/products","type":"content"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/products', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Produkt 1","id":"product_1","hasSub":true,"action":"/portals/products/product_1"},{"title":"Produkt 4","id":"product_4","hasSub":false,"type":"content","action":"/portals/products/product_1/product_2/product_3/product_4/content"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/products/product_1', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Produkt 2","id":"product_2","hasSub":true,"action":"/portals/products/product_1/product_2"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/products/product_1/product_2', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Produkt 3","id":"product_3","hasSub":true,"action":"/portals/products/product_1/product_2/product_3"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/products/product_1/product_2/product_3', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Produkt 4","id":"product_4","hasSub":false,"type":"content","action":"/portals/products/product_1/product_2/product_3/product_4/content"}]}}'
            ]);

            runs(function() {
                app = husky({ debug: { enable: true }});

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
            }, 'Fake server should have respond!', 500);
        });

        afterEach(function() {
            fakeServer.restore();
        });

        /**
            check if the navigation was initialized by checking
            if it appears in the dom
         */
        it('should be started after app start', function() {
            $navigation = $('.navigation');
            expect($navigation.size()).toEqual(1);
        });

        /**
            check if the navigation has inserted 1 column into the dom
         */
        it('should have 1 column', function() {
            expect($navigation.find('.navigation-column').size()).toEqual(1);
        });

        /**
            check if the navigation has the correct amount of entries
         */
        it('should have 5 navigation-items', function() {
            waitsFor(function() {
                // TODO: Change after navigation refactoring
                return $navigation.find('.navigation-column-item').size() === 5;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($navigation.find('.navigation-column-item').size()).toEqual(5);
            });
        });

        /**
            check if a column show properly after clicking on a
            navigation item

            TODO: Change after navigation refactoring
         */
        it('should show a second column', function() {
            var flag = false;

            runs(function() {
                _.delay(function() {
                    // navigation-item id of contacts
                    $('#5242c58c3a591').click();

                    flag = true;
                }, 100);

            });

            waitsFor(function() {
                return flag;
            }, 500);

            runs(function() {
                expect($('.navigation-column').size()).toEqual(2);
            });
        });

        /**
            check if a column loads properly after clicking on a
            navigation item

            TODO: Change after navigation refactoring
        */
        it('should load the sub column of the selected navigation item', function() {
            var flag = false;

            runs(function() {
                _.delay(function() {
                    // navigation-item id of portals
                    $('#52f258bc2e47f').click();
                    fakeServer.respond();

                    flag = true;
                }, 100);

            });

            waitsFor(function() {
                return flag;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-column').size()).toEqual(2);
            });
        });

        /**
            check if a header is in the current column
         */
        it('should insert header into loaded column', function() {
            var flag = false;

            runs(function() {
                _.delay(function() {
                    // navigation-item id of portals
                    $('#52f258bc2e47f').click();
                    fakeServer.respond();

                    flag = true;
                }, 100);

            });

            waitsFor(function() {
                return flag;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('#column-1').find('.navigation-column-header').size()).toEqual(1);
            });
        });

        /**
            check if after the second column a
            sub-columns container is inerted into the navigation
         */
        it('should insert sub-columns container after the second column', function() {
            var flag1 = false,
                flag2 = false;

            runs(function() {
                _.delay(function() {
                    // navigation-item id of portals
                    $('#52f258bc2e47f').click();
                    fakeServer.respond();

                    flag1 = true;
                }, 100);

            });

            waitsFor(function() {
                return flag1;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                _.delay(function() {
                    // navigation-item id of products
                    $('#products').click();
                    fakeServer.respond();

                    flag2 = true;
                }, 100);
            });

            waitsFor(function() {
                return flag2;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-sub-columns').size()).toEqual(1);
            });
        });

        /**
            check if selected item get class "selected"
         */
        xit('should have class selected', function() {});

        /**
            Specs for content columns
         */
        describe('Content-Column', function() {
            beforeEach(function() {
                var flag1 = false,
                    flag2 = false,
                    flag3 = false;

                runs(function() {
                    _.delay(function() {
                        // navigation-item id of portals
                        $('#52f258bc2e47f').click();
                        fakeServer.respond();

                        flag1 = true;
                    }, 100);

                });

                waitsFor(function() {
                    return flag1;
                }, 'Fake server should have respond!', 500);

                runs(function() {
                    _.delay(function() {
                        // navigation-item id of products
                        $('#products').click();
                        fakeServer.respond();

                        flag2 = true;
                    }, 100);
                });

                waitsFor(function() {
                    return flag2;
                }, 'Fake server should have respond!', 500);

                runs(function() {
                    app.sandbox.emit('navigation.item.column.show', {
                        data: {
                            "displayOption": "content",
                            "header": {
                                "displayOption": "link",
                                "action": "/back"
                            },
                            "sub": {
                                "items": [
                                    {
                                        "title": "Details",
                                        "id": "details",
                                        "hasSub": false,
                                        "type": "content",
                                        "action": "/details",
                                        "selected": true
                                    },
                                    {
                                        "title": "Settings",
                                        "id": "settings",
                                        "hasSub": false,
                                        "type": "content",
                                        "action": "/settings"
                                    }
                                ]
                            }
                        }
                    });

                    _.delay(function() {
                        flag3 = true;
                    }, 100);
                });

                waitsFor(function() {
                    return flag3;
                }, 500);
            });

            /**
                check if the content column is inserted
                after the "show content" event
             */
            it('should show content column', function() {
                expect($('.content-column').size()).toEqual(1);
            });

            /**
                check if the content column has 2 entries
             */
            it('should have 2 navigation items', function() {
                expect($('.content-column ul').find('li').size()).toEqual(2);
            });

            /**
                check if the column idx (index) equals the amount of columns
             */
            it('should have the right idx', function() {
                expect($('.navigation-column').size()-1).toEqual($('.content-column').data('column-id'));
            });

            /**
                check if the content column emit an event on item select
             */
            it('should emit an event after item select', function() {
                var emitted = false;

                runs(function() {
                    app.sandbox.on('navigation.item.content.show', function() {
                        emitted = true;
                    });

                    $('#details').click();
                });

                waitsFor(function() {
                    return emitted;
                }, '"content show event wasn\'t emitted"', 500);

                runs(function() {
                    expect(emitted).toBe(true);
                });
            });

            /**
                check if the content column is removed properly
             */
            it('should remove the content-column', function() {
                $('#5242c58c3a591').click();
                expect($('.navigation').size()).toEqual(1);
                expect($('.content-column').size()).toEqual(0);
            });
        });
    });
});

define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer, $navigation;

    describe('Navigation', function() {

        beforeEach(function() {

            var respond = false;

            fakeServer = sinon.fakeServer.create();

            fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
                '{"title":"Root","hasSub":true,"id":"5242c58c3a494", "header": { "title":"Ivoclar", "logo":"../../img/tmp/logo.png" },"sub":{"items":[{"title":"Audits","icon":"check","action":"audit","hasSub":false,"type":"content","id":"5242c58c3a4f2"},{"title":"Profiles","icon":"adjust-alt","action":"profile","hasSub":false,"type":"content","id":"5242c58c3a53e"},{"title":"Portals", "route":"portals","icon":"caution","hasSub":true,"id":"52f258bc2e47f","action":"/navigation/portals"},{"title":"Contacts","icon":"contact-book","hasSub":true,"id":"5242c58c3a591","sub":{"items":[{"title":"People","icon":"parents","action":"contacts\/people","hasSub":false,"type":"content","id":"5242c58c3a5f6"},{"title":"Companies","icon":"bank","action":"contacts\/companies","hasSub":false,"type":"content","id":"5242c58c3a64c"}]}},{"title":"Settings","route":"settings","icon":"cogwheels","hasSub":true,"id":"5242c58c3a69b","sub":{"items":[{"title":"Translate","icon":"book-open","route":"translate","action":"settings\/translate","hasSub":false,"type":"content","id":"5242c58c3a6dd"}]}}]}}'
            ]);

            fakeServer.respondWith('GET', '/navigation/portals', [200, { 'Content-Type': 'application/json' },
                '{"displayOption": "portals", "sub":{"items":[{"title":"Portal 1","icon":"check","id":"portal1","hasSub":true,"action":"/portals/1"},{"title":"Portal 2","icon":"caution","id":"portal_2","hasSub":true,"action":"/portals/2","sub":{"items":[{"title":"Home Pages","icon":"bank","id":"home2","hasSub":false,"action":"/portals/2/home"},{"title":"Pages","icon":"book","route":"pages","id":"pages2","hasSub":true,"action":"/portals/2/pages"}]}}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/1', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Home Pages","icon":"bank","id":"home1","hasSub":false,"action":"/portals/1/home","type":"content"},{"title":"Pages","route":"pages","icon":"book","id":"pages1","hasSub":true,"action":"/portals/1/pages"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/1/pages', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Page 1","route":"page1","id":"page1-1","hasSub":true,"action":"/portals/1/pages/page1"},{"title":"Page 2","id":"page1-2","hasSub":false,"action":"/portals/1/pages/page2"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/1/pages/page1', [200, { 'Content-Type': 'application/json' },
                '{"sub":{"items":[{"title":"Page 3","route":"page2","id":"page1-3","hasSub":true,"action":"/portals/1/pages/page3"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/1/pages/page3', [200, { 'Content-Type': 'application/json' },
                '{"displayOption": "portal", "sub":{"items":[{"title":"Page 4","route":"page3","id":"page1-4","hasSub":true,"action":"/portals/1/pages/page4"}]}}'
            ]);

            fakeServer.respondWith('GET', '/portals/1/pages/page4', [200, { 'Content-Type': 'application/json' },
                '{"displayOption": "portal", "sub":{"items":[{"title":"Page 5","id":"page1-5","hasSub":false,"type":"content","action":"/portals/1/pages/page5"}]}}'
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
                    $('#52f258bc2e47f').click();
                    fakeServer.respond();

                    flag2 = true;
                }, 100);
            });

            waitsFor(function() {
                return flag2;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                _.delay(function() {
                    // navigation-item id of products
                    $('#pages1').click();
                    fakeServer.respond();

                    flag3 = true;
                }, 100);
            });

            waitsFor(function() {
                return flag3;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-sub-columns').size()).toEqual(1);
            });
        });

        /**
         * If two clicks on a ajax reloading item the request should only be done once
         */
        it('should only do the click once', function() {
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
                    $('#52f258bc2e47f').click();
                    fakeServer.respond();

                    flag2 = true;
                }, 100);
            });

            waitsFor(function() {
                return flag2;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                _.delay(function() {
                    // navigation-item id of products
                    $('#pages1').click();
                    _.delay(function(){
                        fakeServer.respond();
                        flag3 = true;
                    }, 100);
                    $('#pages1').click();
                    _.delay(function(){
                        fakeServer.respond();
                        flag3 = true;
                    }, 100);
                }, 100);
            });

            waitsFor(function() {
                return flag3;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-sub-columns .navigation-column').size()).toEqual(1);
            });
        });

        /**
            check if selected item get class "selected"
         */
        xit('should have class selected', function() {});

        it('should route to a certain navigation column', function() {
            var flag = false;

            runs(function() {
                app.sandbox.emit('navigation.route', {
                    route: 'settings/translate'
                });

                _.delay(function() {
                    fakeServer.respond();
                    flag = true;
                }, 300);
            });

            waitsFor(function() {
                return flag;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-column').size()).toEqual(2);
                // id of translate navigation entry
                expect($('#5242c58c3a6dd').size()).toEqual(1);
            });
        });

        it('should load the columns and route to a certain entry', function() {
            var flag = false;

            runs(function() {
                app.sandbox.emit('navigation.route', {
                    route: 'portals',
                    async: true
                });

                _.delay(function() {
                    fakeServer.respond();
                    flag = true;
                }, 300);
            });

            waitsFor(function() {
                return flag;
            }, 'Fake server should have respond!', 500);

            runs(function() {
                expect($('.navigation-column').size()).toEqual(2);
                expect($('#pages1').size()).toEqual(1);
            });
        });

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

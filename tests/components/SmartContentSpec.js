define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer;

    ddescribe('Smart-content', function() {

        beforeEach(function() {
            var respond = false;

            fakeServer = sinon.fakeServer.create();
            fakeServer.respondWith('GET', '/smartcontent?dataSource=&incSubFolders=false&category=&tags=&sortBy=&sortMethod=asc&presentAs=', [200, { 'Content-Type': 'application/json' },
                '{"_embedded": [{"id": 1, "name": "Produkt A"}, {"id": 2, "name": "Produkt B"}, {"id": 3, "name": "Produkt C"}, {"id": 4, "name": "Produkt D"}, {"id": 5, "name": "Produkt E"}, {"id": 6, "name": "Produkt F"}, {"id": 7, "name": "Produkt G"}, {"id": 8, "name": "Produkt H"}, {"id": 9, "name": "Produkt I"}, {"id": 10, "name": "Produkt J"}]}'
            ]);
            fakeServer.respondWith('GET', '/smartcontent?dataSource=1&incSubFolders=false&category=&tags=&sortBy=&sortMethod=asc&presentAs=', [200, { 'Content-Type': 'application/json' },
                '{"_embedded": [{"id": 1, "name": "Produkt X"}, {"id": 2, "name": "Produkt Y"}, {"id": 3, "name": "Produkt Z"}, {"id": 4, "name": "Produkt Q"}]}'
            ]);

            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                $('body').off();
                app.start(document.body).then(function() {

                    app.sandbox.start([
                        {   name: 'smart-content@husky',
                            options: {
                                el: 'body',
                                url: '/smartcontent',
                                visibleItems: 3,
                                dataSources: [{id: 1, name: 'home/'},
                                    {id: 2, name: 'home/products/'},
                                    {id: 3, name: 'home/products/technical'}],
                                categories: [{id: 1, name: 'New products'},
                                    {id: 2, name: 'Old products'},
                                    {id: 3, name: 'technical products'}],
                                sortBy: [{id: 1, name: 'Description'},
                                    {id: 2, name: 'Name'},
                                    {id: 3, name: 'Price'}],
                                presentAs: [{id: 1, name: '2-columns with pictures'},
                                    {id: 2, name: '1-column with pictures'},
                                    {id: 3, name: 'only pictures'}]
                            }
                        }
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
            if (this.results_.failedCount > 0) {
                // if so, change the function which should move to the next test
                jasmine.Queue.prototype.next_ = function() {
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
         * Check if component gets initialized
         */
        it('should initialize the container', function() {
           runs(function() {
               var $container = $('.smart-content-container');
               expect($container.length).toEqual(1);
           });
        });

        /**
         * Check if the header gets initialized
         */
        it('should initialize the header', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-header').length).toEqual(1);
            });
        });

        /**
         * Check if the content gets initialized
         */
        it('should initialize the content', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-content').length).toEqual(1);
            });
        });

        /**
         * Check if requested items are loaded
         */
        it('should contain preloaded items', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-content').html()).toContain('Produkt A');
            });
        });

        /**
         * Check if the footer gets initialized
         */
        it('should initialize the footer', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-footer').length).toEqual(1);
            });
        });

        /**
         * Check if the only 3 visible items are displayed at the beginning
         */
        it('should only render 3 items', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-content .items-list li').length).toEqual(3);
            });
        });

        /**
         * Check if the button has been rendered
         */
        it('should render the toggler-button', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                expect($container.find('.smart-header a').length).toEqual(1);
            });
        });

        /**
         *
         * Dom-event related tests
         *
         */

        /**
         * Check if the 10 items are displayed after clicking on view all
         */
        it('should render 10 items', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                $container.find('.smart-footer .view-toggler').click();
                expect($container.find('.smart-content .items-list li').length).toEqual(10);
            });
        });

        /**
         * Check if overlay gets initialized if toggler-button is clicked
         */
        it('should initialize the overlay', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                $container.find('.smart-header a').click();
                expect($('.overlay-container').length).toEqual(1);
            });
        });

        /**
         * Check if overlay gets removed from DOM on click on close
         */
        it('should remove the overlay', function() {
            runs(function() {
                var $container = $('.smart-content-container');
                $container.find('.smart-header a').click();
                $('.overlay-container .close-button').click();
                expect($('.overlay-container').length).toEqual(0);
            });
        });

        /**
         * Check
         *      if new data gets loaded and rendered if ok button is clicked
         *      if source text gets inserted into the component header
         */
        it('should load items and insert the source into the header if the overlay submitted', function() {
            var responded = false;

            runs(function() {
                $('.smart-content-container').find('.smart-header a').click();
            });

            waitsFor(function() {
                return ($('#husky-dropdown-multiple-select-data-source-dropdown-list').length > 0);
            },'components should be initailized', 500);

            runs(function() {
                $('.overlay-container').find('li:contains("home/")')[0].click();
                $('.overlay-container').find('.save-button').click();
                _.delay(function() {
                    fakeServer.respond();
                    responded = true;
                }, 100);
            });

            waitsFor(function() {
                return responded;
            }, 'FakeServer should return respond', 500);

            runs(function() {
                expect($('.smart-content-container .smart-content').html()).toContain('Produkt X');
                expect($('.smart-content-container .smart-header').html()).toContain('home/');
            });
        });

        /**
         *
         * Custom-event related tests
         *
         */

        /**
         * Check if input-retrieved event is emmited
         */
        it('should emit input-retrieved event', function() {
            var emitted = false;

            runs(function() {
                $('.smart-content-container').find('.smart-header a').click();
            });

            waitsFor(function() {
                return ($('#husky-dropdown-multiple-select-data-source-dropdown-list').length > 0);
            },'components should be initailized', 500);

            runs(function() {
                app.sandbox.on('husky.smart-content.input-retrieved', function() {
                   emitted = true;
                });
                $('.overlay-container').find('.save-button').click();
            });

            waitsFor(function() {
                return emitted;
            }, 'input-retrieved event was not emitted', 500);

            runs(function() {
                expect(emitted).toBe(true);
            });
        });

        /**
         * Check if data-request and data-retrieved events are emmited
         */
        it('should emit data-request and data-retrieved event', function() {
            var emitted = false,
                emitted2 = false;

            runs(function() {
                $('.smart-content-container').find('.smart-header a').click();
            });

            waitsFor(function() {
                return ($('#husky-dropdown-multiple-select-data-source-dropdown-list').length > 0);
            },'components should be initailized', 500);

            runs(function() {
                app.sandbox.on('husky.smart-content.data-request', function() {
                    emitted = true;
                });
                app.sandbox.on('husky.smart-content.data-retrieved', function() {
                    emitted2 = true;
                });
                $('.overlay-container').find('li:contains("home/")')[0].click();
                $('.overlay-container').find('.save-button').click();
                _.delay(function() {
                    fakeServer.respond();
                }, 100);
            });

            waitsFor(function() {
                return (emitted && emitted2);
            }, 'one or both events were not emitted', 500);

            runs(function() {
                expect(emitted).toBe(true);
                expect(emitted2).toBe(true);
            });
        });
    });
});

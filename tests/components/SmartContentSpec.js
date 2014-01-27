// TODO: set footer template
// TODO: initialized (own describe)
// TODO: settings event

define(['husky'], function(husky) {

    'use strict';

    var app, fakeServer;

    describe('Smart-content', function() {

        beforeEach(function() {
            var respond = false;

            fakeServer = sinon.fakeServer.create();
            fakeServer.respondWith('GET', '/smartcontent?dataSource=&incSubFolders=false&category=&tags=&sortBy=&sortMethod=asc&presentAs=', [200, { 'Content-Type': 'application/json' },
                '{"_embedded": [{"id": 1, "name": "Produkt A"}, {"id": 2, "name": "Produkt B"}, {"id": 3, "name": "Produkt C"}, {"id": 4, "name": "Produkt D"}, {"id": 5, "name": "Produkt E"}, {"id": 6, "name": "Produkt F"}, {"id": 7, "name": "Produkt G"}, {"id": 8, "name": "Produkt H"}, {"id": 9, "name": "Produkt I"}, {"id": 10, "name": "Produkt J"}]}'
            ]);

            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                /*$('body').off();
                app.start(document.body).then(function() {

                    app.sandbox.start([
                        {   name: 'smart-content@husky',
                            options: {
                                el: 'body',
                                url: '/smartcontent',
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
                });*/

            });

            /*waitsFor(function() {
                return respond;
            }, 'Fake server should have respond!', 750);*/
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

        it('should test', function() {
           expect(1).toEqual(1);
        });

    });
});

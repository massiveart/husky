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
         * - klassen gesetzt
         * - aufklappen
         * - zuklappen
         * - selektieren
         * - selektierung aendern
         */

    });
});

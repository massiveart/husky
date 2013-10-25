require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var fakeServer = sinon.fakeServer.create(),
        app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
        '{"title":"Root","hasSub":true,"id":"5242c58c3a494", "header": { "title":"Ivoclar", "logo":"../../img/tmp/logo.png" },"sub":{"items":[{"title":"Audits","icon":"check","action":"audit","hasSub":false,"type":"content","id":"5242c58c3a4f2"},{"title":"Profiles","icon":"adjust-alt","action":"profile","hasSub":false,"type":"content","id":"5242c58c3a53e"},{"title":"Portals","icon":"caution","hasSub":true,"id":"52f258bc2e47f","action":"/navigation/portals"},{"title":"Contacts","icon":"contact-book","hasSub":true,"id":"5242c58c3a591","sub":{"items":[{"title":"People","icon":"parents","action":"contacts\/people","hasSub":false,"type":"content","id":"5242c58c3a5f6"},{"title":"Companies","icon":"bank","action":"contacts\/companies","hasSub":false,"type":"content","id":"5242c58c3a64c"}]}},{"title":"Settings","route":"settings","icon":"cogwheels","hasSub":true,"id":"5242c58c3a69b","sub":{"items":[{"title":"Translate","icon":"book-open","route":"translate","action":"settings\/translate","hasSub":false,"type":"content","id":"5242c58c3a6dd"}]}}]}}'
    ]);

    fakeServer.respondWith('GET', '/navigation/portals', [200, { 'Content-Type': 'application/json' },
        '{"displayOption": "portals", "sub":{"items":[{"title":"Portal 1","icon":"check","id":"portal1","hasSub":true,"action":"/portals/1"},{"title":"Portal 2","icon":"caution","id":"portal_2","hasSub":true,"action":"/portals/2","sub":{"items":[{"title":"Home Pages","icon":"bank","id":"home2","hasSub":false,"action":"/portals/2/home"},{"title":"Pages","icon":"book","id":"pages2","hasSub":true,"action":"/portals/2/pages"}]}}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/1', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Home Pages","icon":"bank","id":"home1","hasSub":false,"action":"/portals/1/home","type":"content"},{"title":"Pages","icon":"book","id":"pages1","hasSub":true,"action":"/portals/1/pages"}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/1/pages', [200, { 'Content-Type': 'application/json' },
        '{"displayOption": "portal", "sub":{"items":[{"title":"Page 1","id":"page1-1","hasSub":true,"action":"/portals/1/pages/page1"},{"title":"Page 2","id":"page1-2","hasSub":false,"action":"/portals/1/pages/page2"}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/1/pages/page1', [200, { 'Content-Type': 'application/json' },
        '{"displayOption": "portal", "sub":{"items":[{"title":"Page 3","id":"page1-3","hasSub":true,"action":"/portals/1/pages/page3"}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/1/pages/page3', [200, { 'Content-Type': 'application/json' },
        '{"displayOption": "portal", "sub":{"items":[{"title":"Page 4","id":"page1-4","hasSub":true,"action":"/portals/1/pages/page4"}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/1/pages/page4', [200, { 'Content-Type': 'application/json' },
        '{"displayOption": "portal", "sub":{"items":[{"title":"Page 5","id":"page1-5","hasSub":false,"type":"content","action":"/portals/1/pages/page5"}]}}'
    ]);

    app.start().then(function() {
        app.logger.log('Aura started...');

        var sizeChanged = function(event) {
            $('#content').css('margin-left', event.data.navWidth + 45);
        }, showColumn = function(selected) {
            setTimeout(function() {
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
                                    "selected": !!(selected === 1)
                                },
                                {
                                    "title": "Settings",
                                    "id": "settings",
                                    "hasSub": false,
                                    "type": "content",
                                    "action": "/settings",
                                    "selected": !!(selected === 2)
                                }
                            ]
                        }
                    }
                });
            }, 10);
        };

        app.sandbox.on('navigation.item.selected', function() {
                setTimeout(function() {
                    fakeServer.respond();
                }, 500);
            }
        );

        setTimeout(function() {
            app.sandbox.emit('navigation.route', {
                route: 'settings/translate'
            });
        }, 600);

        app.sandbox.on('husky.util.load.data', function() {
            setTimeout(function() {
                fakeServer.respond();
            }, 500);
        });

        app.sandbox.on('navigation.item.content.show', function(event) {
            $('#print').html(event.item.action);
            //sizeChanged(event);

            if (event.item.action === '/portals/1/pages/page5') {
                showColumn(1);
            }
            if (event.item.action === '/settings') {
                showColumn(2);
            }
            if (event.item.action === '/details') {
                showColumn(1);
            }
        });

        app.sandbox.on('navigation.size.changed', function(event) {
            //sizeChanged(event);
        });

        $('#load').on('click', function() {
            $('#print').html('Content');
            showColumn(1);
        });
    });

})
;

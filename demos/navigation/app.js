require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
        '{"title":"Root","hasSub":true,"id":"5242c58c3a494","sub":{"items":[{"title":"Audits","icon":"check","action":"audit","hasSub":false,"type":"content","id":"5242c58c3a4f2"},{"title":"Profiles","icon":"adjust-alt","action":"profile","hasSub":false,"type":"content","id":"5242c58c3a53e"},{"title":"Contacts","icon":"contact-book","hasSub":true,"id":"5242c58c3a591","sub":{"items":[{"title":"People","icon":"parents","action":"contacts\/people","hasSub":false,"type":"content","id":"5242c58c3a5f6"},{"title":"Companies","icon":"bank","action":"contacts\/companies","hasSub":false,"type":"content","id":"5242c58c3a64c"}]}},{"title":"Settings","icon":"cogwheels","hasSub":true,"id":"5242c58c3a69b","sub":{"items":[{"title":"Translate","icon":"book-open","action":"settings\/translate","hasSub":false,"type":"content","id":"5242c58c3a6dd"}]}}]}}'
    ]);

    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');

        setTimeout(function() {
            fakeServer.respond();
        }, 100);

        $('#load').on('click', function() {
            app.sandbox.emit('navigation.item.column.show', {
                data: {
                    "displayOption": "content",
                    "sub": {
                        "items": [
                            {
                                "title": "Details",
                                "id": "details",
                                "hasSub": false,
                                "type": "content",
                                "action": "/"
                            },
                            {
                                "title": "Settings",
                                "id": "settings",
                                "hasSub": false,
                                "action": "/"
                            }
                        ]
                    }
                }
            });
        });
    });


});

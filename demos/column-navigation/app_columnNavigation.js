require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/nodes?depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/1",'+
                '"children" : "/nodes?parent=1&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "I am an online folder",'+
                    '"id": "121",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                    '"self" : "/nodes/121",'+
                    '"children" : "/nodes?parent=121&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am an offline folder",'+
                    '"id": "122",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/122",'+
                        '"children" : "/nodes?parent=122&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a folder you cant edit",'+
                    '"id": "123",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/123",'+
                        '"children" : "/nodes?parent=123&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a ghost folder",'+
                    '"id": "124",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/124",'+
                        '"children" : "/nodes?parent=124&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a shadow folder",'+
                    '"id": "125",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/125",'+
                        '"children" : "/nodes?parent=125&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a selected folder",'+
                    '"id": "126",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/126",'+
                        '"children" : "/nodes?parent=126&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a linked folder",'+
                    '"id": "127",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/127",'+
                        '"children" : "/nodes?parent=127&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 128",'+
                    '"id": "128",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/128",'+
                        '"children" : "/nodes?parent=128&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 129",'+
                    '"id": "129",'+
                    '"hasSub": true,'+
                    '"_links" : {'+
                        '"self" : "/nodes/129",'+
                        '"children" : "/nodes?parent=129&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Root",'+
            '"id": "1",'+
            '"hasSub": true'+
        '}'
    ]);



    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;

    app.start([
            {
                name: 'column-navigation@husky',
                options: {
                    el: '#column-navigation',
                    url: '/nodes?depth=1'
                }
            }
        ]).then(function () {
            app.logger.log('Aura started...');

            _.delay(function () {
                fakeServer.respond();
            }, 500);

        });
});

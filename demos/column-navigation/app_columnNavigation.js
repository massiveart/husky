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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
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

    fakeServer.respondWith('GET', '/nodes?parent=121&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/121",'+
                '"children" : "/nodes?parent=121&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "I am an online folder 2",'+
                    '"id": "221",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/221",'+
                        '"children" : "/nodes?parent=221&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am an offline folder 2",'+
                    '"id": "222",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1222",'+
                        '"children" : "/nodes?parent=222&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a folder you cant edit 2",'+
                    '"id": "223",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/223",'+
                        '"children" : "/nodes?parent=223&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a ghost folder 2",'+
                    '"id": "224",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/224",'+
                        '"children" : "/nodes?parent=224&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a shadow folder 2",'+
                    '"id": "225",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/225",'+
                        '"children" : "/nodes?parent=225&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a selected folder 2",'+
                    '"id": "1226",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/226",'+
                        '"children" : "/nodes?parent=226&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "I am a linked folder 2",'+
                    '"id": "227",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/227",'+
                        '"children" : "/nodes?parent=227&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 228",'+
                    '"id": "228",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/228",'+
                        '"children" : "/nodes?parent=228&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 229",'+
                    '"id": "229",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/229",'+
                        '"children" : "/nodes?parent=229&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "I am an online folder",'+
            '"id": "121",'+
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

            app.sandbox.on('husky.column.navigation.selected', function (item) {
                app.logger.log('husky.column.navigation.selected item selected');
                if(!!item.hasSub) {
                    setTimeout(function () {
                        fakeServer.respond();
                    }, 500);
                }
            });

        });
});

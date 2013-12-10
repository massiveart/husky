require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    // first column
    fakeServer.respondWith('GET', '/nodes?depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/0",'+
                '"children" : "/nodes?parent=0&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "Page 1",'+
                    '"id": "1",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1",'+
                        '"children" : "/nodes?parent=1&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2",'+
                    '"id": "2",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2",'+
                        '"children" : "/nodes?parent=2&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 3",'+
                    '"id": "3",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/3",'+
                        '"children" : "/nodes?parent=3&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 4",'+
                    '"id": "4",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/4",'+
                        '"children" : "/nodes?parent=4&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 5",'+
                    '"id": "5",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/5",'+
                        '"children" : "/nodes?parent=5&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 6",'+
                    '"id": "6",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/6",'+
                        '"children" : "/nodes?parent=6&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 7",'+
                    '"id": "7",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/7",'+
                        '"children" : "/nodes?parent=7&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 8",'+
                    '"id": "8",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/8",'+
                        '"children" : "/nodes?parent=8&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 9",'+
                    '"id": "9",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/9",'+
                        '"children" : "/nodes?parent=9&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Root",'+
            '"id": "0",'+
            '"hasSub": true'+
        '}'
    ]);

    // menu item 1 - second column
    fakeServer.respondWith('GET', '/nodes?parent=1&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/1",'+
                '"children" : "/nodes?parent=1&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "Page 1.1",'+
                    '"id": "1.1",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.1",'+
                        '"children" : "/nodes?parent=1.1&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.2",'+
                    '"id": "1.2",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.2",'+
                        '"children" : "/nodes?parent=1.2&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.3",'+
                    '"id": "1.3",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.3",'+
                        '"children" : "/nodes?parent=1.3&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.4",'+
                    '"id": "1.4",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.4",'+
                        '"children" : "/nodes?parent=1.4&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.5",'+
                    '"id": "1.5",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.5",'+
                        '"children" : "/nodes?parent=1.5&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.6",'+
                    '"id": "1.6",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.6",'+
                        '"children" : "/nodes?parent=1.6&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.7",'+
                    '"id": "1.7",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.7",'+
                        '"children" : "/nodes?parent=1.7&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.8",'+
                    '"id": "1.8",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.8",'+
                        '"children" : "/nodes?parent=1.8&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.9",'+
                    '"id": "1.9",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.9",'+
                        '"children" : "/nodes?parent=1.9&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Page 1",'+
            '"id": "1",'+
            '"hasSub": true'+
            '}'
    ]);

    // menu item 2 - second column
    fakeServer.respondWith('GET', '/nodes?parent=2&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/2",'+
                '"children" : "/nodes?parent=2&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "Page 2.1",'+
                    '"id": "2.1",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.1",'+
                        '"children" : "/nodes?parent=2.1&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.2",'+
                    '"id": "2.2",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.2",'+
                        '"children" : "/nodes?parent=2.2&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.3",'+
                    '"id": "2.3",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.3",'+
                        '"children" : "/nodes?parent=2.3&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.4",'+
                    '"id": "2.4",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.4",'+
                        '"children" : "/nodes?parent=2.4&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.5",'+
                    '"id": "2.5",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.5",'+
                        '"children" : "/nodes?parent=2.5&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.6",'+
                    '"id": "2.6",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.6",'+
                        '"children" : "/nodes?parent=2.6&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.7",'+
                    '"id": "2.7",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.7",'+
                        '"children" : "/nodes?parent=2.7&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.8",'+
                    '"id": "2.8",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.8",'+
                        '"children" : "/nodes?parent=2.8&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 2.9",'+
                    '"id": "2.9",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/2.9",'+
                        '"children" : "/nodes?parent=2.9&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Page 2",'+
            '"id": "2",'+
            '"hasSub": true'+
            '}'
    ]);

    // menu item 1.1 - third column
    fakeServer.respondWith('GET', '/nodes?parent=1.1&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/1.1",'+
                '"children" : "/nodes?parent=1.1&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                '"title": "Page 1.1.1",'+
                '"id": "1.1.1",'+
                '"hasSub": false,'+
                '"published":true,'+
                '"linked": true,'+
                '"type": "ghost",'+
                '"_links" : {'+
                '"self" : "/nodes/1.1.1",'+
                '"children" : "/nodes?parent=1.1.1&depth=1"'+
                '},'+
                '"_embedded": []'+
                '},'+
                '{'+
                '"title": "Page 1.1.2",'+
                '"id": "1.1.2",'+
                '"hasSub": false,'+
                '"published":true,'+
                '"linked": true,'+
                '"type": "ghost",'+
                '"_links" : {'+
                '"self" : "/nodes/1.1.2",'+
                '"children" : "/nodes?parent=222.3&depth=1"'+
                '},'+
                '"_embedded": []'+
                '},'+
                '{'+
                '"title": "Page 1.1.3",'+
                '"id": "1.1.3",'+
                '"hasSub": false,'+
                '"published":true,'+
                '"linked": true,'+
                '"type": "ghost",'+
                '"_links" : {'+
                '"self" : "/nodes/1.1.3",'+
                '"children" : "/nodes?parent=1.1.3&depth=1"'+
                '},'+
                '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Page 1.1",'+
            '"id": "1.1",'+
            '"hasSub": true'+
            '}'
    ]);

    // menu item 1.2 - third column
    fakeServer.respondWith('GET', '/nodes?parent=1.2&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/1.2",'+
                '"children" : "/nodes?parent=1.2&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "Page 1.2.1",'+
                    '"id": "1.2.1",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                        '"self" : "/nodes/1.2.1",'+
                        '"children" : "/nodes?parent=1.2.1&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                    '},'+
                    '{'+
                        '"title": "Page 1.2.2",'+
                        '"id": "1.2.2",'+
                        '"hasSub": false,'+
                        '"published":true,'+
                        '"linked": true,'+
                        '"type": "ghost",'+
                        '"_links" : {'+
                            '"self" : "/nodes/1.2.2",'+
                            '"children" : "/nodes?parent=1.2.2&depth=1"'+
                        '},'+
                        '"_embedded": []'+
                    '},'+
                    '{'+
                        '"title": "Page 1.2.3",'+
                        '"id": "1.2.3",'+
                        '"hasSub": true,'+
                        '"published":true,'+
                        '"linked": true,'+
                        '"type": "ghost",'+
                        '"_links" : {'+
                            '"self" : "/nodes/1.2.3",'+
                            '"children" : "/nodes?parent=1.2.3&depth=1"'+
                        '},'+
                        '"_embedded": []'+
                    '}'+
            '],'+
            '"title": "Page 1.2",'+
            '"id": "1.2",'+
            '"hasSub": true'+
            '}'
    ]);

    // menu item 1.2.3 - fourth column
    fakeServer.respondWith('GET', '/nodes?parent=1.2.3&depth=1', [200, { 'Content-Type': 'application/json' },
        '{'+
            '"_links" : {'+
                '"self": "/nodes/1.2.3",'+
                '"children" : "/nodes?parent=1.2.3&depth=1"'+
            '},'+
            '"_embedded": ['+
                '{'+
                    '"title": "Page 1.2.3.1",'+
                    '"id": "1.2.3.1",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                    '"self" : "/nodes/1.2.3.1",'+
                    '"children" : "/nodes?parent=1.2.3.1&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.2.3.2",'+
                    '"id": "1.2.3.2",'+
                    '"hasSub": false,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                    '"self" : "/nodes/222.4",'+
                    '"children" : "/nodes?parent=1.2.3.2&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '},'+
                '{'+
                    '"title": "Page 1.2.3.3",'+
                    '"id": "1.2.3.3",'+
                    '"hasSub": true,'+
                    '"published":true,'+
                    '"linked": true,'+
                    '"type": "ghost",'+
                    '"_links" : {'+
                    '"self" : "/nodes/1.2.3.3",'+
                    '"children" : "/nodes?parent=1.2.3.3&depth=1"'+
                    '},'+
                    '"_embedded": []'+
                '}'+
            '],'+
            '"title": "Page 1.2.3",'+
            '"id": "1.2.3",'+
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

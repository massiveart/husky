require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder=asc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"self":"/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
            '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+

            '"sortable": {' +
            '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '}'+
            '},' +
            '"_embedded":'+
            '['+
            '{ "id": "1", "content1": "A Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "B Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
            '}'
    ]);



    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;

    app.start([
            {
                name: 'column-navigation@husky',
                options: {
                    el: '#column-navigation'
                }
            }
        ]).then(function () {
            app.logger.log('Aura started...');

//            _.delay(function () {
//                fakeServer.respond();
//            }, 500);

        });
});

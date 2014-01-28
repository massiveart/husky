require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    // all
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"self":"/admin/api/contacts?flat=true",' +
            '"all":"/admin/api/contacts?flat=true",' +
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +
            '"sortable": {' +
                '"content1" : "/admin/api/contacts?flat=true&sortBy=content1&sortOrder={sortOrder}",' +
                '"content2" : "/admin/api/contacts?flat=true&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } },'+
                '{ "id": "5", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "6", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "7", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "8", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":8,'+
            '"pages": 1,' +
            '"page": 1,' +
            '"pageSize": 0' +
            '}'
    ]);

    // content1 asc
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder=asc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"self":"/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
            '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
            '"all": "/admin/api/contacts?flat=true",'+
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

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

    // content1 desc
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder=desc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"self":"/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                    '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                    '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "D Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "C Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "B Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "A Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
        '}'
    ]);

    // content2 desc
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder=desc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"self":"/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                    '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                    '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
        '}'
    ]);

    // content2 asc
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder=asc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"self":"/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                    '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                    '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
        '}'
    ]);

    // search
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&search=D%20Hallo', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"self":"/admin/api/contacts?flat=true&pageSize=4&search=A%20Hallo%201.1",' +

            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +
            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+

            '"find": "/admin/api/contacts?flat=true&pageSize=4&search={searchString}{&searchFields}",'+

            '"sortable": {' +
            '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '}'+
            '},' +
            '"_embedded":'+
            '['+
            '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } },'+
            '{ "id": "4", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
            '}'
    ]);

    // initial load
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true&pageSize=4",' +

                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+

                '"find": "/admin/api/contacts?flat=true&pageSize=4&search={searchString}{&searchFields}",'+

                '"sortable": {' +
                        '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                        '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
        '}'
    ]);

    // patch
    fakeServer.respondWith('PATCH', '/admin/api/contacts?flat=true&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"self":"/admin/api/contacts?flat=true&pageSize=4",' +

            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"all": "/admin/api/contacts?flat=true",'+
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+

            '"find": "/admin/api/contacts?flat=true&pageSize=4&search={searchString}{&searchFields}",'+

            '"sortable": {' +
            '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '}'+
            '},' +
            '"_embedded":'+
            '['+
            '{ "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
            '}'
    ]);

    // search reset
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&search=', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"self":"/admin/api/contacts?flat=true&pageSize=4",' +

            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"all": "/admin/api/contacts?flat=true",'+
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+

            '"find": "/admin/api/contacts?flat=true&pageSize=4&search={searchString}{&searchFields}",'+

            '"sortable": {' +
            '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '}'+
            '},' +
            '"_embedded":'+
            '['+
            '{ "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
            '}'
    ]);

    // first page
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=1&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +

                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1 1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1 1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1 1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1 1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
            '}'
    ]);

    // second page
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=2&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +

                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"next":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1 2", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1 2", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1 2", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1 2", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"pageSize": 4,' +
            '"page": 2' +
            '}'
    ]);

    // last page
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&page=3&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '"self":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +

            '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '"prev":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
            '"all": "/admin/api/contacts?flat=true",'+
            '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

            '"sortable": {' +
            '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '}'+
            '},' +
            '"_embedded":'+
            '['+
            '{ "id": "1", "content1": "B Hallo 1.1 3", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "A Hallo 1.1 3", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "C Hallo 1.1 3", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1.1 3", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"pageSize": 4,' +
            '"page": 3' +
            '}'
    ]);

    // columns change
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&fields=content1,content2', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true&pageSize=4",' +

                '"first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
                '"last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"pagination": "/admin/api/contacts?flat=true&page={page}&pageSize=4",'+
                '"all": "/admin/api/contacts?flat=true",'+
                '"filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

                '"sortable": {' +
                '"content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
                '"content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1 3", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1 3", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1 3", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1 3", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"total":12,'+
            '"pages": 3,' +
            '"pageSize": 4,' +
            '"page": 1' +
            '}'
    ]);


    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;

    app.start([
            {
                name: 'datagrid@husky',
                options: {
                    url: '/admin/api/contacts?flat=true',
                    selectItem: {
                        type: 'checkbox'
                    },
                    paginationOptions: {
                        pageSize: 4,
                        showPages: 3
                    },
                    className: "myClass",
                    removeRow: true,
                    pagination: true,
                    editable: true,
                    columns: [
                        {content: 'Content 1', width: "30%", attribute: "content1", editable: true},
                        {content: 'Content 2', width: "30%", attribute: "content2", editable: true},
                        {content: 'Content 3', width: "30%", attribute: "content3"}
                    ],
                    sortable: true,
                    excludeFields: [''],
                    searchInstanceName: 'test',
                    columnOptionsInstanceName: '',
                    el: '#datagrid'
                }
            },
            {
                name: 'toolbar@husky',
                options: {
                    el: '#toolbar',
                    instanceName: 'test',
                    hasSearch: true,
                    data: [
                        {
                            id: 'add',
                            icon: 'user-add',
                            class: 'highlight',
                            title: 'add',
                            callback: function() {
                                this.sandbox.emit('sulu.list-toolbar.add');
                            }.bind(this)
                        },
                        {
                            id: 'delete',
                            icon: 'bin',
                            title: 'delete',
                            group: '1',
                            callback: function() {
                                this.sandbox.emit('sulu.list-toolbar.delete');
                            }.bind(this)
                        },
                        {
                            id: 'settings',
                            icon: 'cogwheel',
                            group: '1',
                            items: [
                                {
                                    title: 'import',
                                    disabled: true
                                },
                                {
                                    title: 'export',
                                    disabled: true
                                }
                            ]
                        }
                    ]
                }
            }
        ]).then(function () {
            app.logger.log('Aura started...');

            _.delay(function () {
                fakeServer.respond();
            }, 500);

            $('#add-row').on('click', function () {
                app.sandbox.emit('husky.datagrid.row.add', { "id": "", "content1": "Tschau", "content2": "Hallo 2", "content3": "Hallo 3" });
            });

            app.sandbox.on('husky.datagrid.page.change', function () {
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.search.test', function () {
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.search.test.reset', function () {
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.datagrid.row.removed', function (item) {
                app.logger.log('remove: ' + item);
            });

            app.sandbox.on('husky.datagrid.row.remove-click', function (event, item) {
                app.logger.log('remove-clicked: ' + item);

                window.alert('DELETE AFTER OK');

                if (typeof item === 'number') {
                    app.sandbox.emit('husky.datagrid.row.remove', item);
                } else {
                    app.sandbox.emit('husky.datagrid.row.remove', event);
                }
            });

            app.sandbox.on('husky.datagrid.item.select', function (item) {
                app.logger.log('Husky.Ui.DataGrid item select: ' + item);
            });

            app.sandbox.on('husky.datagrid.item.deselect', function (item) {
                app.logger.log('Husky.Ui.DataGrid item deselect: ' + item);
            });

            app.sandbox.on('husky.datagrid.item.click', function (item) {
                app.logger.log('Husky.Ui.DataGrid item click: ' + item);
            });

            app.sandbox.on('husky.datagrid.page.change', function () {
                app.logger.log('Husky.Ui.DataGrid page change');
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.datagrid.data.sort', function () {
                app.logger.log('Husky.Ui.DataGrid sort change');
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.util.save.data', function () {
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.datagrid.data.load.all', function () {
                app.logger.log('Husky.Ui.DataGrid load all');
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            app.sandbox.on('husky.column-options.saved', function () {
                setTimeout(function () {
                    fakeServer.respond();
                }, 500);
            });

            $('#get-selected').on('click', function () {
                app.sandbox.emit('husky.datagrid.items.get-selected');
            });

            app.sandbox.on('husky.datagrid.items.selected', function (event) {
                app.logger.log('Husky.Ui.DataGrid items selected ' + event);
            });

            $('#update').on('click', function () {
                app.sandbox.emit('husky.datagrid.update');
            });

            $('#save').on('click', function () {
                app.sandbox.emit('husky.datagrid.data.save');
            });

            app.sandbox.dom.on('#change-columns','click', function () {
                app.sandbox.emit('husky.column-options.saved',
                    [{"id":"content1","translation":"content1","disabled":false},{"id":"content2","translation":"content2","disabled":false},{"id":"content3","translation":"content3","disabled":true}]
                );
            });

        });
});

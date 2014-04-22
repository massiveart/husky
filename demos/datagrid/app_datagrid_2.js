require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    // initial load
    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
            '   "self":"/admin/api/contacts?flat=true&pageSize=4",' +
            '   "first":"/admin/api/contacts?flat=true&page=1&pageSize=4",' +
            '   "last": "/admin/api/contacts?flat=true&page=3&pageSize=4",' +
            '   "next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
            '   "all": "/admin/api/contacts?flat=true",'+
            '   "filter":"/admin/api/contacts?flat=true&fields={fieldsList}",' +

            '   "pagination": "/admin/api/contacts?flat=true&page={page}&pageSize={pageSize}",' +

            '   "find": "/admin/api/contacts?flat=true&pageSize=4&search={searchString}{&searchFields}",' +

            '   "sortable": {' +
            '       "content1" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content1&sortOrder={sortOrder}",' +
            '       "content2" : "/admin/api/contacts?flat=true&page=1&pageSize=4&sortBy=content2&sortOrder={sortOrder}"' +
            '   }' +
            '},' +
            '"_embedded":' +
            '[' +
            '   { "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '   { "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '   { "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '   { "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }' +
            '],' +
            '"total": 4,' +
            '"numberOfAll": 12,' +
            '"pages": 3,' +
            '"page": 1,' +
            '"pageSize": 4' +
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
                    removeRow: false,
                    progressRow: true,
                    pagination: true,
                    contentContainer: '#content',
                    columns: [
                        {
                            content: 'Content 1',
                            width: "30%",
                            attribute: "content1"
                        },
                        {
                            content: 'Content 2',
                            width: "30%",
                            attribute: "content2"
                        },
                        {
                            content: 'Content 3',
                            width: "30%",
                            attribute: "content3"
                        }
                    ],
                    excludeFields: [''],
                    columnOptionsInstanceName: '',
                    el: '#datagrid'
                }
            }
        ]).then(function() {
        app.logger.log('Aura started...');

        _.delay(function() {
            fakeServer.respond();
        }, 500);

        app.sandbox.on('husky.datagrid.item.select', function(item) {
            app.logger.log('Husky.Ui.DataGrid item select: ' + item);
        });

        app.sandbox.on('husky.datagrid.item.deselect', function(item) {
            app.logger.log('Husky.Ui.DataGrid item deselect: ' + item);
        });

        app.sandbox.on('husky.datagrid.item.click', function(item) {
            app.logger.log('Husky.Ui.DataGrid item click: ' + item);
        });

    });
});

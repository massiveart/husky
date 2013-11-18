require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

        fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true",' +
                '"next":"/admin/api/contacts?flat=true&page=2&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true",' +
                '"sortable": {' +
                    '"content1" : {' +
                    '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
                    '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc"' +
                    '},' +
                    '"content2" : {' +
                    '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                    '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc"' +
                    '}' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "A Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "B Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"_total":56'+
        '}'
    ]);

    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true",' +
                '"next":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true",' +
                '"sortable": {' +
                    '"content1" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc"' +
                    '},' +
                    '"content2" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc"' +
                    '}' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "D Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "C Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "B Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "A Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"_total":56'+
        '}'
    ]);


    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true",' +
                '"next":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true",' +
                '"sortable": {' +
                    '"content1" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc"' +
                    '},' +
                    '"content2" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc"' +
                    '}' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"_total":56'+
            '}'
    ]);

    fakeServer.respondWith('GET', '/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true",' +
                '"next":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true",' +
                '"sortable": {' +
                    '"content1" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc"' +
                    '},' +
                    '"content2" : {' +
                        '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                        '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc"' +
                    '}' +
                '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"_total":56'+
            '}'
    ]);


    fakeServer.respondWith('GET', '/contacts?flat=true&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{' +
            '"_links":' +
            '{' +
                '"self":"/admin/api/contacts?flat=true",' +
                '"next":"/admin/api/contacts?flat=true&page=3&pageSize=4",' +
                '"prev":"/admin/api/contacts?flat=true",' +
                '"sortable": {' +
                        '"content1" : {' +
                            '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=asc",' +
                            '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content1&sortOrder=desc"' +
                        '},' +
                        '"content2" : {' +
                            '"asc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=asc",' +
                            '"desc": "/admin/api/contacts?flat=true&pageSize=4&sortBy=content2&sortOrder=desc"' +
                        '}' +
                    '}'+
            '},' +
            '"_embedded":'+
            '['+
                '{ "id": "1", "content1": "B Hallo 1.1", "content2": "C Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "2", "content1": "A Hallo 1.1", "content2": "B Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "3", "content1": "C Hallo 1.1", "content2": "D Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
                '{ "id": "4", "content1": "D Hallo 1.1", "content2": "A Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }'+
            '],'+
            '"_total":56'+
        '}'
    ]);


    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;

    app.start([
            {
                name: 'datagrid@husky', options: {
                url: '/contacts?flat=true',
                selectItem: {
                    type: 'checkbox'
                },
                className: "myClass",
                removeRow: true,
                pagination: true,
                tableHead: [
                    {content: 'Content 1', width: "30%", attribute: "content1"},
                    {content: 'Content 2', width: "30%", attribute: "content2"},
                    {content: 'Content 3', width: "30%", attribute: "content3"},
                    {content: ''}
                ],
                sortable: true,
                excludeFields: ['id'],
                el: '#datagrid'
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

            $('#get-selected').on('click', function () {
                app.sandbox.emit('husky.datagrid.items.get-selected');
            });

            app.sandbox.on('husky.datagrid.items.selected', function (event) {
                app.logger.log('Husky.Ui.DataGrid items selected ' + event);
            });

            $('#update').on('click', function () {
                app.sandbox.emit('husky.datagrid.update');
            });

        });
});

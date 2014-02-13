require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function (Husky) {
    'use strict';


    var fakeServer,
        app,
        _;

    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/contacts?pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "Hallo 1.1", "content2": "Hallo 1.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "Hallo 2.1", "content2": "Hallo 2.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "Hallo 3.1", "content2": "Hallo 3.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "Hallo 4.1", "content2": "Hallo 4.2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?pageSize=4&page=2', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "Hallo 2", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "Hallo 2", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "Hallo 2", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "Hallo 2", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?pageSize=4&page=3', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "Hallo 3", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "Hallo 3", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "Hallo 3", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "Hallo 3", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?pageSize=4&page=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "Hallo 4", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "Hallo 4", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "Hallo 4", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "Hallo 4", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=asc&sortBy=content1&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "A Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "B Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "C Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=desc&sortBy=content1&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "D Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "C Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "B Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "A Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=asc&sortBy=content2&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "D Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "C Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "B Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "A Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=desc&sortBy=content2&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "A Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "C Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "B Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=asc&sortBy=content3&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "D Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "C Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "B Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "A Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?sortOrder=desc&sortBy=content3&pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [' +
            '{"id": "1", "content1": "A Hallo 1", "content2": "D Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "2", "content1": "C Hallo 1", "content2": "C Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "3", "content1": "B Hallo 1", "content2": "B Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, ' +
            '{ "id": "4", "content1": "D Hallo 1", "content2": "A Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);


    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;


    app.start([
            {
                name: 'datagrid@husky', options: {
                url: '/contacts',
                selectItem: {
                    type: 'checkbox'
                    //clickable: false,

                },
                pagination: true,
                className: "myClass",
                paginationOptions: {
                    pageSize: 4,
                    showPages: 6
                },
                removeRow: true,
                autoRemoveHandling: true,
                tableHead: [
                    {content: 'Content 2', width: "30%", attribute: "content2"},
                    {content: 'Content 3', width: "30%", attribute: "content3"},
                    {content: 'Content 1', width: "30%", attribute: "content1"},
                    {content: ''}
                ],
                sortable: true,
                excludeFields: ['id'],
                searchInstanceName: 'test',
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

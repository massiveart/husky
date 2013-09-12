require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';


    var fakeServer;
    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/contacts?pageSize=4', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [{"id": "1", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "2", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "3", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "4", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?pageSize=4&page=2', [200, { 'Content-Type': 'application/json' },
        '{"total": 56, "items": [{"id": "1", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "2", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "3", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }, { "id": "4", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://placehold.it/24x24", "alt": "lorempixel" } }] }'
    ]);
    



    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start([
        { 
            name: 'datagrid@husky', options: 
            { 
                url: '/contacts',
                selectItemType: 'checkbox',
                pagination: false,
                className: "myClass",
                paginationOptions: {
                    pageSize: 4,
                    showPages: 6
                },
                removeRow: true,
                autoRemoveHandling: false,
                tableHead: [
                    {content: 'Content 1'},
                    {content: 'Content 2'},
                    {content: 'Content 3'},
                    {content: ''}
                ],
                excludeFields: ['id'],
                el: '#content'
            }
        }
    ]).then(function() {
        app.logger.log('Aura started...');

        _.delay(function() {
                fakeServer.respond();
            }, 500);

    });

});

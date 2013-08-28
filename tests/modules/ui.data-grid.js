Husky.DEBUG = true;

describe('Husky.Ui.DataGrid', function() {
    var $dataGridContainer, fakeServer;

    beforeEach(function() {
        $dataGridContainer = $('<div id="js-data-grid"/>');
        $('body').append($dataGridContainer);

        fakeServer = sinon.fakeServer.create();

        fakeServer.respondWith('GET', '/contacts?pageSize=4', [200, { 'Content-Type': 'application/json' },
            '{"pageSize": 4, "page": 1, "total": 56, "head": [ { "content": "Radio", "width": "100" }, { "content": "Head 1", "width": "100" }, { "content": "Head 2" }, { "content": "", "width": "100" }, { "content": "Remove" }], "items": [{"id": "1", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "2", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "3", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "4", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }] }'
        ]);

        fakeServer.respondWith('GET', '/contacts?pageSize=4&page=2', [200, { 'Content-Type': 'application/json' },
            '{"pageSize": 4, "page": 1, "total": 56, "head": [ { "content": "Radio", "width": "100" }, { "content": "Head 1", "width": "100" }, { "content": "Head 2" }, { "content": "", "width": "100" }, { "content": "Remove" }], "items": [{"id": "1", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "2", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "3", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }, { "id": "4", "content1": "Hallo 1", "content2": "Hallo 2", "content3": { "thumb": "http://lorempixel.com/24/24/", "alt": "lorempixel" } }] }'
        ]);

    });

    afterEach(function() {
        fakeServer.restore();
    });

    it('Create instance', function() {

        try {
            var $dataGrid = $('#js-data-grid').huskyDataGrid({
                url: '/contacts',
                selectItemType: 'checkbox',
                pagination: true,
                paginationOptions: {
                    pageSize: 4,
                    showPages: 6
                }
            });

            fakeServer.respond();

        } catch (e) {
            // TODO fail('DataGrid instantiation');
        }

        expect(typeof $dataGrid.data('Husky.Ui.DataGrid')).toEqual('object')
        expect($dataGrid.data('Husky.Ui.DataGrid').data.total).toEqual(56);
    });
});
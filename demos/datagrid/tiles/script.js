require.config({
    baseUrl: '../../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = new Husky({debug: {enable: true}});

    app.start([{
        name: 'datagrid@husky',
        options: {
            el: '#datagrid',
            url: 'http://husky.lo:7878/admin/api/datagrid/tiles',
            view: 'tiles',
            viewOptions: {
                tiles: {
                    translations: {
                        items: 'items',
                        addNew: 'Add folder'
                    }
                }
            },
            pagination: false,
            actionCallback: function(id, record) {
                app.logger.log('Tile with the id ' + id + ' was clicked', record);
            },
            matchings: [
                {
                    name: 'id'
                },
                {
                    name: 'title'
                },
                {
                    name: 'elementsCount',
                    type: 'count'
                }
            ]
        }
    }]);
});

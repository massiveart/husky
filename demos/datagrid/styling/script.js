require.config({
    baseUrl: '../../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var app = new Husky({debug: {enable: true}}),
        matchings = [
            {
                name: 'id',
                translation: 'id',
                disabled: true
            },
            {
                name: 'status',
                translation: 'status'
            },
            {
                name: 'task',
                translation: 'name',
                sortable: true
            },
            {
                name: 'schedule',
                translation: 'schedule',
                type: 'date',
                sortable: true
            },
            {
                name: 'created',
                translation: 'created'
            },
            {
                name: 'creator',
                translation: 'creator',
            }
        ],
        contentFilter = {
            status: function(content, argument, recordId) {
                var iconString = 'fa-question';
                switch(content) {
                    case 0:
                        iconString = 'fa-check-circle';
                        break;
                    case 1:
                        iconString = 'fa-exclamation-triangle';
                        break;
                    case 2:
                        iconString = 'fa-ban';
                        break;
                }
                return '<span class="' + iconString + ' task-state"/>';
            }
        };

    app.start([
        {
            name: 'datagrid@husky',
            options: {
                el: '#datagrid-default',
                url: 'http://husky.lo:7878/admin/api/datagrid/tasks',
                viewOptions: {
                    table: {
                        selectItem: false
                    }
                },
                pagination: false,
                matchings: matchings
            }
        },
        {
            name: 'datagrid@husky',
            options: {
                el: '#datagrid-light',
                url: 'http://husky.lo:7878/admin/api/datagrid/tasks',
                contentFilters: contentFilter,
                viewOptions: {
                    table: {
                        selectItem: false,
                        cssClass: 'light'
                    }
                },
                pagination: false,
                matchings: matchings
            }
        },
    ]);
});

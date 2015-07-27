require.config({
    baseUrl: '../../'
});

var App;

require(['lib/husky'], function(Husky) {
    'use strict';


    var app,
        view, pagination,
        _;

    app = new Husky({ debug: { enable: true }});
    _ = app.sandbox.util._;

    app.start([
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid?pageSize=4&sortBy=content1&sortOrder=desc',
                    preselected: ["1", "2"],
                    paginationOptions: {
                        dropdown: {
                            limit: 4
                        }
                    },
                    viewOptions: {
                        table: {
                            badges: [
                                {
                                    column: 'content1',
                                    icon: 'check'
                                },
                                {
                                    column: 'date',
                                    title: 'de'
                                }
                            ],
                            selectItem: {
                                type: 'checkbox'
                            },
                            className: "myClass",
                            removeItem: true,
                            editable: true,
                            validation: true,
                            addRowTop: true,
                            showHead: true, // false to hide table-head
                            fullWidth: true, // uncomment for full-width mode
                            contentContainer: '#content',
                            highlightSelected: true,
                            croppedMaxLength: 5
                        },
                        thumbnail: {}
                    },
                    sortable: true,
                    searchInstanceName: 'test',
                    searchFields: ['fullName'],
                    columnOptionsInstanceName: '',
                    el: '#datagrid',
                    matchings: 'http://husky.lo:7878/admin/api/datagrid/fields',
                    selectedCounter: true,
                    selectedCounterText: 'selected elements',
                    clickCallback: function(item, data) {
                        app.logger.log('Husky.Ui.DataGrid item click: ' + item, data);
                    },
                    actionCallback: function(item, data) {
                        app.logger.log('Husky.Ui.DataGrid item action: ' + item, data);
                    }
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid',
                    paginationOptions: {
                        dropdown: {
                            limit: 4
                        }
                    },
                    view: 'thumbnail',
                    viewOptions: {
                        thumbnail: {
                            large: true
                        }
                    },
                    sortable: true,
                    searchInstanceName: 'test',
                    columnOptionsInstanceName: '',
                    el: '#datagrid2',
                    instanceName: 'grid2',
                    selectedCounter: true,
                    selectedCounterText: 'selected elements',
                    matchings: [
                        {
                            content: 'Content 1',
                            width: "25%",
                            name: "content1",
                            editable: true,
                            sortable: true,
                            type: 'title',
                            validation: {
                                required: true
                            }
                        },
                        {
                            content: 'Content 2',
                            width: "25%",
                            name: "content2",
                            editable: false,
                            sortable: true,
                            type: 'bytes',
                            validation: {
                                required: true
                            }
                        },
                        {
                            content: 'Content 3',
                            width: "25%",
                            name: "content3",
                            type: 'thumbnails'
                        },
                        {
                            content: 'Date',
                            width: "25%",
                            sortable: true,
                            name: 'date',
                            type: 'date'
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/children?depth=0',
                    el: '#children-datagrid',
                    instanceName: 'children-grid',
                    sortable: true,
                    pagination: false,
                    childrenPropertyName: 'children',
                    resultKey: 'categories',
                    viewOptions: {
                        table: {
                            icons: [
                                {
                                    icon: 'pencil',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on edit for ' + id);
                                    }
                                },
                                {
                                    icon: 'plus-circle',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on add for ' + id);
                                    }
                                }
                            ],
                            selectItem: {
                                type: 'checkbox',
                                inFirstCell: true
                            }
                        }
                    },
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/children?depth=0',
                    el: '#children-datagrid-only-leaves',
                    instanceName: 'children-grid-only-leaves',
                    sortable: true,
                    pagination: false,
                    childrenPropertyName: 'children',
                    onlySelectLeaves: true,
                    resultKey: 'categories',
                    viewOptions: {
                        table: {
                            icons: [
                                {
                                    icon: 'pencil',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on edit for ' + id);
                                    }
                                },
                                {
                                    icon: 'plus-circle',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on add for ' + id);
                                    }
                                }
                            ],
                            selectItem: {
                                type: 'checkbox',
                                inFirstCell: true
                            }
                        }
                    },
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/children/all',
                    el: '#children-datagrid-beginning',
                    instanceName: 'children-grid-beginning',
                    sortable: true,
                    pagination: false,
                    childrenPropertyName: 'children',
                    resultKey: 'categories',
                    viewOptions: {
                        table: {
                            openChildId: 12,
                            hideChildrenAtBeginning: true,
                            icons: [
                                {
                                    icon: 'pencil',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on edit for ' + id);
                                    }
                                },
                                {
                                    icon: 'plus-circle',
                                    column: 'name',
                                    align: 'left',
                                    callback: function(id) {
                                        console.log('You clicked on add for ' + id);
                                    }
                                }
                            ],
                            selectItem: {
                                type: 'checkbox',
                                inFirstCell: true
                            }
                        }
                    },
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/children/all',
                    el: '#assignment-datagrid',
                    instanceName: 'assignment-datagrid',
                    pagination: false,
                    childrenPropertyName: 'children',
                    resultKey: 'categories',
                    preselected: [7,10],
                    viewOptions: {
                        table: {
                            openPathToSelectedChildren: true,
                            showHead: false,
                            selectItem: {
                                type: 'checkbox',
                                inFirstCell: true
                            }
                        }
                    },
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/empty',
                    el: '#empty-datagrid',
                    instanceName: 'empty-datagrid',
                    pagination: false,
                    resultKey: 'items',
                    viewOptions: {
                        table: {
                            showHead: false,
                            selectItem: {
                                type: 'checkbox',
                                inFirstCell: true
                            }
                        }
                    },
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'datagrid@husky',
                options: {
                    url: 'http://husky.lo:7878/admin/api/datagrid/empty',
                    el: '#empty-datagrid2',
                    instanceName: 'empty-datagrid2',
                    pagination: false,
                    resultKey: 'items',
                    matchings: [
                        {
                            name: 'name',
                            sortable: true,
                            content: 'Name'
                        },
                        {
                            name: 'id',
                            disabled: true
                        },
                        {
                            name: 'children',
                            disabled: true
                        },
                        {
                            name: 'parent',
                            disabled: true
                        }
                    ]
                }
            },
            {
                name: 'toolbar@husky',
                options: {
                    el: '#toolbar',
                    instanceName: 'test',
                    hasSearch: true,
                    groups: [
                        {
                            id: '1',
                            align: 'left'
                        },
                        {
                            id: '0',
                            align: 'left'
                        }
                    ],
                    buttons: [
                        {
                            id: 'add',
                            icon: 'plus-circle',
                            class: 'highlight',
                            group: '0',
                            position: 3,
                            callback: function() {
                                app.sandbox.emit('husky.datagrid.record.add', { id: "", content1: "", content2: "", content3: "" });
                            }.bind(this)
                        },
                        {
                            id: 'delete',
                            icon: 'trash-o',
                            group: '1',
                            position: 2,
                            callback: function() {
                                app.sandbox.emit('sulu.list-toolbar.delete');
                            }.bind(this)
                        },
                        {
                            id: 'settings',
                            icon: 'gear',
                            group: '1',
                            position: 1,
                            dropdownItems: [
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
        ]).then(function() {
            App = app;
            app.logger.log('Aura started...');

            $('#add-row').on('click', function() {
                app.sandbox.emit('husky.datagrid.record.add', { id: "", content1: "", content2: "", content3: "" });
            });

            $('#change-records').on('click', function() {
                app.sandbox.emit('husky.datagrid.records.change', [
                    { id: "1", content1: "changed content", content2: 1239490},
                    { id: "2", content1: "also changed", content2: 4456767865456}
                ]);
            });

            $('#add-records').on('click', function() {
                app.sandbox.emit('husky.datagrid.records.add', [
                    {id: 5000, content1: 'Added record 1', content2: 'something new', content3: {alt: "lorempixel", thumb: "http://placehold.it/170x170"}},
                    {id: 5001, content1: 'Added record 2', content2: 'something new', content3: {alt: "lorempixel", thumb: "http://placehold.it/170x170"}, selected: true},
                    {id: 5002, content1: 'Added record 3', content2: 'something new', content3: {alt: "lorempixel", thumb: "http://placehold.it/170x170"}, selected: true},
                    {id: 5003, content1: 'Added record 4', content2: 'something new', content3: {alt: "lorempixel", thumb: "http://placehold.it/170x170"}}
                ]);
            });

        $('#new-group').on('click', function () {
            app.sandbox.emit('husky.datagrid.grid-thumbnails.record.add', {
                id: 13,
                title: 'A brand new collection',
                mediaNumber: 0,
                thumbnails: [
                    {url: 'http://lorempixel.com/150/100/sports/x', title: 'Media title'},
                    {url: 'http://lorempixel.com/150/100/sports/y', title: 'Media title'},
                    {url: 'http://lorempixel.com/150/100/sports/z', title: 'Media title'}
                ]
            });
        });

        $('#get-from-data').on('click', function () {
            console.log('This ids were in the dom:', $('#assignment-datagrid').data('selected'));
        });

        $('#open-category').on('click', function () {
            app.sandbox.emit('husky.datagrid.children-grid-beginning.table.open-parents', 113);
        });

        $('#update-url').on('click', function() {
                app.sandbox.emit('husky.datagrid.url.update', { search: null, content1: "fdsa" });
            });

            app.sandbox.on('husky.datagrid.row.removed', function(item) {
                app.logger.log('remove: ' + item);
            });

            app.sandbox.on('husky.datagrid.row.remove-click', function(event, item) {
                app.logger.log('remove-clicked: ' + item);

                window.alert('DELETE AFTER OK');

                if (typeof item === 'number') {
                    app.sandbox.emit('husky.datagrid.row.remove', item);
                } else {
                    app.sandbox.emit('husky.datagrid.row.remove', event);
                }
            });

            app.sandbox.on('husky.datagrid.item.select', function(item) {
                app.logger.log('Husky.Ui.DataGrid item select: ' + item);
            });

            app.sandbox.on('husky.datagrid.item.deselect', function(item) {
                app.logger.log('Husky.Ui.DataGrid item deselect: ' + item);
            });


            $('#get-selected').on('click', function () {
                app.sandbox.emit('husky.datagrid.items.get-selected', function(selected) {
                    console.log(selected);
                });
            });

            app.sandbox.on('husky.datagrid.items.selected', function(event) {
                app.logger.log('Husky.Ui.DataGrid items selected ' + event);
            });

            $('#update').on('click', function() {
                app.sandbox.emit('husky.datagrid.update');
            });

            $('#save').on('click', function() {
                app.sandbox.emit('husky.datagrid.data.save');
            });

            view = 'thumbnail';
            $('#change-view').on('click', function() {
               var large = (Math.random() < 0.5) ? true : false;
               app.sandbox.emit('husky.datagrid.view.change', view, {large: large});
               view = (view === 'thumbnail') ? 'table' : 'thumbnail';
            });

            pagination = 'showall';
            $('#change-pagination').on('click', function() {
                app.sandbox.emit('husky.datagrid.pagination.change', pagination);
                pagination = (pagination === 'dropdown') ? 'showall' : 'dropdown';
            });

            app.sandbox.dom.on('#change-columns','click', function () {
                app.sandbox.emit('husky.column-options.saved',
                    [
                        {
                            id: 'content1',
                            translation: 'Content 1',
                            disabled: false,
                            editable: true,
                            validation: {
                                unique: true,
                                required: true
                            }
                        },
                        {"id":"content2","translation":"Content 2","disabled":false},
                        {"id":"content3","translation":"Content 3","disabled":false,"width":"100px"},
                        {"id":"content4","translation":"Content 4","disabled":false,"width":"500px"}
                    ]
                );
            });

        });
});

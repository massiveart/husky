require.config({
    baseUrl: '../../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var data = new Array();
    data[0] = { id: 2, translations: [], locale: 'English', code: 'code 1'};
    data[1] = { id: 4, translations: [], locale: 'Deutsch', code: 'code 2'};


    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start([
        { 
            name: 'datagrid@husky', options: 
            { 
                el: '#datagrid',
                pagination: false,
                autoRemoveHandling: false,
                tableHead: [
                    {content: 'Content 2', width: "60%"},
                    {content: 'Code', width: "20%"},
                    {content: 'Remove', width: "10%"}
                ],
                excludeFields: ['id', 'translations'],
                data: {
                    items: data,
                },
                template: {
                    row: ['<tr <% if (!!id) { %> data-id="<%= id %>"<% } %> >',
                                '<td>',
                                    '<label>',
                                        '<input type="radio" class="custom-radio" name="catalogue-radio">',
                                        '<span class="custom-radio-icon"></span>',
                                    '</label>',
                                '</td>',
                                '<td>',
                                    '<input class="form-element" type="text" id="locale<%= id %>" value="<%= locale %>"/>',
                                '</td>',
                                '<td>',
                                    '<input class="form-element" type="text" id="code<%= id %>" value="<%= code %>"/>',
                                '</td>',
                                '<td class="remove-row">',
                                    '<span class="icon-remove"></span>',
                                '</td>',
                            '</tr>'].join(''),
                }
            }
        }
    ]).then(function() {
        app.logger.log('Aura started...');

        $('#add-row').on('click', function() {
            app.sandbox.emit('husky.datagrid.row.add', { id: "", locale: "" , translations: [], code: "" });
        });

        // app.sandbox.on('husky.datagrid.row.removed', function(item) {
        //     console.log('remove: ' + item);
        // });

        app.sandbox.on('husky.datagrid.row.remove-click', function(event, item) {
            console.log('remove-clicked: ' + item);
            console.log(item);
            alert('DELETE AFTER OK');
            
            if(typeof item == 'number' ) {
                app.sandbox.emit('husky.datagrid.row.remove', item);
            } else {
                app.sandbox.emit('husky.datagrid.row.remove', event);
            }
        });

        app.sandbox.on('husky.datagrid.item.select', function(item) {
            console.log('Husky.Ui.DataGrid item select: ' + item);
        });

        app.sandbox.on('husky.datagrid.item.deselect', function(item) {
            console.log('Husky.Ui.DataGrid item deselect: ' + item);
        });

        app.sandbox.on('husky.datagrid.item.click', function(item) {
            console.log('Husky.Ui.DataGrid item click: ' + item);
        });

    });
});

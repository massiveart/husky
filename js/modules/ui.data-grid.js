(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.DataGrid';

    Husky.Ui.DataGrid = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;

        this.$element = $(element);
        this.$dataGrid = null;
        this.selectedItemIds = [];

        // sample column mapping
        this.options.columnMapping = {
            tile: { display: 'Title', width: '20%', sortable: true },
            date: { display: 'Last edit date', width: '20%', sortable: false }
        }

        this.data = null;

        if (!!this.options.url) {
            this.loadData();
        }
    };

    $.extend(Husky.Ui.DataGrid.prototype, Husky.Events, {

        loadData: function(url) {
            Husky.DEBUG && console.log(this.name, 'loadData');

            Husky.Util.ajax({
                url: url || this.options.url,
                success: function(data) {
                    this.data = data;
                    this.checkListType();
                    this.render();
                }.bind(this)
            });
        },

        checkListType: function() {
            if (this.options.elementType === 'list') {
                // TODO:
                // this.prepareList();
            } else {
                this.$dataGrid = this.prepareTable();
            }
        },

        //
        // elementType === 'table'
        //
        prepareTable: function() {
            var $table, $thead, $tbody, tblClasses;

            $table = $('<table/>');

            if (!!this.data.head || !!this.options.tableHead) {
                $thead = $('<thead/>');
                $thead.append(this.prepareTableHead());
                $table.append($thead);
            }

            if (!!this.data.rows) {
                $tbody = $('<tbody/>');
                $tbody.append(this.prepareTableRows());
                $table.append($tbody);
            }

            // set html classes
            tblClasses = [];
            tblClasses.push((!!this.options.class && this.options.class !== 'table') ? 'table ' + this.options.class : 'table');
            tblClasses.push((this.options.selectItems) ? 'is-selectable' : '');

            $table.addClass(tblClasses.join(' '));

            return $table;
        },

        prepareTableHead: function() {
            var tblColumns, tblColumnClass, tblColumnWidth, headData;

            tblColumns = [];
            headData = headData = this.options.tableHead || this.data.head;

            // add a checkbox to each row
            this.options.selectItems && tblColumns.push('<th>' + this.templates.checkbox() + ' All</th>');

            headData.forEach(function(column) {
                tblColumnClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                tblColumnWidth = ((!!column.width) ? ' width="' + column.width + 'px"' : '');

                tblColumns.push('<th' + tblColumnClass + tblColumnWidth + '>' + column.content + '</th>');
            });

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        prepareTableRows: function() {
            var tblRows, tblColumns, tblColumnClass, tblRowId;

            tblRows = [];
            tblColumns = [];

            this.data.rows.forEach(function(row) {
                tblColumns = [];
                tblRowId = ((!!row.id) ? ' data-id="' + row.id + '"' : ''),

                // add a checkbox to each row
                this.options.selectItems && tblColumns.push('<td>' + this.templates.checkbox() + '</td>');

                row.columns.forEach(function(column) {
                    tblColumnClass = ((!!column.class) ? ' class="' + tblColumnClass + '"' : '');

                    tblColumns.push('<td ' + tblColumnClass + '>' + column.content + '</td>');
                }.bind(this));

                tblRows.push('<tr ' + tblRowId + '>' + tblColumns.join('') + '</tr>');
            }.bind(this));

            return tblRows.join('');
        },

        selectItem: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectItem');

            var $element, itemId;

            $element = $(event.currentTarget);
            itemId = $element.data('id');

            if (this.options.selectItems) {
                
            }

            console.log(this.selectedItemIds);

            if (this.selectItems.indexOf(itemId) > -1) {
                $element
                    .removeClass('is-selected')
                    .find('td:first-child input[type="checkbox"]')
                    .attr('checked', false);

                this.selectedItemIds.splice(this.selectedItemIds.indexOf(itemId), 1);
                this.trigger('data-grid:item:deselect');
            } else {
                $element
                    .addClass('is-selected')
                    .find('td:first-child input[type="checkbox"]')
                    .attr('checked', true);

                this.selectedItemIds.push(itemId);
                this.trigger('data-grid:item:select');
            }
        },

        bindDOMEvents: function() {
            if (this.options.selectItems) {
                this.$element.on('click', 'tr', this.selectItem.bind(this));
            }
        },

        render: function() {
            this.$element.html(this.$dataGrid);
            this.bindDOMEvents();
        },

        templates: {
            checkbox: function(data) {
                var id, name;

                data = data || {};
                id = (!!data['id']) ? ' id="' + data['id'] + '"' : '';
                name = (!!data['name']) ? ' name="' + data['name'] + '"' : '';

                return [
                    '<span class="custom-checkbox">',
                        '<input' + id + name + ' type="checkbox"/>',
                    '</span>'
                ].join('')
            }
        }
    });

    $.fn.huskyDataGrid = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyDataGrid.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.DataGrid(this, options));

        return this;
    };

    $.fn.huskyDataGrid.defaults = {
        listType: 'table',
        pageSize: 10,
        pagination: true,
        selectItems: false
    };

})(Husky.$, this, this.document);
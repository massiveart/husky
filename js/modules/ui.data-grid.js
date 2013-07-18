(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.DataGrid';

    Husky.Ui.DataGrid = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;

        this.configs = {};

        this.$element = $(element);
        this.$dataGrid = $('<div/>', {
            class: 'inline-block'
        });

        this.allItemIds = [];
        this.selectedItemIds = [];

        // sample column mapping
        this.options.columnMapping = {
            tile: { display: 'Title', width: '20%', sortable: true },
            date: { display: 'Last edit date', width: '20%', sortable: false }
        }

        this.data = null;
        this.options.pagination = this.options.pagination || !!this.options.url;

        if (!!this.options.url) {
            this.load({
                url: this.options.url,
                success: function(response) {
                    this.data = response;
                    this.setConfigs();
                    this.checkElementType();
                    this.appendPagination();
                    this.render();
                }.bind(this)
            });
        }
    };

    $.extend(Husky.Ui.DataGrid.prototype, Husky.Events, {

        load: function(params) {
            Husky.DEBUG && console.log(this.name, 'load');

            Husky.Util.ajax({
                url: params.url,
                data: params.data,
                success: function(response) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    if (typeof params.success === 'function') {
                        params.success(response);
                    }
                }.bind(this)
            });
        },

        update: function(params) {
            Husky.DEBUG && console.log(this.name, 'update');

            Husky.Util.ajax({
                url: params.url,
                data: params.data,
                success: function(response) {
                    Husky.DEBUG && console.log(this.name, 'update', 'success');

                    this.data = response;
                    this.setConfigs();

                    this.checkElementType();
                    this.appendPagination();
                    this.render();

                    if (typeof params.success === 'function') {
                        params.success(response);
                    }
                }.bind(this)
            });
        },

        setConfigs: function() {
            this.configs = {};
            this.configs.pagesLength = this.data.pagesLength;
            this.configs.pagesSize = this.data.pagesSize;
            this.configs.page = this.data.page;
        },

        checkElementType: function() {
            this.$dataGrid.empty();

            if (this.options.elementType === 'list') {
                // TODO:
                // return this.$dataGrid = this.prepareList();
            } else {
                return this.$dataGrid.append(this.prepareTable());
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
            this.options.selectItems && 
            tblColumns.push('<th class="select-all">',
                                this.templates.checkbox({ id: 'select-all' }),
                                ' All',
                            '</th>');

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
            this.allItemIds = [];

            this.data.rows.forEach(function(row) {
                tblColumns = [];
                tblRowId = ((!!row.id) ? ' data-id="' + row.id + '"' : '');

                // add row id to itemIds collection (~~ === shorthand for parse int)
                !!row.id && this.allItemIds.push(~~row.id);

                // add a checkbox to each row
                this.options.selectItems && tblColumns.push('<td>', this.templates.checkbox(), '</td>');

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

            if (this.selectedItemIds.indexOf(itemId) > -1) {
                $element
                    .removeClass('is-selected')
                    .find('td:first-child input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds.splice(this.selectedItemIds.indexOf(itemId), 1);
                this.trigger('data-grid:item:deselect', itemId);
            } else {
                $element
                    .addClass('is-selected')
                    .find('td:first-child input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds.push(itemId);
                this.trigger('data-grid:item:select', itemId);
            }
        },

        selectAllItems: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectAllItems');

            var $element = $(event.currentTarget).find('input[type="checkbox"]');

            event.stopPropagation();

            if (this.selectedItemIds === this.allItemIds) {

                this.$dataGrid
                    .find('input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds = [];
                this.trigger('data-grid:all:deselect', null);

            } else {
                this.$dataGrid
                    .find('input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds = this.allItemIds;
                this.trigger('data-grid:all:select', this.selectedItemIds);
            }
        },

        //
        // Pagination
        //
        appendPagination: function() {
            if (this.options.pagination) {
                return this.$dataGrid.append(this.preparePagination());
            }
        },

        preparePagination: function() {
            var $pagination;

            if (!!this.configs.pagesLength && ~~this.configs.pagesLength >= 1) {
                $pagination = $('<div/>');
                $pagination.addClass('pagination');

                $pagination.append(this.preparePaginationPrevNavigation());
                $pagination.append(this.preparePaginationPageNavigation());
                $pagination.append(this.preparePaginationNextNavigation());
            }

            return $pagination;
        },

        preparePaginationPageNavigation: function() {
            return this.templates.paginationPageNavigation({
                pageSize: this.options.pageSize,
                selectedPage: this.configs.page
            });
        },

        preparePaginationNextNavigation: function() {
            console.log(this.configs.page);
            return this.templates.paginationNextNavigation({
                next: this.options.pagination.next,
                selectedPage: this.configs.page,
                pageSize: this.configs.pagesLength
            });
        },

        preparePaginationPrevNavigation: function() {
            return this.templates.paginationPrevNavigation({
                prev: this.options.pagination.prev,
                selectedPage: this.configs.page
            });
        },

        changePage: function(event) {
            Husky.DEBUG && console.log(this.name, 'changePage');

            var $element, page;

            $element = $(event.currentTarget);
            page = $element.data('page');

            this.addLoader();

            this.update({
                url: this.options.url + '/' + page,
                success: function() {
                    this.removeLoader();
                }.bind(this)
            });

            this.trigger('data-grid:page:changed', page);
        },

        changePageSize: function() {
            // TODO
        },

        bindDOMEvents: function() {
            this.$element.off();

            if (this.options.selectItems) {
                this.$element.on('click', 'tbody > tr', this.selectItem.bind(this));
                this.$element.on('click', 'th.select-all', this.selectAllItems.bind(this));
            }

            if (this.options.pagination) {
                this.$element.on('click', '.pagination li.page', this.changePage.bind(this));
            }
        },

        render: function() {
            this.$element.html(this.$dataGrid);
            this.bindDOMEvents();
        },

        addLoader: function() {
            return this.$dataGrid
                        .outerWidth(this.$dataGrid.outerWidth())
                        .outerHeight(this.$dataGrid.outerHeight())
                        .empty()
                        .addClass('is-loading');
        },

        removeLoader: function() {
            return this.$dataGrid.removeClass('is-loading');
        },

        templates: {
            checkbox: function(data) {
                var id, name;

                data = data || {};
                id = (!!data['id']) ? ' id="' + data['id'] + '"' : '';
                name = (!!data['name']) ? ' name="' + data['name'] + '"' : '';

                return [
                    '<span class="custom-checkbox">',
                        '<input', id, name,' type="checkbox"/>',
                    '</span>'
                ].join('')
            },

            // Pagination
            paginationPrevNavigation: function(data) {
                var prev, first, selectedPage;

                data = data || {};
                prev = data['prev'] || 'Previous';
                first = data['first'] || 'First';
                selectedPage = ~~data['selectedPage'];

                return [
                    '<ul>',
                        '<li class="pagination-first page" data-page="1">', first, '</li>',
                        '<li class="pagination-prev page" data-page="', selectedPage - 1, '">', prev, '</li>',
                    '</ul>'
                ].join('')
            },

            paginationNextNavigation: function(data) {
                var next, last, pageSize, selectedPage;

                data = data || {};
                next = data['next'] || 'Next';
                last = data['last'] || 'Last';
                pageSize = data['pageSize'];
                selectedPage = ~~data['selectedPage'];

                return [
                    '<ul>',
                        '<li class="pagination-next page" data-page="', selectedPage + 1, '">', next, '</li>',
                        '<li class="pagination-last page" data-page="', pageSize, '">', last, '</li>',
                    '</ul>'
                ].join('')
            },

            paginationPageNavigation: function(data) {
                var pageSize, i, pageItems, selectedPage, pageClass;

                data = data || {};
                pageSize = ~~data['pageSize'],
                selectedPage = ~~data['selectedPage'],

                pageItems = [];

                for (i = 1; i <= pageSize; i++) {
                    pageClass = (selectedPage === i) ? 'class="page is-selected"' : 'class="page"';
                    pageItems.push('<li ', pageClass, ' data-page="', i, '">', i ,'</li>');
                }

                pageItems.push('<li class="is-disabled">...</li>');

                return '<ul>' + pageItems.join('') + '</ul>';
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
        pagination: true,
        paginationOptions: {
            pageSize: 10,
            showPages: 5
        },
        selectItems: false
    };

})(Husky.$, this, this.document);
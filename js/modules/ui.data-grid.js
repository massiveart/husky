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

        this.data = null;
        this.options.pagination = this.options.pagination || !!this.options.url;

        if (!!this.options.url) {
            this.load({
                url: this.options.url
            });
        }
    };

    $.extend(Husky.Ui.DataGrid.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        getUrl: function(params) {
            var url = params.url + '?pageSize=' + this.options.pageSize

            if (params.page > 1) {
                url += '&page=' + params.page;
            }
            return url;
        },

        load: function(params) {
            Husky.DEBUG && console.log(this.name, 'load');

            Husky.Util.ajax({
                url: this.getUrl(params),
                data: params.data,
                success: function(response) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    this.data = response;
                    this.setConfigs();

                    this.prepare()
                        .appendPagination()
                        .render();

                    if (typeof params.success === 'function') {
                        params.success(response);
                    }
                }.bind(this)
            });
        },

        setConfigs: function() {
            this.configs = {};
            this.configs.total = this.data.total;
            this.configs.pagesSize = this.data.pagesSize;
            this.configs.page = this.data.page;
        },

        prepare: function() {
            this.$dataGrid.empty();

            if (this.options.elementType === 'list') {
                // TODO:
                //this.$dataGrid = this.prepareList();
            } else {
                this.$dataGrid.append(this.prepareTable());
            }

            return this;
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
            var tblColumns, tblCellClass, tblColumnWidth, headData;

            tblColumns = [];
            headData = this.options.tableHead || this.data.head;

            // add a checkbox to each row
            this.options.selectItems &&
            tblColumns.push(
                '<th class="select-all">',
                    this.templates.checkbox({ id: 'select-all' }),
                '</th>');

            headData.forEach(function(column) {
                tblCellClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                tblColumnWidth = ((!!column.width) ? ' width="' + column.width + 'px"' : '');

                tblColumns.push('<th' + tblCellClass + tblColumnWidth + '>' + column.content + '</th>');
            });

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        prepareTableRows: function() {
            var tblRows, tblColumns, tblCellClass, 
                tblCellClasses, tblRowId, tblCellContent;

            tblRows = [];
            tblColumns = [];
            tblCellClasses = [];
            this.allItemIds = [];

            this.data.rows.forEach(function(row) {
                tblColumns = [];
                tblRowId = ((!!row.id) ? ' data-id="' + row.id + '"' : '');

                // add row id to itemIds collection (~~ === shorthand for parse int)
                !!row.id && this.allItemIds.push(~~row.id);

                // add a checkbox to each row
                this.options.selectItems && tblColumns.push('<td>', this.templates.checkbox(), '</td>');

                row.columns.forEach(function(column) {
                    tblCellClasses = [];
                    tblCellContent = (!!column.thumb) ? '<img alt="' + (column.alt || '') + '" src="' + column.thumb + '"/>' : column.content;
                    
                    // prepare table cell classes
                    !!column.class && tblCellClasses.push(column.class);
                    !!column.thumb && tblCellClasses.push('thumb');
                    
                    tblCellClass = (!!tblCellClasses.length) ? 'class="' + tblCellClasses.join(' ') + '"' : '';

                    tblColumns.push('<td ' + tblCellClass + ' >' + tblCellContent + '</td>');
                }.bind(this));

                tblRows.push('<tr' + tblRowId + '>' + tblColumns.join('') + '</tr>');
            }.bind(this));

            return tblRows.join('');
        },

        resetItemSelection: function() {
            this.allItemIds = [];
            this.selectedItemIds = [];
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

                // uncheck 'Select All'-checkbox
                $('th.select-all')
                    .find('input[type="checkbox"]')
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

            event.stopPropagation();

            if (Husky.Util.compare(this.selectedItemIds, this.allItemIds)) {

                this.$dataGrid
                    .find('input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds = [];
                this.trigger('data-grid:all:deselect', null);

            } else {
                this.$dataGrid
                    .find('input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds = this.allItemIds.slice(0);
                this.trigger('data-grid:all:select', this.selectedItemIds);
            }
        },

        //
        // Pagination
        // TODO: create pagination module
        //
        appendPagination: function() {
            if (this.options.pagination) {
                this.$dataGrid.append(this.preparePagination());
            }
            return this;
        },

        preparePagination: function() {
            var $pagination;

            if (!!this.configs.total && ~~this.configs.total >= 1) {
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
            return this.templates.paginationNextNavigation({
                next: this.options.pagination.next,
                selectedPage: this.configs.page,
                pageSize: this.configs.total
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

            this.load({
                url: this.options.url,
                page: page,
                success: function() {
                    this.removeLoader();
                }.bind(this)
            });

            this.trigger('data-grid:page:change', null);
            this.vent.trigger('data-grid:update', null);
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

        bindCustomEvents: function() {
            this.vent.off();

            this.vent.on('data-grid:update', this.updateHandler.bind(this));
        },

        updateHandler: function() {
            this.resetItemSelection();
        },

        render: function() {
            this.$element.html(this.$dataGrid);

            this.bindCustomEvents();
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
                    '<input', id, name, ' type="checkbox" class="custom-checkbox"/>',
                    '<span class="custom-checkbox-icon"></span>'
                ].join('')
            },

            // Pagination
            paginationPrevNavigation: function(data) {
                var prev, first, selectedPage;

                data = data || {};
                selectedPage = ~~data['selectedPage'];

                return [
                    '<ul>',
                        '<li class="pagination-first page" data-page="1"></li>',
                        '<li class="pagination-prev page" data-page="', selectedPage - 1, '">', 'Previous', '</li>',
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
                        '<li class="pagination-last page" data-page="', pageSize, '"></li>',
                    '</ul>'
                ].join('')
            },

            paginationPageNavigation: function(data) {
                var pageSize, i, pageItems, selectedPage, pageClass;

                data = data || {};
                pageSize = ~~data['pageSize'];
                selectedPage = ~~data['selectedPage'];

                pageItems = [];

                for (i = 1; i <= pageSize; i++) {
                    pageClass = (selectedPage === i) ? 'class="page is-selected"' : 'class="page"';
                    pageItems.push('<li ', pageClass, ' data-page="', i, '">', i, '</li>');
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
        elementType: 'table',
        pagination: true,
        paginationOptions: {
            pageSize: 10,
            showPages: 5
        },
        selectItems: false
    };

})(Husky.$, this, this.document);

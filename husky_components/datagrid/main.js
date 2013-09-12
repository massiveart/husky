/**
 *	Name: Datagrid
 * 
 *	Options:
 *		- autoRemoveHandling: thorws an event before a row is deleted
 *		- className: additional classname for the wrapping div 
 *		- data: array of data to display (instead of using a url)
 *		- elementType: type of datagrid (table,..) ??
 *		- excludeFields: array of field to exclude
 *		- pagination: display a pagination
 *      - pageSize: lines per page
 *      - showPages: amount of pages that will be shown
 *      - removeRow: displays in the last column an icon to remove a row
 *      - selectItemType: typ of select [checkbox, radio]
 *      - url: url to fetch content
 *
 *	Provided Events:
 *		- ??
 *		- husky.headerbar.button-type: change ButtonType [save, saveDelete, add, template]
 *
 * 	Used Events:
 *  	- ??
 *
 */

define(['jquery'], function($) {


	/*
	 *	Default values for options
	*/
	var defaults = {
		autoRemoveHandling: true,
		className: 'datagridcontainer', 
		elementType: 'table', //??
		data: null,
		excludeFields: ['id'],
		pagination: false,
        paginationOptions: {
            pageSize: 10,
            showPages: 5
        },
        removeRow: true,
        selectItemType: null,
        url: null,
	};

    return {

        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialized datagrid');
            //this.sandbox.logger.log('options', this.options)
           	//this.sandbox.logger.log('el', this.$el);

            // extend default options and set variables
            this.options = this.sandbox.util.extend({}, defaults, this.options);
            this.name = this.options.name;
	        this.data = null;
	        this.configs = {};
			this.allItemIds = [];
	        this.selectedItemIds = [];

	        // append datagrid to html element
	        this.$originalElement = $(this.options.el);
	        this.$element = $('<div class="husky-data-grid"/>');
	        this.$originalElement.append(this.$element);

	        
	        // ??
	        this.options.pagination = (this.options.pagination !== undefined) ? !!this.options.pagination : !!this.options.url;

	       	this.getData();
        },

        /*
         * Gets the data either via the url or the array
        */
        getData: function() {

        	if (!!this.options.url) {
	            
	            this.sandbox.logger.log('load data from url');
	            this.load({ url: this.options.url});

	        } else if (!!this.options.data.items) {

	        	this.sandbox.logger.log('load data from array');
				this.data = this.options.data;
			
	            this.setConfigs();

	            this.prepare()
	                .appendPagination()
	                .render();
	        }

	        this.sandbox.logger.log('data in datagrid', this.data);
        },

        load: function(params) {
        	
        	this.sandbox.logger.log('loading data');

            $.ajax({

                url: this.getUrl(params),
                data: params.data,

                success: function(response) {
                    this.sandbox.logger.log('load', params);

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

        getUrl: function(params) {
            var delimiter = '?';
            if (params.url.indexOf('?') != -1) delimiter = '&';
            var url = params.url + delimiter + 'pageSize=' + this.options.paginationOptions.pageSize;

            if (params.page > 1) {
                url += '&page=' + params.page;
            }

            console.log(url, "url");

            return url;
        },

        setConfigs: function() {
            this.configs = {};
            this.configs.total = this.data.total;
            this.configs.pageSize = this.data.pageSize;
            this.configs.page = this.data.page;
        },

        prepare: function() {
            this.$element.empty();

            if (this.options.elementType === 'list') {
                // TODO:
                //this.$element = this.prepareList();
            } else {
                this.$element.append(this.prepareTable());
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

            if (!!this.data.items) {
                $tbody = $('<tbody/>');
                $tbody.append(this.prepareTableRows());
                $table.append($tbody);
            }

            // set html classes
            tblClasses = [];
            tblClasses.push((!!this.options.className && this.options.className !== 'table') ? 'table ' + this.options.className : 'table');
            tblClasses.push((this.options.selectItemType && this.options.selectItemType === 'checkbox') ? 'is-selectable' : '');

            $table.addClass(tblClasses.join(' '));

            return $table;
        },

        prepareTableHead: function() {
            var tblColumns, tblCellClass, tblColumnWidth, headData;

            tblColumns = [];
            headData = this.options.tableHead || this.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItemType && this.options.selectItemType === 'checkbox') {
                tblColumns.push(
                    '<th class="select-all">',
                    this.templates.checkbox({ id: 'select-all' }),
                    '</th>');
            }

            headData.forEach(function(column) {
                tblCellClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                tblColumnWidth = ((!!column.width) ? ' width="' + column.width + 'px"' : '');

                tblColumns.push('<th' + tblCellClass + tblColumnWidth + '>' + column.content + '</th>');
            });

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        prepareTableRows: function() {
            var tblRows;

            tblRows = [];
            this.allItemIds = [];

            this.data.items.forEach(function(row) {
                tblRows.push(this.prepareTableRow(row));
            }.bind(this));


            return tblRows.join('');
        },

        prepareTableRow: function(row) {

            if (!!(this.options.template && this.options.template.row)) {

                return _.template(this.options.template.row, row);

            } else {

                var tblRowAttributes, tblCellContent, tblCellClass,
                    tblColumns, tblCellClasses;

                tblColumns = [];
                tblRowAttributes = '';

                // add row id to itemIds collection (~~ === shorthand for parse int)
                !!row.id && this.allItemIds.push(~~row.id);

                if (!!this.options.selectItemType && this.options.selectItemType === 'checkbox') {
                    // add a checkbox to each row
                    tblColumns.push('<td>', this.templates.checkbox(), '</td>');
                } else if (!!this.options.selectItemType && this.options.selectItemType === 'radio') {
                    // add a radio to each row
                    tblColumns.push('<td>', this.templates.radio({
                        name: 'husky-radio' // TODO
                    }), '</td>');
                }

                for (var key in row) {
                    var column = row[key];

                    if (this.options.excludeFields.indexOf(key) < 0) {
                        tblCellClasses = [];
                        tblCellContent = (!!column.thumb) ? '<img alt="' + (column.alt || '') + '" src="' + column.thumb + '"/>' : column;

                        // prepare table cell classes
                        !!column.class && tblCellClasses.push(column.class);
                        !!column.thumb && tblCellClasses.push('thumb');

                        tblCellClass = (!!tblCellClasses.length) ? 'class="' + tblCellClasses.join(' ') + '"' : '';

                        tblColumns.push('<td ' + tblCellClass + ' >' + tblCellContent + '</td>');
                    } else {
                        tblRowAttributes += ' data-' + key + '="' + column + '"';
                    }
                }

                if (!!this.options.removeRow) {
                    tblColumns.push('<td class="remove-row">', this.templates.removeRow(), '</td>');
                }

                return '<tr' + tblRowAttributes + '>' + tblColumns.join('') + '</tr>';
            }
        },

        resetItemSelection: function() {
            this.allItemIds = [];
            this.selectedItemIds = [];
        },

        selectItem: function(event) {
            console.log(this.name, 'selectItem');

            var $element, itemId;

            $element = $(event.currentTarget);

            if (!$element.is('input')) {
                $element = $element.parent().find('input');
            }

            itemId = $element.parents('tr').data('id');

            if (this.selectedItemIds.indexOf(itemId) > -1) {
                $element
                    .removeClass('is-selected')
                    .prop('checked', false);

                // uncheck 'Select All'-checkbox
                $('th.select-all')
                    .find('input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds.splice(this.selectedItemIds.indexOf(itemId), 1);
                this.sandbox.emit('data-grid:item:deselect', itemId);
            } else {
                $element
                    .addClass('is-selected')
                    .prop('checked', true);

                this.selectedItemIds.push(itemId);
                this.sandbox.emit('data-grid:item:select', itemId);
            }
            return false;
        },

        selectAllItems: function(event) {
            console.log(this.name, 'selectAllItems');

            event.stopPropagation();

            console.log(Util.compare(this.selectedItemIds, this.allItemIds), "compare");

            if (Util.compare(this.selectedItemIds, this.allItemIds)) {

                this.$element
                    .find('input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds = [];
                this.sandbox.emit('data-grid:all:deselect', null);

            } else {
                this.$element
                    .find('input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds = this.allItemIds.slice(0);
                this.sandbox.emit('data-grid:all:select', this.selectedItemIds);
            }
        },

        addRow: function(row) {
            console.log(this.name, 'addRow');

            var $table;
            // TODO check element type, list or table

            $table = this.$element.find('table');

            $table.append(this.prepareTableRow(row));
        },

        prepareRemoveRow: function(event) {
            if (!!this.options.autoRemoveHandling) {
                this.removeRow(event);
            } else {
                var $element, $tblRow;
                $element = $(event.currentTarget);
                $tblRow = $element.parent().parent();
                this.sandbox.emit('data-grid:row:remove-click', event, $tblRow.data('id'));
            }
        },

        removeRow: function(event) {
            console.log(this.name, 'removeRow');

            var $element, $tblRow, id;

            if (typeof event === 'object') {
                $element = $(event.currentTarget);
                $tblRow = $element.parent().parent();

                id = $tblRow.data('id');
            } else {
                id = event;
                $tblRow = this.$element.find('tr[data-id="' + id + '"]');
            }

            this.sandbox.emit('data-grid:row:removed', event);
            $tblRow.remove();
        },

        //
        // Pagination
        // TODO: create pagination module
        //
        appendPagination: function() {
            if (this.options.pagination) {
                this.$element.append(this.preparePagination());
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
                pageSize: this.options.paginationOptions.pageSize,
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
            console.log(this.name, 'changePage');

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

            this.sandbox.emit('data-grid:page:change', null);
            this.vent.sandbox.emit('data-grid:update', null);
        },


        bindDOMEvents: function() {
            this.$element.off();

            if (!!this.options.selectItemType && this.options.selectItemType === 'checkbox') {
                this.$element.on('click', 'tbody > tr span.custom-checkbox-icon', this.selectItem.bind(this));
                this.$element.on('change', 'tbody > tr input[type="checkbox"]', this.selectItem.bind(this));

                this.$element.on('click', 'th.select-all', this.selectAllItems.bind(this));
            } else if (!!this.options.selectItemType && this.options.selectItemType === 'radio') {
                this.$element.on('click', 'tbody > tr input[type="radio"]', this.selectItem.bind(this));
            }

            this.$element.on('click', 'tbody > tr', function(event) {
                if (!$(event.target).is('input') && !$(event.target).is('span.icon-remove')) {
                    this.sandbox.emit('data-grid:item:click', $(event.currentTarget).data('id'));
                }
            }.bind(this));

            if (this.options.pagination) {
                this.$element.on('click', '.pagination li.page', this.changePage.bind(this));
            }

            if (this.options.removeRow) {
                this.$element.on('click', '.remove-row > span', this.prepareRemoveRow.bind(this));
            }
        },

        bindCustomEvents: function() {
            // listen for private events

            this.sandbox.on('data-grid:update', this.updateHandler.bind(this));

            // listen for public events
            this.sandbox.on('data-grid:row:add', this.addRow.bind(this));

            this.sandbox.on('data-grid:row:remove', this.removeRow.bind(this));
        },

        updateHandler: function() {
            this.resetItemSelection();
        },

        render: function() {
            this.$originalElement.html(this.$element);

            this.bindCustomEvents();
            this.bindDOMEvents();
        },

        addLoader: function() {
            return this.$element
                .outerWidth(this.$element.outerWidth())
                .outerHeight(this.$element.outerHeight())
                .empty()
                .addClass('is-loading');
        },

        removeLoader: function() {
            return this.$element.removeClass('is-loading');
        },

        templates: {
            removeRow: function() {
                return [
                    '<span class="icon-remove"></span>'
                ].join('')
            },
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

            radio: function(data) {
                var id, name;

                data = data || {};
                id = (!!data['id']) ? ' id="' + data['id'] + '"' : '';
                name = (!!data['name']) ? ' name="' + data['name'] + '"' : '';

                return [
                    '<input', id, name, ' type="radio" class="custom-radio"/>',
                    '<span class="custom-radio-icon"></span>'
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
        
    };

});
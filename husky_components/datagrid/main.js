/**
 *	Name: Datagrid
 * 
 *	Options:
 *		- autoRemoveHandling: raises an event before a row is removed
 *		- className: additional classname for the wrapping div 
 *		- data: array of data to display (instead of using a url)
 *		- elementType: type of datagrid (table,..) ??
 *		- excludeFields: array of field to exclude
 *		- pagination: display a pagination
 *      - pageSize: lines per page
 *      - showPages: amount of pages that will be shown
 *      - removeRow: displays in the last column an icon to remove a row
 *      - selectItem.type: typ of select [checkbox, radio]
 *      - selectItem.width: typ of select [checkbox, radio]
 *      - url: url to fetch content
 *
 *	Provided Events:
 *       - husky.datagrid.item.deselect - raised when item is deselected
 *       - husky.datagrid.item.select - raised when item is selected
 *       - husky.datagrid.all.deselect - raised when all items get deselected via the header checkbox
 *       - husky.datagrid.all.select - raised when all items get selected via the header checkbox
 *       - husky.datagrid.row.remove-click - raised when clicked on the remove-row-icon 
 *       - husky.datagrid.row.removed - raised when row got removed
 *       - husky.datagrid.page.change - raised when the the current page changes
 *       - husky.datagrid.update - raised when the data needs to be updated
 *       - husky.datagrid.item.click - raised when clicked on an item
 *
 * 	Used Events:
 *       - husky.datagrid.update
 *       - husky.datagrid.row.add - used to add a row
 *       - husky.datagrid.row.remove - used to remove a row
 *
 */

define(function() {


	/*
	 *	Default values for options
	 */
	var defaults = {
		autoRemoveHandling: true,
		className: 'datagridcontainer', 
		elementType: 'table', //??
		data: null,
		defaultMeasureUnit: 'px',
		excludeFields: ['id'],
		pagination: false,
        paginationOptions: {
            pageSize: 10,
            showPages: 5
        },
        removeRow: true,
        selectItem: {
            type:   null,      // checkbox, radiobutton
            width:  '50px',    // numerous value
            //clickable: false   // defines if background is clickable TODO do not use until fixed
        },
        tableHead: [],
        url: null,
	};

    return {

        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialized datagrid');
            //this.sandbox.logger.log('options', this.options)
           	//this.sandbox.logger.log('el', this.$el);

            // extend default options and set variables
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.name = this.options.name;
	        this.data = null;
	        this.configs = {};
			this.allItemIds = [];
	        this.selectedItemIds = [];

	        // append datagrid to html element
	        this.$originalElement = this.sandbox.dom.$(this.options.el);
	        this.$element = this.sandbox.dom.$('<div class="husky-datagrid"/>');
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

            this.sandbox.util.ajax({

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

            $table = this.sandbox.dom.$('<table/>');

            if (!!this.data.head || !!this.options.tableHead) {
                $thead = this.sandbox.dom.$('<thead/>');
                $thead.append(this.prepareTableHead());
                $table.append($thead);
            }

            if (!!this.data.items) {
                $tbody = this.sandbox.dom.$('<tbody/>');
                $tbody.append(this.prepareTableRows());
                $table.append($tbody);
            }

            // set html classes
            tblClasses = [];
            tblClasses.push((!!this.options.className && this.options.className !== 'table') ? 'table ' + this.options.className : 'table');
            tblClasses.push((this.options.selectItem && this.options.selectItem.type === 'checkbox') ? 'is-selectable' : '');

            $table.addClass(tblClasses.join(' '));

            return $table;
        },

        prepareTableHead: function() {
            var tblColumns, tblCellClass, tblColumnWidth, headData, tblCheckboxWidth, widthValues, checkboxValues;

            tblColumns = [];
            headData = this.options.tableHead || this.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItem) {

                // default values
                checkboxValues = [];
                if (this.options.selectItem.width) {
                    checkboxValues = this.getNumberAndUnit(this.options.selectItem.width, this.options.defaultMeasureUnit);
                }

                tblCheckboxWidth = [];
                tblCheckboxWidth.push(
                    'width =',
                    checkboxValues[0],
                    checkboxValues[1]
                );


                tblColumns.push(
                    '<th class="select-all" ',tblCheckboxWidth.join(""),' >');
                if (this.options.selectItem.type === 'checkbox')
                    tblColumns.push(this.templates.checkbox({ id: 'select-all' }));
                tblColumns.push('</th>');
            }

            headData.forEach(function(column) {
                tblCellClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                tblColumnWidth = '';
                // get width and measureunit
                if (!!column.width) {
                    widthValues = this.getNumberAndUnit(column.width, this.options.defaultMeasureUnit);
                    tblColumnWidth = ' width="' + widthValues[0] + widthValues[1] + '"' ;
                }

                tblColumns.push('<th' + tblCellClass + tblColumnWidth + '>' + column.content + '</th>');
            }.bind(this));

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        // returns number and unit
        getNumberAndUnit: function(numberUnit, defaultUnit) {
            numberUnit= String(numberUnit);
            var regex = numberUnit.match(/(\d+)\s*(.*)/);
            // no unit , set default
            if ((!!defaultUnit) && (!regex[2])) {
            	regex[2] = defaultUnit;
            }
            return [regex[1], regex[2]];
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

                return this.sandbox.template.parse(this.options.template.row, row);

            } else {

                var tblRowAttributes, tblCellContent, tblCellClass,
                    tblColumns, tblCellClasses, radioPrefix;

                if(!!this.options.className && this.options.className != '') {
                    radioPrefix = '-'+this.options.className;
                } else {
                    radioPrefix = '';
                }

                tblColumns = [];
                tblRowAttributes = '';

                // add row id to itemIds collection (~~ === shorthand for parse int)
                !!row.id && this.allItemIds.push(~~row.id);

                if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                    // add a checkbox to each row
                    tblColumns.push('<td>', this.templates.checkbox(), '</td>');
                } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                    // add a radio to each row

                    tblColumns.push('<td>', this.templates.radio({
                        name: 'husky-radio'+radioPrefix
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

            // Todo review handling of events for new rows in datagrid (itemId empty?)

            var $element, itemId;

            $element = this.sandbox.dom.$(event.currentTarget);

            if (!$element.is('input')) {
                $element = $element.parent().find('input');
            }

            itemId = $element.parents('tr').data('id');
            
            if($element.attr('type') === 'checkbox') {

                if (this.selectedItemIds.indexOf(itemId) > -1) {
                    $element
                        .removeClass('is-selected')
                        .prop('checked', false);

                    // uncheck 'Select All'-checkbox
                    $('th.select-all')
                        .find('input[type="checkbox"]')
                        .prop('checked', false);

                    this.selectedItemIds.splice(this.selectedItemIds.indexOf(itemId), 1);
                    this.sandbox.emit('husky.datagrid.item.deselect', itemId);
                } else {
                    $element
                        .addClass('is-selected')
                        .prop('checked', true);
                    
                    if(!!itemId){
                        this.selectedItemIds.push(itemId);
                        this.sandbox.emit('husky.datagrid.item.select', itemId);
                    } else {
                        this.sandbox.emit('husky.datagrid.item.select', event);
                    }
                }

            } else if ($element.attr('type') === 'radio') {
                
                var oldSelectionId = this.selectedItemIds.pop();

                if(!!oldSelectionId && oldSelectionId > -1) {
                    this.sandbox.dom.$('tr[data-id="'+oldSelectionId+'"]').find('input[type="radio"]').removeClass('is-selected').prop('checked', false);
                    this.sandbox.emit('husky.datagrid.item.deselect', oldSelectionId);                    
                }

                $element.addClass('is-selected').prop('checked', true);
                
                if(!!itemId){
                    this.selectedItemIds.push(itemId);
                    this.sandbox.emit('husky.datagrid.item.select', itemId);
                } else {
                    this.sandbox.emit('husky.datagrid.item.select', event);
                }

            }
        },

        selectAllItems: function(event) {

            event.stopPropagation();
            if (this.sandbox.util.compare(this.selectedItemIds, this.allItemIds)) {

                this.$element
                    .find('input[type="checkbox"]')
                    .prop('checked', false);

                this.selectedItemIds = [];
                this.sandbox.emit('husky.datagrid.all.deselect', null);

            } else {
                this.$element
                    .find('input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds = this.allItemIds.slice(0);
                this.sandbox.emit('husky.datagrid.all.select', this.selectedItemIds);
            }
        },

        addRow: function(row) {

            var $table;
            // TODO check element type, list or table

            $table = this.$element.find('table');

            $table.append(this.prepareTableRow(row));
        },

        prepareRemoveRow: function(event) {
            if (!!this.options.autoRemoveHandling) {
                this.removeRow(event);
            } else {
                var $tblRow, id;

                $tblRow = this.sandbox.dom.$(event.currentTarget).parent().parent();
                id = $tblRow.data('id');    

                if(!!id) {
                    this.sandbox.emit('husky.datagrid.row.remove-click', event, id);
                } else {
                    this.sandbox.emit('husky.datagrid.row.remove-click', event, $tblRow);
                }
            }
        },

        removeRow: function(event) {

            var $element, $tblRow, id;

            if (typeof event === 'object') {

                $element = this.sandbox.dom.$(event.currentTarget);
                $tblRow = $element.parent().parent();

                id = $tblRow.data('id');
            } else {
                id = event;
                $tblRow = this.$element.find('tr[data-id="' + id + '"]');
            }

            this.sandbox.emit('husky.datagrid.row.removed', event);
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
                $pagination = this.sandbox.dom.$('<div/>');
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

            var $element, page;

            $element = this.sandbox.dom.$(event.currentTarget);
            page = $element.data('page');


            this.addLoader();

            this.load({
                url: this.options.url,
                page: page,
                success: function() {
                    this.removeLoader();
                }.bind(this)
            });

            this.sandbox.emit('husky.datagrid.page.change', 'change page');
            this.sandbox.emit('husky.datagrid.update', 'update page');
        },


        bindDOMEvents: function() {
            
            if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                this.$element.on('click', 'tbody > tr span.custom-checkbox-icon', this.selectItem.bind(this));
                this.$element.on('change', 'tbody > tr input[type="checkbox"]', this.selectItem.bind(this));
                this.$element.on('click', 'th.select-all', this.selectAllItems.bind(this));
            } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                this.$element.on('click', 'tbody > tr input[type="radio"]', this.selectItem.bind(this));
            }

            this.$element.on('click', 'tbody > tr', function(event) {
                if (!this.sandbox.dom.$(event.target).is('input') && !this.sandbox.dom.$(event.target).is('span.icon-remove')) {
                    var id = this.sandbox.dom.$(event.currentTarget).data('id');
                    
                    if(!!id) {
                        this.sandbox.emit('husky.datagrid.item.click', id);
                    } else {
                        this.sandbox.emit('husky.datagrid.item.click', event);
                    }
                }
            }.bind(this));

            if (this.options.pagination) {
                this.$element.on('click', '.pagination li.page', this.changePage.bind(this));
            }

            if (this.options.removeRow) {
                this.$element.on('click', '.remove-row > span', this.prepareRemoveRow.bind(this));
            }


            // Todo
            // trigger event when click on clickable area
            // different handling when clicked on checkbox and when clicked on td

            // if (this.options.selectItem && !this.options.selectItem.clickable)
            //     this.$element.on('click', 'tbody tr td:first-child()', function(event) {

            //         // change checked state
            //         var $input = this.sandbox.dom.$(event.target).find("input");
            //         $input.prop("checked", !$input.prop("checked"));

            //         itemId = this.sandbox.dom.$(event.target).parents('tr').data('id');

                    // if(!!itemId){
                    //     this.selectedItemIds.push(itemId);
                    //     this.sandbox.once('husky.datagrid.item.select', itemId);
                    // } else {
                    //     this.sandbox.once('husky.datagrid.item.select', event);
                    // }

                    // stop propagation
            //         event.stopPropagation();
            // }.bind(this));
        },

        bindCustomEvents: function() {
            // listen for private events

            this.sandbox.on('husky.datagrid.update', this.updateHandler.bind(this));

            // listen for public events
            this.sandbox.on('husky.datagrid.row.add', this.addRow.bind(this));

            this.sandbox.on('husky.datagrid.row.remove', this.removeRow.bind(this));
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
                .empty();
                //.addClass('is-loading');
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

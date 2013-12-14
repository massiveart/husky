/**
 *    Name: Datagrid
 *
 *    Options:
 *      - autoRemoveHandling: raises an event before a row is removed
 *      - className: additional classname for the wrapping div
 *      - data: array of data to display (instead of using a url)
 *      - elementType: type of datagrid (currently is only table available)
 *      - excludeFields: array of field to exclude
 *      - pagination: display a pagination
 *      - pageSize: lines per page
 *      - showPages: amount of pages that will be shown
 *      - removeRow: displays in the last column an icon to remove a row
 *      - selectItem.type: typ of select [checkbox, radio]
 *      - selectItem.width: typ of select [checkbox, radio]
 *      - sortable: is list sortable [true,false]
 *      - tableHead: configuration of table header
 *          - content: column title
 *          - width: width of column
 *          - class: css class of th
 *          - attribute: mapping information to data (if not set it will just itterate of attributes)
 *      - url: url to fetch content
 *      - appendTBody: add TBODY to table
 *
 *    Provided Events:
 *       - husky.datagrid.item.deselect - raised when item is deselected
 *       - husky.datagrid.item.select - raised when item is selected
 *       - husky.datagrid.all.deselect - raised when all items get deselected via the header checkbox
 *       - husky.datagrid.all.select - raised when all items get selected via the header checkbox
 *       - husky.datagrid.row.remove-click - raised when clicked on the remove-row-icon
 *       - husky.datagrid.row.removed - raised when row got removed
 *       - husky.datagrid.page.change - raised when the the current page changes
 *       - husky.datagrid.updated - raised when the data is updated
 *       - husky.datagrid.item.click - raised when clicked on an item
 *       - husky.datagrid.items.selected - raised when husky.datagrid.items.get-selected is triggered
 *       - husky.datagrid.data.provide - raised when when husky.datagrid.data.get is triggered
 *
 *
 *    Used Events:
 *       - husky.datagrid.update - used to trigger an update of the data
 *       - husky.datagrid.row.add - used to add a row
 *       - husky.datagrid.row.remove - used to remove a row
 *       - husky.datagrid.items.get-selected - triggers husky.datagrid.items.selected event, which returns all selected item ids
 *       - husky.datagrid.data.get - triggers husky.datagrid.data.provide
 *
 */



define(function() {

    'use strict';

    /**
     *    Default values for options
     */
    var defaults = {
        autoRemoveHandling: true,
        className: 'datagridcontainer',
        elementType: 'table',
        data: null,
        defaultMeasureUnit: 'px',
        excludeFields: ['id'],
        pagination: false,
        paginationOptions: {
            pageSize: 4,
            showPages: 5
        },
        removeRow: true,
        selectItem: {
            type: null,      // checkbox, radiobutton
            width: '50px'    // numerous value
            //clickable: false   // defines if background is clickable TODO do not use until fixed
        },
        sortable: false,
        tableHead: [],
        url: null,
        appendTBody: true   // add TBODY to table
    };


    return {

        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialized datagrid');

            // extend default options and set variables
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.name = this.options.name;
            this.data = null;
            this.allItemIds = [];
            this.selectedItemIds = [];
            this.rowStructure = ['id'];
            this.sort = {
                ascClass: 'icon-arrow-up',
                descClass: 'icon-arrow-down',
                additionalClasses: ' m-left-5 small-font'
            };

            // append datagrid to html element
            this.$originalElement = this.sandbox.dom.$(this.options.el);
            this.$element = this.sandbox.dom.$('<div class="husky-datagrid"/>');
            this.$originalElement.append(this.$element);

            this.getData();

            // Should only be be called once
            this.bindCustomEvents();
        },

        /**
         * Gets the data either via the url or the array
         */
        getData: function() {

            if (!!this.options.url) {

                this.sandbox.logger.log('load data from url');
                this.load({ url: this.options.url});

            } else if (!!this.options.data.items) {

                this.sandbox.logger.log('load data from array');
                this.data = this.options.data;

                this.prepare()
                    .appendPagination()
                    .render();
            }
        },

        /**
         * Loads contents via ajax
         * @param params url
         */
        load: function(params) {

            this.sandbox.util.ajax({

                url: this.getUrl(params),
                data: params.data,

                error: function(jqXHR, textStatus, errorThrown) {
                    this.sandbox.logger.log("An error occured while fetching data from: " + this.getUrl(params));
                    this.sandbox.logger.log("textstatus: "+textStatus);
                    this.sandbox.logger.log("errorthrown",errorThrown);
                }.bind(this),

                success: function(response) {

                    // TODO adjust when new api is finished and no backwards compatibility needed
                    if(!!response.items) {
                        this.data = response;
                    } else {
                        this.data = {};
                        this.data.links = response._links;
                        this.data.embedded = response._embedded;
                        this.data.total = response.total;
                        this.data.page = response.page;
                        this.data.pages = response.pages;
                        this.data.pageSize = response.pageSize || this.options.paginationOptions.pageSize;
                        this.data.pageDisplay = this.options.paginationOptions.showPages;
                    }

                    this.prepare()
                        .appendPagination()
                        .render();

                    this.setHeaderClasses();

                    if (typeof params.success === 'function') {
                        params.success(response);
                    }
                }.bind(this)
            });
        },

        /**
         * Returns url with page size and page param at the end
         * @param params
         * @returns {string}
         */
        getUrl: function(params) {

            // TODO adjust when new api is finished and no backwards compatibility needed
            if (!!this.data && this.data.links) {
                return params.url;
            }

            var delimiter = '?', url;
            if (params.url.indexOf('?') !== -1) {
                delimiter = '&';
            }

            url = params.url + delimiter + 'pageSize=' + this.options.paginationOptions.pageSize;
            if (params.page > 1) {
                url += '&page=' + params.page;
            }

            return url;
        },

        /**
         * Prepares the structure of the datagrid (list, table)
         * @returns {*}
         */
        prepare: function() {
            this.$element.empty();

            if (this.options.elementType === 'list') {
                // TODO:
                //this.$element = this.prepareList();
                this.sandbox.logger.log("list is not yet implemented!");
            } else {
                this.$element.append(this.prepareTable());
            }

            return this;
        },

        /**
         * Perapres the structure of the datagrid when element type is table
         * @returns {table} returns table element
         */
        prepareTable: function() {
            var $table, $thead, $tbody, tblClasses;

            $table = this.sandbox.dom.$('<table/>');

            if (!!this.data.head || !!this.options.tableHead) {
                $thead = this.sandbox.dom.$('<thead/>');
                $thead.append(this.prepareTableHead());
                $table.append($thead);
            }

            // TODO adjust when api is fully implemented and no backwards compatibility needed
            if (!!this.data.items || !!this.data.embedded) {
                if (!!this.options.appendTBody) {
                    $tbody = this.sandbox.dom.$('<tbody/>');
                }
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

        /**
         * Prepares table head
         * @returns {string} returns table head
         */

        prepareTableHead: function () {
            var tblColumns, tblCellClass, tblColumnWidth, headData, tblCheckboxWidth, widthValues, checkboxValues, dataAttribute, isSortable;

            tblColumns = [];
            headData = this.options.tableHead || this.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItem && this.options.selectItem.type) {

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
                    '<th class="select-all" ', tblCheckboxWidth.join(""), ' >');

                if (this.options.selectItem.type === 'checkbox') {
                    tblColumns.push(this.templates.checkbox({ id: 'select-all' }));
                }

                tblColumns.push('</th>');
            }

            this.rowStructure = ['id'];

            headData.forEach(function (column) {

                tblColumnWidth = '';
                // get width and measureunit
                if (!!column.width) {
                    widthValues = this.getNumberAndUnit(column.width, this.options.defaultMeasureUnit);
                    tblColumnWidth = ' width="' + widthValues[0] + widthValues[1] + '"';
                }

                isSortable = false;

                // TODO adjust when new api fully implemented and no backwards compatibility needed
                if(!!this.data.links && !!this.data.links.sortable) {

                    //is column sortable - check with received sort-links
                    this.sandbox.util.each(this.data.links.sortable, function(index) {
                        if(index === column.attribute){
                            isSortable = true;
                            return false;
                        }
                    }.bind(this));
                }

                // add to row structure when valid entry
                if(column.attribute !== undefined) {
                    this.rowStructure.push(column.attribute);
                }

                // add html to table header cell if sortable
                if (!!isSortable) {
                    dataAttribute = ' data-attribute="' + column.attribute + '"';
                    tblCellClass = ((!!column.class) ? ' class="' + column.class + ' pointer"' : ' class="pointer"');
                    tblColumns.push('<th' + tblCellClass + tblColumnWidth + dataAttribute + '>' + column.content + '<span></span></th>');
                } else {
                    tblCellClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                    tblColumns.push('<th' + tblCellClass + tblColumnWidth + '>' + column.content + '</th>');
                }

            }.bind(this));

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        // returns number and unit
        getNumberAndUnit: function(numberUnit, defaultUnit) {
            numberUnit = String(numberUnit);
            var regex = numberUnit.match(/(\d+)\s*(.*)/);
            // no unit , set default
            if ((!!defaultUnit) && (!regex[2])) {
                regex[2] = defaultUnit;
            }
            return [regex[1], regex[2]];
        },

        /**
         * Itterates over all items and prepares the rows
         * @returns {string} returns a string of all rows
         */
        prepareTableRows: function() {
            var tblRows;

            tblRows = [];
            this.allItemIds = [];

            // TODO adjust when new api is fully implemented and no backwards compatibility needed
            if(!!this.data.items) {
                this.data.items.forEach(function (row) {
                    tblRows.push(this.prepareTableRow(row));
                }.bind(this));
            } else if(!!this.data.embedded) {
                this.data.embedded.forEach(function (row) {
                    tblRows.push(this.prepareTableRow(row));
                }.bind(this));
            }

            return tblRows.join('');
        },

        /**
         * Returns a table row including values and data attributes
         * @param row
         * @returns string table row
         */
        prepareTableRow: function(row) {

            if (!!(this.options.template && this.options.template.row)) {

                return this.sandbox.template.parse(this.options.template.row, row);

            } else {

                var radioPrefix, key;
                this.tblColumns = [];
                this.tblRowAttributes = '';

                if (!!this.options.className && this.options.className !== '') {
                    radioPrefix = '-' + this.options.className;
                } else {
                    radioPrefix = '';
                }

                !!row.id && this.allItemIds.push(parseInt(row.id, 10));

                if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                    // add a checkbox to each row
                    this.tblColumns.push('<td>', this.templates.checkbox(), '</td>');
                } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                    // add a radio to each row

                    this.tblColumns.push('<td>', this.templates.radio({
                        name: 'husky-radio' + radioPrefix
                    }), '</td>');
                }

                // when row structure contains more elements than the id then use the structure to set values
                if (this.rowStructure.length > 1) {
                    this.rowStructure.forEach(function(key) {
                        this.setValueOfRowCell(key, row[key]);
                    }.bind(this));
                } else {
                    for (key in row) {
                        if (row.hasOwnProperty(key)) {
                            this.setValueOfRowCell(key, row[key]);
                        }
                    }
                }

                if (!!this.options.removeRow) {
                    this.tblColumns.push('<td class="remove-row">', this.templates.removeRow(), '</td>');
                }

                return '<tr' + this.tblRowAttributes + '>' + this.tblColumns.join('') + '</tr>';
            }
        },

        /**
         * Sets the value of row cell and the data-id attribute for the row
         * @param key attribute name
         * @param value attribute value
         */
        setValueOfRowCell: function(key, value) {
            var tblCellClasses,
                tblCellContent,
                tblCellClass;

            if (this.options.excludeFields.indexOf(key) < 0) {
                tblCellClasses = [];
                tblCellContent = (!!value.thumb) ? '<img alt="' + (value.alt || '') + '" src="' + value.thumb + '"/>' : value;

                // prepare table cell classes
                !!value.class && tblCellClasses.push(value.class);
                !!value.thumb && tblCellClasses.push('thumb');

                tblCellClass = (!!tblCellClasses.length) ? 'class="' + tblCellClasses.join(' ') + '"' : '';

                this.tblColumns.push('<td ' + tblCellClass + ' >' + tblCellContent + '</td>');
            } else {
                this.tblRowAttributes += ' data-' + key + '="' + value + '"';
            }
        },

        /**
         * Resets the arrays for selected items
         */
        resetItemSelection: function() {
            this.allItemIds = [];
            this.selectedItemIds = [];
        },

        /**
         * Selectes or deselects the clicked item
         * @param event
         */
        selectItem: function(event) {

            // Todo review handling of events for new rows in datagrid (itemId empty?)

            var $element, itemId, oldSelectionId;

            $element = this.sandbox.dom.$(event.currentTarget);

            if (!$element.is('input')) {
                $element = $element.parent().find('input');
            }

            itemId = $element.parents('tr').data('id');

            if ($element.attr('type') === 'checkbox') {

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

                    if (!!itemId) {
                        this.selectedItemIds.push(itemId);
                        this.sandbox.emit('husky.datagrid.item.select', itemId);
                    } else {
                        this.sandbox.emit('husky.datagrid.item.select', event);
                    }
                }

            } else if ($element.attr('type') === 'radio') {

                oldSelectionId = this.selectedItemIds.pop();

                if (!!oldSelectionId && oldSelectionId > -1) {
                    this.sandbox.dom.$('tr[data-id="' + oldSelectionId + '"]').find('input[type="radio"]').removeClass('is-selected').prop('checked', false);
                    this.sandbox.emit('husky.datagrid.item.deselect', oldSelectionId);
                }

                $element.addClass('is-selected').prop('checked', true);

                if (!!itemId) {
                    this.selectedItemIds.push(itemId);
                    this.sandbox.emit('husky.datagrid.item.select', itemId);
                } else {
                    this.sandbox.emit('husky.datagrid.item.select', event);
                }

            }
        },

        /**
         * Selects or deselect all available items of the list
         * @param event
         */
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

        /**
         * Adds a row to the datagrid
         * @param row
         */
        addRow: function(row) {
            var $table;
            // check for other element types when implemented
            $table = this.$element.find('table');
            $table.append(this.prepareTableRow(row));
        },

        /**
         * Prepares for removing a row
         * Raises the husky.datagrid.row.remove-click event when auto remove handling is not set to true
         * @param event
         */
        prepareRemoveRow: function(event) {
            if (!!this.options.autoRemoveHandling) {
                this.removeRow(event);
            } else {
                var $tblRow, id;

                $tblRow = this.sandbox.dom.$(event.currentTarget).parent().parent();
                id = $tblRow.data('id');

                if (!!id) {
                    this.sandbox.emit('husky.datagrid.row.remove-click', event, id);
                } else {
                    this.sandbox.emit('husky.datagrid.row.remove-click', event, $tblRow);
                }
            }
        },

        /**
         * Removes a row from the datagrid
         * Raises husky.datagrid.row.removed event
         * @param event
         */
        removeRow: function(event) {

            var $element, $tblRow, id, idx;

            if (typeof event === 'object') {

                $element = this.sandbox.dom.$(event.currentTarget);
                $tblRow = $element.parent().parent();

                id = $tblRow.data('id');
            } else {
                id = event;
                $tblRow = this.$element.find('tr[data-id="' + id + '"]');
            }

            idx = this.selectedItemIds.indexOf(id);

            if (idx >= 0) {
                this.selectedItemIds.splice(idx, 1);
            }

            this.sandbox.emit('husky.datagrid.row.removed', event);
            $tblRow.remove();
        },

        // TODO: create pagination module
        /**
         * Appends pagination when option is set
         * @returns {*}
         */
        appendPagination: function() {

            // TODO adjust when api is finished
            if (this.options.pagination && !!this.data.links) {
                this.$element.append(this.preparePagination());
            }
            return this;
        },

        /**
         * Delegates the rendering of the pagination when paginations is needed
         * @returns {*}
         */
        preparePagination: function() {
            var $pagination;

            if (!!this.options.pagination && parseInt(this.data.pages, 10) > 1) {
                $pagination = this.sandbox.dom.$('<div/>');
                $pagination.addClass('pagination');

                // TODO next / prev not set when on last / first page
                $pagination.append(this.preparePaginationForwardNavigation());
                $pagination.append(this.preparePaginationPageNavigation());
                $pagination.append(this.preparePaginationBackwardNavigation());
            }

            return $pagination;
        },

        /**
         * Triggers rendering of the numbers in the pagination
         * @returns {*}
         */
        preparePaginationPageNavigation: function() {
            return this.templates.paginationPageNavigation({
                pageSize: this.data.pageSize,
                pages: this.data.pages,
                page: this.data.page,
                pagesDisplay: this.data.pageDisplay
            });
        },

        /**
         * Triggers rendering for last and next link
         * @returns {*|string}
         */
        preparePaginationBackwardNavigation: function() {

            var $next = '',
                $last = '';

            if(this.data.links.next) {
                $next = this.templates.paginationNavigation("next", "Next");
            }
            if(this.data.links.last) {
                $last = this.templates.paginationNavigation("last", "");
            }

            return ["<ul>",$next,$last,"</ul>"].join('');
        },


        /**
         * Triggers rendering for first and previous link
         * @returns {*|string}
         */
        preparePaginationForwardNavigation: function() {
            var $prev = '',
                $first = '';

            if(this.data.links.first) {
                $first = this.templates.paginationNavigation("first", "");
            }
            if(this.data.links.prev) {
                $prev = this.templates.paginationNavigation("prev", "Previous");
            }

            return ["<ul>",$first,$prev,"</ul>"].join('');
        },

        /**
         * Called when the current page should change
         * Emits husky.datagrid.updated event on success
         * @param event
         */
        changePage: function(event) {

            var $element, page, template, url, uri;

            $element = this.sandbox.dom.$(event.currentTarget);
            page = $element.data('page');

            if(!!page) {
                this.addLoader();
                this.resetItemSelection();
                //this.resetSortingOptions(); // browsing through sorted pages
                
                this.sandbox.emit('husky.datagrid.page.change', 'change page');

                uri = this.data.links[page];

                if(!!uri) {
                    url = uri;
                } else {
                    template = this.sandbox.uritemplate.parse(this.data.links.pagination);
                    url = this.sandbox.uritemplate.expand(template, {page: page});
                }

                this.load({
                    url: url,
                    page: page,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit('husky.datagrid.updated', 'updated page');
                    }.bind(this)
                });
            }
        },

        resetSortingOptions: function() {
            this.sort.attribute = null;
            this.sort.direction = null;
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

                    if (!!id) {
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

            if (this.options.sortable) {
                this.$element.on('click', 'thead th[data-attribute]', this.changeSorting.bind(this));
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

        /**
         * Sets header classes and loads new data
         * Emits husky.datagrid.updated event on success
         * @param event
         */
        changeSorting: function(event) {

            var attribute = this.sandbox.dom.data(event.currentTarget, 'attribute'),
                $element = event.currentTarget,
                $span = this.sandbox.dom.children($element, 'span')[0],
                url, template;

            if (!!attribute && !!this.data.links.sortable[attribute]) {

                this.sandbox.emit('husky.datagrid.data.sort');
                this.sort.attribute = attribute;

                if (this.sandbox.dom.hasClass($span, this.sort.ascClass)) {
                    this.sort.direction = "desc";
                } else {
                    this.sort.direction = "asc";
                }

                this.addLoader();
                template = this.sandbox.uritemplate.parse(this.data.links.sortable[attribute]);
                url = this.sandbox.uritemplate.expand(template, {sortOrder: this.sort.direction});

                this.load({
                    url: url,
                    success: function () {
                        this.removeLoader();
                        this.sandbox.emit('husky.datagrid.updated', 'updated sort');
                    }.bind(this)
                });
            }
        },

        /**
         * Sets the header classes used for sorting purposes
         * needs this.sort to be correctly initialized
         */
        setHeaderClasses: function() {
            var attribute = this.sort.attribute,
                direction = this.sort.direction,
                $element = this.sandbox.dom.find('thead th[data-attribute=' + attribute + ']', this.$element),
                $span = this.sandbox.dom.children($element, 'span')[0];

            if (!!attribute) {

                this.sandbox.dom.addClass($element, 'bold');

                if (direction === 'asc') {
                    this.sandbox.dom.addClass($span, this.sort.ascClass + this.sort.additionalClasses);
                } else {
                    this.sandbox.dom.addClass($span, this.sort.descClass + this.sort.additionalClasses);
                }

            }
        },

        bindCustomEvents: function() {

            // listen for private events
            this.sandbox.on('husky.datagrid.update', this.updateHandler.bind(this));

            // listen for public events
            this.sandbox.on('husky.datagrid.row.add', this.addRow.bind(this));

            this.sandbox.on('husky.datagrid.row.remove', this.removeRow.bind(this));

            // trigger selectedItems
            this.sandbox.on('husky.datagrid.items.get-selected', this.getSelectedItemsIds.bind(this));

            this.sandbox.on('husky.datagrid.data.get', this.provideData.bind(this));
        },

        provideData: function() {
            this.sandbox.emit('husky.datagrid.data.provide', this.data);
        },

        /**
         * Updates data in datagrid
         * Called when husky.datagrid.update event emitted
         * Emits husky.datagrid.updated event on success
         */
        updateHandler: function() {
            this.resetItemSelection();
            this.resetSortingOptions();

            // TODO does not work?
            this.load({
                url: this.data.links.self,
                success: function () {
                    this.removeLoader();
                    this.sandbox.emit('husky.datagrid.updated', 'updated data 123');
                }.bind(this)
            });
        },

        /**
         * Renders datagrid element in container
         * Binds DOM events
         */
        render: function() {
            this.$originalElement.html(this.$element);
            this.bindDOMEvents();
        },

        /**
         * Adds loading icon and keeps width and height
         * @returns {*}
         */
        addLoader: function() {
            return this.$element
                .outerWidth(this.$element.outerWidth())
                .outerHeight(this.$element.outerHeight())
                .empty()
                .addClass('is-loading');
        },

        /**
         * Removes loading icon, width and height of container
         * @returns {*}
         */
        removeLoader: function() {
            return this.$element.removeClass('is-loading').outerHeight("").outerWidth("");
        },

        /**
         * Returns selected items either via callback or else via husky.datagrid.items.selected event
         * Gets called on husky.datagrid.items.get-selected event
         * @param callback
         */
        getSelectedItemsIds: function(callback) {
            if (typeof callback === 'function') {
                callback(this.selectedItemIds);
            } else {
                this.sandbox.emit('husky.datagrid.items.selected', this.selectedItemIds);
            }
        },

        templates: {
            removeRow: function() {
                return [
                    '<span class="icon-remove"></span>'
                ].join('');
            },

            checkbox: function(data) {
                var id, name;

                data = data || {};
                id = (!!data.id) ? ' id="' + data.id + '"' : '';
                name = (!!data.name) ? ' name="' + data.name + '"' : '';

                return [
                    '<input', id, name, ' type="checkbox" class="custom-checkbox"/>',
                    '<span class="custom-checkbox-icon"></span>'
                ].join('');
            },

            radio: function(data) {
                var id, name;

                data = data || {};
                id = (!!data.id) ? ' id="' + data.id + '"' : '';
                name = (!!data.name) ? ' name="' + data.name + '"' : '';

                return [
                    '<input', id, name, ' type="radio" class="custom-radio"/>',
                    '<span class="custom-radio-icon"></span>'
                ].join('');
            },

            // Pagination
            paginationNavigation: function(data , label) {

                return ['<li class="pagination-',data,' page" data-page="', data, '">',label,'</li>'].join('');
            },


            paginationPageNavigation: function(data) {

                // TODO currect page + this.options.paginationOptions.showPages: 5
                var rest,
                    pageItemsCurrentAfter = [],
                    pageItemsBefore = [],
                    pageClass,
                    i;

                // add pages for current after current page
                for (i = data.page; i <= data.pagesDisplay; i++) {
                    pageClass = (data.page === i) ? 'class="page is-selected bold"' : 'class="page"';
                    pageItemsCurrentAfter.push('<li '+pageClass+' data-page="'+ i + '">' + i + '</li>');
                }


                rest = data.pagesDisplay - pageItemsCurrentAfter.length;

                // add pages before current page if needed
                if(rest > 0) {
                    for (i = data.page-rest; i < data.page ; i++) {
                        pageItemsBefore.push('<li class="page" data-page="'+ i + '">' + i + '</li>');
                    }
                }

                return '<ul>'+ pageItemsBefore.join('') + pageItemsCurrentAfter.join('') + '</ul>';
            }
        }

    };

});

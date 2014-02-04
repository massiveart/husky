/**
 * @class DataGrid
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {Boolean} [options.autoRemoveHandling] raises an event before a row is removed
 * @param {Array} [options.fieldsData] fields data will extend url and set tableHead automatically
 * @param {Object} [options.fieldsData.{}] fields object
 * @param {String} [options.fieldsData.{}.id] field name
 * @param {String} [options.fieldsData.{}.translation] translation key which will be translated automatically
 * @param {String} [options.fieldsData.{}.disabled] either 'true' or 'false'
 * @param {Boolean} [options.editable] will not set class is-selectable to prevent hover effect for complete rows
 * @param {String} [options.className] additional classname for the wrapping div
 * @param {Object} [options.data] if no url is provided (some functionality like search & sort will not work)
 * @param {String} [options.defaultMeasureUnit=px] the unit that should be taken
 * @param {String} [options.elementType=table] type of datagrid (currently only table is available)
 * @param {Array} [options.excludeFields=[id]] array of field to exclude
 * @param {Boolean} [options.pagination=false] display a pagination
 * @param {Object} [options.paginationOptions] Configuration Object for the pagination
 * @param {Number} [options.paginationOptions.pageSize] Number of items per page
 * @param {Boolean} [options.paginationOptions.showPages] show pages as visual numbers
 * @param {Number} [options.pageSize] lines per page
 * @param {Number} [options.showPages] amount of pages that will be shown
 * @param {Boolean} [options.removeRow] displays in the last column an icon to remove a row
 * @param {Object} [options.selectItem] Configuration object of select item (column)
 * @param {String} [options.selectItem.type] Type of select [checkbox, radio]
 * @param {String} [options.selectItem.width] Width of select column
 * @param {Boolean} [options.sortable] Defines if list is sortable
 * @param {Array} [options.columns] configuration array of columns
 * @param {String} [options.columns.content] column title
 * @param {String} [options.columns.width] width of column
 * @param {String} [options.columns.class] css class of th
 * @param {String} [options.columns.attribute] mapping information to data (if not set it will just iterate of attributes)
 * @param {Boolean} [options.appendTBody] add TBODY to table
 * @param {String} [options.searchInstanceName=null] if set, a listener will be set for the corresponding search event
 * @param {String} [options.columnOptionsInstanceName=null] if set, a listener will be set for listening for column changes
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.paginationTemplate] template for pagination
 * @param {Boolean} [options.validation] enables validation for datagrid
 */
define(function() {

    'use strict';

    /**
     *    Default values for options
     */
    var defaults = {
            autoRemoveHandling: true,
            editable: false,
            className: 'datagridcontainer',
            elementType: 'table',
            data: null,
            defaultMeasureUnit: 'px',
            excludeFields: ['id'],
            instance: 'undefined',
            pagination: false,
            paginationOptions: {
                pageSize: null,
                showPages: null
            },
            removeRow: true,
            selectItem: {
                type: null,      // checkbox, radiobutton
                width: '50px'    // numerous value
                //clickable: false   // defines if background is clickable TODO do not use until fixed
            },
            sortable: false,
            columns: [],
            url: null,
            appendTBody: true,   // add TBODY to table
            searchInstanceName: null, // at which search it should be listened to can be null|string|empty_string
            columnOptionsInstanceName: null, // at which search it should be listened to can be null|string|empty_string
            paginationTemplate: '<%=translate("pagination.page")%> <%=i%> <%=translate("pagination.of")%> <%=pages%>',
            fieldsData: null,
            validation: false,
            validationDebug: false,
            startTabIndex: 1
        },

        namespace = 'husky.datagrid.',

    /* TRIGGERS EVENTS */

        /**
         * raised when item is deselected
         * @event husky.datagrid.item.deselect
         * @param {String} id of deselected item
         */
            ITEM_DESELECT = namespace + 'item.deselect',

        /**
         * raised when item is selected
         * @event husky.datagrid.item.select
         * @param {String} if of selected item
         */
            ITEM_SELECT = namespace + 'item.select',

        /**
         * raised when clicked on an item
         * @event husky.datagrid.item.click
         * @param {String} id of item that was clicked
         */
            ITEM_CLICK = namespace + 'item.click',

        /**
         * raised when husky.datagrid.items.get-selected is triggered
         * @event husky.datagrid.items.selected
         * @param {Array} ids of all items that have been clicked
         */
            ITEMS_SELECTED = namespace + 'items.selected',

        /**
         * raised when all items get deselected via the header checkbox
         * @event husky.datagrid.all.deselect
         */
            ALL_DESELECT = namespace + 'all.deselect',

        /**
         * raised when all items get deselected via the header checkbox
         * @event husky.datagrid.all.select
         * @param {Array} ids of all items that have been clicked
         */
            ALL_SELECT = namespace + 'all.select',

        /**
         * click - raised when clicked on the remove-row-icon
         * @event husky.datagrid.row.remove-click
         * @param {Object} event object of click
         * @param {String} id of item that was clicked for removal
         */
            ROW_REMOVE_CLICK = namespace + 'row.remove-click',

        /**
         * raised when row got removed
         * @event husky.datagrid.row.removed
         * @param {String} id of item that was removed
         */
            ROW_REMOVED = namespace + 'row.removed',

        /**
         * raised when the the current page changes
         * @event husky.datagrid.page.change
         */
            PAGE_CHANGE = namespace + 'page.change',

        /**
         * raised when the data is updated
         * @event husky.datagrid.updated
         */
            UPDATED = namespace + 'updated',

        /**
         * raised when husky.datagrid.data.get is triggered
         * @event husky.datagrid.data.provide
         */
            DATA_PROVIDE = namespace + 'data.provide',

        /**
         * raised when data is sorted
         * @event husky.datagrid.data.sort
         */
            DATA_SORT = namespace + 'data.sort',

        /**
         * raised when selection of items changes
         * @event husky.datagrid.number.selections
         */
            NUMBER_SELECTIONS = namespace + 'number.selections',

        /**
         * raised when data was saved
         * @event husky.datagrid.data.saved
         */
            DATA_SAVED = namespace + 'data.saved',

        /**
         * raised when editable list is changed
         * @event husky.datagrid.data.save
         */
            DATA_CHANGED = namespace + 'data.changed',


    /* PROVIDED EVENTS */

        /**
         * used to trigger an update of the data
         * @event husky.datagrid.update
         */
            UPDATE = namespace + 'update',

        /**
         * used to add a row
         * @event husky.datagrid.row.add
         * @param {String} id of the row to be removed
         */
            ROW_ADD = namespace + 'row.add',

        /**
         * used to remove a row
         * @event husky.datagrid.row.remove
         * @param {String} id of the row to be removed
         */
            ROW_REMOVE = namespace + 'row.remove',

        /**
         * triggers husky.datagrid.items.selected event, which returns all selected item ids
         * @event husky.datagrid.items.get-selected
         * @param  {Function} callback function receives array of selected items
         */
            ITEMS_GET_SELECTED = namespace + 'items.get-selected',

        /**
         * triggers husky.datagrid.data.provide
         * @event husky.datagrid.data.get
         */
            DATA_GET = namespace + 'data.get',

        /**
         * used to trigger the save operation of changed data
         * @event husky.datagrid.data.save
         */
            DATA_SAVE = namespace + 'data.save';


    return {

        view: true,

        tabIndex: 0,

        initialize: function() {
            this.sandbox.logger.log('initialized datagrid');

            // extend default options and set variables
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.name = this.options.name;
            this.dropdownInstanceName = 'datagrid-pagination-dropdown';
            this.data = null;
            this.allItemIds = [];
            this.selectedItemIds = [];
            this.changedData = {};
            this.rowStructure = [];

            this.elId = this.sandbox.dom.attr(this.$el, 'id');

            this.sort = {
                ascClass: 'icon-arrow-up',
                descClass: 'icon-arrow-down',
                additionalClasses: ' m-left-5 small-font'
            };

            this.changedData = [];

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
            var fieldsData, url;

            if (!!this.options.url) {
                url = this.options.url;

                // parse fields data
                if (this.options.fieldsData) {
                    fieldsData = this.parseFieldsData(this.options.fieldsData);
                    url += '&fields=' + fieldsData.urlFields;
                    this.options.columns = fieldsData.columns;
                }

                this.sandbox.logger.log('load data from url');
                this.load({ url: url});

            } else if (!!this.options.data.items) {

                this.sandbox.logger.log('load data from array');
                this.data = this.options.data;

                this.prepare()
                    .appendPagination()
                    .render();
            }
        },

        /**
         * parses fields data retreived from api
         * @param fields
         * @returns {{columns: Array, urlFields: string}}
         */
        parseFieldsData: function(fields) {
            var data = [],
                urlfields = [],
                fieldsCount = 0,
                tmp;

            this.sandbox.util.foreach(fields, function(field) {

                tmp = {};

                if (field.disabled !== 'true' && field.disabled !== true) {

                    // data
                    for (var key in field) {
                        if (key === 'translation') {
                            tmp.content = this.sandbox.translate(field.translation);
                        } else if (key === 'id') {
                            tmp.attribute = field.id;
                        } else {
                            tmp[key] = field[key];
                        }
                    }

                    data.push(tmp);
                    urlfields.push(field.id);

                } else if (field.id === 'id') {
                    urlfields.push(field.id);
                }

                fieldsCount++;

            }.bind(this));
            return {
                columns: data,
                urlFields: urlfields.join(',')
            };
        },

        /**
         * Loads contents via ajax
         * @param params url
         */
        load: function(params) {

            /*
             * TODO do that: this.sandbox.util.load
             * this.sandbox.util.load(url)
             *      .then(function(response) {
             *      }.bind(this))
             *      .fail(function(error) {
             *      }.bind(this));
             */
            this.sandbox.util.ajax({

                url: this.getUrl(params),
                data: params.data,

                error: function(jqXHR, textStatus, errorThrown) {
                    this.sandbox.logger.log("An error occured while fetching data from: " + this.getUrl(params));
                    this.sandbox.logger.log("textstatus: " + textStatus);
                    this.sandbox.logger.log("errorthrown", errorThrown);
                }.bind(this),

                success: function(response) {

                    // TODO adjust when new api is finished and no backwards compatibility needed
                    if (!!response.items) {
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

            var delimiter = '?', url = params.url;

            if (!!this.options.pagination && !!this.options.paginationOptions.pageSize) {

                if (params.url.indexOf('?') !== -1) {
                    delimiter = '&';
                }

                url = params.url + delimiter + 'pageSize=' + this.options.paginationOptions.pageSize;
                if (params.page > 1) {
                    url += '&page=' + params.page;
                }
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
                // TODO this.$element = this.prepareList();
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

            $table = this.sandbox.dom.$('<table' + (!!this.options.validationDebug ? 'data-debug="true"' : '' ) + '/>');

            if (!!this.data.head || !!this.options.columns) {
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

            // when list should not have the hover effect for whole rows do not set the is-selectable class
            if (!this.options.editable) {
                tblClasses.push((this.options.selectItem && this.options.selectItem.type === 'checkbox') ? 'is-selectable' : '');
            }

            $table.addClass(tblClasses.join(' '));

            return $table;
        },

        /**
         * Prepares table head
         * @returns {string} returns table head
         */

        prepareTableHead: function() {
            var tblColumns, tblCellClass, tblColumnWidth, headData, tblCheckboxWidth, widthValues, checkboxValues, dataAttribute, isSortable;

            tblColumns = [];
            headData = this.options.columns || this.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItem && this.options.selectItem.type) {

                // default values
                checkboxValues = [];
                if (this.options.selectItem.width) {
                    checkboxValues = this.getNumberAndUnit(this.options.selectItem.width);
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

            this.rowStructure = [];

            headData.forEach(function(column) {

                tblColumnWidth = '';
                // get width and measureunit
                if (!!column.width) {
                    widthValues = this.getNumberAndUnit(column.width);
                    tblColumnWidth = ' width="' + widthValues[0] + widthValues[1] + '"';
                }

                isSortable = false;

                // TODO adjust when new api fully implemented and no backwards compatibility needed
                if (!!this.data.links && !!this.data.links.sortable) {

                    //is column sortable - check with received sort-links
                    this.sandbox.util.each(this.data.links.sortable, function(index) {
                        if (index === column.attribute) {
                            isSortable = true;
                            return false;
                        }
                    }.bind(this));
                }

                // add to row structure when valid entry
                if (column.attribute !== undefined) {
                    this.rowStructure.push({
                        attribute: column.attribute,
                        editable: column.editable,
                        validation: column.validation
                    });
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

            // remove-row entry
            if (this.options.removeRow) {
                tblColumns.push('<th width="30px"/>');
            }

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        // returns number and unit
        getNumberAndUnit: function(numberUnit) {
            numberUnit = String(numberUnit);
            var regex = numberUnit.match(/(\d+)\s*(.*)/);
            // no unit , set default
            if (!regex[2]) {
                regex[2] = this.options.defaultMeasureUnit;
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

            this.tabIndex = this.options.startTabIndex;

            // TODO adjust when new api is fully implemented and no backwards compatibility needed
            if (!!this.data.items) {
                this.data.items.forEach(function(row) {
                    tblRows.push(this.prepareTableRow(row));
                }.bind(this));
            } else if (!!this.data.embedded) {
                this.data.embedded.forEach(function(row) {
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

                // special treatment for id
                if (!!row.id) {
                    this.tblRowAttributes += ' data-id="' + row.id + '"';
                }

                if (!!this.options.className && this.options.className !== '') {
                    radioPrefix = '-' + this.options.className;
                } else {
                    radioPrefix = '';
                }

                !!row.id && this.allItemIds.push(parseInt(row.id, 10));

                // add a checkbox to each row
                if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                    this.tblColumns.push('<td>', this.templates.checkbox(), '</td>');

                    // add a radio to each row
                } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                    this.tblColumns.push('<td>', this.templates.radio({
                        name: 'husky-radio' + radioPrefix
                    }), '</td>');
                }

                // when row structure contains more elements than the id then use the structure to set values
                if (this.rowStructure.length) {
                    this.rowStructure.forEach(function(key) {
                        key.editable = key.editable || false;
                        this.createRowCell(key.attribute, row[key.attribute], key.editable, key.validation);
                    }.bind(this));
                } else {
                    for (key in row) {
                        if (row.hasOwnProperty(key)) {
                            this.createRowCell(key, row[key], false, null);
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
         * @param editable flag whether field is editable or not
         */
        createRowCell: function(key, value, editable, validation) {
            var tblCellClasses,
                tblCellContent,
                tblCellClass,
                k,
                validationAttr = '';

            if (!value) {
                value = '';
            }

            if (this.options.excludeFields.indexOf(key) < 0) {
                tblCellClasses = [];
                tblCellContent = (!!value.thumb) ? '<img alt="' + (value.alt || '') + '" src="' + value.thumb + '"/>' : value;

                // prepare table cell classes
                !!value.class && tblCellClasses.push(value.class);
                !!value.thumb && tblCellClasses.push('thumb');

                tblCellClass = (!!tblCellClasses.length) ? 'class="' + tblCellClasses.join(' ') + '"' : '';

                if (!!validation) {
                    for (k in validation) {
                        validationAttr += ['data-validation-', k, '="', validation[k], '" '].join('');
                    }
                }

                if (!!editable) {
                    this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' ><span class="editable" contenteditable="true" ' + validationAttr + ' tabindex="' + this.tabIndex + '">' + tblCellContent + '</span></td>');

                    this.tabIndex++;
                } else {
                    this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' >' + tblCellContent + '</td>');
                }
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
                    this.sandbox.emit(ITEM_DESELECT, itemId);
                } else {
                    $element
                        .addClass('is-selected')
                        .prop('checked', true);

                    if (!!itemId) {
                        this.selectedItemIds.push(itemId);
                        this.sandbox.emit(ITEM_SELECT, itemId);
                    } else {
                        this.sandbox.emit(ITEM_SELECT, event);
                    }
                }
                this.sandbox.emit(NUMBER_SELECTIONS, this.selectedItemIds.length);

            } else if ($element.attr('type') === 'radio') {

                oldSelectionId = this.selectedItemIds.pop();

                if (!!oldSelectionId && oldSelectionId > -1) {
                    this.sandbox.dom.$('tr[data-id="' + oldSelectionId + '"]').find('input[type="radio"]').removeClass('is-selected').prop('checked', false);
                    this.sandbox.emit(ITEM_DESELECT, oldSelectionId);
                }

                $element.addClass('is-selected').prop('checked', true);

                if (!!itemId) {
                    this.selectedItemIds.push(itemId);
                    this.sandbox.emit(ITEM_SELECT, itemId);
                } else {
                    this.sandbox.emit(ITEM_SELECT, event);
                }
                this.sandbox.emit(NUMBER_SELECTIONS, this.selectedItemIds.length);
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
                this.sandbox.emit(ALL_DESELECT, null);

            } else {
                this.$element
                    .find('input[type="checkbox"]')
                    .prop('checked', true);

                this.selectedItemIds = this.allItemIds.slice(0);
                this.sandbox.emit(ALL_SELECT, this.selectedItemIds);
            }
            this.sandbox.emit(NUMBER_SELECTIONS, this.selectedItemIds.length);
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
                    this.sandbox.emit(ROW_REMOVE_CLICK, event, id);
                } else {
                    this.sandbox.emit(ROW_REMOVE_CLICK, event, $tblRow);
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

            this.sandbox.emit(ROW_REMOVED, event);
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
                this.initPaginationIds();
                this.$element.append(this.preparePagination());
                this.preparePaginationDropdown();
            }
            return this;
        },

        /**
         * inits the dom ids needed for the pagination
         */
        initPaginationIds: function() {
            this.pagination = {
                prevId: this.options.instance + '-prev',
                nextId: this.options.instance + '-next',
                dropdownId: this.options.instance + '-pagination-dropdown',
                showAllId: this.options.instance + '-show-all'
            };
        },

        /**
         * Delegates the rendering of the pagination when pagination is needed
         * @returns {*}
         */
        preparePagination: function() {
            var $pagination,
                $paginationWrapper,
                $showAll,
                paginationLabel;

            if (!!this.options.pagination && parseInt(this.data.pages, 10) > 1) {
                $paginationWrapper = this.sandbox.dom.$('<div/>');
                $paginationWrapper.addClass('pagination-wrapper m-top-20 grid-row small-font');

                if (!!this.data.total && !!this.data.links.all) {
                    $showAll = this.sandbox.dom.$(this.templates.showAll(this.data.total, this.sandbox.translate('pagination.elements'), this.sandbox.translate('pagination.showAll'), this.pagination.showAllId));
                    $paginationWrapper.append($showAll);
                }

                $pagination = this.sandbox.dom.$('<div/>');
                $pagination.addClass('pagination grid-col-8 pull-right');

                $paginationWrapper.append($pagination);

                paginationLabel = this.renderPaginationRow(this.data.page, this.data.pages);

                $pagination.append('<div id="' + this.pagination.nextId + '" class="icon-chevron-right pagination-prev pull-right pointer"></div>');
                $pagination.append('<div id="' + this.pagination.dropdownId + '" class="pagination-main pull-right pointer"><span class="inline-block">' + paginationLabel + '</span><span class="dropdown-toggle inline-block"></span></div>');
                $pagination.append('<div id="' + this.pagination.prevId + '" class="icon-chevron-left pagination-next pull-right pointer"></div>');
            }

            return $paginationWrapper;
        },


        /**
         * Renders template for one row in the pagination
         * @param i current page number
         * @param pages total number of pages
         */
        renderPaginationRow: function(i, pages) {
            var defaults = {
                translate: this.sandbox.translate,
                i: i,
                pages: pages
            };

            return this.sandbox.util.template(this.options.paginationTemplate, defaults);
        },

        /**
         * Prepares and initializes the dropdown used for the pagination
         */
        preparePaginationDropdown: function() {

            var data = [], i, name;

            for (i = 1; i <= this.data.pages; i++) {
                name = this.renderPaginationRow(i, this.data.pages);
                data.push({id: i, name: name});
            }

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: '#' + this.pagination.dropdownId,
                        setParentDropDown: true,
                        instanceName: this.dropdownInstanceName,
                        alignment: 'left',
                        data: data
                    }
                }
            ]);
        },

        /**
         * Called when the current page should change
         * Emits husky.datagrid.updated event on success
         * @param uri
         * @param event
         */
        changePage: function(uri, event) {
            var url, template;

            // when a valid uri is passed to this function - load from the uri
            if (!!uri) {
                event.preventDefault();
                url = uri;

                // determine wether the page number received via the event from the dropdown is valid
            } else if (!!event.id && event.id > 0 && event.id <= this.data.pages) {
                template = this.sandbox.uritemplate.parse(this.data.links.pagination);
                url = this.sandbox.uritemplate.expand(template, {page: event.id});

                // invalid - wether page number nor uri are valid
            } else {
                this.sandbox.logger.log("invalid page number or reached start/end!");
                return;
            }

            this.sandbox.emit(PAGE_CHANGE, url);
            this.addLoader();
            this.load({url: url,
                success: function() {
                    this.removeLoader();
                    this.sandbox.emit(UPDATED, 'updated page');
                }.bind(this)});
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
                        this.sandbox.emit(ITEM_CLICK, id);
                    } else {
                        this.sandbox.emit(ITEM_CLICK, event);
                    }
                }
            }.bind(this));

            if (this.options.pagination) {

                // next page
                this.$element.on('click', '#' + this.pagination.nextId, this.changePage.bind(this, this.data.links.next));

                // previous page
                this.$element.on('click', '#' + this.pagination.prevId, this.changePage.bind(this, this.data.links.prev));

                // show all
                this.$element.on('click', '#' + this.pagination.showAllId, this.changePage.bind(this, this.data.links.all));
            }

            if (this.options.removeRow) {
                this.$element.on('click', '.remove-row > span', this.prepareRemoveRow.bind(this));
            }

            if (this.options.sortable) {
                this.$element.on('click', 'thead th[data-attribute]', this.changeSorting.bind(this));
            }

            if (!!this.options.editable) {
                this.$element.on('focusin', '.editable', this.focusOnEditable.bind(this));
                this.$element.on('focusout', '.editable', this.focusOutEditable.bind(this));
            }


            // Todo trigger event when click on clickable area
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

                this.sandbox.emit(DATA_SORT);
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
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED, 'updated sort');
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
            var searchInstanceName = '', columnOptionsInstanceName = '';

            // listen for private events
            this.sandbox.on(UPDATE, this.updateHandler.bind(this));

            // listen for public events
            this.sandbox.on(ROW_ADD, this.addRow.bind(this));

            this.sandbox.on(ROW_REMOVE, this.removeRow.bind(this));

            // trigger selectedItems
            this.sandbox.on(ITEMS_GET_SELECTED, this.getSelectedItemsIds.bind(this));


            this.sandbox.on(DATA_GET, this.provideData.bind(this));

            // pagination dropdown item clicked
            this.sandbox.on('husky.dropdown.' + this.dropdownInstanceName + '.item.click', this.changePage.bind(this, null));

            // listen to search events
            if (!!this.options.searchInstanceName) {
                if (this.options.searchInstanceName !== '') {
                    searchInstanceName = '.' + this.options.searchInstanceName;
                }
                this.sandbox.on('husky.search' + searchInstanceName, this.triggerSearch.bind(this));
                this.sandbox.on('husky.search' + searchInstanceName + '.reset', this.triggerSearch.bind(this, ''));
            }

            // listen to search events
            if (this.options.columnOptionsInstanceName || this.options.columnOptionsInstanceName === '') {
                columnOptionsInstanceName = (this.options.columnOptionsInstanceName !== '') ? '.' + this.options.columnOptionsInstanceName : '';
                this.sandbox.on('husky.column-options' + columnOptionsInstanceName + '.saved', this.filterColumns.bind(this));
            }

            // listen for save event
            if (!!this.options.editable) {
                this.sandbox.on(DATA_SAVE, this.saveChangedData.bind(this));
            }

        },

        /**
         * Remembers value of previously focused editable field
         * Is used by isDataChanged to decide wether the value
         * changed or not
         */
        focusOnEditable: function(event) {
            var $td = this.sandbox.dom.parent(event.currentTarget),
                $tr = this.sandbox.dom.parent($td),
                field = this.sandbox.dom.data($td, 'field'),
                id = this.sandbox.dom.data($tr, 'id'),
                value = event.currentTarget.innerText;

            this.lastFocusedEditableElement = {
                id: id,
                field: field,
                value: value
            };
        },

        /**
         * Triggered when editable field looses focus
         */
        focusOutEditable: function(event) {
            var $td = this.sandbox.dom.parent(event.currentTarget),
                $tr = this.sandbox.dom.parent($td),
                field = this.sandbox.dom.data($td, 'field'),
                id = this.sandbox.dom.data($tr, 'id'),
                value = event.currentTarget.innerText,
                el;

            // last focused object should be same as the one previously left
            if (this.lastFocusedEditableElement.id === id) {
                if (this.lastFocusedEditableElement.value !== value) {

                    this.sandbox.emit(DATA_CHANGED);

                    // element already changed in the past and therefor in the changed data array
                    this.sandbox.util.each(this.changedData, function(index, value) {
                        if (value.id === id) {
                            el = value;
                        }
                    }.bind(this));

                    // changed for the first time
                    if (!el) {
                        el = {};
                        el.id = id;
                        el[field] = value;

                        this.changedData.push(el);

                        // changed changes
                    } else {
                        el[field] = value;
                    }
                }
            } else {
                this.sandbox.logger.log("Something went wrong!");
            }

        },

        /**
         * Saves the changes for an editable list
         * Triggered with the husky.datagrid.data.save event
         */
        saveChangedData: function() {

            var url = this.data.links.self,
                type = 'PATCH';

            // is validation configured
            if (!!this.options.validation) {
                // is invalid
                if (!this.sandbox.form.validate('#' + this.elId)) {
                    this.sandbox.logger.log("validation error...");
                    return;
                }
            }

            this.sandbox.logger.log("saving data...");

            if (!!this.changedData && this.changedData.length > 0) {
                this.sandbox.util.save(url, type, this.changedData)
                    .then(function() {
                        this.sandbox.emit(DATA_SAVED);
                    }.bind(this))
                    .fail(function() {
                        this.sandbox.logger.log("failed during save!");
                    }.bind(this));
            }
        },


        /**
         * Provides data of the list to the caller
         */
        provideData: function() {
            this.sandbox.emit(DATA_PROVIDE, this.data);
        },

        /**
         * Updates data in datagrid
         * Called when husky.datagrid.update event emitted
         * Emits husky.datagrid.updated event on success
         */
        updateHandler: function() {
            this.resetItemSelection();
            this.resetSortingOptions();

            this.load({
                url: this.data.links.self,
                success: function() {
                    this.removeLoader();
                    this.sandbox.emit(UPDATED);
                }.bind(this)
            });
        },

        /**
         * this will trigger a api search
         */
        triggerSearch: function(searchString) {

            var template, url,
            // TODO: get searchFields
                searchFields;

            this.addLoader();
            template = this.sandbox.uritemplate.parse(this.data.links.find);
            url = this.sandbox.uritemplate.expand(template, {searchString: searchString, searchFields: searchFields});

            this.load({
                url: url,
                success: function() {
                    this.removeLoader();
                    this.sandbox.emit(UPDATED, 'updated after search');
                }.bind(this)
            });
        },


        /**
         * is called when columns are changed
         */
        filterColumns: function(fieldsData) {


            var template, url,
                parsed = this.parseFieldsData(fieldsData);

            this.addLoader();

            template = this.sandbox.uritemplate.parse(this.data.links.filter);
            url = this.sandbox.uritemplate.expand(template, {fieldsList: parsed.urlFields.split(',')});

            this.options.columns = parsed.columns;

            this.load({
                url: url,
                success: function() {
                    this.removeLoader();
                    this.sandbox.emit(UPDATED, 'updated after search');
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

            // initialize validation
            if (!!this.options.validation) {
                this.sandbox.form.create('#' + this.elId);
            }
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
                this.sandbox.emit(ITEMS_SELECTED, this.selectedItemIds);
            }
        },

        templates: {

            showAll: function(total, elementsLabel, showAllLabel, id) {

                return ['<div class="show-all grid-col-4 m-top-10">', total, ' ', elementsLabel, ' (<a id="' + id + '" href="">', showAllLabel, '</a>)</div>'].join('');
            },

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
            }
        }
    };
});

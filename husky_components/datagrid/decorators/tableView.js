/**
 * @class TableView (Datagrid Decorator)
 * @constructor
 */
define(function() {

    'use strict';

    var datagrid,

        constants = {
            fullWidthClass: 'fullwidth',
            // if datagrid is in fullwidth-mode (options.fullWidth is true)
            // this number gets subracted from the datagrids final width in the resize listener
            overflowIconSpacing: 30
        },

        namespace = 'husky.datagrid.',

    /**
     * raised when item is deselected
     * @event husky.datagrid.item.deselect
     * @param {String} id of deselected item
     */
        ITEM_DESELECT = namespace + 'item.deselect',

    /**
     * raised when selection of items changes
     * @event husky.datagrid.number.selections
     */
        NUMBER_SELECTIONS = namespace + 'number.selections',

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
     * raised when row got removed
     * @event husky.datagrid.row.removed
     * @param {String} id of item that was removed
     */
        ROW_REMOVED = namespace + 'row.removed',

    /**
     * triggers husky.datagrid.items.selected event, which returns all selected item ids
     * @event husky.datagrid.items.get-selected
     * @param  {Function} callback function receives array of selected items
     */
        ITEMS_GET_SELECTED = namespace + 'items.get-selected',

    /**
     * raised when husky.datagrid.items.get-selected is triggered
     * @event husky.datagrid.items.selected
     * @param {Array} ids of all items that have been clicked
     */
        ITEMS_SELECTED = namespace + 'items.selected',

    /**
     * raised when data was saved
     * @event husky.datagrid.data.saved
     * @param {Object} data returned
     */
        DATA_SAVED = namespace + 'data.saved',

    /**
     * raised when save of data failed
     * @event husky.datagrid.data.save.failed
     * @param {String} text status
     * @param {String} error thrown
     *
     */
        DATA_SAVE_FAILED = namespace + 'data.save.failed',

    /**
     * raised when editable table is changed
     * @event husky.datagrid.data.save
     */
        DATA_CHANGED = namespace + 'data.changed',

    /**
     * used to update the table width and its containers due to responsiveness
     * @event husky.datagrid.update.table
     */
        UPDATE_TABLE = namespace + 'update.table',

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
     * calculates the width of a text by creating a tablehead element and measure its width
     * @param text
     * @param classArray
     * @param isSortable
     */
    getTextWidth = function(text, classArray, isSortable) {

        var elWidth, el,
            sortIconWidth = 0,
            paddings = 20;
        // handle css classes
        if (!classArray) {
            classArray = [];
        }
        if (isSortable) {
            classArray.push('is-sortable');
            sortIconWidth = 20;
        }
        classArray.push('is-selected');

        el = this.sandbox.dom.createElement('<table style="width:auto"><thead><tr><th class="' + classArray.join(',') + '">' + text + '</th></tr></thead></table>');
        this.sandbox.dom.css(el, {
            'position': 'absolute',
            'visibility': 'hidden',
            'height': 'auto',
            'width': 'auto'
        });
        this.sandbox.dom.append('body', el);

        // text width + paddings and sorting icon
        elWidth = this.sandbox.dom.width(el) + paddings + sortIconWidth;

        this.sandbox.dom.remove(el);

        return elWidth;
    };

    return {

        /**
         * Method to render data in table view
         */
        render: function(context) {
            // context of the datagrid-component
            datagrid = context;

            // make options available in this-context
            this.options = datagrid.options;

            // make sandbox available in this-context
            this.sandbox = datagrid.sandbox;

            this.setVariables();
            this.bindCustomEvents();

            this.$tableContainer = this.sandbox.dom.createElement('<div class="table-container"/>');
            this.sandbox.dom.append(datagrid.$element, this.$tableContainer);
            this.sandbox.dom.append(this.$tableContainer, this.prepareTable());

            this.bindDomEvents();
            this.onResize();
        },

        /**
         * Binds custom events to the datagrid related to this
         * view (like an extension)
         */
        bindCustomEvents: function() {
            // listen for public events
            this.sandbox.on(ROW_ADD, this.addRow.bind(this));

            this.sandbox.on(ROW_REMOVE, this.removeRow.bind(this));

            // trigger selectedItems
            this.sandbox.on(ITEMS_GET_SELECTED, this.getSelectedItemsIds.bind(this));

            // checks table width
            this.sandbox.on(UPDATE_TABLE, this.onResize.bind(this));
        },

        /**
         * Binds Dom related events for this table-view
         */
        bindDomEvents: function() {
            // prevent multiple events
            this.sandbox.dom.unbind(this.sandbox.dom.find('*', datagrid.$element));
            this.sandbox.dom.unbind(datagrid.$element);

            if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                datagrid.$element.on('click', 'tbody > tr input[type="checkbox"]', this.selectItem.bind(this));
                datagrid.$element.on('click', 'th.select-all', this.selectAllItems.bind(this));
            } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                datagrid.$element.on('click', 'tbody > tr input[type="radio"]', this.selectItem.bind(this));
            }

            if (this.options.removeRow) {
                datagrid.$element.on('click', '.remove-row > span', this.prepareRemoveRow.bind(this));
            }

            datagrid.$element.on('click', 'tbody > tr', function(event) {
                if (!this.sandbox.dom.$(event.target).is('input') && !this.sandbox.dom.$(event.target).is('span.icon-remove')) {
                    var id = this.sandbox.dom.$(event.currentTarget).data('id');

                    if (!!id) {
                        this.sandbox.emit(ITEM_CLICK, id);
                    } else {
                        this.sandbox.emit(ITEM_CLICK, event);
                    }
                }
            }.bind(this));
        },

        /**
         * Sets the components starting properties
         */
        setVariables: function() {
            this.dropdownInstanceName = 'datagrid-pagination-dropdown';
            this.allItemIds = [];
            this.selectedItemIds = [];
            this.rowStructure = [];
            this.elId = this.sandbox.dom.attr(this.$el, 'id');
            this.currentUrl = '';
            this.$tableContainer = null;
            this.$table;

            if (!!this.options.contentContainer) {
                if (this.sandbox.dom.css(this.options.contentContainer, 'max-width') === 'none') {
                    this.originalMaxWidth = null;
                } else {
                    this.originalMaxWidth = datagrid.getNumberAndUnit(this.sandbox.dom.css(this.options.contentContainer, 'max-width')).number;
                }
                this.contentMarginRight = datagrid.getNumberAndUnit(this.sandbox.dom.css(this.options.contentContainer, 'margin-right')).number;
                this.contentPaddings = datagrid.getNumberAndUnit(this.sandbox.dom.css(this.options.contentContainer, 'padding-right')).number;
                this.contentPaddings += datagrid.getNumberAndUnit(this.sandbox.dom.css(this.options.contentContainer, 'padding-left')).number;
            } else {
                this.contentMarginRight = 0;
                this.contentPaddings = 0;
            }

            this.domId = 0;

            this.bottomTabIndex = this.options.startTabIndex || 49999;
            this.topTabIndex = this.options.startTabIndex || 50000;

            this.errorInRow = [];

            this.sort = {
                ascClass: 'icon-arrow-up',
                descClass: 'icon-arrow-down',
                additionalClasses: ' m-left-5 small-font'
            };
        },

        /**
         * Perapres the structure of the datagrid when element type is table
         * @returns {table} returns table element
         */
        prepareTable: function() {
            var $table, $thead, $tbody, tblClasses;

            this.$table = $table = this.sandbox.dom.createElement('<table' + (!!this.options.validationDebug ? 'data-debug="true"' : '' ) + '/>');

            if (!!datagrid.data.head || !!this.options.columns) {
                $thead = this.sandbox.dom.createElement('<thead/>');
                $thead.append(this.prepareTableHead());
                $table.append($thead);
            }

            if (!!datagrid.data.embedded) {
                if (!!this.options.appendTBody) {
                    $tbody = this.sandbox.dom.createElement('<tbody/>');
                }
                this.sandbox.dom.append($tbody, this.prepareTableRows());
                this.sandbox.dom.append($table, $tbody);
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
            var tblColumns, tblCellClass, headData, widthValues, checkboxValues, dataAttribute, isSortable,
                tblColumnStyle, minWidth;

            tblColumns = [];
            headData = this.options.columns || datagrid.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItem && this.options.selectItem.type) {

                // default values
                if (this.options.selectItem.width) {
                    checkboxValues = datagrid.getNumberAndUnit(this.options.selectItem.width);
                }

                minWidth = checkboxValues.number + checkboxValues.unit;

                tblColumns.push(
                    '<th class="select-all" ', 'style="width:' + minWidth + ';max-width:' + minWidth + ';min-width:' + minWidth + ';"', ' >');

                if (this.options.selectItem.type === 'checkbox') {
                    tblColumns.push(this.templates.checkbox({ id: 'select-all' }));
                }

                tblColumns.push('</th>');
            }

            this.rowStructure = [];

            // value used for correct tabindex when row added at top of table
            this.tabIndexParam = 1;

            headData.forEach(function(column) {

                isSortable = false;

                if (!!datagrid.data.links && !!datagrid.data.links.sortable) {

                    //is column sortable - check with received sort-links
                    this.sandbox.util.each(datagrid.data.links.sortable, function(index) {
                        if (index === column.attribute) {
                            isSortable = true;
                            return false;
                        }
                    }.bind(this));
                }

                // calculate width
                tblColumnStyle = [];
                if (column.width) {
                    minWidth = column.width;
                } else if (column.minWidth) {
                    minWidth = column.minWidth;
                } else {
                    minWidth = getTextWidth.call(this, column.content, [], isSortable);
                    minWidth = (minWidth > datagrid.getNumberAndUnit(this.options.columnMinWidth).number) ? minWidth + 'px' : this.options.columnMinWidth;

                }
                tblColumnStyle.push('min-width:' + minWidth);
                column.minWidth = minWidth;

                // get width and measureunit
                if (!!column.width) {
                    widthValues = datagrid.getNumberAndUnit(column.width);
                    tblColumnStyle.push('max-width:' + widthValues.number + widthValues.unit);
                    tblColumnStyle.push('width:' + widthValues.number + widthValues.unit);
                }

                // add to row structure when valid entry
                if (column.attribute !== undefined) {
                    this.rowStructure.push({
                        attribute: column.attribute,
                        editable: column.editable,
                        validation: column.validation,
                        type: column.type
                    });

                    if (!!column.editable) {
                        this.tabIndexParam++;
                    }
                }


                // add html to table header cell if sortable
                if (!!isSortable) {
                    dataAttribute = ' data-attribute="' + column.attribute + '"';
                    tblCellClass = ((!!column.class) ? ' class="' + column.class + ' is-sortable"' : ' class="is-sortable"');
                    tblColumns.push('<th' + tblCellClass + ' style="' + tblColumnStyle.join(';') + '" ' + dataAttribute + '>' + column.content + '<span></span></th>');
                } else {
                    tblCellClass = ((!!column.class) ? ' class="' + column.class + '"' : '');
                    tblColumns.push('<th' + tblCellClass + ' style="' + tblColumnStyle.join(';') + '" >' + column.content + '</th>');
                }

            }.bind(this));

            // remove-row entry
            if (this.options.removeRow || this.options.progressRow) {
                tblColumns.push('<th style="width:30px;"/>');
            }

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        /**
         * Itterates over all items and prepares the rows
         * @returns {string} returns a string of all rows
         */
        prepareTableRows: function() {
            var tblRows;

            tblRows = [];
            this.allItemIds = [];

            if (!!datagrid.data.embedded) {
                datagrid.data.embedded.forEach(function(row) {
                    tblRows.push(this.prepareTableRow(row, false));
                }.bind(this));
            }

            return tblRows.join('');
        },

        prepareTableRow: function(row, triggeredByAddRow) {

            if (!!(this.options.template && this.options.template.row)) {

                return this.sandbox.template.parse(this.options.template.row, row);

            } else {

                var radioPrefix, key, i;
                this.tblColumns = [];
                this.tblRowAttributes = ' data-dom-id="dom-' + this.options.instance + '-' + this.domId + '"';
                this.domId++;

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

                    if (!!triggeredByAddRow && !!this.options.addRowTop) {
                        this.bottomTabIndex -= (this.tabIndexParam + 1);
                    }

                    this.rowStructure.forEach(function(key, index) {
                        key.editable = key.editable || false;
                        this.createRowCell(key.attribute, row[key.attribute], key.type, key.editable, key.validation, triggeredByAddRow, index);
                    }.bind(this));

                } else {
                    i = 0;
                    for (key in row) {
                        if (row.hasOwnProperty(key)) {
                            this.createRowCell(key, row[key], null, false, null, triggeredByAddRow, i);
                            i++;
                        }
                    }
                }

                if (!!this.options.removeRow) {
                    this.tblColumns.push('<td class="remove-row">', this.templates.removeRow(), '</td>');
                } else if (!!this.options.progressRow) {
                    this.tblColumns.push('<td class="progress-row">', this.templates.progressRow(), '</td>');
                }

                return '<tr' + this.tblRowAttributes + '>' + this.tblColumns.join('') + '</tr>';
            }
        },

        /**
         * Sets the value of row cell and the data-id attribute for the row
         * @param key attribute name
         * @param value attribute value
         * @param type {String} The type of the cell. Used to call a function to manipulate the content
         * @param editable flag whether field is editable or not
         * @param validation information for field
         * @param triggeredByAddRow triggered trough add row
         * @param index
         */
        createRowCell: function(key, value, type, editable, validation, triggeredByAddRow, index) {
            var tblCellClasses,
                tblCellContent,
                tblCellStyle,
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

                if (!!this.options.validation && !!validation) {
                    for (k in validation) {
                        validationAttr += ['data-validation-', k, '="', validation[k], '" '].join('');
                    }
                }

                tblCellStyle = 'style="max-width:' + this.options.columns[index].minWidth + '"';

                // call the type manipulate to manipulate the content of the cell
                if (!!type) {
                    tblCellContent = datagrid.manipulateContent(tblCellContent, type);
                }

                if (!!editable) {

                    if (!!triggeredByAddRow) {

                        // differentiate for tab index
                        if (!!this.options.addRowTop) {
                            this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' ><span class="editable" style="display: none">' + tblCellContent + '</span><input type="text" class="form-element editable-content" tabindex="' + this.bottomTabIndex + '" value="' + tblCellContent + '"  ' + validationAttr + '/></td>');
                            this.bottomTabIndex++;
                        } else {
                            this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' ><span class="editable" style="display: none">' + tblCellContent + '</span><input type="text" class="form-element editable-content" tabindex="' + this.topTabIndex + '" value="' + tblCellContent + '"  ' + validationAttr + '/></td>');
                            this.topTabIndex++;
                        }

                    } else {
                        this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' ><span class="editable">' + tblCellContent + '</span><input type="text" class="form-element editable-content hidden" value="' + tblCellContent + '" tabindex="' + this.topTabIndex + '" ' + validationAttr + '/></td>');
                        this.topTabIndex++;

                    }

                } else {
                    this.tblColumns.push('<td data-field="' + key + '" ' + tblCellClass + ' ' + tblCellStyle + '>' + tblCellContent + '</td>');
                }
            } else {
                this.tblRowAttributes += ' data-' + key + '="' + value + '"';
            }
        },

        /**
         * Adds a row to the datagrid
         * @param row
         */
        addRow: function(row) {
            var $table, $row, $firstInputField, $checkbox;
            // check for other element types when implemented
            $table = this.$tableContainer.find('table');
            $row = this.sandbox.dom.$(this.prepareTableRow(row, true));

            // when unsaved new row exists - save it
            this.prepareSave();

            // prepend or append row
            if (!!this.options.addRowTop) {
                this.sandbox.dom.prepend($table, $row);
            } else {
                this.sandbox.dom.append($table, $row);
            }

            $firstInputField = this.sandbox.dom.find('input[type=text]', $row)[0];
            this.sandbox.dom.focus($firstInputField);

            if (!!this.options.editable) {
                this.lastFocusedRow = this.getInputValuesOfRow($row);
            }

            // if allchecked then disable top checkbox after adding new row
            if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                $checkbox = this.sandbox.dom.find('#select-all', this.$el);
                if (this.sandbox.dom.hasClass($checkbox, 'is-selected')) {
                    this.sandbox.dom.prop($checkbox, 'checked', false);
                    this.sandbox.dom.removeClass($checkbox, 'is-selected');
                }
            }
        },

        /**
         * Perparse to save new/changed data includes validation
         */
        prepareSave: function() {

            if (!!this.lastFocusedRow) {

                var $tr = this.sandbox.dom.find('tr[data-dom-id=' + this.lastFocusedRow.domId + ']', this.$tableContainer),
                    lastFocusedRowCurrentData = this.getInputValuesOfRow($tr),

                    data = {},
                    key,
                    url,
                    isValid = true,
                    valuesChanged = false,
                    isDataEmpty;

                data.id = lastFocusedRowCurrentData.id;

                // validate locally
                if (!!this.options.validation && !this.sandbox.form.validate('#' + this.elId)) {
                    isValid = false;
                }

                isDataEmpty = this.isDataRowEmpty(lastFocusedRowCurrentData.fields);

                // do nothing when data is not valid or no data exists
                if (!!isValid && !isDataEmpty) {

                    // check which values changed and remember these
                    for (key in lastFocusedRowCurrentData.fields) {
                        if (this.lastFocusedRow.fields.hasOwnProperty(key) && this.lastFocusedRow.fields[key] !== lastFocusedRowCurrentData.fields[key]) {
                            data[key] = lastFocusedRowCurrentData.fields[key];
                            valuesChanged = true;
                        }
                    }

                    // trigger save action when data changed
                    if (!!valuesChanged || true) {
                        this.sandbox.emit(DATA_CHANGED);
                        url = this.getUrlWithoutParams();

                        // save via put
                        if (!!data.id) {
                            this.save(data, 'PUT', url + '/' + data.id, $tr, this.lastFocusedRow.domId);

                            // save via post
                        } else {
                            this.save(data, 'POST', url, $tr, this.lastFocusedRow.domId);
                        }

                        // reset last focused row after save
                        this.lastFocusedRow = null;

                    } else if (this.errorInRow.indexOf(this.lastFocusedRow.domId) !== -1) {
                        this.sandbox.logger.log("Error in table row!");

                    } else {
                        // nothing changed - reset immediately
                        this.sandbox.logger.log("No data changed!");
                        this.resetRowInputFields($tr);
                        this.unlockWidthsOfColumns(this.sandbox.dom.find('table th', this.$el));
                    }

                } else {
                    this.sandbox.logger.log("There seems to be some invalid or empty data!");
                }

            }
        },

        /**
         * Checks wether data is in row or not
         * @param data fields object
         */
        isDataRowEmpty: function(data) {

            var isEmpty = true, field;

            for (field in data) {
                if (data[field] !== '') {
                    isEmpty = false;
                    break;
                }
            }

            return isEmpty;
        },

        /**
         * Saves changes
         * @param data
         * @param method
         * @param url
         * @param $tr table row
         * @param domId
         */
        save: function(data, method, url, $tr, domId) {

            var message;

            this.sandbox.logger.log("data to save", data);

            this.sandbox.util.save(url, method, data)
                .then(function(data, textStatus) {

                    // remove row from error list
                    if (this.errorInRow.indexOf(domId) !== -1) {
                        this.errorInRow.splice(this.errorInRow.indexOf(domId), 1);
                    }

                    this.sandbox.emit(DATA_SAVED, data, textStatus);
                    this.resetRowInputFields($tr);
                    this.unlockWidthsOfColumns(this.sandbox.dom.find('table th', this.$el));

                    // set new returned data
                    this.setDataForRow($tr[0], data);

                }.bind(this))
                .fail(function(jqXHR, textStatus, error) {
                    this.sandbox.emit(DATA_SAVE_FAILED, textStatus, error);

                    // remember row with error
                    if (this.errorInRow.indexOf(domId) === -1) {
                        this.errorInRow.push(domId);
                    }

                    message = JSON.parse(jqXHR.responseText);

                    // error in context with database constraints
                    if (!!message.field) {
                        this.showValidationError($tr, message.field);
                    } else {
                        this.sandbox.logger.error("An error occured during save of changed data!");
                    }

                }.bind(this));
        },

        /**
         *  Hides input fields and displays new content for table row
         * @param $tr
         */
        resetRowInputFields: function($tr) {

            var $inputFields = this.sandbox.dom.find('input[type=text]:not(.hidden)', $tr),
                content, $span;

            this.sandbox.util.each($inputFields, function(index, $field) {

                // remove css class for server side validation error
                // TODO: remove this when validation type is implemented
                if (this.sandbox.dom.hasClass($field, 'server-validation-error')) {
                    this.sandbox.dom.removeClass($field, 'server-validation-error');
                }

                content = this.sandbox.dom.$($field).val();
                $span = this.sandbox.dom.prev($field, '.editable');
                $span.text(content);

                this.sandbox.dom.addClass($field, 'hidden');
                this.sandbox.dom.show($span);

            }.bind(this));
        },

        /**
         * Resets the min-width of columns and
         * @param $th array of th elements
         */
        unlockWidthsOfColumns: function($th) {
            if (!!this.columnWidths) {
                this.sandbox.dom.each($th, function(index, $el) {
                    // skip columns without data-attribute because the have min/max and normal widths by default
                    if (!!this.sandbox.dom.data($el, 'attribute')) {
                        this.sandbox.dom.css($el, 'min-width', this.columnWidths[index]);
                        this.sandbox.dom.css($el, 'max-width', '');
                        this.sandbox.dom.css($el, 'width', '');
                    }
                }.bind(this));
            }
        },

        /**
         * Sets the data for a row
         * @param $tr dom row
         * @param data
         */
        setDataForRow: function($tr, data) {

            var editables, field, $input;

            // set id
            this.sandbox.dom.data($tr, 'id', data.id);
            this.sandbox.dom.attr($tr, 'data-id', data.id);

            this.sandbox.util.each(this.sandbox.dom.find('td', $tr), function(index, $el) {

                editables = this.sandbox.dom.find('.editable', $el);
                field = this.sandbox.dom.data($el, 'field');
                $input = this.sandbox.dom.find('input[type=text]', $el);

                if (!!field) {
                    if (!!editables && editables.length === 1) { // set values in spans
                        this.sandbox.dom.html(editables[0], data[field]);
                        this.sandbox.dom.val($input, data[field]);
                    } else { // set values in td
                        this.sandbox.dom.html($el, data[field]);
                    }
                }

            }.bind(this));
        },

        /**
         * Sets the validation error class for a dom element
         * @param $domElement
         * @param field name of field which caused the error
         */
        showValidationError: function($domElement, field) {

            var $td = this.sandbox.dom.find('td[data-field=' + field + ']', $domElement)[0],
                $input = this.sandbox.dom.find('input', $td)[0];

            if (this.sandbox.dom.hasClass($td, 'husky-validate-success')) {
                this.sandbox.dom.removeClass($td, 'husky-validate-success');
            }

            this.sandbox.dom.addClass($td, 'husky-validate-error');

            // add class for serverside validation error
            // TODO remove this when correct validation type is implmented
            if (!this.sandbox.dom.hasClass($input, 'server-validation-error')) {
                this.sandbox.dom.addClass($input, 'server-validation-error');
            }
        },

        /**
         * Returns an object with the current values of the inputfields, id and domId
         * @param $tr table row
         * @returns {{domId: *, id: *, fields: Array}}
         */
        getInputValuesOfRow: function($tr) {

            var id = this.sandbox.dom.data($tr, 'id'),
                domId = this.sandbox.dom.data($tr, 'dom-id'),
                $inputs = this.sandbox.dom.find('input[type=text]', $tr),
                fields = [], field, $td;

            this.sandbox.dom.each($inputs, function(index, $input) {
                $td = this.sandbox.dom.parent($input, 'td');
                field = this.sandbox.dom.data($td, 'field');

                fields[field] = $input.value;

            }.bind(this));
            return {
                domId: domId,
                id: id,
                fields: fields
            };

        },

        /**
         * Returns selected items either via callback or else via husky.datagrid.items.selected event
         * Gets called on husky.datagrid.items.get-selected event
         * @param callback
         */
        getSelectedItemsIds: function(callback) {

            // get selected items
            var ids = this.getIdsOfSelectedRows();

            if (typeof callback === 'function') {
                callback(ids);
            } else {
                this.sandbox.emit(ITEMS_SELECTED, ids);
            }
        },

        /**
         * Returns an array with the ids of the selected rows
         */
        getIdsOfSelectedRows: function() {
            var $checkboxes = this.sandbox.dom.find('input[type=checkbox]:checked', this.$el),
                ids = [],
                id,
                $tr;

            this.sandbox.util.each($checkboxes, function(index, $checkbox) {
                $tr = this.sandbox.dom.closest($checkbox, 'tr');
                id = this.sandbox.dom.data($tr, 'id');
                if (!!id) {
                    ids.push(id);
                }

            }.bind(this));

            return ids;
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

            var $element, $tblRow, id, $editableElements, $checkboxes;

            if (typeof event === 'object') {
                $element = this.sandbox.dom.$(event.currentTarget);
                $tblRow = this.sandbox.dom.closest($element, 'tr')[0];
                id = this.sandbox.dom.data($tblRow, 'id');
            } else {
                id = event;
                $tblRow = this.sandbox.dom.find('tr[data-id="' + id + '"]')[0];
            }

            // remove row elements from validation
            if (!!this.options.validation) {
                $editableElements = this.sandbox.dom.find('.editable', $tblRow);
                this.sandbox.util.each($editableElements, function(index, $element) {
                    this.sandbox.form.removeField('#' + this.elId, $element);
                }.bind(this));
            }

            this.sandbox.emit(ROW_REMOVED, event);
            this.sandbox.dom.remove($tblRow);

            // when last table row was removed, uncheck thead checkbox if exists
            $checkboxes = this.sandbox.dom.find('input[type=checkbox]', this.$el);
            if ($checkboxes.length === 1) {
                this.sandbox.dom.removeClass('is-selected', $checkboxes[0]);
                this.sandbox.dom.prop($checkboxes[0], 'checked', false);
            }

        },

        /**
         * Gets automatically executed on window resize
         * responsible for the responsiveness
         */
        onResize: function() {
            var finalWidth,
                contentPaddings = 0,
                content = !!this.options.contentContainer ? this.options.contentContainer : this.$el,
                tableWidth = this.sandbox.dom.width(this.$table),
                tableOffset = this.sandbox.dom.offset(this.$table),
                contentWidth = this.sandbox.dom.width(content),
                windowWidth = this.sandbox.dom.width(this.sandbox.dom.window),
                overlaps = false,
                originalMaxWidth = contentWidth;

            tableOffset.right = tableOffset.left + tableWidth;


            if (!!this.options.contentContainer && !!this.originalMaxWidth) {
                // get original max-width and right margin
                originalMaxWidth = this.originalMaxWidth;
                contentPaddings = this.contentPaddings;
            }

            // if table is greater than max content width
            if (tableWidth > originalMaxWidth - contentPaddings && contentWidth < windowWidth - tableOffset.left) {
                // adding this class, forces table cells to shorten long words
                this.sandbox.dom.addClass(datagrid.$element, 'oversized');
                overlaps = true;
                // reset table width and offset
                tableWidth = this.sandbox.dom.width(this.$table);
                tableOffset.right = tableOffset.left + tableWidth;
            }

            // tablecontainer should have width of table in normal cases
            finalWidth = tableWidth;

            // if table > window-size set width to available space
            if (tableOffset.right + this.contentMarginRight > windowWidth) {
                finalWidth = windowWidth - tableOffset.left;
            } else {
                // set scroll position back
                this.sandbox.dom.scrollLeft(datagrid.$element, 0);
            }

            // width is not allowed to be smaller than the width of content
            if (finalWidth < contentWidth) {
                finalWidth = contentWidth;
            }

            // if contentContainer is set, adapt maximum size
            if (!!this.options.contentContainer) {
                this.sandbox.dom.css(this.options.contentContainer, 'max-width', finalWidth + contentPaddings);
                finalWidth = this.sandbox.dom.width(this.options.contentContainer);
                if (!overlaps) {
                    // if table does not overlap border, set content to original width
                    this.sandbox.dom.css(this.options.contentContainer, 'max-width', '');
                }
            }

            if (this.options.fullWidth === true) {
                finalWidth = finalWidth - constants.overflowIconSpacing;
            }

            // now set width
            this.sandbox.dom.width(datagrid.$element, finalWidth);

            // check scrollwidth and add class
            if (this.sandbox.dom.get(this.$tableContainer, 0).scrollWidth > finalWidth) {
                this.sandbox.dom.addClass(this.$tableContainer, 'overflow');
            } else {
                this.sandbox.dom.removeClass(this.$tableContainer, 'overflow');
            }
        },

        /**
         * Selectes or deselects the clicked item
         * @param event
         */
        selectItem: function(event) {
            event.stopPropagation();

            // Todo review handling of events for new rows in datagrid (itemId empty?)

            var $element, itemId, oldSelectionId, parentTr;

            $element = this.sandbox.dom.$(event.currentTarget);

            if (!$element.is('input')) {
                $element = this.sandbox.dom.find('input', this.sandbox.dom.parent($element));
            }

            parentTr = this.sandbox.dom.parents($element, 'tr');
            itemId = this.sandbox.dom.data(parentTr, 'id');

            if ($element.attr('type') === 'checkbox') {

                if (this.sandbox.dom.prop($element, 'checked') === false) {
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

                this.sandbox.emit(NUMBER_SELECTIONS, this.getIdsOfSelectedRows().length);

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

            var $headCheckbox = this.sandbox.dom.find('th input[type="checkbox"]', this.$tableContainer)[0],
                $checkboxes = this.sandbox.dom.find('input[type="checkbox"]', this.$tableContainer),
                selectedElements,
                tmp;

            if (this.sandbox.dom.prop($headCheckbox, 'checked') === false) {
                this.sandbox.dom.prop($checkboxes, 'checked', false);
                this.sandbox.dom.removeClass($checkboxes, 'is-selected');
                this.sandbox.emit(ALL_DESELECT);
            } else {
                this.sandbox.dom.prop($checkboxes, 'checked', true);
                this.sandbox.dom.addClass($checkboxes, 'is-selected');
                this.sandbox.emit(ALL_SELECT, this.getIdsOfSelectedRows());
            }

            tmp = this.sandbox.dom.find('input[type="checkbox"]:checked', this.$tableContainer).length - 1;
            selectedElements = tmp > 0 ? tmp : 0;

            this.sandbox.emit(NUMBER_SELECTIONS, selectedElements);
        },

        templates: {

            showElements: function(id) {
                var desc = '';
                if (datagrid.data.total === datagrid.data.numberOfAll) {
                    desc = this.sandbox.translate('pagination.show-all-elements');
                } else {
                    desc = this.sandbox.translate('pagination.show') +' <strong>'+ datagrid.data.total +'</strong> '+ this.sandbox.translate('pagination.elements-of') +' '+ datagrid.data.numberOfAll;
                }

                return [
                    '<div class="show-elements">',
                    '<div class="dropdown-trigger" id="'+ id +'">'+ desc +'<span class="dropdown-toggle"></span></div>',
                    '</div>'
                ].join('');
            },

            removeRow: function() {
                return [
                    '<span class="icon-remove pointer"></span>'
                ].join('');
            },

            progressRow: function() {
                return [
                    '<span class=""></span>'
                ].join('');
            },

            checkbox: function(data) {
                var id, name;

                data = data || {};
                id = (!!data.id) ? ' id="' + data.id + '"' : '';
                name = (!!data.name) ? ' name="' + data.name + '"' : '';

                return [
                    '<div class="custom-checkbox">',
                    '<input', id, name, ' type="checkbox" data-form="false"/>',
                    '<span class="icon"></span>',
                    '</div>'
                ].join('');
            },

            radio: function(data) {
                var id, name;

                data = data || {};
                id = (!!data.id) ? ' id="' + data.id + '"' : '';
                name = (!!data.name) ? ' name="' + data.name + '"' : '';

                return [
                    '<div class="custom-radio">',
                    '<input', id, name, ' type="radio"/>',
                    '<span class="icon"></span>',
                    '</div>'
                ].join('');
            }
        }
    };
});

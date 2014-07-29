/**
 * @class TableView (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [viewOptions] Configuration object
 * @param {Boolean} [options.editable] will not set class is-selectable to prevent hover effect for complete rows
 * @param {String} [options.className] additional classname for the wrapping div
 * @param {Boolean} [options.removeRow] displays in the last column an icon to remove a row
 * @param {Object} [options.selectItem] Configuration object of select item (column)
 * @param {Boolean} [options.selectItem.inFirstCell] If true checkbox is in the first cell. If true checkbox gets its own cell
 * @param {String} [options.selectItem.type] Type of select [checkbox, radio]
 * @param {Boolean} [options.validation] enables validation for datagrid
 * @param {Boolean} [options.validationDebug] enables validation debug for datagrid
 * @param {Boolean} [options.addRowTop] adds row to the top of the table when add row is triggered
 * @param {Boolean} [options.startTabIndex] start index for tabindex
 * @param {String} [options.columnMinWidth] sets the minimal width of table columns
 * @param {String} [options.fullWidth] If true datagrid style will be full-width mode
 * @param {Array} [options.excludeFields=['id']] array of fields to exclude by the view
 * @param {Boolean} [options.showHead] if TRUE head would be showed
 * @param {Array} [options.icons] array of icons to display
 * @param {String} [options.icons[].icon] the actual icon which sould be displayed
 * @param {String} [options.icons[].column] the id of the column in which the icon should be displayed
 * @param {String} [options.icons[].align] the align of the icon. 'left' org 'right'
 * @param {Function} [options.icons.callback] a callback to execute if the icon got clicked. Gets the id of the data-record as first argument
 * @param {Boolean} [options.hideChildrenAtBeginning] if true children get hidden, if all children are loaded at the beginning
 * @param {String|Number|Null} [options.openChildId] the id of the children to open all parents for. (only relevant in a child-list)
 * @param {String|Number|Null} [options.cssClass] css-class to give the the components element. (e.g. "white-box")
 * @param {Boolean} [options.highlightSelected] highlights the clicked row when selected
 * @param {Boolean} [options.dblClick] emits the clicked event only when a double click is registered
 *
 * @param {Boolean} [rendered] property used by the datagrid-main class
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the view and unbind events
 * @param {Function} [onResize] function which gets automatically executed on window resize
 * @param {Function} [unbindCustomEvents] function to unbind the custom events of this object
 */
define(function() {

    'use strict';

    var defaults = {
            editable: false,
            className: 'datagridcontainer',
            fullWidth: false,
            removeRow: false,
            selectItem: {
                type: 'checkbox',      // checkbox, radio button
                inFirstCell: false
            },
            validation: false, // TODO does not work for added rows
            validationDebug: false,
            addRowTop: true,
            startTabIndex: 99999,
            excludeFields: [''],
            cssClass: null,
            columnMinWidth: '70px',
            thumbnailFormat: '50x50',
            showHead: true,
            hideChildrenAtBeginning: true,
            openChildId: null,
            highlightSelected: false,
            dblClick: false,
            icons: []
        },

        constants = {
            viewClass: 'table-container',
            fullWidthClass: 'fullwidth',
            // if datagrid is in fullwidth-mode (options.fullWidth is true)
            // this number gets subracted from the tables final width in the resize listener
            overflowIconSpacing: 30,
            ascClass: 'fa-caret-up',
            descClass: 'fa-caret-down',
            additionalHeaderClasses: ' m-left-5 small-font',
            rowRemoverClass: 'row-remover',
            editableClass: 'editable',
            selectAllName: 'select-all',
            isSelectedClass: 'is-selected',
            isSelectableClass: 'is-selectable',
            sortableClass: 'is-sortable',
            tableClass: 'table',
            serverValidationError: 'server-validation-error',
            oversizedClass: 'oversized',
            overflowClass: 'overflow',
            thumbSrcKey: 'url',
            thumbAltKey: 'alt',
            sortLoaderClass: 'sort-loader',
            childrenSlideDownIcon: 'fa-caret-right',
            childrenSlideUpIcon: 'fa-caret-down',
            slideDownClass: 'children-toggler',
            noChildrenClass: 'no-children',
            childrenIndentClass: 'child-indent',
            childrenLoadedClass: 'children-loaded',
            noHeadClass: 'no-head',
            selected: 'selected',
            childrenIndentPx: 25 //px
        },

        /**
         * Templates used by this class
         */
        templates = {
            removeRow: [
                '<td class="remove-row">',
                    '<span class="fa-trash-o pointer ' + constants.rowRemoverClass + '"></span>',
                '</td>'
            ].join(''),

            checkboxPlaceholder: '<span class="checkbox-placeholder"></span>',

            checkbox: [
                '<div class="custom-checkbox">',
                '<input id="<%= id %>" type="checkbox" data-form="false"<% if (!!checked) { %> checked<% } %>/>',
                '<span class="icon"></span>',
                '</div>'
            ].join(''),

            icon: [
                '<span class="grid-icon <%= align %>">',
                    '<span class="fa-<%= icon %>"></span>',
                '</span>'
            ].join(''),

            checkboxCell: [
                '<td class="checkbox-cell">',
                '<%= checkbox %>',
                '</td>'
            ].join(''),

            radio: [
                '<td>',
                '<div class="custom-radio">',
                '<input name="<%= name %>" type="radio"/>',
                '<span class="icon"></span>',
                '</div>',
                '</td>'
            ].join('')
        },

        /**
         * used to update the table width and its containers due to responsiveness
         * @event husky.datagrid.update.table
         */
        UPDATE_TABLE = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'update.table');
        },

        /**
         * used to update the table width and its containers due to responsiveness
         * @event husky.datagrid.table.open-child
         * @param {Number|String} id The id of the data-record to open the parents for
         */
        OPEN_PARENTS = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'table.open-parents');
        },

        /**
         * triggered when a radio button inside the datagrid is clicked
         * @event husky.datagrid.table.open-child
         * @param {Number|String} id The id of the data-record to open the parents for
         * @param {String} columnName column name
         */
        RADIO_SELECTED = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'radio.selected');
        },

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
                classArray.push(constants.sortableClass);
                sortIconWidth = 20;
            }
            classArray.push(constants.isSelectedClass);

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
         * Initializes the view, gets called only once
         * @param {Object} context The context of the datagrid class
         * @param {Object} options The options used by the view
         */
        initialize: function(context, options) {
            // store context of the datagrid-component
            this.datagrid = context;

            // make sandbox available in this-context
            this.sandbox = this.datagrid.sandbox;

            // merge defaults with options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
            this.bindCustomEvents();
        },

        /**
         * Method to render data in table view
         */
        render: function(data, $container) {
            var selected = null;
            this.data = data;
            this.$el = $container;

            this.$tableContainer = this.sandbox.dom.createElement('<div class="' + constants.viewClass + '"/>');
            this.sandbox.dom.append(this.$el, this.$tableContainer);
            this.sandbox.dom.append(this.$tableContainer, this.prepareTable());

            // add full-width class if configured
            if (this.options.fullWidth === true) {
                this.sandbox.dom.addClass(this.$el, constants.fullWidthClass);
            }

            // add custom-css class
            if (!!this.options.cssClass) {
                this.sandbox.dom.addClass(this.$el, this.options.cssClass);
            }

            this.bindDomEvents();
            if (this.datagrid.options.resizeListeners === true) {
                this.onResize();
            }

            // initialize validation
            if (!!this.options.validation) {
                this.sandbox.form.create(this.datagrid.$el);
            }

            this.setHeaderClasses();

            // try to open all parents for a child if configured
            if (!!this.options.openChildId) {
                this.openAllParents(this.options.openChildId);
                this.options.openChildId = null;
            }
            // try to open all parents for selected records
            selected = this.datagrid.getSelectedItemIds.call(this.datagrid);
            this.sandbox.util.foreach(selected, function(recordId) {
                this.openAllParents(recordId);
            }.bind(this));

            this.rendered = true;
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.unbindDomEvents();
            //this.sandbox.stop(this.sandbox.dom.find('*', this.$tableContainer));
            // remove full-width class if configured
            if (this.options.fullWidth === true) {
                this.sandbox.dom.removeClass(this.$el, constants.fullWidthClass);
            }
            // remove configured css-class
            if (!!this.options.cssClass) {
                this.sandbox.dom.removeClass(this.options.cssClass);
            }
            // remove inline-styles
            this.sandbox.dom.removeAttr(this.$el, 'style');
            this.sandbox.dom.remove(this.$tableContainer);
        },

        /**
         * Binds custom events to the datagrid related to this
         * view (like an extension)
         */
        bindCustomEvents: function() {
            // checks table widths
            this.sandbox.on(UPDATE_TABLE.call(this), this.onResize.bind(this));
            // opens all parents for a given child
            this.sandbox.on(OPEN_PARENTS.call(this), this.openAllParents.bind(this));
        },

        /**
         * Unbinds the custom-events by this view
         */
        unBindCustomEvents: function() {
            this.sandbox.off(UPDATE_TABLE.call(this));
        },

        /**
         * Unbinds the Dom-Events of the view
         */
        unbindDomEvents: function() {
            this.sandbox.dom.unbind(this.sandbox.dom.find('*', this.$tableContainer));
            this.sandbox.dom.unbind(this.$tableContainer);
        },

        /**
         * Binds Dom related events for this table-view
         */
        bindDomEvents: function() {
            // select events for checkboxes and radio buttons
            if (!!this.options.selectItem.type) {
                this.sandbox.dom.on(this.$tableContainer, 'click', this.selectItem.bind(this),
                    'input[type="checkbox"], input[type="radio"]'
                );
                //select all event
                this.sandbox.dom.on(
                    this.sandbox.dom.find('#' + constants.selectAllName, this.$tableContainer),
                    'click',
                    this.selectAllItems.bind(this)
                );
            }

            // events for removing row
            if (this.options.removeRow) {
                this.sandbox.dom.on(
                    this.$tableContainer, 'click', this.prepareRemoveRow.bind(this), '.' + constants.rowRemoverClass
                );
            }

            // emits an event when a table row gets clicked
            if(this.options.dblClick){
                this.sandbox.dom.on(
                    this.$tableContainer, 'dblclick',
                    this.emitRowClickedEvent.bind(this), 'tbody tr'
                );
            } else {
                this.sandbox.dom.on(
                    this.$tableContainer, 'click',
                    this.emitRowClickedEvent.bind(this), 'tbody tr'
                );
            }

            if(!!this.options.highlightSelected){
                this.sandbox.dom.on(
                    this.$tableContainer, 'click',
                    this.highlightRow.bind(this), 'tbody tr'
                );
            }

            // calls the icon-callback on click on an icon
            this.sandbox.dom.on(
                this.$tableContainer, 'click',
                this.callIconCallback.bind(this), 'tr .grid-icon'
            );

            // calls the radio-clicked event and stops further event-propagation
            this.sandbox.dom.on(
                this.sandbox.dom.find('.custom-radio.custom-filter',this.$tableContainer), 'click',
                this.radioClickedCallback.bind(this)
            );

            this.sandbox.dom.on(this.$tableContainer, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
            }.bind(this));

            // add editable events if configured
            if (!!this.options.editable) {
                this.sandbox.dom.on(
                    this.$tableContainer, 'click', this.editCellValues.bind(this), '.' + constants.editableClass
                );
                this.sandbox.dom.on(this.$tableContainer, 'click', this.focusOnRow.bind(this), 'tbody tr');

                // save on "blur"
                this.sandbox.dom.on(window, 'click', function() {
                    if (!!this.lastFocusedRow) {
                        this.prepareSave();
                    }
                }.bind(this));
            }

            // add sortable events if configured
            if (this.datagrid.options.sortable) {
                this.sandbox.dom.on(
                    this.sandbox.dom.find('thead th[data-attribute]', this.$tableContainer),
                    'click',
                    this.prepareSort.bind(this)
                );
            }

            // add load-children events if configured
            if (!!this.datagrid.options.childrenPropertyName) {
                this.sandbox.dom.on(this.$tableContainer, 'click',
                    this.prepareChildrenLoad.bind(this), 'tbody tr'
                );
            }
        },

        /**
         * Highlights clicked row and removes highlighting from the previously
         * highlighted
         * @param event
         */
        highlightRow: function(event) {
            var $row = event.currentTarget,
                $selectedRow = this.sandbox.dom.find(
                        'tbody tr.' + constants.selected,
                    this.$el
                );

            this.sandbox.dom.removeClass($selectedRow, constants.selected);
            this.sandbox.dom.addClass($row, constants.selected);
        },

        /**
         * emits radio-clicked event and stops event propagation
         */
        radioClickedCallback: function(event) {
            var parentTr = this.sandbox.dom.closest(event.currentTarget, 'tr'),
                parentTd = this.sandbox.dom.closest(event.currentTarget, 'td'),
                id = this.sandbox.dom.data(parentTr, 'id'),
                field = this.sandbox.dom.data(parentTd, 'field');
            this.sandbox.emit(RADIO_SELECTED.call(this), id, field);
            event.stopPropagation();
        },

        /**
         * Emits the row-clicked event
         */
        emitRowClickedEvent: function(event) {

            if (!this.rowClicked) {
                this.rowClicked = true;
                var id = this.sandbox.dom.$(event.currentTarget).data('id');
                if (!!id) {
                    this.datagrid.emitItemClickedEvent.call(this.datagrid, id);
                } else {
                    this.datagrid.emitItemClickedEvent.call(this.datagrid, event);
                }

                // set row clicked back to prevent double click
                setTimeout(function(){
                    this.rowClicked = false;
                }.bind(this), 500);
            }
        },

        /**
         * Sets the components starting properties
         */
        setVariables: function() {
            this.rendered = false;
            this.$tableContainer = null;
            this.$table = null;
            this.$el = null;
            this.data = null;
            this.rowId = 0;
            this.rowStructure = [];
            this.errorInRow = [];
            this.bottomTabIndex = this.options.startTabIndex || 49999;
            this.topTabIndex = this.options.startTabIndex || 50000;
            this.contentMarginRight = 0;
            this.contentPaddings = 0;
            this.rowClicked = false;
        },

        /**
         * Sets the header classes used for sorting purposes
         * uses this.datagrid.sort
         */
        setHeaderClasses: function() {
            var attribute = this.datagrid.sort.attribute,
                direction = this.datagrid.sort.direction,
                $element = this.sandbox.dom.find('thead th[data-attribute=' + attribute + ']', this.$tableContainer),
                $span = this.sandbox.dom.children($element, 'span')[0];

            if (!!attribute) {
                this.sandbox.dom.addClass($element, constants.isSelectedClass);

                if (direction === 'asc') {
                    this.sandbox.dom.addClass($span, constants.ascClass + constants.additionalHeaderClasses);
                } else {
                    this.sandbox.dom.addClass($span, constants.descClass + constants.additionalHeaderClasses);
                }
            }
        },

        /**
         * Perapres the structure of the datagrid when element type is table
         * @returns {table} returns table element
         */
        prepareTable: function() {
            var $table, $thead, $tbody, tblClasses;

            this.$table = $table = this.sandbox.dom.createElement('<table' + (!!this.options.validationDebug ? 'data-debug="true"' : '' ) + '/>');

            if (!!this.data.head || !!this.datagrid.matchings) {
                $thead = this.sandbox.dom.createElement('<thead/>');
                this.sandbox.dom.append($thead, this.prepareTableHead());
                this.sandbox.dom.append($table, $thead);
            }

            if (this.options.showHead === false) {
                this.sandbox.dom.addClass(this.$tableContainer, constants.noHeadClass);
            }

            if (!!this.data.embedded) {
                $tbody = this.sandbox.dom.createElement('<tbody/>');
                this.prepareTableRows($tbody);
                this.sandbox.dom.append($table, $tbody);
            }

            // set html classes
            tblClasses = [];
            tblClasses.push(
                (!!this.options.className && this.options.className !== constants.tableClass) ? constants.tableClass +
                    ' ' + this.options.className : constants.tableClass
            );

            // when list should not have the hover effect for whole rows do not set the is-selectable class
            if (!this.options.editable) {
                tblClasses.push((this.options.selectItem && this.options.selectItem.type === 'checkbox') ? constants.isSelectableClass : '');
            }

            this.sandbox.dom.addClass($table, tblClasses.join(' '));

            return $table;
        },

        /**
         * Prepares table head
         * @returns {string} returns table head
         */

        prepareTableHead: function() {
            var tblColumns, tblCellClass, headData, widthValues, dataAttribute,
                tblColumnStyle, minWidth, count = 0;

            tblColumns = [];
            headData = this.datagrid.matchings || this.data.head;

            // add a checkbox to head row
            if (!!this.options.selectItem && !!this.options.selectItem.type) {
                tblColumns.push(
                        '<th class="' + constants.selectAllName + ' checkbox-cell">'
                );

                if (this.options.selectItem.type === 'checkbox') {
                    tblColumns.push(this.sandbox.util.template(templates.checkbox)({
                        id: constants.selectAllName,
                        checked: false
                    }));
                }

                tblColumns.push('</th>');
            }

            this.rowStructure = [];

            // value used for correct tabindex when row added at top of table
            this.tabIndexParam = 1;

            this.sandbox.util.foreach(headData, function(column) {
                if (this.options.excludeFields.indexOf(column.attribute) < 0) {

                    // calculate width
                    tblColumnStyle = [];
                    tblCellClass = '';
                    if (column.width) {
                        minWidth = column.width;
                    } else if (column.minWidth) {
                        minWidth = column.minWidth;
                    } else {
                        minWidth = getTextWidth.call(this, column.content, [], column.sortable);
                        minWidth = (minWidth > this.datagrid.getNumberAndUnit(this.options.columnMinWidth).number) ? minWidth + 'px' : this.options.columnMinWidth;

                    }
                    tblColumnStyle.push('min-width:' + minWidth);
                    column.minWidth = minWidth;

                    // get width and measureunit
                    if (!!column.width) {
                        widthValues = this.datagrid.getNumberAndUnit(column.width);
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

                    // add children-toggler class if children toggle is enabled
                    if (!!this.datagrid.options.childrenPropertyName && count === 0) {
                        tblCellClass = constants.slideDownClass;
                    }

                    // add html to table header cell if sortable
                    if (!!column.sortable) {
                        dataAttribute = ' data-attribute="' + column.attribute + '"';
                        tblCellClass += ((!!column.class) ? ' ' + column.class + ' ' + constants.sortableClass : ' ' + constants.sortableClass + '');
                        tblColumns.push('<th class="' + tblCellClass + '" style="' + tblColumnStyle.join(';') + '" ' + dataAttribute + '>' + column.content + '<span></span></th>');
                    } else {
                        tblCellClass += ((!!column.class) ? ' ' + column.class + '' : '');
                        tblColumns.push('<th class="' + tblCellClass + '" style="' + tblColumnStyle.join(';') + '" >' + column.content + '</th>');
                    }
                }
                count++;
            }.bind(this));

            // remove-row entry
            if (!!this.options.removeRow) {
                tblColumns.push('<th style="width:30px;"/>');
            }

            return '<tr>' + tblColumns.join('') + '</tr>';
        },

        /**
         * Itterates over all items and prepares the rows
         * @param {Object} container to insert the table-rows the table-rows to
         */
        prepareTableRows: function($container) {
            var $row, $parent;

            if (!!this.data.embedded) {
                this.data.embedded.forEach(function(row) {
                    $parent = null;
                    $row = this.prepareTableRow(row, false);
                    if (!!row.parent) {
                        $parent = this.sandbox.dom.find('tr[data-id="' + row.parent + '"]', $container);
                    }
                    if (!!$parent) {
                        this.insertChild($row, $parent, row.parent, this.options.hideChildrenAtBeginning);
                    } else {
                        this.sandbox.dom.append($container, $row);
                    }
                }.bind(this));
            }
        },

        /**
         * Responsible for creating a single table-row
         * @param row {Object} the data for a row
         * @param triggeredByAddRow
         * @returns {*}
         */
        prepareTableRow: function(row, triggeredByAddRow) {
            var $tableRow, radioPrefix, key, i;

            if (!!(this.options.template && this.options.template.row)) {
                $tableRow = this.sandbox.template.parse(this.options.template.row, row);

            } else {
                this.tblColumns = [];
                this.tblRowAttributes = ' data-dom-id="dom-' + this.datagrid.options.instanceName + '-' + this.rowId + '"';
                this.rowId++;

                if (!!this.options.className && this.options.className !== '') {
                    radioPrefix = '-' + this.options.className;
                } else {
                    radioPrefix = '';
                }

                // if the select-item should have its own cell add a checkbox or a radio-button
                if (this.options.selectItem.inFirstCell !== true) {
                    // and don't display the checkbox anyway if only leaves should have a checkbox and record has children
                    if (!(this.datagrid.options.onlySelectLeaves === true && row[this.datagrid.options.childrenPropertyName] > 0)) {
                        // add a checkbox-cell to each row
                        if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                            this.tblColumns.push(this.sandbox.util.template(templates.checkboxCell)({
                                checkbox: this.sandbox.util.template(templates.checkbox)({
                                    id: '',
                                    checked: !!row.selected
                                })
                            }));

                            // add a radio to each row
                        } else if (!!this.options.selectItem.type && this.options.selectItem.type === 'radio') {
                            this.tblColumns.push(this.sandbox.util.template(templates.radio)({
                                name: 'husky-radio' + radioPrefix
                            }));
                        }
                    } else {
                        this.tblColumns.push('<td></td>');
                    }
                }

                // when row structure contains more elements than the id then use the structure to set values
                if (this.rowStructure.length) {

                    if (!!triggeredByAddRow && !!this.options.addRowTop) {
                        this.bottomTabIndex -= (this.tabIndexParam + 1);
                    }

                    this.sandbox.util.foreach(this.rowStructure, function(key, index) {
                        key.editable = key.editable || false;
                        this.createRowCell(key.attribute, row[key.attribute], key.type, key.editable, key.validation, triggeredByAddRow, index, row);
                    }.bind(this));

                } else {
                    i = 0;
                    for (key in row) {
                        if (row.hasOwnProperty(key)) {
                            this.createRowCell(key, row[key], null, false, null, triggeredByAddRow, i, row);
                            i++;
                        }
                    }
                }

                if (!!this.options.removeRow) {
                    this.tblColumns.push(this.sandbox.util.template(templates.removeRow)());
                }

                $tableRow = this.sandbox.dom.createElement('<tr' + this.tblRowAttributes + '>' + this.tblColumns.join('') + '</tr>');

                if (!!row.id) {
                    this.sandbox.dom.data($tableRow, 'id', row.id);
                    this.sandbox.dom.attr($tableRow, 'data-id', row.id);
                }
            }
            return $tableRow;
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
         * @param row {Object} the row object
         */
        createRowCell: function (key, value, type, editable, validation, triggeredByAddRow, index, row) {
            var tblCellClasses,
                tblCellContent,
                tblCellStyle,
                tblCellClass,
                k,
                validationAttr = '',
                $cell,
                $innerContainer;

            if (!value) {
                value = '';
            }

            if (this.options.excludeFields.indexOf(key) < 0) {
                tblCellClasses = [];
                tblCellContent = value;

                // prepare table cell classes
                !!value.class && tblCellClasses.push(value.class);
                (type === this.datagrid.types.THUMBNAILS) && tblCellClasses.push('thumb');

                tblCellClass = (!!tblCellClasses.length) ? 'class="' + tblCellClasses.join(' ') + '"' : '';

                if (!!this.options.validation && !!validation) {
                    for (k in validation) {
                        validationAttr += ['data-validation-', k, '="', validation[k], '" '].join('');
                    }
                }
                tblCellStyle = 'style="max-width:' + this.datagrid.matchings[index].minWidth + '"';

                // call the type manipulate to manipulate the content of the cell
                if (!!type && type === this.datagrid.types.THUMBNAILS) {
                    tblCellContent = this.datagrid.manipulateContent(tblCellContent, type, this.options.thumbnailFormat);
                    tblCellContent = '<img alt="' + tblCellContent[constants.thumbAltKey] + '" src="' + tblCellContent[constants.thumbSrcKey] + '"/>';
                } else {
                    tblCellContent = this.datagrid.processContentFilter(key, tblCellContent, type, index);
                }

                if (!!editable) {
                    if (!!triggeredByAddRow) {
                        // differentiate for tab index
                        if (!!this.options.addRowTop) {
                            $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ><span class="' + constants.editableClass + '" style="display: none">' + tblCellContent + '</span><input type="text" class="form-element editable-content" tabindex="' + this.bottomTabIndex + '" value="' + tblCellContent + '"  ' + validationAttr + '/></td>';
                            this.bottomTabIndex++;
                        } else {
                            $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ><span class="' + constants.editableClass + '" style="display: none">' + tblCellContent + '</span><input type="text" class="form-element editable-content" tabindex="' + this.topTabIndex + '" value="' + tblCellContent + '"  ' + validationAttr + '/></td>';
                            this.topTabIndex++;
                        }
                    } else {
                        $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ><span class="' + constants.editableClass + '">' + tblCellContent + '</span><input type="text" class="form-element editable-content hidden" value="' + tblCellContent + '" tabindex="' + this.topTabIndex + '" ' + validationAttr + '/></td>';
                        this.topTabIndex++;

                    }
                    // if record has children and is first element in row add an icon
                } else if (index === 0 && !!this.datagrid.options.childrenPropertyName) {
                    if (row[this.datagrid.options.childrenPropertyName] > 0) {
                        $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ' + tblCellStyle + '><div class="' + constants.slideDownClass + ' ' + constants.childrenIndentClass + '"><span class="' + constants.childrenSlideDownIcon + ' toggle-icon"></span>' + tblCellContent + '</div></td>';
                    } else {
                        $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ' + tblCellStyle + '><div class="' + constants.noChildrenClass + ' ' + constants.childrenIndentClass + '">' + tblCellContent + '</div></td>';
                    }
                    $cell = this.sandbox.dom.createElement($cell);
                    $innerContainer = this.sandbox.dom.find('.' + constants.childrenIndentClass, $cell);
                } else {
                    $cell = '<td data-field="' + key + '" ' + tblCellClass + ' ' + tblCellStyle + '>' + tblCellContent + '</td>';
                }
                $cell = this.sandbox.dom.createElement($cell);

                // add checkbox to first cell if configured
                if (index === 0 && this.options.selectItem.inFirstCell === true) {
                    // dont display a checkbox if only leaves should get a checkbox and record has children
                    if (!(this.datagrid.options.onlySelectLeaves === true && row[this.datagrid.options.childrenPropertyName] > 0)) {
                        this.sandbox.dom.prepend($innerContainer || $cell, this.sandbox.util.template(templates.checkbox)({
                            id: '',
                            checked: !!row.selected
                        }));
                    } else {
                        this.sandbox.dom.prepend($innerContainer || $cell, templates.checkboxPlaceholder);
                    }
                    // double the colspan because of the extra cell in the header
                    this.sandbox.dom.prop($cell, 'colspan', 2);
                }

                this.addIconsToCell($innerContainer || $cell, key, row);

                // push the html string to the global array
                this.tblColumns.push(this.sandbox.dom.outerHTML($cell));
            } else {
                this.tblRowAttributes += ' data-' + key + '="' + value + '"';
            }
        },

        /**
         * Adds configured icons to a cell
         * @param $container {Object} the dom-object to append the icons to
         * @param column {String} the identifier of the column
         * @param row {Object} the row object
         * @
         */
        addIconsToCell: function($container, column, row) {
            if (!!this.options.icons) {
                var i, length, $icon;

                for (i = -1, length = this.options.icons.length; ++i < length;) {
                    if (column === this.options.icons[i].column) {
                        $icon = this.sandbox.dom.createElement(this.sandbox.util.template(templates.icon)({
                            icon: this.options.icons[i].icon,
                            align: this.options.icons[i].align || 'left'
                        }));
                        this.sandbox.dom.attr($icon, 'data-icon-index', i);
                        this.sandbox.dom.append($container, $icon);
                    }
                }
            }
        },

        /**
         * Handles the click an an icon (calls the defined callback)
         * @param event
         */
        callIconCallback: function(event) {
            this.sandbox.dom.stopPropagation(event);
            var index = this.sandbox.dom.data(event.currentTarget, 'iconIndex'),
                recordId = this.sandbox.dom.data(this.sandbox.dom.parents(event.currentTarget, 'tr'), 'id');
            // call the callback
            if (!!this.options.icons[index] && typeof this.options.icons[index].callback === 'function') {
                this.options.icons[index].callback(recordId);
            }
        },

        /**
         * Adds a row to the datagrid
         * @param row
         */
        addRecord: function(row) {
            var $row, $firstInputField, $checkbox, $parent;
            // check for other element types when implemented
            $row = this.sandbox.dom.$(this.prepareTableRow(row, true));

            // when unsaved new row exists - save it
            this.prepareSave();

            if (!!row.parent) {
                $parent = this.sandbox.dom.find('tr[data-id="' + row.parent + '"]', this.$tableContainer);
            }

            // if record has a parent insert it after its parent else prepend or append row
            if (!!$parent) {
                this.insertChild($row, $parent, row.parent, false);
            } else if (!!this.options.addRowTop) {
                this.sandbox.dom.prepend(this.$table, $row);
            } else {
                this.sandbox.dom.append(this.$table, $row);
            }

            $firstInputField = this.sandbox.dom.find('input[type=text]', $row)[0];
            this.sandbox.dom.focus($firstInputField);

            if (!!this.options.editable) {
                this.lastFocusedRow = this.getInputValuesOfRow($row);
            }

            // if allchecked then disable top checkbox after adding new row
            if (!!this.options.selectItem.type && this.options.selectItem.type === 'checkbox') {
                $checkbox = this.sandbox.dom.find('#' + constants.selectAllName, this.$tableContainer);
                if (this.sandbox.dom.hasClass($checkbox, constants.isSelectedClass)) {
                    this.sandbox.dom.prop($checkbox, 'checked', false);
                    this.sandbox.dom.removeClass($checkbox, constants.isSelectedClass);
                }
            }
        },

        /**
         * Inserts a child-element after a parent element and indents it
         * @param $child
         * @param $parent
         * @param parentId {Number|String} the id of the parent
         * @param hidden {Boolean} if true child gets hidden
         */
        insertChild: function ($child, $parent, parentId, hidden) {
            var $parentIcon, depth = this.sandbox.dom.data($parent, 'depth') || 0;
            depth = parseInt(depth, 10);
            $parentIcon = this.sandbox.dom.find('.' + constants.slideDownClass + ' .toggle-icon', $parent);

            // make sure parent has children-loaded class
            this.sandbox.dom.addClass($parent, constants.childrenLoadedClass);

            this.sandbox.dom.attr($child, 'data-parent', parentId);
            this.sandbox.dom.data($child, 'depth', depth + 1);

            // indent the children-rows
            this.sandbox.dom.css(this.sandbox.dom.find('.' + constants.childrenIndentClass, $child), {
                'margin-left': (constants.childrenIndentPx * (depth + 1)) + 'px'
            });

            if (hidden === true) {
                // change the icon of the parent
                this.sandbox.dom.removeClass($parentIcon, constants.childrenSlideUpIcon);
                this.sandbox.dom.prependClass($parentIcon, constants.childrenSlideDownIcon);
                this.sandbox.dom.hide($child);
            } else {
                // change the icon of the parent
                this.sandbox.dom.removeClass($parentIcon, constants.childrenSlideDownIcon);
                this.sandbox.dom.prependClass($parentIcon, constants.childrenSlideUpIcon);
            }

            this.sandbox.dom.after($parent, $child);
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
                if (!!this.options.validation && !this.sandbox.form.validate('#' + this.datagrid.elId)) {
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
                        url = this.datagrid.getUrlWithoutParams();

                        // pass data to datagrid to save it
                        this.datagrid.saveGrid.call(this.datagrid, data, url,
                            this.saveSuccess.bind(this, this.lastFocusedRow.domId, $tr),
                            this.saveFail.bind(this, this.lastFocusedRow.domId, $tr),
                            this.options.addRowTop);

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
         * Callback for save success
         * @param $tr
         * @param domId
         * @param data
         */
        saveSuccess: function(domId, $tr, data) {
            // remove row from error list
            if (this.errorInRow.indexOf(domId) !== -1) {
                this.errorInRow.splice(this.errorInRow.indexOf(domId), 1);
            }

            this.resetRowInputFields($tr);
            this.unlockWidthsOfColumns(this.sandbox.dom.find('table th', this.$el));

            // set new returned data
            this.setDataForRow($tr[0], data);
        },

        /**
         * Callback for save fail
         * @param domId
         * @param $tr
         * @param jqXHR
         */
        saveFail: function(domId, $tr, jqXHR) {
            var message = JSON.parse(jqXHR.responseText);

            // remember row with error
            if (this.errorInRow.indexOf(domId) === -1) {
                this.errorInRow.push(domId);
            }
            // error in context with database constraints
            if (!!message.field) {
                this.showValidationError($tr, message.field);
            }
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
                // TODO: remove this when server-validation validation type is implemented
                if (this.sandbox.dom.hasClass($field, constants.serverValidationError)) {
                    this.sandbox.dom.removeClass($field, constants.serverValidationError);
                }

                content = this.sandbox.dom.val(this.sandbox.dom.$($field));
                $span = this.sandbox.dom.prev($field, '.' + constants.editableClass);
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
                this.sandbox.util.each($th, function(index, $el) {
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
         * Makes the widths of columns fixed when the table is in edit mode
         * prevents changes in column width
         * @param $th array of th elements
         */
        lockWidthsOfColumns: function($th) {
            var width, minwidth;
            this.columnWidths = [];

            this.sandbox.dom.each($th, function(index, $el) {
                minwidth = this.sandbox.dom.css($el, 'min-width');
                this.columnWidths.push(minwidth);

                width = this.sandbox.dom.outerWidth($el);
                this.sandbox.dom.css($el, 'min-width', width);
                this.sandbox.dom.css($el, 'max-width', width);
                this.sandbox.dom.css($el, 'width', width);
            }.bind(this));
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

                editables = this.sandbox.dom.find('.' + constants.editableClass, $el);
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
            if (!this.sandbox.dom.hasClass($input, constants.serverValidationError)) {
                this.sandbox.dom.addClass($input, constants.serverValidationError);
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
         * Prepares for removing a row
         * Raises the husky.datagrid.record.remove-click event when auto remove handling is not set to true
         * @param event
         */
        prepareRemoveRow: function(event) {
            this.sandbox.dom.stopPropagation(event);
            this.removeRecord(event);
        },

        /**
         * Removes a row from the datagrid
         * @param event
         */
        removeRecord: function(event) {
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
                $editableElements = this.sandbox.dom.find('.' + constants.editableClass, $tblRow);
                this.sandbox.util.each($editableElements, function(index, $element) {
                    this.sandbox.form.removeField('#' + this.datagrid.elId, $element);
                }.bind(this));
            }

            if (!!id) {
                this.datagrid.removeRecord.call(this.datagrid, id);
            }
            this.sandbox.dom.remove($tblRow);

            // when last table row was removed, uncheck thead checkbox if exists
            $checkboxes = this.sandbox.dom.find('input[type=checkbox]', this.$el);
            if ($checkboxes.length === 1) {
                this.sandbox.dom.removeClass(constants.isSelectedClass, $checkboxes[0]);
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
                tableWidth = this.sandbox.dom.width(this.$table),
                tableOffset = this.sandbox.dom.offset(this.$table),
                contentWidth = this.sandbox.dom.width(content),
                windowWidth = this.sandbox.dom.width(this.sandbox.dom.window),
                overlaps = false,
                originalMaxWidth = contentWidth;

            tableOffset.right = tableOffset.left + tableWidth;

            // if table is greater than max content width
            if (tableWidth > originalMaxWidth - contentPaddings && contentWidth < windowWidth - tableOffset.left) {
                // adding this class, forces table cells to shorten long words
                this.sandbox.dom.addClass(this.$el, constants.oversizedClass);
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
                this.sandbox.dom.scrollLeft(this.$el, 0);
            }

            // width is not allowed to be smaller than the width of content
            if (finalWidth < contentWidth) {
                finalWidth = contentWidth;
            }

            // now set width
            this.sandbox.dom.width(this.$el, finalWidth);

            // check scrollwidth and add class
            if (this.sandbox.dom.get(this.$tableContainer, 0).scrollWidth > finalWidth) {
                this.sandbox.dom.addClass(this.$tableContainer, constants.overflowClass);

                // if overflown and in full width mode reduce list-width
                if (this.options.fullWidth === true) {
                    finalWidth = finalWidth - constants.overflowIconSpacing;
                    this.sandbox.dom.width(this.$el, finalWidth);
                }

            } else {
                this.sandbox.dom.removeClass(this.$tableContainer, constants.overflowClass);
            }
        },

        /**
         * Selectes or deselects the clicked item
         * @param event
         */
        selectItem: function(event) {
            this.sandbox.dom.stopPropagation(event);

            var $element, itemId, parentTr;
            $element = this.sandbox.dom.$(event.currentTarget);

            if (!this.sandbox.dom.is($element, 'input')) {
                $element = this.sandbox.dom.find('input', this.sandbox.dom.parent($element));
            }

            parentTr = this.sandbox.dom.parents($element, 'tr');
            itemId = this.sandbox.dom.data(parentTr, 'id');

            if (this.sandbox.dom.attr($element, 'type') === 'checkbox') {
                if (this.sandbox.dom.prop($element, 'checked') === false) {
                    this.sandbox.dom.removeClass($element, constants.isSelectedClass);
                    this.sandbox.dom.prop($element, 'checked', false);

                    // uncheck 'Select All'-checkbox
                    this.sandbox.dom.prop(
                        this.sandbox.dom.find('#' + constants.selectAllName, this.$tableContainer),
                        'checked', false
                    );

                    this.datagrid.setItemUnselected.call(this.datagrid, itemId);
                } else {
                    this.sandbox.dom.addClass($element, constants.isSelectedClass);
                    this.sandbox.dom.prop($element, 'checked', true);
                    if (!!itemId) {
                        this.datagrid.setItemSelected.call(this.datagrid, itemId);
                    }
                }

            } else if (this.sandbox.dom.attr($element, 'type') === 'radio') {

                this.datagrid.deselectAllItems.call(this.datagrid);

                this.sandbox.dom.removeClass(
                    this.sandbox.dom.find('tr input[type="radio"]', this.$tableContainer), constants.isSelectedClass);
                this.sandbox.dom.prop(
                    this.sandbox.dom.find('tr input[type="radio"]', this.$tableContainer), 'checked', false);

                this.sandbox.dom.addClass($element, constants.isSelectedClass);
                this.sandbox.dom.prop($element, 'checked', true);

                if (!!itemId) {
                    this.datagrid.setItemSelected.call(this.datagrid, itemId);
                }
            }

        },

        /**
         * Shows input and hides span
         * @param event
         */
        editCellValues: function(event) {
            var $target = event.currentTarget,
                $input = this.sandbox.dom.next($target, 'input');

            this.lockWidthsOfColumns(this.sandbox.dom.find('table th', this.$tableContainer));

            this.sandbox.dom.hide($target);
            this.sandbox.dom.removeClass($input, 'hidden');
            this.sandbox.dom.select($input[0]);
        },

        /**
         * Put focus on table row and remember values
         */
        focusOnRow: function(event) {
            var $tr = event.currentTarget,
                domId = this.sandbox.dom.data($tr, 'dom-id');

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.logger.log("focus on row", domId);

            if (!!this.lastFocusedRow && this.lastFocusedRow.domId !== domId) { // new focus
                this.prepareSave();
                this.lastFocusedRow = this.getInputValuesOfRow($tr);
                this.sandbox.logger.log("focused " + this.lastFocusedRow.domId + " now!");
            } else if (!this.lastFocusedRow) { // first focus
                this.lastFocusedRow = this.getInputValuesOfRow($tr);
                this.sandbox.logger.log("focused " + this.lastFocusedRow.domId + " now!");
            }
        },

        /**
         * Selects or deselect all available items of the list
         * @param event
         */
        selectAllItems: function(event) {
            this.sandbox.dom.stopPropagation(event);

            var $headCheckbox = this.sandbox.dom.find('th input[type="checkbox"]', this.$tableContainer)[0],
                $checkboxes = this.sandbox.dom.find('input[type="checkbox"]:visible', this.$tableContainer);

            if (this.sandbox.dom.prop($headCheckbox, 'checked') === false) {
                this.sandbox.dom.prop($checkboxes, 'checked', false);
                this.sandbox.dom.removeClass($checkboxes, constants.isSelectedClass);
                this.datagrid.deselectAllItems.call(this.datagrid);
            } else {
                this.sandbox.dom.prop($checkboxes, 'checked', true);
                this.sandbox.dom.addClass($checkboxes, constants.isSelectedClass);
                this.datagrid.selectAllItems.call(this.datagrid);
            }
        },

        /**
         * Takes a record id and returns true if the record has children
         * @param id {Number|String} the id of the record
         * @returns {boolean} true if has children, false if not
         */
        recordHasChildren: function(id) {
            for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                if (this.data.embedded[i].id === id) {
                    return this.data.embedded[i][this.datagrid.options.childrenPropertyName] > 0;
                }
            }
            return false;
        },

        /**
         * Handles the click on a table row if elements in the grid have children
         *
         * @param event
         */
        prepareChildrenLoad: function(event) {
            this.sandbox.dom.stopPropagation(event);
            var recordId = this.sandbox.dom.data(event.currentTarget, 'id');

            // only load children if they are not already loaded
            if (!this.sandbox.dom.hasClass(event.currentTarget, constants.childrenLoadedClass)) {
                if (!!recordId && this.recordHasChildren(recordId)) {
                    this.sandbox.dom.addClass(event.currentTarget, constants.childrenLoadedClass);
                    this.datagrid.loadChildren.call(this.datagrid, recordId);
                }
            } else {
                this.toggleChildren(event.currentTarget, recordId);
            }
        },

        /**
         * Toggles the already loaded children of a parent element
         * @param $parent
         * @param parentId
         */
        toggleChildren: function($parent, parentId) {
            var $children = this.sandbox.dom.find('tr[data-parent="'+ parentId +'"]', this.$tableContainer);

            if (this.sandbox.dom.is($children, ':visible')) {
                this.hideChildren($parent, parentId);
            } else {
                this.showChildren($parent, parentId);
            }
        },

        /**
         * Opens all parents of a data-record and because of that makes sure that the data-record is visible in the table
         * @param id {Number|String} the id of the data-record
         */
        openAllParents: function(id) {
            var $child = this.sandbox.dom.find('tr[data-id="'+ id +'"]', this.$tableContainer),
                parentId = this.sandbox.dom.data($child, 'parent'),
                $parent = this.sandbox.dom.find('tr[data-id="'+ parentId +'"]', this.$tableContainer)
            if (!!parentId && !!$parent) {
                if (!!this.sandbox.dom.data($parent, 'parent')) {
                    this.openAllParents(parentId);
                }
                this.showChildren($parent, parentId);
            }
        },

        /**
         * Shows the first-level of children of a record
         * @param $parent
         * @param parentId
         */
        showChildren: function($parent, parentId) {
            var $children = this.sandbox.dom.find('tr[data-parent="'+ parentId +'"]', this.$tableContainer),
                $parentIcon = this.sandbox.dom.find('.' + constants.slideDownClass + ' .toggle-icon', $parent);

            this.sandbox.dom.removeClass($parentIcon, constants.childrenSlideDownIcon);
            this.sandbox.dom.prependClass($parentIcon, constants.childrenSlideUpIcon);
            this.sandbox.dom.show($children);
        },

        /**
         * Recursivly hides all children of a given parent (with nested ones)
         * @param $parent
         * @param parentId
         */
        hideChildren: function($parent, parentId) {
            var $children = this.sandbox.dom.find('tr[data-parent="'+ parentId +'"]', this.$tableContainer),
                $parentIcon = this.sandbox.dom.find('.' + constants.slideDownClass + ' .toggle-icon', $parent);

            this.sandbox.util.foreach($children, function($child) {
                if (this.sandbox.dom.hasClass($child, constants.childrenLoadedClass)) {
                    this.hideChildren($child, this.sandbox.dom.data($child, 'id'));
                }
            }.bind(this));
            this.sandbox.dom.removeClass($parentIcon, constants.childrenSlideUpIcon);
            this.sandbox.dom.prependClass($parentIcon, constants.childrenSlideDownIcon);
            this.sandbox.dom.hide($children);
        },

        /**
         * Handles the click on a sortable column title
         *
         * Creates the function parameters need for sorting
         * and delegates the sorting itself to the datagrid
         * @param event {Object} the event object
         */
        prepareSort: function(event) {
            var $element = event.currentTarget,
                $span = this.sandbox.dom.children($element, 'span')[0],
                attribute = this.sandbox.dom.data($element, 'attribute'),
                direction = this.sandbox.dom.hasClass($span, constants.ascClass) ? 'desc' : 'asc',
                $loaderContainer = this.sandbox.dom.createElement('<span class="'+ constants.sortLoaderClass +'"/>');

            this.sandbox.dom.stopPropagation(event);

            // start loader beneath th
            this.sandbox.dom.removeClass($span);
            this.sandbox.dom.append($span, $loaderContainer);
            this.sandbox.start([
                {
                    name: 'loader@husky',
                    options: {
                        el: $loaderContainer,
                        size: '10px',
                        color: '#999999'
                    }
                }
            ]);

            // delegate sorting to datagrid
            this.datagrid.sortGrid.call(this.datagrid, attribute, direction);
        }
    };
});

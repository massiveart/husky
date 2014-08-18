/**
 * @class TableView (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [viewOptions] Configuration object
 * @param {Boolean} [options.editable] will not set class is-selectable to prevent hover effect for complete rows
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
 * @param {String|Number} [options.cssClass] css-class to give the the components element. (e.g. "white-box")
 * @param {Boolean} [options.highlightSelected] highlights the clicked row when selected
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
            /*editable: false,*/
            /*fullWidth: false,*/
            /*removeRow: false,*/
            selectItem: {
                type: 'checkbox',      // checkbox, radio
                inFirstCell: false
            },
            noItemsText: 'This list is empty',
            /*validation: false, // TODO does not work for added rows
            validationDebug: false,*/
            /*addRowTop: true,*/
            excludeFields: [''],
            cssClass: '',
            thumbnailFormat: '50x50',
            showHead: true,
            /*hideChildrenAtBeginning: true,*/
            /*openChildId: null,*/
            /*highlightSelected: false,*/
            /*icons: []*/
        },

        constants = {
            skeletonClass: 'husky-table',
            containerClass: 'table-container',
            overflowClass: 'overflow',
            emptyListElementClass: 'empty-list',
            cellFitClass: 'fit',
            tableClass: 'table',
            thumbSrcKey: 'url',
            thumbAltKey: 'alt'
        },

        selectItems = {
            CHECKBOX: 'checkbox',
            RADIO: 'radio'
        },

        /**
         * Templates used by this class
         */
        templates = {
            skeleton: [
                '<div class="'+ constants.skeletonClass +'">',
                '   <div class="'+ constants.containerClass +'"></div>',
                '</div>'
            ].join(''),

            table: '<table class="'+ constants.tableClass +'"></table>',
            header: '<thead></thead>',
            body: '<tbody></tbody>',
            row: '<tr></tr>',
            headerCell: '<th></th>',
            cell: '<td></td>',

            img: '<img alt="<%= alt %>" src="<%= src %>"/>',

            checkbox: [
                '<div class="custom-checkbox">',
                '   <input type="checkbox" data-form="false"/>',
                '   <span class="icon"></span>',
                '</div>'
            ].join(''),

            radio: [
                '<div class="custom-radio">',
                '    <input name="<%= name %>" type="radio" data-form="false"/>',
                '    <span class="icon"></span>',
                '</div>'
            ].join(''),

            empty: [
                '<div class="'+ constants.emptyListElementClass +'">',
                '   <div class="fa-coffee icon"></div>',
                '   <span><%= text %></span>',
                '</div>'
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
         * triggered when children were collapsed
         * @event husky.datagrid.table.children.collapsed
         */
            CHILDREN_COLLAPSED = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'children.collapsed');
        },

        /**
         * triggered when children were expanded
         * @event husky.datagrid.table.children.expanded
         */
            CHILDREN_EXPANDED = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'children.expanded');
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
        },

        /**
         * Method to render data in table view
         */
        render: function(data, $container) {
            this.$el = this.sandbox.dom.createElement(templates.skeleton);
            this.sandbox.dom.append($container, this.$el);
            this.sandbox.dom.addClass(this.$el, this.options.cssClass);
            this.data = data;
            this.renderTable();
            if (this.datagrid.options.resizeListeners === true) {
                this.onResize();
            }
            this.rendered = true;
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.sandbox.dom.remove(this.$el);
        },

        /**
         * Sets the components starting properties
         */
        setVariables: function() {
            this.rendered = false;
            this.$el = null;
            this.table = {};
            this.data = null;
        },

        /**
         * Render methods (start)
         * -------------------------------------------------------------------- */

        /**
         * Renders the table
         */
        renderTable: function() {
            this.table.$el = this.sandbox.dom.createElement(templates.table);
            if (this.options.showHead === true) {
                this.renderHeader();
            }
            this.renderBody();
            this.sandbox.dom.append(this.sandbox.dom.find('.' + constants.containerClass, this.$el), this.table.$el);
        },

        /**
         * Renders the table header
         */
        renderHeader: function() {
            this.table.header = {};
            this.table.header.$el = this.sandbox.dom.createElement(templates.header);
            this.table.header.$row = this.sandbox.dom.createElement(templates.row);
            if (!!this.options.selectItem && !!this.options.selectItem.type) {
                this.renderHeaderSelectItem();
            }
            this.renderHeaderCells();
            this.sandbox.dom.append(this.table.header.$el, this.table.header.$row);
            this.sandbox.dom.append(this.table.$el, this.table.header.$el);
        },

        /**
         * Renders the select-all checkbox of the header
         */
        renderHeaderSelectItem: function() {
            var $cell = this.sandbox.dom.createElement(templates.headerCell);
            this.sandbox.dom.addClass($cell, constants.cellFitClass);
            if (this.options.selectItem.type === selectItems.CHECKBOX) {
                this.sandbox.dom.html($cell, templates.checkbox);
            }
            this.sandbox.dom.prepend(this.table.header.$row, $cell);
        },

        /**
         * Renderes the cells in the header
         */
        renderHeaderCells: function() {
            var $headerCell;
            this.table.header.cells = {};

            this.sandbox.util.foreach(this.datagrid.matchings, function(column) {
                $headerCell = this.sandbox.dom.createElement(templates.headerCell);
                this.sandbox.dom.html($headerCell, this.sandbox.translate(column.content));
                this.table.header.cells[column.attribute] = {
                    $el: $headerCell
                };
                this.sandbox.dom.append(this.table.header.$row, this.table.header.cells[column.attribute].$el);
            }.bind(this));
        },

        /**
         * Renders the table body
         */
        renderBody: function() {
            this.table.$body = this.sandbox.dom.createElement(templates.body);
            this.table.rows = {};
            if (this.data.embedded.length > 0) {
                this.sandbox.util.foreach(this.data.embedded, function(record) {
                    this.renderBodyRow(record);
                }.bind(this));
            } else {
                this.renderEmptyIndicator();
            }
            this.sandbox.dom.append(this.table.$el, this.table.$body);
        },

        /**
         * Renderes a single table row
         * @param record {Object} the record
         */
        renderBodyRow: function(record) {
            var $row = this.sandbox.dom.createElement(templates.row);
            this.table.rows[record.id] = {
                $el: $row,
                cells: {}
            };
            if (!!this.options.selectItem && !!this.options.selectItem.type && this.options.selectItem.inFirstCell === false) {
                this.renderRowSelectItem(record.id);
            }
            // foreach matching grab the corresponding data and render the cell with it
            this.sandbox.util.foreach(this.datagrid.matchings, function(column) {
                if (this.options.excludeFields.indexOf(column.attribute) === -1) {
                    this.renderBodyCell(record, column);
                }
            }.bind(this));
            this.sandbox.dom.append(this.table.$body, this.table.rows[record.id].$el);
        },

        /**
         * Renderes the checkbox or radio button for a row in the tbody
         * @param id {Number|String} the id of the row to add the select-item for
         */
        renderRowSelectItem: function(id) {
            var $cell = this.sandbox.dom.createElement(templates.cell);
            this.sandbox.dom.addClass($cell, constants.cellFitClass);
            if (this.options.selectItem.type === selectItems.CHECKBOX) {
                this.sandbox.dom.html($cell, templates.checkbox);
            } else if (this.options.selectItem.type === selectItems.RADIO) {
                this.sandbox.dom.html($cell, this.sandbox.util.template(templates.radio)({
                    name: 'datagrid-' + this.datagrid.options.instanceName
                }));
            }
            this.sandbox.dom.prepend(this.table.rows[id].$el, $cell);
        },

        /**
         * Renders a single cell
         * @param record {Object} the record to render the cell for
         * @param column {Object} the column which should be rendered
         */
        renderBodyCell: function(record, column) {
            var $cell = this.sandbox.dom.createElement(templates.cell),
                content = this.getCellContent(record, column);

            this.sandbox.dom.html($cell, content);

            this.table.rows[record.id].cells[column.attribute] = {
                $el: $cell
            };
            // append cell to corresponding row
            this.sandbox.dom.append(
                this.table.rows[record.id].$el,
                this.table.rows[record.id].cells[column.attribute].$el
            );
        },

        /**
         * Gets the actual content for a cell
         * @param record {Object} the record to get the content for
         * @param column {Object} the column for which the content should be returned
         * @returns {String|Object} the dom object for the cell content or html
         */
        getCellContent: function(record, column) {
            var content = record[column.attribute];
            if (!!column.type && column.type === this.datagrid.types.THUMBNAILS) {
                content = this.datagrid.manipulateContent(content, column.type, this.options.thumbnailFormat);
                content = this.sandbox.util.template(templates.img)({
                   alt: content[constants.thumbAltKey],
                   src: content[constants.thumbSrcKey]
                });
            } else {
                content = this.datagrid.processContentFilter(
                    column.attribute,
                    content,
                    column.type,
                    Object.keys(this.table.rows).length
                );
            }
            return content;
        },

        /**
         * Renders the empty list element
         */
        renderEmptyIndicator: function() {
            this.sandbox.dom.append(this.$el, this.sandbox.util.template(templates.empty)({
                text: this.sandbox.translate(this.options.noItemsText)
            }));
        },

        /**
         * Render methods (end)
         * -------------------------------------------------------------------- */

        /**
         * Handles the responsiveness
         */
        onResize: function() {
           var $container = this.sandbox.dom.find('.' + constants.containerClass, this.$el),
               isOverflown = this.sandbox.dom.get($container, 0).scrollWidth > this.sandbox.dom.width($container);
            if (isOverflown === true) {
                this.sandbox.dom.addClass(this.$el, constants.overflowClass);
            } else {
                this.sandbox.dom.removeClass(this.$el, constants.overflowClass);
            }
        },

        /**
         * Removes the empty list element
         */
        removeEmptyIndicator: function() {
            this.sandbox.dom.remove(this.sandbox.dom.find('.' + constants.emptyListElementClass, this.$el));
        }
     };
});

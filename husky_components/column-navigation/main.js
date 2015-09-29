/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/column-navigation
 */

/**
 * @class ColumnNavigation
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.url] url to load data
 * @params {String} [options.selected] id of selected element - needed to restore state
 * @params {String|Function} [options.actionIcon] icon class of action button
 * @params {Array}  [options.data] array of data displayed in the settings dropdown
 * @params {String}  [options.data[].mode] if 'order' - column gets set in order mode if clicked
 * @params {Function}  [options.data[].enabler] Gets called each time the options change columns.
 *          Gets an object with a numberItems and a hasSelected property.
 *          If returns false the dropdown item will get disabled, enabled otherwise
 * @params {String} [options.instanceName] name of current instance
 * @params {String} [options.hasSubName] name of hasSub-key
 * @params {String} [options.idName] name of id-key
 * @params {String} [options.pathName] name of path-key
 * @params {String} [options.linkedName] name of linked-key
 * @params {String} [options.publishedName] name of published-key
 * @params {String} [options.titleName] name of title-key
 * @params {String} [options.noPageDescription] translation key for the "No-Page"-description
 * @params {String} [options.resultKey] The name of the array in the responded _embedded
 * @params {Boolean} [options.responsive] If true the resize listener gets initialized. Otherwise the column navigation just takes up 100 % of the height and width
 * @params {Boolean} [options.showOptions] hide or shows the options
 * @params {Boolean} [options.showActionIcon] if true the action icon is shown, not shown otherwise
 * @params {Boolean} [options.showStatus] hide or display status of elements
 * @params {String} [options.skin] css class which gets added to the components element. Available: '', 'fixed-height-small'
 * @params {Boolean} [options.markable] If true a node gets marked with a css class on click on the blue button
 * @params {Array} [options.premarkedIds] an array of uuids of nodes which should be marked from the beginning on
 * @params {Array} [options.disableIds] an array of uuids which will be disabled
 * @params {Array} [options.disabledChildren] an array of uuids which will be disabled
 * @params {Boolean} [options.orderable] if true component-items can be ordered
 * @params {Boolean} [options.tooltipTranslations] translation-keys for the tooltips
 * @params {Boolean} [options.tooltipTranslations.ghost] translation-keys for ghost
 * @params {Boolean} [options.tooltipTranslations.shadow] translation-keys for shadow
 * @params {Boolean} [options.tooltipTranslations.unpublished] translation-keys for unpublished
 * @params {Boolean} [options.tooltipTranslations.internalLink] translation-keys for internal-link
 * @params {Boolean} [options.tooltipTranslations.externalLink] translation-keys for external-link
 */
define([], function() {

    'use strict';

    var defaults = {
            url: null,
            prefilledData: null,
            selected: null,
            data: null,
            instanceName: '',
            hasSubName: 'hasSub',
            actionIcon: 'fa-pencil',
            addButton: true,
            idName: 'id',
            pathName: 'path',
            linkedName: 'linked',
            publishedName: 'publishedState',
            titleName: 'title',
            typeName: 'type',
            noPageDescription: 'public.no-pages',
            skin: '',
            resultKey: 'nodes',
            responsive: true,
            showOptions: true,
            showStatus: true,
            premarkedIds: [],
            disableIds: [],
            disabledChildren: false,
            markable: false,
            orderable: true,
            showActionIcon: true,
            orderConfirmTitle: 'column-navigation.order-title',
            orderConfirmMessage: 'column-navigation.order-message',
            tooltipTranslations: {
                ghost: 'column-navigation.ghost',
                shadow: 'column-navigation.shadow',
                unpublished: 'public.unpublished',
                internalLink: 'public.internal-link',
                externalLink: 'public.external-link'
            }
        },

        constants = {
            responsiveHeightRation: 7 / 10,
            columnWidth: 250,
            minVisibleRatio: 1 / 2,
            markedClass: 'marked',
            displayedcolumns: 2, // number of displayed columns with content
            wrapperClass: 'column-navigation-wrapper',
            disabledClass: 'disabled',
            columnClass: 'column',
            optionsClass: 'options',
            componentClass: 'husky-column-navigation',
            nodeLoaderClass: 'husky-column-navigation-loader',
            bigLoaderClass: 'column-navigation-loader',
            columnItemClass: 'column-item',
            iconsLeftClass: 'icons-left',
            iconsRightClass: 'icons-right',
            itemTextClass: 'item-text',
            orderInputClass: 'orderer',
            orderErrorClass: 'husky-validate-error',
            highlightClass: 'highlight-animation',
            orderModeClass: 'order-mode'
        },

        templates = {
            wrapper: ['<div class="', constants.wrapperClass, '"></div>'].join(''),
            container: ['<div class="column-navigation"></div>'].join(''),

            column: [
                '<div data-column="<%= columnNumber %>" class="', constants.columnClass, '" id="<%= id %>">',
                '    <ul></ul>',
                '</div>'
            ].join(''),

            noPage: [
                '<div class="no-page">',
                '    <span class="fa-coffee icon"></span>',
                '    <div class="text"><%= description %></div>',
                '</div>'
            ].join(''),

            optionsContainer: ['<div class="', constants.optionsClass, ' grid-row"></div>'].join(''),

            optionsAdd: [
                '<div class="align-center add pointer">',
                '    <span class="fa-plus-circle"></span>',
                '</div>'
            ].join(''),

            optionsSettings: [
                '<div class="align-center settings pointer drop-down-trigger">',
                '    <span class="fa-gear inline-block"></span><span class="dropdown-toggle inline-block"></span>',
                '</div>'
            ].join(''),

            optionsOk: [
                '<div class="align-center ok pointer">',
                '    <span class="fa-check"></span>',
                '</div>'
            ].join(''),

            item: [
                '<li data-id="<%= id %>" class="' + constants.columnItemClass + '">',
                '    <span class="' + constants.iconsLeftClass + '"></span>',
                '    <span title="<%= title %>" class="' + constants.itemTextClass + '"><%= title%></span>',
                '    <span class="' + constants.iconsRightClass + '"></span>',
                '</li>'
            ].join(''),

            orderInput: [
                '<span class="' + constants.orderInputClass + '">',
                '    <input type="text" class="form-element husky-validate" value="<%= value %>" />',
                '</span>'
            ].join('')
        },

        /**
         * namespace for events
         * @type {string}
         */
        eventNamespace = 'husky.column-navigation.',

        /**
         * @event husky.column-navigation.initialized
         * @description thrown after initialization has finished
         */
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * @event husky.column-navigation.loaded
         * @description the component has loaded everything successfully and will be rendered
         */
        LOADED = function() {
            return createEventName.call(this, 'loaded');
        },

        /**
         * @event husky.column-navigation.selected
         * @description an navigation element has been selected
         * @param {Object} selected object
         */
        SELECTED = function() {
            return createEventName.call(this, 'selected');
        },

        /**
         * @event husky.column-navigation.settings
         * @description an navigation element has been selected and a item from selected dropdown clicked
         * @param {Object} selected column navigation object
         * @param {Object} clicked dropdown item
         */
        SETTINGS = function() {
            return createEventName.call(this, 'settings');
        },

        /**
         * @event husky.column-navigation.add
         * @description the add button has been clicked
         * @param {Object} parent object from active column level
         */
        ADD = function() {
            return createEventName.call(this, 'add');
        },

        /**
         * @event husky.column-navigation.action
         * @description emitted if the action-icon of an item gets clicked
         * @param {Object} clicked item
         */
        ACTION = function() {
            return createEventName.call(this, 'action');
        },

        /**
         * @event husky.column-navigation.ordered
         * @description emited when the position of an item gets changed
         * @param {String} uuid of the reposition item
         * @param {Number} the new position of the item
         */
        ORDERED = function() {
            return createEventName.call(this, 'ordered');
        },

        /**
         * @event husky.column-navigation.order
         * @description listens on and sets the column containing an item with a given id in order-mode
         * @param {String} uuid of the item
         */
        ORDER = function() {
            return createEventName.call(this, 'order');
        },

        /**
         * @event husky.column-navigation.order-start
         * @description emited if a column is set in order-mode
         */
        ORDER_START = function() {
            return createEventName.call(this, 'order-start');
        },

        /**
         * @event husky.column-navigation.order-start
         * @description emited if a column is set in order-mode
         */
        ORDER_END = function() {
            return createEventName.call(this, 'order-end');
        },

        /**
         * @event husky.column-navigation.unmark
         * @description listens on and unmarks a node with a given id
         * @param {Number|String} the id of the node to unmark
         */
        UNMARK = function() {
            return createEventName.call(this, 'unmark');
        },

        /**
         * @event husky.column-navigation.highlight
         * @description listens on and highlights an item with a given uuid
         * @param {Number|String} the id of the item to highlight
         */
        HIGHLIGHT = function() {
            return createEventName.call(this, 'highlight');
        },

        /**
         * @event husky.column-navigation.get-breadcrumb
         * @description the breadcrumb will be returned
         * @param {Function} callback function which will process the breadcrumb objects
         */
        BREADCRUMB = function() {
            return createEventName.call(this, 'get-breadcrumb');
        },

        /**
         * @event husky.column-navigation.resize
         * @description the element will be resized
         * @param {Function} callback function which will process the breadcrumb objects
         */
        RESIZE = function() {
            return createEventName.call(this, 'resize');
        },

        createContext = function(column) {
            if (column <= 0) {
                return this.columns[column];
            }

            var context = {
                numberItems: 0,
                hasSelected: false,
                selectedItem: null,
                parent: null,
                children: []
            };

            if (!!this.columns[column]) {
                context.numberItems = Object.keys(this.columns[column]).length;
                context.hasSelected = !!this.selected[column];
                context.children = this.columns[column];

                if (!!this.selected[column]) {
                    context.selectedItem = this.selected[column];
                }
            }

            if (column > 0) {
                context.parent = createContext.call(this, column - 1);
            }

            return context;
        },

        /**
         * Returns the action items for the given item data
         * @param {Object} data
         * @returns {string}
         */
        getActionIcon = function(data) {
            var actionItem = this.options.actionIcon;

            if (typeof(this.options.actionIcon) === 'function') {
                actionItem = this.options.actionIcon(data);
            }

            return actionItem;
        },

        /**
         * Returns whether the add button in the column should be shown or not (can also differ between columns)
         * @returns {boolean}
         */
        getAddButton = function() {
            if (typeof(this.options.addButton) === 'function') {
                return this.options.addButton(createContext.call(this, this.lastHoveredColumn));
            }

            return this.options.addButton;
        },

        /**
         * Sets the width for all visible option buttons
         */
        setOptionButtonWidths = function() {
            var $optionButtons = this.$find('.' + constants.optionsClass + ' > :visible'),
                width = 100 / $optionButtons.length;

            $optionButtons.each(function(count, optionButton) {
                $(optionButton).width(width + '%');
            });

            this.$find('.' + constants.optionsClass + ' > :visible').removeClass('first');
            this.$find('.' + constants.optionsClass + ' > :visible').removeClass('last');
            this.$find('.' + constants.optionsClass + ' > :visible:first').addClass('first');
            this.$find('.' + constants.optionsClass + ' > :visible:last').addClass('last');
        },

        /** returns normalized event names */
        createEventName = function(postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.setProperties();
            this.render();
            this.startBigLoader();
            this.initData();
            this.bindDOMEvents();
            this.bindCustomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * initialize data
         */
        initData: function() {
            if (!!this.options.prefilledData) {
                this.handleResponse(this.options.prefilledData, 0);
            } else {
                this.load(this.options.url, 0);
            }
        },

        /**
         * Initializes the class properties with their default-values
         */
        setProperties: function() {
            this.$selectedElement = null;
            this.filledColumns = 0;
            this.columnLoadStarted = false;
            this.isOrdering = false; // flag (only one item at a time can be ordered)
            this.inOrderMode = false; // flag (only one column at a time can be in order-mode)
            this.optionsLocked = false;
            this.dom = {
                $wrapper: null,
                $container: null,
                $add: null,
                $settings: null,
                $bigLoader: null,
                $loader: null,
                $ok: null,
                $lastClicked: null
            };

            this.columns = [];
            this.selected = [];
            // array with all marked ids
            this.marked = this.options.premarkedIds || [];
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {
            this.renderWrapper();
            if (!!this.options.showOptions) { // Options-toolbar with "add" and "settings"
                this.renderOptions();
            }
            if (!!this.options.data) {
                this.initSettingsDropdown();
            }
            if (this.options.responsive === true) {
                this.setContainerHeight();
            }
        },

        /**
         * Returns the index of a column which contains an item with a given id
         * @param item - the id of the item
         * @returns {number} the index of the column if found, a value below 0 otherwise
         */
        getColumnForItem: function(item) {
            for (var i = -1, length = this.columns.length; ++i < length;) {
                if (!!this.columns[i] && !!this.columns[i][item]) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * Renders the options-buttons. "Add" and "Settings"
         */
        renderOptions: function() {
            this.$optionsContainer = this.sandbox.dom.createElement(templates.optionsContainer);
            this.dom.$add = this.sandbox.dom.createElement(templates.optionsAdd);
            this.dom.$settings = this.sandbox.dom.createElement(templates.optionsSettings);
            this.dom.$ok = this.sandbox.dom.createElement(templates.optionsOk);
            this.sandbox.dom.hide(this.dom.$ok);
            this.sandbox.dom.append(this.$optionsContainer, this.dom.$add);
            this.sandbox.dom.append(this.$optionsContainer, this.dom.$settings);
            this.sandbox.dom.append(this.$optionsContainer, this.dom.$ok);
            this.hideOptions();
            this.sandbox.dom.append(this.dom.$wrapper, this.$optionsContainer);
        },

        /**
         * Renders the component wrapper and an additional container
         */
        renderWrapper: function() {
            this.sandbox.dom.addClass(this.$el, constants.componentClass);
            if (!!this.options.skin) {
                this.sandbox.dom.addClass(this.$el, this.options.skin);
            }

            this.dom.$wrapper = this.sandbox.dom.createElement(templates.wrapper);
            this.sandbox.dom.append(this.$el, this.dom.$wrapper);

            // navigation container
            this.dom.$container = this.sandbox.dom.createElement(templates.container);
            this.sandbox.dom.append(this.dom.$wrapper, this.dom.$container);
        },

        /**
         * Starts the big loader, before loading content during the initialization
         */
        startBigLoader: function() {
            if (this.dom.$bigLoader === null) {
                this.dom.$bigLoader = this.sandbox.dom.createElement('<div class="' + constants.bigLoaderClass + '"/>');
                this.sandbox.dom.hide(this.dom.$bigLoader);
                this.sandbox.dom.html(this.dom.$container, this.dom.$bigLoader);

                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: this.dom.$bigLoader,
                            size: '100px',
                            color: '#e4e4e4'
                        }
                    }
                ]);
            }
            this.sandbox.dom.show(this.dom.$bigLoader);
        },

        /**
         * Detatches the big loader from the column-navigation
         */
        removeBigLoader: function() {
            this.sandbox.dom.hide(this.dom.$bigLoader);
        },

        /**
         * Sets the height of the container
         */
        setContainerHeight: function() {
            var height = this.sandbox.dom.height(this.sandbox.dom.$window),
                top = this.sandbox.dom.offset(this.$el).top;
            this.sandbox.dom.height(this.dom.$container, (height - top) * constants.responsiveHeightRation);
        },

        /**
         * Instantiats the dropdown component
         */
        initSettingsDropdown: function() {
            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: this.dom.$settings,
                        setParentDropDown: true,
                        instanceName: this.options.instanceName + '.settings.dropdown',
                        alignment: 'left',
                        data: this.options.data
                    }
                }
            ]);
        },

        /**
         * Loads data from a specific url and triggers the parsing
         * @param {String} url
         * @param {Number} columnNumber
         */
        load: function(url, columnNumber) {
            if (!!url) {
                this.columnLoadStarted = true;
                this.sandbox.util.load(url)
                    .then(function(response) {
                        this.handleResponse(response, columnNumber);
                    }.bind(this))
                    .fail(function(error) {
                        this.columnLoadStarted = false;
                        this.sandbox.logger.error("An error occured while fetching data from: ", error);
                    }.bind(this));

            } else {
                this.sandbox.logger.log("husky.column.navigation -  url not set, aborted loading of data");
            }
        },

        /**
         * Handle data response
         * @param response
         * @param columnNumber
         */
        handleResponse: function(response, columnNumber) {
            this.removeBigLoader();
            this.columnLoadStarted = false;
            this.parseData(response, columnNumber);
            this.scrollIfNeeded(this.filledColumns + 1);
            this.setOverflowClass();
            this.showOptionsAtLast();
            this.sandbox.emit(LOADED.call(this));
        },

        /**
         * Removes removes data and removes dom elements
         * @param {Number} newColumn
         */
        removeColumns: function(newColumn) {
            var length = this.filledColumns,
                i;

            for (i = length; i >= newColumn; i--) {
                delete this.columns[i];
                this.sandbox.dom.remove('#column' + this.options.instanceName + '-' + i);
                this.filledColumns--;
            }
        },

        /**
         * Parses the received data and renders columns
         * @param {String} data
         * @param {Number} columnNumber
         */
        parseData: function(data, columnNumber) {
            // if there is nothing loaded yet, create a "root"-column
            if (columnNumber === 0) {
                this.columns[0] = data;
            }
            var newColNumber = columnNumber + 1;

            this.renderColumn(newColNumber, data);
            this.removeLoadingIconForSelected();
        },

        /**
         * Renderes a column
         * @param number - the number of the new column
         * @param data - the data for the column
         */
        renderColumn: function(number, data) {
            var $column = this.sandbox.dom.createElement(this.sandbox.util.template(templates.column)({
                columnNumber: number,
                id: 'column' + this.options.instanceName + '-' + number
            }));
            this.sandbox.dom.append(this.dom.$container, $column);
            this.filledColumns = number;
            this.renderItems($column, number, data);
        },

        /**
         * Renderes the items for a column
         * @param $column - the dom-object of the column
         * @param number - the number of the column to add the items to
         * @param data - the columns data object
         */
        renderItems: function($column, number, data) {
            var $list = this.sandbox.dom.find('ul', $column), nodeWithSubNodes, lastSelected;
            this.sandbox.util.each(data._embedded[this.options.resultKey], function(index, itemData) {
                itemData.order = (index + 1);
                var $item = this.renderItem(itemData);
                itemData.$el = $item;
                this.storeDataItem(number, itemData);
                this.sandbox.dom.append($list, $item);
                this.setItemsTextWidth($item);

                // if there are sub-nodes for this node loaded (need to be rendered later, so we save a reference)
                if (!!itemData[this.options.hasSubName] && !!itemData._embedded[this.options.resultKey] && itemData._embedded[this.options.resultKey].length > 0) {
                    nodeWithSubNodes = itemData;
                    this.setElementSelected($item);
                    this.selected[number] = itemData;
                }

                // if this node is the specified as selected in the options, we select it
                if (!!this.options.selected && (this.options.selected === itemData[this.options.idName] || this.options.selected === itemData[this.options.pathName])) {
                    this.setElementSelected($item);
                    this.selected[number] = itemData;
                    lastSelected = itemData;
                    this.options.selected = null;
                }
            }.bind(this));

            // here we come back the the node with the sub-nodes and recursively parse the sub-nodes-column
            if (!!nodeWithSubNodes) {
                this.parseData(nodeWithSubNodes, number);
                // otherwise, if there are no sub-nodes and we have a selected node - we display the "No-Pages"-column
            } else if (!!lastSelected && !lastSelected[this.options.hasSubName]) {
                this.insertAddColumn(lastSelected, number);
            }
        },

        /**
         * Takes the data object and returns a column-item
         * @param data - the item's data
         * @returns the items dom-object
         */
        renderItem: function(data) {
            var $item = this.sandbox.dom.createElement(this.sandbox.util.template(templates.item)({
                    title: this.sandbox.util.escapeHtml(data[this.options.titleName]),
                    id: data[this.options.idName]
                })),
                disabled = (this.options.disableIds.indexOf(data[this.options.idName]) !== -1);

            if (this.marked.indexOf(data[this.options.idName]) !== -1) { // if is marked
                this.sandbox.dom.addClass($item, constants.markedClass);
            }
            if (disabled) { // if is marked
                this.sandbox.dom.addClass($item, constants.disabledClass);
            }
            this.renderLeftInfo($item, data);
            this.renderItemText($item, data);
            this.renderRightInfo($item, data, disabled);

            return $item;
        },

        /**
         * Renders the left buttons and icons for an item
         * @param $item - dom object of the item
         * @param data - the item's data
         */
        renderLeftInfo: function($item, data) {
            var $container = this.sandbox.dom.find('.' + constants.iconsLeftClass, $item);
            this.sandbox.dom.append($container, '<span class="fa-check pull-left marked-icon"></span>');
            if (!!this.options.showStatus) {
                // link
                if (!!data[this.options.linkedName]) {
                    if (data[this.options.linkedName] === 'internal') {
                        this.sandbox.dom.append($container,
                            '<span class="fa-internal-link col-icon" title="' + this.sandbox.translate(this.options.tooltipTranslations.internalLink) + '"></span>');
                    } else if (data[this.options.linkedName] === 'external') {
                        this.sandbox.dom.append($container,
                            '<span class="fa-external-link col-icon"  title="' + this.sandbox.translate(this.options.tooltipTranslations.externalLink) + '"></span>');
                    }
                }
                // type (ghost, shadow)
                if (!!data[this.options.typeName]) {
                    if (data[this.options.typeName].name === 'ghost') {
                        this.sandbox.dom.append($container,
                            '<span class="ghost col-icon"  title="' + this.sandbox.translate(this.options.tooltipTranslations.ghost) + '">' + data[this.options.typeName].value + '</span>');
                    } else if (data[this.options.typeName].name === 'shadow') {
                        this.sandbox.dom.append($container,
                            '<span class="fa-shadow-node col-icon"  title="' + this.sandbox.translate(this.options.tooltipTranslations.shadow) + '"></span>');
                    }
                }
                // unpublished
                if (!data[this.options.publishedName]) {
                    this.sandbox.dom.append($container,
                        '<span class="not-published col-icon"  title="' + this.sandbox.translate(this.options.tooltipTranslations.unpublished) + '">&bull;</span>');
                }
            }
            if (!!this.options.orderable) {
                this.sandbox.dom.append($container, this.sandbox.util.template(templates.orderInput)({
                    value: data.order
                }));
            }
        },

        /**
         * Renderes the text element of a column-item
         * @param $item - dom object of the item
         * @param data - the data for the item
         */
        renderItemText: function($item, data) {
            var $container = this.sandbox.dom.find('.' + constants.itemTextClass, $item);
            if (!!data[this.options.typeName] && data[this.options.typeName].name === 'ghost') {
                this.sandbox.dom.addClass($container, 'inactive');
            }
        },

        /**
         * Renders the right buttons and icons for an item
         * @param $item - dom object of the item
         * @param data - the data for the item
         * @param disabled - indicates if item is disabled
         */
        renderRightInfo: function($item, data, disabled) {
            var $container = this.sandbox.dom.find('.' + constants.iconsRightClass, $item),
                actionIcon = getActionIcon.call(this, data);

            if (this.options.showActionIcon === true && actionIcon && !disabled) {
                this.sandbox.dom.append($container, '<span class="' + actionIcon + ' action col-icon"></span>');
            }
            if (!!data[this.options.hasSubName] && (!disabled || !this.options.disabledChildren)) {
                this.sandbox.dom.append($container, '<span class="fa-chevron-right arrow inactive col-icon"></span>');
            }
        },

        /**
         * Sets the width of the text-container of an item
         * @param {Object} $item the dom-object of an item
         */
        setItemsTextWidth: function($item) {
            var width, $itemText;

            $itemText = this.sandbox.dom.find('.item-text', $item);
            width = constants.columnWidth - this.sandbox.dom.outerWidth(this.sandbox.dom.find('.icons-left', $item));
            width -= parseInt(this.sandbox.dom.css($item, 'padding-right').replace('px', ''));
            width -= parseInt(this.sandbox.dom.css($item, 'padding-left').replace('px', ''));
            width -= this.sandbox.dom.outerWidth(this.sandbox.dom.find('.icons-right', $item));
            width -= 17; // FIXME: Better solution? (For potential scrollbar)
            this.sandbox.dom.width($itemText, width);
            this.cropItemsText($itemText);
        },

        /**
         * Sets the text width of all items in a column
         * @param column
         */
        setColumnTextWidth: function(column) {
            this.sandbox.util.each(this.columns[column], function(id, item) {
                this.setItemsTextWidth(item.$el);
            }.bind(this));
        },

        /**
         * Crops the item text of an item depending on its width
         * @param $itemText {Object}
         */
        cropItemsText: function($itemText) {
            var title = this.sandbox.dom.attr($itemText, 'title'),
                croppedTitle,
                maxLength = title.length,
                overflow;

            //set the item text to the original title
            this.sandbox.dom.html($itemText, title);
            this.sandbox.dom.css($itemText, 'font-weight', 'bold');

            overflow = (this.sandbox.dom.get($itemText, 0).scrollWidth > this.sandbox.dom.width($itemText));

            while (overflow === true) {
                maxLength--;
                croppedTitle = this.sandbox.util.cropMiddle(title, maxLength);
                this.sandbox.dom.html($itemText, croppedTitle);
                overflow = (this.sandbox.dom.get($itemText, 0).scrollWidth > this.sandbox.dom.width($itemText));
            }
            this.sandbox.dom.css($itemText, 'font-weight', '');
        },

        /**
         * Sets/removes all needed classes to display a node as selected
         * @param $element
         */
        setElementSelected: function($element) {
            this.sandbox.dom.addClass($element, 'selected');
            var $arrowElement = this.sandbox.dom.find('.arrow', $element);
            this.sandbox.dom.removeClass($arrowElement, 'inactive');
        },

        /**
         * Adds the loading icon to a contianer
         * @param $container
         */
        addLoadingIcon: function($container) {
            this.sandbox.dom.removeClass($container, 'fa-chevron-right inactive');

            if (this.dom.$loader === null) {
                this.dom.$loader = this.sandbox.dom.createElement('<div class="' + constants.nodeLoaderClass + '"/>');
                this.sandbox.dom.hide(this.dom.$loader);
            }
            if (this.sandbox.dom.is(this.dom.$loader, ':empty')) {
                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: this.dom.$loader,
                            size: '16px',
                            color: '#666666'
                        }
                    }
                ]);
            }
            this.sandbox.dom.detach(this.dom.$loader);
            this.sandbox.dom.html($container, this.dom.$loader);
            this.sandbox.dom.show(this.dom.$loader);
        },

        /**
         * Removes loading icon from selected element
         */
        removeLoadingIconForSelected: function() {
            if (!!this.$selectedElement) {
                var $arrow = this.sandbox.dom.find('.arrow', this.$selectedElement);
                this.sandbox.dom.hide(this.dom.$loader);
                this.sandbox.dom.prependClass($arrow, 'fa-chevron-right');
            }
        },

        /**
         * Stores data in internal structure - seperated by column number
         * @param {Object} item
         * @param {Number} columnNumber
         */
        storeDataItem: function(columnNumber, item) {

            if (!this.columns[columnNumber]) {
                this.columns[columnNumber] = {};
            }
            this.columns[columnNumber][item[this.options.idName]] = item;
        },

        bindDOMEvents: function() {
            var selector = 'li:not(.selected' + (this.options.disabledChildren ? ', .' + constants.disabledClass : '') + ')';

            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), selector);

            this.sandbox.dom.on(this.$el, 'mouseenter', this.itemMouseEnter.bind(this), '.column-navigation li');
            this.sandbox.dom.on(this.$el, 'mouseleave', this.itemMouseLeave.bind(this), '.column-navigation li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.showOptions.bind(this), '.column');
            this.sandbox.dom.on(this.dom.$add, 'click', this.addNode.bind(this));
            this.sandbox.dom.on(this.$el, 'click', this.actionClickHandler.bind(this), '.action');
            this.sandbox.dom.on(this.dom.$container, 'dblclick', this.actionClickHandler.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
            }.bind(this), 'input[type="checkbox"]');

            if (this.options.responsive === true) {
                this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', function() {
                    this.setContainerHeight();
                    this.setOverflowClass();
                }.bind(this));
            }

            if (this.options.orderable) {
                this.sandbox.dom.on(this.$el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                }.bind(this), '.' + constants.orderInputClass);

                this.sandbox.dom.on(this.$el, 'focus', function(event) {
                    if (this.isOrdering === true) {
                        this.sandbox.dom.blur(event.currentTarget);
                        return false;
                    }
                    this.sandbox.dom.select(event.currentTarget);
                }.bind(this), '.' + constants.orderInputClass + ' input');

                // save last clicked element -> used to trigger the default action after the ordering has finished
                this.sandbox.dom.on(this.dom.$wrapper, 'mousedown', function(event) {
                    this.lastClicked = this.sandbox.dom.$(event.target);
                }.bind(this));

                this.sandbox.dom.on(this.dom.$ok, 'click', this.closeOrderMode.bind(this));
                this.sandbox.dom.on(this.$el, 'keydown', this.orderKeyHandler.bind(this), '.' + constants.orderInputClass + ' input');
                this.sandbox.dom.on(this.$el, 'focusout', this.orderBlurHandler.bind(this), '.' + constants.orderInputClass);
            }
        },

        /**
         * Handles the key-down event of a order-input
         * @param event
         */
        orderKeyHandler: function(event) {
            if (event.keyCode === 13) { // blur on enter
                this.sandbox.dom.blur(event.currentTarget);
            }
            if (event.keyCode === 27) { // cancel on esc
                var column = this.sandbox.dom.attr(this.sandbox.dom.parents(
                        event.currentTarget, '.' + constants.columnClass), 'data-column'),
                    item = this.sandbox.dom.attr(this.sandbox.dom.parents(
                        event.currentTarget, '.' + constants.columnItemClass), 'data-id');
                this.resetOrderInput(column, item);
                this.sandbox.dom.blur(event.currentTarget);
            }
        },

        /**
         * Handles the blur event of a order-input
         * @param event
         */
        orderBlurHandler: function(event) {
            if (this.isOrdering === false) {
                var column = this.sandbox.dom.attr(this.sandbox.dom.parents(event.currentTarget, '.' + constants.columnClass), 'data-column'),
                    item = this.sandbox.dom.attr(this.sandbox.dom.parents(event.currentTarget, '.' + constants.columnItemClass), 'data-id'),
                    $input = this.sandbox.dom.find('input', this.columns[column][item].$el);
                // if is an integer
                if (this.sandbox.dom.isNumeric(this.sandbox.dom.val($input)) &&
                    Math.floor(this.sandbox.dom.val($input)) == this.sandbox.dom.val($input)) {
                    this.orderPrepare(column, item);
                } else {
                    this.orderError(column, item);
                }
            }
        },

        /**
         * Looks if the position changes and executes the order or resets the inputs
         * @param column - column in which the item is
         * @param item - the id of the item
         */
        orderPrepare: function(column, item) {
            var $input = this.sandbox.dom.find('input', this.columns[column][item].$el),
                position = this.normalizeOrderPosition(column, parseInt(this.sandbox.dom.val($input), 10));
            this.sandbox.dom.val($input, position);
            this.sandbox.dom.removeClass(this.columns[column][item].$el, constants.orderErrorClass);
            if (position !== this.columns[column][item].order) {
                this.isOrdering = true;
                this.confirmOrder(
                    function() { // ok callback
                        this.order(column, item, position);
                        this.isOrdering = false;
                        this.sandbox.dom.click(this.lastClicked);
                    }.bind(this),
                    function() { // cancel callback
                        this.resetOrderInput(column, item);
                        this.isOrdering = false;
                        this.sandbox.dom.click(this.lastClicked);
                    }.bind(this)
                );
            }
        },

        /**
         * Changes the position of an item and updates the positions of the other items in the column
         * @param column - the index of the column in which the item is
         * @param item - the id of the item
         * @param newPosition - the new position of the item
         */
        order: function(column, item, newPosition) {
            var oldPosition = this.columns[column][item].order;
            this.sandbox.util.each(this.columns[column], function(itemId) {
                this.repositionItem(column, itemId, oldPosition, newPosition);
                this.resetOrderInput(column, itemId);
            }.bind(this));
            this.updateItemDomPosition(column, item);
            this.sandbox.util.delay(this.highlight.bind(this, item), 550);
            this.sandbox.emit(ORDERED.call(this), item, newPosition);
            this.isOrdering = false;
        },

        /**
         * Determines and resets the position of a single item, given a position-change
         * @param column - the column in which the item is
         * @param item - the id of the item
         * @param oldPosition - the old position of the position-change
         * @param newPosition - the new position of the position-change
         */
        repositionItem: function(column, item, oldPosition, newPosition) {
            if (this.columns[column][item].order === oldPosition) { // update property to new position
                this.columns[column][item].order = newPosition;
            } else { // update the order-position of the other items
                if (this.columns[column][item].order > oldPosition &&
                    this.columns[column][item].order <= newPosition) {
                    this.columns[column][item].order--;
                } else if (this.columns[column][item].order < oldPosition &&
                    this.columns[column][item].order >= newPosition) {
                    this.columns[column][item].order++;
                }
            }
        },

        /**
         * Brings an item to the position set in the order-position-property
         * @param column - the column of the item
         * @param item - the id of the item
         */
        updateItemDomPosition: function(column, item) {
            var $list = this.sandbox.dom.parent(this.columns[column][item].$el);
            this.sandbox.dom.detach(this.columns[column][item].$el);
            this.sandbox.dom.insertAt(
                this.columns[column][item].order - 1, '.' + constants.columnItemClass,
                $list, this.columns[column][item].$el
            );
            this.sandbox.dom.scrollAnimate(
                this.sandbox.dom.position(this.columns[column][item].$el).top,
                this.sandbox.dom.parents(this.columns[column][item].$el, '.' + constants.columnClass)
            );
        },

        /**
         * Resets the position input of an item
         * @param column
         * @param item
         */
        resetOrderInput: function(column, item) {
            var $input = this.sandbox.dom.find('input', this.columns[column][item].$el);
            this.sandbox.dom.val($input, this.columns[column][item].order);
        },

        /**
         * Normalizes a position used for ordering
         * @param column - the column for which the position gets normalized
         * @param position (int) - the position to normalize
         * @returns int - the normalized position
         */
        normalizeOrderPosition: function(column, position) {
            position = (position < 1) ? 1 : position;
            return (position > (Object.keys(this.columns[column])).length) ?
                Object.keys(this.columns[column]).length : position;
        },

        /**
         * Sets css-classes on an item, through which an input error get signalized
         * @param column - the column in which the item is
         * @param item - the id of the item
         */
        orderError: function(column, item) {
            this.sandbox.dom.addClass(this.columns[column][item].$el, constants.orderErrorClass);
        },

        /**
         * Shows a confirmation-overlay
         * @param okCallback - callback to execute if clicked on ok
         * @param closeCallback - callback to execute if clicked on ok
         */
        confirmOrder: function(okCallback, closeCallback) {
            this.sandbox.confirm.alert(this,
                this.options.orderConfirmTitle, this.options.orderConfirmMessage,
                okCallback, closeCallback);
        },

        /**
         * Sets an overflow-class to the container if the navigation is scrollable
         */
        setOverflowClass: function() {
            var $navigation = this.sandbox.dom.find('.column-navigation', this.$el);
            if (this.sandbox.dom.width($navigation) < this.sandbox.dom.get($navigation, 0).scrollWidth) {
                this.sandbox.dom.addClass($navigation, 'overflow');
            } else {
                this.sandbox.dom.removeClass($navigation, 'overflow');
            }
        },

        bindCustomEvents: function() {
            this.sandbox.on(BREADCRUMB.call(this), this.getBreadCrumb.bind(this));
            this.sandbox.on(UNMARK.call(this), this.unmark.bind(this));
            this.sandbox.on(HIGHLIGHT.call(this), this.highlight.bind(this));
            this.sandbox.on(ORDER.call(this), this.startOrderModeItem.bind(this));

            this.sandbox.on('husky.dropdown.' + this.options.instanceName + '.settings.dropdown.item.click', this.dropdownItemClicked.bind(this));

            if (this.options.responsive === true) {
                this.sandbox.on(RESIZE.call(this), function() {
                    this.setContainerHeight();
                    this.setOverflowClass();
                }.bind(this));
            }
        },

        /**
         * Sets a column containing an item with a given id in order-mode
         * @param itemId - the id of the item
         */
        startOrderModeItem: function(itemId) {
            var column = this.getColumnForItem(itemId);
            if (column > 0) {
                this.startOrderModeColumn(column);
            }
        },


        /**
         * Sets a column in order-mode
         * @param column - the index of the column
         */
        startOrderModeColumn: function(column) {
            if (this.inOrderMode === false && !!this.columns[column] && Object.keys(this.columns[column]).length > 1) {
                this.inOrderMode = true;
                var $column = this.$find('.' + constants.columnClass + '[data-column="' + column + '"]');
                this.lockOptions(column);
                this.sandbox.dom.addClass($column, constants.orderModeClass);
                this.sandbox.dom.hide(this.dom.$settings);
                this.sandbox.dom.hide(this.dom.$add);
                this.sandbox.dom.show(this.dom.$ok);
                setOptionButtonWidths.call(this);
                this.setColumnTextWidth(column);
                this.sandbox.emit(ORDER_START.call(this));
            }
        },

        /**
         * Closes the order mode
         */
        closeOrderMode: function() {
            if (this.inOrderMode === true) {
                var $column = this.$find('.' + constants.columnClass + '.' + constants.orderModeClass),
                    column = this.sandbox.dom.data($column, 'column');
                this.unlockOptions();
                this.sandbox.dom.removeClass($column, constants.orderModeClass);
                this.sandbox.dom.hide(this.dom.$ok);
                this.sandbox.dom.show(this.dom.$settings);
                this.sandbox.dom.show(this.dom.$add);
                this.setColumnTextWidth(column);
                this.inOrderMode = false;
                this.sandbox.emit(ORDER_END.call(this));
            }
        },

        /**
         * Highlights an item
         * @param item - the id of the item
         */
        highlight: function(item) {
            var column = this.getColumnForItem(item);
            if (column > 0) {
                this.sandbox.dom.addClass(this.columns[column][item].$el, constants.highlightClass);

                // remove class after effect has finished
                this.sandbox.dom.on(this.columns[column][item].$el, 'animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
                    this.sandbox.dom.removeClass(this.columns[column][item].$el, constants.highlightClass);
                }.bind(this));
            }
        },

        /**
         * Gets execute after an item in the settings-dropdown has been clicked
         * @param dropdownItem - the dropdown-item
         */
        dropdownItemClicked: function(dropdownItem) {
            if (!!this.lastHoveredColumn && !!dropdownItem.mode && dropdownItem.mode === 'order') {
                this.startOrderModeColumn(this.lastHoveredColumn);
            }
            if (!!this.selected[this.lastHoveredColumn]) {
                if (!!dropdownItem.callback) {
                    dropdownItem.callback(dropdownItem, this.selected[this.lastHoveredColumn], this.columns[this.lastHoveredColumn]);
                } else {
                    this.sandbox.emit(SETTINGS.call(this), dropdownItem, this.selected[this.lastHoveredColumn], this.columns[this.lastHoveredColumn]);
                }
            }
        },

        /**
         * Unmarks a node for a given id
         * @param id {Number|String} the id of the node to unmark
         */
        unmark: function(id) {
            var $element = this.$find('li[data-id="' + id + '"]');
            if (!!$element.length) {
                this.sandbox.dom.removeClass($element, constants.markedClass);
                this.marked.splice(this.marked.indexOf(id), 1);
            }
        },

        /**
         * Sets the text width
         * @param {Object} event
         */
        itemMouseEnter: function(event) {
            this.setItemsTextWidth(event.currentTarget);
        },

        /**
         * Sets the text width
         * @param {Object} event
         */
        itemMouseLeave: function(event) {
            this.setItemsTextWidth(event.currentTarget);
        },

        /**
         * Returns the breadcrumb
         * @param {Function} callback
         */
        getBreadCrumb: function(callback) {
            if (typeof callback === 'function') {
                callback(this.selected);
            } else {
                this.sandbox.logger.log("callback is not a function");
            }
        },

        /**
         * Shows the options at the last available column
         */
        showOptionsAtLast: function() {
            var $lastColumn = this.sandbox.dom.last(this.sandbox.dom.find('.column', this.dom.$container));
            this.showOptions({
                currentTarget: $lastColumn
            });
        },

        /**
         * Shows the options below the last hovered column
         * @param {Object} event
         */
        showOptions: function(event) {
            if (this.optionsLocked === false) {
                var $currentTarget = this.sandbox.dom.$(event.currentTarget);

                this.displayOptions($currentTarget);

                this.sandbox.dom.off(this.dom.$container, 'scroll.column-navigation.' + this.options.instanceName);
                this.sandbox.dom.on(this.dom.$container, 'scroll.column-navigation.' + this.options.instanceName, this.displayOptions.bind(this, $currentTarget));
            }
        },

        /**
         * Shows the options below the passed column and locks them
         * @param column - the index of the column
         */
        lockOptions: function(column) {
            var $column = this.$find('.' + constants.columnClass + '[data-column="' + column + '"]');
            if (!!$column.length) {
                this.showOptions({currentTarget: $column});
                this.optionsLocked = true;
            }
        },

        /**
         * Unlocks the options
         */
        unlockOptions: function() {
            this.optionsLocked = false;
        },

        /**
         * Displays the options-navigation under a given column
         * @param $activeColumn {object} column for which the options will be inserted
         */
        displayOptions: function($activeColumn) {
            if (!!this.inOrderMode) {
                return;
            }

            var visibleRatio;

            this.lastHoveredColumn = this.sandbox.dom.data($activeColumn, 'column');

            // calculate the ratio of how much of the hovered column is visible
            if (this.sandbox.dom.position($activeColumn).left + this.sandbox.dom.width($activeColumn) > this.sandbox.dom.width(this.dom.$container)) {
                visibleRatio = (this.sandbox.dom.width(this.dom.$container) - this.sandbox.dom.position($activeColumn).left ) / this.sandbox.dom.width($activeColumn);
            } else {
                visibleRatio = (this.sandbox.dom.width($activeColumn) + this.sandbox.dom.position($activeColumn).left) / this.sandbox.dom.width($activeColumn);
            }

            // display the option only if the column is visible enough
            if (visibleRatio >= constants.minVisibleRatio) {
                this.sandbox.dom.css(this.$optionsContainer, {'visibility': 'visible'});
                this.moveOptions($activeColumn);
                this.toggleSettingDropdownItems(this.lastHoveredColumn);
            } else {
                this.hideOptions();
            }
        },

        /**
         * Calls the enabler for all dropdown-items (if exists) and disables
         * or enalbes the corresponding item
         * @param column - the index of the column on which the enalber should check the states of the items
         */
        toggleSettingDropdownItems: function(column) {
            if (!!this.options.data && this.options.data.length > 0) {
                var context = createContext.call(this, column);
                this.sandbox.util.each(this.options.data, function(index, item) {
                    if (!!item.enabler && typeof item.enabler === 'function') {
                        this.sandbox.emit(
                            'husky.dropdown.' + this.options.instanceName + '.settings.dropdown.item.toggle',
                            item.id,
                            item.enabler(context)
                        );
                    }
                }.bind(this));
            }
        },

        /**
         * Updates the position of the options
         * @param $activeColumn {object} dom-object of active column
         */
        moveOptions: function($activeColumn) {
            var marginLeft = this.sandbox.dom.position($activeColumn).left - 1;
            $(this.$optionsContainer).css('margin-left', marginLeft + 'px');

            if (getAddButton.call(this)) {
                $(this.dom.$add).show();
            } else {
                $(this.dom.$add).hide();
            }

            setOptionButtonWidths.call(this);
        },

        /**
         * Hides options
         */
        hideOptions: function() {
            this.sandbox.dom.css(this.$optionsContainer, {'visibility': 'hidden'});
        },

        /**
         * Item was selected and data will be loaded if has sub
         * @param {Object} event
         */
        itemSelected: function(event) {
            //only do something if no column is loading
            if (this.columnLoadStarted === false) {
                this.closeOrderMode(); // force closing of possible order mode
                this.$selectedElement = this.sandbox.dom.$(event.currentTarget);
                var id = this.sandbox.dom.data(this.$selectedElement, 'id'),
                    column = this.sandbox.dom.data(this.sandbox.dom.parent(this.sandbox.dom.parent(this.$selectedElement)), 'column'),
                    selectedItem = this.columns[column][id],
                    length = this.selected.length - 1,
                    i, $arrowElement;


                if (this.sandbox.dom.hasClass(this.$selectedElement, 'selected')) { // is element already selected

                    this.sandbox.emit(SELECTED.call(this), selectedItem);

                } else { // element not selected

                    this.removeCurrentSelected(column);

                    this.sandbox.dom.addClass(this.$selectedElement, 'selected');
                    $arrowElement = this.sandbox.dom.find('.arrow', this.$selectedElement);
                    this.addLoadingIcon($arrowElement);

                    if (!!selectedItem) {

                        // remove old elements from breadcrumb
                        for (i = length; i >= column; i--) {
                            delete this.selected[i];
                        }

                        // add element to breadcrumb
                        this.selected[column] = selectedItem;
                        this.sandbox.emit(SELECTED.call(this), selectedItem);

                        if (!!selectedItem[this.options.hasSubName]) {
                            this.load(selectedItem._links.children.href, column);
                        }

                        this.removeColumns(column + 1);
                        this.setOverflowClass();
                    }
                }

                // scroll for add column
                if (!selectedItem.hasSub) {
                    this.insertAddColumn(selectedItem, column);
                    this.scrollIfNeeded(column);
                    this.setOverflowClass();
                    this.toggleSettingDropdownItems(column);
                }
            }
        },

        insertAddColumn: function(selectedItem, column) {
            var $addColumn = this.sandbox.dom.createElement(this.sandbox.util.template(templates.column)({
                columnNumber: column + 1,
                id: 'column' + this.options.instanceName + '-' + (column + 1)
            }));
            // fill it with the "No Page"-content
            this.sandbox.dom.append($addColumn, this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.noPage)({
                    description: this.sandbox.translate(this.options.noPageDescription)
                })
            ));
            this.sandbox.dom.append(this.dom.$container, $addColumn);
            this.filledColumns++;
        },

        /**
         * Scrolls if needed
         * @param column
         */
        scrollIfNeeded: function(column) {
            if (column > constants.displayedcolumns) {
                this.sandbox.dom.scrollLeft(this.dom.$container, (column - constants.displayedcolumns) * constants.columnWidth);
            }
        },

        /**
         * Removes the selected class from old elements
         * @param {Number} column
         */
        removeCurrentSelected: function(column) {
            var $items = this.sandbox.dom.find('li', '#column' + this.options.instanceName + '-' + column);

            this.sandbox.util.each($items, function(index, $el) {
                this.sandbox.dom.removeClass($el, 'selected');
                var $arrowElement = this.sandbox.dom.find('.arrow', $el);
                this.sandbox.dom.addClass($arrowElement, 'inactive');
            }.bind(this));
        },

        /**
         * Emits an add event
         */
        addNode: function() {
            var parent = this.selected[this.lastHoveredColumn - 1] || null;
            this.sandbox.emit(ADD.call(this), parent);
        },

        /**
         * Handles the click on action-icons as well as the double click on items
         * @param {Object} event
         */
        actionClickHandler: function(event) {
            var $listItem, id, item, column;

            if (this.inOrderMode === true) {
                return false;
            }

            if (this.sandbox.dom.hasClass(event.currentTarget, 'action') === true) {
                $listItem = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget));
            } else {
                $listItem = this.sandbox.dom.$(event.currentTarget);
            }

            if ($listItem.hasClass(constants.disabledClass)) {
                return;
            }

            column = this.sandbox.dom.index(this.sandbox.dom.parents(event.currentTarget, '.column'));
            id = this.sandbox.dom.attr($listItem, 'data-id');
            item = this.columns[column][id];

            if (this.options.markable === true) {
                this.sandbox.dom.addClass($listItem, constants.markedClass);
                this.marked.push(id);
                this.setItemsTextWidth($listItem);
            }

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.emit(ACTION.call(this), item);
        }
    };
});


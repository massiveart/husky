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
 * @params {String} [options.editIcon] icon class of edit button
 * @params {Array}  [options.data] array of data displayed in the settings dropdown
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
 * @params {Boolean} [options.showOptions] hide or display edit elements
 * @params {Boolean} [options.showStatus] hide or display status of elements
 * @params {String} [options.skin] css class which gets added to the components element. Available: '', 'fixed-height-small'
 * @params {Boolean} [options.markable] If true a node gets marked with a css class on click on the blue button
 * @params {Array} [options.premarkedIds] an array of uuids of nodes which should be marked from the beginning on
 */
define([], function () {

    'use strict';

    var defaults = {
            url: null,
            selected: null,
            data: null,
            instanceName: '',
            hasSubName: 'hasSub',
            editIcon: 'fa-pencil',
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
            markable: false
        },

        constants = {
            responsiveHeightRation: 7/10,
            columnWidth: 250,
            minVisibleRatio: 1/2,
            markedClass: 'marked',
            displayedcolumns: 2, // number of displayed columns with content
            wrapperClass: 'column-navigation-wrapper',
            columnClass: 'column',
            optionsClass: 'options',
            componentClass: 'husky-column-navigation',
            nodeLoaderClass: 'husky-column-navigation-loader',
            bigLoaderClass: 'column-navigation-loader',
            columnItemClass: 'column-item',
            iconsLeftClass: 'icons-left',
            iconsRightClass: 'icons-right',
            itemTextClass: 'item-text'
        },

        templates = {
            wrapper: ['<div class="'+ constants.wrapperClass +'"></div>'].join(''),
            container: ['<div class="column-navigation"></div>'].join(''),

            column: ['<div data-column="<%= columnNumber %>" class="'+ constants.columnClass +'" id="<%= id %>">',
                     '    <ul></ul>',
                    '</div>'].join(''),

            noPage: ['<div class="no-page">',
                     '    <span class="fa-coffee icon"></span>',
                     '    <div class="text"><%= description %></div>',
                     '</div>'].join(''),

            optionsContainer: ['<div class="'+ constants.optionsClass +' grid-row"></div>'].join(''),

            optionsAdd: ['<div class="align-center add pointer">',
                            '<span class="fa-plus-circle"></span>',
                         '</div>'].join(''),

            optionsSettings: ['<div class="align-center settings pointer drop-down-trigger">',
                              '   <span class="fa-gear inline-block"></span><span class="dropdown-toggle inline-block"></span>',
                              '</div>'].join(''),

            item: ['<li data-id="<%= id %>" class="'+ constants.columnItemClass +'">',
                   '    <span class="'+ constants.iconsLeftClass +'"></span>',
                   '    <span title="<%= title %>" class="'+ constants.itemTextClass +'"><%= title%></span>',
                   '    <span class="'+ constants.iconsRightClass +'"></span>',
                   '</li>'].join('')
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
        INITIALIZED = function () {
            return createEventName.call(this, 'initialized');
        },

        /**
         * @event husky.column-navigation.loaded
         * @description the component has loaded everything successfully and will be rendered
         */
        LOADED = function () {
            return createEventName.call(this, 'loaded');
        },

        /**
         * @event husky.column-navigation.selected
         * @description an navigation element has been selected
         * @param {Object} selected object
         */
        SELECTED = function () {
            return createEventName.call(this, 'selected');
        },

        /**
         * @event husky.column-navigation.get-selected
         * @description listens on and passes the selected nodes to a given callback
         * @param {Function} callback to pass the ids to
         */
        GET_SELECTED = function () {
            return createEventName.call(this, 'get-selected');
        },

        /**
         * @event husky.column-navigation.settings
         * @description an navigation element has been selected and a item from selected dropdown clicked
         * @param {Object} selected column navigation object
         * @param {Object} clicked dropdown item
         */
        SETTINGS = function () {
            return createEventName.call(this, 'settings');
        },

        /**
         * @event husky.column-navigation.add
         * @description the add button has been clicked
         * @param {Object} parent object from active column level
         */
        ADD = function () {
            return createEventName.call(this, 'add');
        },

        /**
         * @event husky.column-navigation.edit
         * @description the edit icon has been clicked
         * @param {Object} clicked object
         */
        EDIT = function () {
            return createEventName.call(this, 'edit');
        },

        /**
         * @event husky.column-navigation.unmark
         * @description listens on and unmarks a node with a given id
         * @param {Number|String} the id of the node to unmark
         */
        UNMARK = function () {
            return createEventName.call(this, 'unmark');
        },

        /**
         * @event husky.column-navigation.get-breadcrumb
         * @description the breadcrumb will be returned
         * @param {Function} callback function which will process the breadcrumb objects
         */
        BREADCRUMB = function () {
            return createEventName.call(this, 'get-breadcrumb');
        },

        /**
         * @event husky.column-navigation.resize
         * @description the element will be resized
         * @param {Function} callback function which will process the breadcrumb objects
         */
        RESIZE = function () {
            return createEventName.call(this, 'resize');
        },

        /** returns normalized event names */
        createEventName = function (postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        initialize: function () {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.setProperties();
            this.render();
            this.startBigLoader();
            this.load(this.options.url, 0);
            this.bindDOMEvents();
            this.bindCustomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Initializes the class properties with their default-values
         */
        setProperties: function() {
            this.$selectedElement = null;
            this.filledColumns = 0;
            this.columnLoadStarted = false;
            this.dom = {
                $wrapper: null,
                $container: null,
                $add: null,
                $settings: null,
                $bigLoader: null,
                $loader: null
            };

            this.columns = [];
            this.selected = [];
            // array with all marked ids
            this.marked = this.options.premarkedIds || [];
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function () {
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
         * Renders the options-buttons. "Add" and "Settings"
         */
        renderOptions: function() {
            this.$optionsContainer = this.sandbox.dom.createElement(templates.optionsContainer);
            this.dom.$add = this.sandbox.dom.createElement(templates.optionsAdd);
            this.dom.$settings = this.sandbox.dom.createElement(templates.optionsSettings);
            this.sandbox.dom.append(this.$optionsContainer, this.dom.$add);
            this.sandbox.dom.append(this.$optionsContainer, this.dom.$settings);
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
        startBigLoader: function () {
            if (this.dom.$bigLoader === null) {
                this.dom.$bigLoader = this.sandbox.dom.createElement('<div class="'+ constants.bigLoaderClass +'"/>');
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
        removeBigLoader: function () {
            this.sandbox.dom.hide(this.dom.$bigLoader);
        },

        /**
         * Sets the height of the container
         */
        setContainerHeight: function () {
            var height = this.sandbox.dom.height(this.sandbox.dom.$window),
                top = this.sandbox.dom.offset(this.$el).top;
            this.sandbox.dom.height(this.dom.$container, (height - top) * constants.responsiveHeightRation);
        },

        /**
         * Instantiats the dropdown component
         * @param containerId dom id for element to start dropdown
         */
        initSettingsDropdown: function () {

            // TODO show dropdown only if item is selected and enable/disable certain elements of the dropdown depending on the selected element

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
        load: function (url, columnNumber) {
            if (!!url) {
                this.columnLoadStarted = true;
                this.sandbox.util.load(url)
                    .then(function (response) {
                        this.removeBigLoader();
                        this.columnLoadStarted = false;
                        this.parseData(response, columnNumber);
                        this.scrollIfNeeded(this.filledColumns + 1);
                        this.setOverflowClass();
                        this.showOptionsAtLast();
                        this.sandbox.emit(LOADED.call(this));
                    }.bind(this))
                    .fail(function (error) {
                        this.columnLoadStarted = false;
                        this.sandbox.logger.error("An error occured while fetching data from: ", error);
                    }.bind(this));

            } else {
                this.sandbox.logger.log("husky.column.navigation -  url not set, aborted loading of data");
            }
        },

        /**
         * Removes removes data and removes dom elements
         * @param {Number} newColumn
         */
        removeColumns: function (newColumn) {
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
        parseData: function (data, columnNumber) {
            // if there is nothing loaded yet, create a "root"-column
            if (columnNumber === 0) {
                this.columns[0] = [];
                this.columns[0][data[this.options.idName]] = data;
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
        renderColumn: function(number,  data) {
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
            this.sandbox.util.each(data._embedded[this.options.resultKey], function (index, value) {
                this.storeDataItem(number, value);
                var $item = this.renderItem(value);
                this.sandbox.dom.append($list, $item);
                this.setItemsTextWidth($item);

                // if there are sub-nodes for this node loaded (need to be rendered later, so we save a reference)
                if (!!value[this.options.hasSubName] && !!value._embedded[this.options.resultKey] && value._embedded[this.options.resultKey].length > 0) {
                    nodeWithSubNodes = value;
                    this.setElementSelected($item);
                    this.selected[number] = value;
                }

                // if this node is the specified as selected in the options, we select it
                if (!!this.options.selected && (this.options.selected === value[this.options.idName] || this.options.selected === value[this.options.pathName])) {
                    this.setElementSelected($item);
                    this.selected[number] = value;
                    lastSelected = value;
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
         * @param data
         * @returns the items dom-object
         */
        renderItem: function(data) {
            var $item = this.sandbox.dom.createElement(this.sandbox.util.template(templates.item)({
                title: data[this.options.titleName],
                id: data[this.options.idName]
            }));
            if (this.marked.indexOf(data[this.options.idName]) !== -1) { // if is marked
                this.sandbox.dom.addClass($item, constants.markedClass)
            }
            this.renderLeftInfo($item, data);
            this.renderItemText($item, data);
            this.renderRightInfo($item, data);
            return $item;
        },

        /**
         * Renders the left buttons and icons for an item
         * @param $item - dom object of the item
         * @param data - the data for the item
         */
        renderLeftInfo: function($item, data) {
            var $container = this.sandbox.dom.find('.' + constants.iconsLeftClass, $item);
            if (!!this.options.showStatus) {
                // link
                if (!!data[this.options.linkedName]) {
                    if (data[this.options.linkedName] === 'internal') {
                        this.sandbox.dom.append($container, '<span class="fa-internal-link col-icon"></span>');
                    } else if (data[this.options.linkedName] === 'external') {
                        this.sandbox.dom.append($container, '<span class="fa-external-link col-icon"></span>');
                    }
                }
                // type (ghost, shadow)
                if (!!data[this.options.typeName]) {
                    if (data[this.options.typeName].name === 'ghost') {
                        this.sandbox.dom.append($container, '<span class="ghost col-icon">'+ data[this.options.typeName].value +'</span>');
                    } else if (data[this.options.typeName].name === 'shadow') {
                        this.sandbox.dom.append($container, '<span class="fa-shadow-node col-icon"></span>');
                    }
                }
                // published
                if (!data[this.options.publishedName]) {
                    this.sandbox.dom.append($container, '<span class="not-published col-icon">&bull;</span>');
                }
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
         */
        renderRightInfo: function($item, data) {
            var $container = this.sandbox.dom.find('.' + constants.iconsRightClass, $item);
            this.sandbox.dom.append($container, '<span class="' + this.options.editIcon + ' edit col-icon"></span>');
            if (!!data[this.options.hasSubName]) {
                this.sandbox.dom.append($container, '<span class="fa-chevron-right arrow inactive col-icon"></span>');
            }
        },

        /**
         * Sets the width of the text-container of an item
         * @param {Object} $item the dom-object of an item
         */
        setItemsTextWidth: function ($item) {
            var width, $itemText;

            $itemText = this.sandbox.dom.find('.item-text', $item);
            width = constants.columnWidth - this.sandbox.dom.outerWidth(this.sandbox.dom.find('.icons-left', $item));
            width = width - parseInt(this.sandbox.dom.css($item, 'padding-right').replace('px', '')) - 2;
            width = width - parseInt(this.sandbox.dom.css($item, 'padding-left').replace('px', ''));
            width = width - this.sandbox.dom.outerWidth(this.sandbox.dom.find('.icons-right', $item));

            this.sandbox.dom.width($itemText, width);
            this.cropItemsText($itemText);
        },

        /**
         * Crops the item text of an item depending on its width
         * @param $itemText {Object}
         */
        cropItemsText: function ($itemText) {
            var title = this.sandbox.dom.attr($itemText, 'title'),
                croppedTitle,
                maxLength = title.length,
                overflow;

            //set the item text to the original title
            this.sandbox.dom.html($itemText, title);

            overflow = (this.sandbox.dom.get($itemText, 0).scrollWidth > this.sandbox.dom.width($itemText));

            while (overflow === true) {
                maxLength = maxLength - 1;
                croppedTitle = this.sandbox.util.cropMiddle(title, maxLength);
                this.sandbox.dom.html($itemText, croppedTitle);
                overflow = (this.sandbox.dom.get($itemText, 0).scrollWidth > this.sandbox.dom.width($itemText));
            }
        },

        /**
         * Sets/removes all needed classes to display a node as selected
         * @param $element
         */
        setElementSelected: function ($element) {
            this.sandbox.dom.addClass($element, 'selected');
            var $arrowElement = this.sandbox.dom.find('.arrow', $element);
            this.sandbox.dom.removeClass($arrowElement, 'inactive');
        },

        /**
         * Adds the loading icon to a contianer
         * @param $container
         */
        addLoadingIcon: function ($container) {
            this.sandbox.dom.removeClass($container, 'fa-chevron-right inactive');

            if (this.dom.$loader === null) {
                this.dom.$loader = this.sandbox.dom.createElement('<div class="'+ constants.nodeLoaderClass +'"/>');
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
        removeLoadingIconForSelected: function () {
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
        storeDataItem: function (columnNumber, item) {

            if (!this.columns[columnNumber]) {
                this.columns[columnNumber] = [];
            }
            this.columns[columnNumber][item[this.options.idName]] = item;

        },

        bindDOMEvents: function () {
            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), 'li:not(.selected)');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.itemMouseEnter.bind(this), '.column-navigation li');
            this.sandbox.dom.on(this.$el, 'mouseleave', this.itemMouseLeave.bind(this), '.column-navigation li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.showOptions.bind(this), '.column');
            this.sandbox.dom.on(this.dom.$add, 'click', this.addNode.bind(this));
            this.sandbox.dom.on(this.$el, 'click', this.editNode.bind(this), '.edit');
            this.sandbox.dom.on(this.$el, 'dblclick', this.editNode.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'click', function (event) {
                this.sandbox.dom.stopPropagation(event);
            }.bind(this), 'input[type="checkbox"]');

            if (this.options.responsive === true) {
                this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', function () {
                    this.setContainerHeight();
                    this.setOverflowClass();
                }.bind(this));
            }
        },

        /**
         * Sets an overflow-class to the container if the navigation is scrollable
         */
        setOverflowClass: function () {
            var $navigation = this.sandbox.dom.find('.column-navigation', this.$el);
            if (this.sandbox.dom.width($navigation) < this.sandbox.dom.get($navigation, 0).scrollWidth) {
                this.sandbox.dom.addClass($navigation, 'overflow');
            } else {
                this.sandbox.dom.removeClass($navigation, 'overflow');
            }
        },

        bindCustomEvents: function () {
            this.sandbox.on(BREADCRUMB.call(this), this.getBreadCrumb.bind(this));
            this.sandbox.on(GET_SELECTED.call(this), this.getSelected.bind(this));
            this.sandbox.on(UNMARK.call(this), this.unmark.bind(this));

            this.sandbox.on('husky.dropdown.' + this.options.instanceName + '.settings.dropdown.item.click', this.dropdownItemClicked.bind(this));

            if (this.options.responsive === true) {
                this.sandbox.on(RESIZE.call(this), function () {
                    this.setContainerHeight();
                    this.setOverflowClass();
                }.bind(this));
            }
        },

        dropdownItemClicked: function (item) {
            if (!!this.selected[this.lastHoveredColumn]) {
                if (!!item.callback) {
                    item.callback(item, this.selected[this.lastHoveredColumn], this.columns[this.lastHoveredColumn]);
                } else {
                    this.sandbox.emit(SETTINGS.call(this), item, this.selected[this.lastHoveredColumn], this.columns[this.lastHoveredColumn]);
                }
            }
        },

        /**
         * Unmarks a node for a given id
         * @param id {Number|String} the id of the node to unmark
         */
        unmark: function (id) {
            var $element = this.$find('li[data-id="' + id + '"]');
            if (!!$element.length) {
                this.sandbox.dom.removeClass($element, constants.markedClass);
                this.marked.splice(this.marked.indexOf(id), 1);
            }
        },

        /**
         * Passes all selected nodes to a callback
         * @param callback {Function} the callback to pass the selected nodes to
         */
        getSelected: function (callback) {
            var $checkboxes = this.$find('input[type="checkbox"]:checked'),
                checkedNodes = [],
                $column, $node;
            if ($checkboxes.length !== 0) {
                this.sandbox.util.foreach($checkboxes, function ($checkbox) {
                    //TODO: foreach checkbox get the node object and create the checked Nodes array
                }.bind(this));
            }
        },

        /**
         * Sets the text width
         * @param {Object} event
         */
        itemMouseEnter: function (event) {
            this.setItemsTextWidth(event.currentTarget);
        },

        /**
         * Sets the text width
         * @param {Object} event
         */
        itemMouseLeave: function (event) {
            this.setItemsTextWidth(event.currentTarget);
        },

        /**
         * Returns the breadcrumb
         * @param {Function} callback
         */
        getBreadCrumb: function (callback) {
            if (typeof callback === 'function') {
                callback(this.selected);
            } else {
                this.sandbox.logger.log("callback is not a function");
            }
        },

        /**
         * Shows the options at the last available column
         */
        showOptionsAtLast: function () {
            var $lastColumn = this.sandbox.dom.last(this.sandbox.dom.find('.column', this.dom.$container));
            this.showOptions({
                currentTarget: $lastColumn
            });
        },

        /**
         * Shows the options below the last hovered column
         * @param {Object} event
         */
        showOptions: function (event) {
            var $currentTarget = this.sandbox.dom.$(event.currentTarget);

            this.displayOptions($currentTarget);

            this.sandbox.dom.off(this.dom.$container, 'scroll.column-navigation.' + this.options.instanceName);
            this.sandbox.dom.on(this.dom.$container, 'scroll.column-navigation.' + this.options.instanceName, this.displayOptions.bind(this, $currentTarget));
        },

        /**
         * Displays the options-navigation under a given column
         * @param $activeColumn {object} column for which the options will be inserted
         */
        displayOptions: function ($activeColumn) {
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
                this.updateOptionsMargin($activeColumn);
            } else {
                this.hideOptions();
            }
        },

        /**
         * Updates the position of the options
         * @param $activeColumn {object} dom-object of active column
         */
        updateOptionsMargin: function ($activeColumn) {
            var marginLeft = this.sandbox.dom.position($activeColumn).left - 1;
            this.sandbox.dom.css(this.$optionsContainer, 'margin-left', marginLeft + 'px');
        },

        /**
         * Hides options
         */
        hideOptions: function () {
            this.sandbox.dom.css(this.$optionsContainer, {'visibility': 'hidden'});
        },

        /**
         * Item was selected and data will be loaded if has sub
         * @param {Object} event
         */
        itemSelected: function (event) {
            //only do something if no column is loading
            if (this.columnLoadStarted === false) {
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
                            this.load(selectedItem._links.children, column);
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
                }
            }
        },

        insertAddColumn: function (selectedItem, column) {
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
        scrollIfNeeded: function (column) {
            if (column > constants.displayedcolumns) {
                this.sandbox.dom.scrollLeft(this.dom.$container, (column - constants.displayedcolumns) * constants.columnWidth);
            }
        },

        /**
         * Removes the selected class from old elements
         * @param {Number} column
         */
        removeCurrentSelected: function (column) {
            var $items = this.sandbox.dom.find('li', '#column' + this.options.instanceName + '-' + column);

            this.sandbox.util.each($items, function (index, $el) {
                this.sandbox.dom.removeClass($el, 'selected');
                var $arrowElement = this.sandbox.dom.find('.arrow', $el);
                this.sandbox.dom.addClass($arrowElement, 'inactive');
            }.bind(this));
        },

        /**
         * Emits an add event
         */
        addNode: function () {
            var parent = this.selected[this.lastHoveredColumn - 1] || null;
            this.sandbox.emit(ADD.call(this), parent);
        },

        /**
         * Emits an edit event
         * @param {Object} event
         */
        editNode: function (event) {
            var $listItem, id, item, column;

            if (this.sandbox.dom.hasClass(event.currentTarget, 'edit') === true) {
                $listItem = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget));
            } else {
                $listItem = this.sandbox.dom.$(event.currentTarget);
            }
            column = this.sandbox.dom.index(this.sandbox.dom.parents(event.currentTarget, '.column'));
            id = this.sandbox.dom.attr($listItem, 'data-id');
            item = this.columns[column][id];

            if (this.options.markable === true) {
                this.sandbox.dom.addClass($listItem, this.options.markedClass);
                this.marked.push(id);
                this.setItemsTextWidth($listItem);
            }

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.emit(EDIT.call(this), item);
        }
    };
});


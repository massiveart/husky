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
 * @params {Number} [options.wrapper.height] height of container in percentage
 * @params {Number} [options.column.width] width of a column in within the navigation in pixels
 * @params {Number} [options.scrollBarWidth] with of scrollbar
 * @params {String} [options.url] url to load data
 * @params {String} [options.selected] id of selected element - needed to restore state
 * @params {String} [options.editIcon] icon class of edit button
 * @params {Array}  [options.data] array of data displayed in the settings dropdown
 * @params {String} [options.instanceName] name of current instance
 * @params {String} [options.hasSubName] name of hasSub-key
 * @params {String} [options.idName] name of id-key
 * @params {String} [options.linkedName] name of linked-key
 * @params {String} [options.publishedName] name of published-key
 * @params {String} [options.typeName] name of type-key
 * @params {String} [options.titleName] name of title-key
 * @params {String} [options.resultKey] The name of the array in the responded _embedded
 * @params {Number} [options.visibleRatio] minimum ratio of how much of a column must be visible to display the navigation
 * @params {Boolean} [options.responsive] If true the resize listener gets initialized. Otherwise the column navigation just takes up 100 % of the height and width
 * @params {Boolean} [options.showEdit] hide or display edit elements
 * @params {Boolean} [options.showEditIcon] hide or display edit icon element
 * @params {Boolean} [options.showStatus] hide or display status of elements
 * @params {String} [options.skin] css class which gets added to the components element. Available: '', 'fixed-height-small'
 * @params {Boolean} [options.markable] If true a node gets marked with a css class on click on the blue button
 * @params {String} [options.markedClass] The css-class which gets set on the node if node gets marked
 * @params {Array} [options.premarkedIds] an array of uuids of nodes which should be marked from the beginning on
 */
define([], function () {

    'use strict';

    var defaults = {
            wrapper: {
                height: 70
            },
            column: {
                width: 250
            },
            paddingLeft: 50,
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
            minVisibleRatio: 1 / 2,
            noPageDescription: 'public.no-pages',
            skin: '',
            resultKey: 'nodes',
            responsive: true,
            showEdit: true,
            showEditIcon: true,
            showStatus: true,
            premarkedIds: [],
            markedClass: 'marked',
            markable: false
        },

        DISPLAYEDCOLUMNS = 2, // number of displayed columns with content

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

            this.$element = this.sandbox.dom.$(this.options.el);
            this.$selectedElement = null;
            this.filledColumns = 0;
            this.columnLoadStarted = false;
            this.$loader = null;
            this.$bigLoader = null;

            this.columns = [];
            this.selected = [];
            // array with all marked ids
            this.marked = this.options.premarkedIds || [];

            this.render();
            this.startBigLoader();
            this.load(this.options.url, 0);
            this.bindDOMEvents();
            this.bindCustomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function () {
            var $add, $settings, $wrapper;

            this.sandbox.dom.addClass(this.$el, 'husky-column-navigation');
            if (!!this.options.skin) {
                this.sandbox.dom.addClass(this.$el, this.options.skin);
            }

            $wrapper = this.sandbox.dom.$(this.template.wrapper.call(this));
            this.sandbox.dom.append(this.$element, $wrapper);

            // navigation container

            this.$columnContainer = this.sandbox.dom.$(this.template.columnContainer.call(this));
            this.sandbox.dom.append($wrapper, this.$columnContainer);

            // options container - add and settings button
            this.addId = this.options.instanceName + "-column-navigation-add";
            this.settingsId = this.options.instanceName + "-column-navigation-settings";

            if (!!this.options.showEdit) {
                this.$optionsContainer = this.sandbox.dom.$(this.template.optionsContainer.call(this, this.options.column.width));
                $add = this.sandbox.dom.$(this.template.options.add(this.addId));
                $settings = this.sandbox.dom.$(this.template.options.settings(this.settingsId));
                this.sandbox.dom.append(this.$optionsContainer, $add);
                this.sandbox.dom.append(this.$optionsContainer, $settings);
                this.hideOptions();
                this.sandbox.dom.append($wrapper, this.$optionsContainer);
            }

            if (this.options.responsive === true) {
                this.setContainerHeight();
            }

            //init dropdown for settings in options container
            if (!!this.options.data) {
                this.initSettingsDropdown(this.sandbox.dom.attr($settings, 'id'));
            }

        },

        /**
         * Starts the big loader, before loading content during the initialization
         */
        startBigLoader: function () {
            if (this.$bigLoader === null) {
                this.$bigLoader = this.sandbox.dom.createElement('<div class="column-navigation-loader"/>');
                this.sandbox.dom.hide(this.$bigLoader);
                this.sandbox.dom.html(this.$columnContainer, this.$bigLoader);

                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: this.$bigLoader,
                            size: '100px',
                            color: '#e4e4e4'
                        }
                    }
                ]);
            }
            this.sandbox.dom.show(this.$bigLoader);
        },

        /**
         * Detatches the big loader from the column-navigation
         */
        removeBigLoader: function () {
            this.sandbox.dom.hide(this.$find('.column-navigation-loader'));
        },

        /**
         * Sets the height of the container
         */
        setContainerHeight: function () {
            var height = this.sandbox.dom.height(this.sandbox.dom.$window),
                top = this.sandbox.dom.offset(this.$el).top - (this.sandbox.dom.$window !== this.sandbox.dom.$window ? this.sandbox.dom.offset(this.sandbox.dom.$window).top : 0);
            top = top < 0 ? 0 : top;

            this.sandbox.dom.height(
                this.$columnContainer, (height - top) * this.options.wrapper.height / 100
            );
        },

        /**
         * Instantiats the dropdown component
         * @param containerId dom id for element to start dropdown
         */
        initSettingsDropdown: function (containerId) {

            // TODO show dropdown only if item is selected and enable/disable certain elements of the dropdown depending on the selected element

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: '#' + containerId,
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
                        this.handleLastEmptyColumn();
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
            var $column, $list, newColumn, nodeWithSubNodes = null, lastSelected = null;

            if (columnNumber === 0) {  // case 1: no elements in container
                this.columns[0] = [];
                this.columns[0][data[this.options.idName]] = data;
                newColumn = 1;
            } else { // case 2: columns in container replace level after clicked column and clear following levels
                newColumn = columnNumber + 1;
            }

            $column = this.sandbox.dom.$(this.template.column.call(this, newColumn, this.options.column.width));
            this.sandbox.dom.append(this.$columnContainer, $column);

            $list = this.sandbox.dom.find('ul', $column);

            this.sandbox.util.each(data._embedded[this.options.resultKey], function (index, value) {
                this.storeDataItem(newColumn, value);
                var $element = this.sandbox.dom.$(this.template.item.call(this, this.options.column.width, value));
                this.sandbox.dom.append($list, $element);

                this.setItemsTextWidth($element);

                // remember which item has subitems to display a whole tree when column navigation should be restored
                if (!!value[this.options.hasSubName] && !!value._embedded[this.options.resultKey] && value._embedded[this.options.resultKey].length > 0) {
                    nodeWithSubNodes = value;
                    this.setElementSelected($element);
                    this.selected[newColumn] = value;
                }

                // needed to select node in last level of nodes
                if (!!this.options.selected && (this.options.selected === value[this.options.idName] || this.options.selected === value[this.options.pathName])) {
                    this.setElementSelected($element);
                    this.selected[newColumn] = value;
                    lastSelected = value;
                }
            }.bind(this));

            this.removeLoadingIconForSelected();

            this.filledColumns = newColumn;

            if (!!nodeWithSubNodes) { // parse next column if data exists
                this.parseData(nodeWithSubNodes, newColumn);
            } else if (!!lastSelected && !lastSelected[this.options.hasSubName]) { // append add column if no children
                this.addColumn(lastSelected, newColumn);
            }
        },

        /**
         * Sets the width of the text-container of an item
         * @param {Object} $item the dom-object of an item
         */
        setItemsTextWidth: function ($item) {
            var width, $itemText;

            $itemText = this.sandbox.dom.find('.item-text', $item);
            width = this.options.column.width - this.sandbox.dom.outerWidth(this.sandbox.dom.find('.icons-left', $item));
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

            if (this.$loader === null) {
                this.$loader = this.sandbox.dom.createElement('<div class="husky-column-navigation-loader"/>');
                this.sandbox.dom.hide(this.$loader);
            }
            if (this.sandbox.dom.is(this.$loader, ':empty')) {
                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: this.$loader,
                            size: '16px',
                            color: '#666666'
                        }
                    }
                ]);
            }
            this.sandbox.dom.detach(this.$loader);
            this.sandbox.dom.html($container, this.$loader);
            this.sandbox.dom.show(this.$loader);
        },

        /**
         * Removes loading icon from selected element
         */
        removeLoadingIconForSelected: function () {
            if (!!this.$selectedElement) {
                var $arrow = this.sandbox.dom.find('.arrow', this.$selectedElement);
                this.sandbox.dom.hide(this.$loader);
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
            this.sandbox.dom.on(this.$el, 'click', this.addNode.bind(this), '#' + this.addId);
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

        /**
         * Inserts some markup into the last column if column is empty
         */
        handleLastEmptyColumn: function () {
            var $lastColumn = this.sandbox.dom.last(this.sandbox.dom.find('.column', this.$columnContainer));

            this.sandbox.dom.remove(this.sandbox.dom.find('.no-page', this.$columnContainer));

            // if last column is empty insert markup
            if (this.sandbox.dom.find('li', $lastColumn).length === 0) {
                this.sandbox.dom.append($lastColumn, this.template.noPage.call(this, this.sandbox.translate(this.options.noPageDescription)));
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
                this.sandbox.dom.removeClass($element, this.options.markedClass);
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
            var $lastColumn = this.sandbox.dom.last(this.sandbox.dom.find('.column', this.$columnContainer));
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

            this.sandbox.dom.off(this.$columnContainer, 'scroll.column-navigation.' + this.options.instanceName);
            this.sandbox.dom.on(this.$columnContainer, 'scroll.column-navigation.' + this.options.instanceName, this.displayOptions.bind(this, $currentTarget));
        },

        /**
         * Displays the options-navigation under a given column
         * @param $activeColumn {object} column for which the options will be inserted
         */
        displayOptions: function ($activeColumn) {
            var visibleRatio;

            this.lastHoveredColumn = this.sandbox.dom.data($activeColumn, 'column');

            // calculate the ratio of how much of the hovered column is visible
            if (this.sandbox.dom.position($activeColumn).left + this.sandbox.dom.width($activeColumn) > this.sandbox.dom.width(this.$columnContainer)) {
                visibleRatio = (this.sandbox.dom.width(this.$columnContainer) - this.sandbox.dom.position($activeColumn).left ) / this.sandbox.dom.width($activeColumn);
            } else {
                visibleRatio = (this.sandbox.dom.width($activeColumn) + this.sandbox.dom.position($activeColumn).left) / this.sandbox.dom.width($activeColumn);
            }

            // display the option only if the column is visible enough
            if (visibleRatio >= this.options.minVisibleRatio) {
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
                    this.addColumn(selectedItem, column);
                    this.handleLastEmptyColumn();
                    this.scrollIfNeeded(column);
                    this.setOverflowClass();
                }
            }
        },

        addColumn: function (selectedItem, column) {
            this.sandbox.dom.append(
                this.$columnContainer,
                this.sandbox.dom.createElement(this.template.column.call(this, column + 1, this.options.column.width))
            );

            this.filledColumns++;
        },

        /**
         * Scrolls if needed
         * @param column
         */
        scrollIfNeeded: function (column) {
            if (column > DISPLAYEDCOLUMNS) {
                this.sandbox.dom.scrollLeft(this.$columnContainer, (column - DISPLAYEDCOLUMNS) * this.options.column.width);
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
        },

        /**
         * Templates for various parts
         */
        template: {

            wrapper: function () {
                return '<div class="column-navigation-wrapper"></div>';
            },

            columnContainer: function () {
                return ['<div class="column-navigation"></div>'].join('');
            },

            column: function (columnNumber, width) {
                return ['<div data-column="', columnNumber, '" class="column" id="column' + this.options.instanceName + '-', columnNumber, '" style="width: ', width, 'px"><ul></ul></div>'].join('');
            },

            noPage: function (description) {
                return ['<div class="no-page">',
                    '<span class="fa-coffee icon"></span>',
                    '<div class="text">', description , '</div>',
                    '</div>'].join('');
            },

            item: function (width, data) {

                var isMarked = (this.marked.indexOf(data[this.options.idName]) !== -1),
                    item = ['<li data-id="', data[this.options.idName], '" class="pointer' + ((isMarked === true) ? ' ' + this.options.markedClass : '' ) + '">'];

                // icons left
                item.push('<span class="icons-left">');

                item.push('<span class="fa-check pull-left markedIcon"></span>');

                if (!!this.options.showStatus) {
                    // link
                    if (!!data[this.options.linkedName]) {
                        if (data[this.options.linkedName] === 'internal') {
                            item.push('<span class="fa-internal-link pull-left m-right-5"></span>');
                        } else if (data[this.options.linkedName] === 'external') {
                            item.push('<span class="fa-external-link pull-left m-right-5"></span>');
                        }
                    }

                    // type (ghost, shadow)
                    if (!!data[this.options.typeName]) {
                        if (data[this.options.typeName].name === 'ghost') {
                            item.push('<span class="ghost pull-left m-right-5">', data[this.options.typeName].value, '</span>');
                        } else if (data[this.options.typeName].name === 'shadow') {
                            item.push('<span class="fa-shadow-node pull-left m-right-5"></span>');
                        }
                    }

                    // published
                    if (!data[this.options.publishedName]) {
                        item.push('<span class="not-published pull-left m-right-5">&bull;</span>');
                    }
                }
                item.push('</span>');

                // text center
                if (!!data[this.options.typeName] && data[this.options.typeName].name === 'ghost') {
                    item.push('<span title="' + data[this.options.titleName] + '" class="item-text inactive pull-left">', data[this.options.titleName], '</span>');
                } else {
                    item.push('<span title="' + data[this.options.titleName] + '" class="item-text pull-left">', data[this.options.titleName], '</span>');
                }

                // icons right (subpage, edit)
                item.push('<span class="icons-right">');
                if (!!this.options.showEditIcon) {
                    item.push('<span class="' + this.options.editIcon + ' edit pull-left"></span>');
                }
                !!data[this.options.hasSubName] ? item.push('<span class="fa-chevron-right arrow inactive pull-left"></span>') : '';
                item.push('</span></li>');
                return item.join('');
            },

            optionsContainer: function (width) {
                return ['<div class="options grid-row" style="width:', width + 1, 'px"></div>'].join('');
            },

            options: {
                add: function (id) {
                    return ['<div id="', id, '" class="align-center add pointer">',
                        '<span class="fa-plus-circle"></span>',
                        '</div>'].join('');
                },

                settings: function (id) {
                    return ['<div id="', id, '" class="align-center settings pointer drop-down-trigger">',
                        '<span class="fa-gear inline-block"></span><span class="dropdown-toggle inline-block"></span>',
                        '</div>'].join('');
                }
            }
        }
    };
});


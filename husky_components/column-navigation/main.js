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
 * @params {Array}  [options.data] array of data displayed in the settings dropdown
 * @params {String} [options.instanceName] name of current instance
 * @params {String} [options.hasSubName] name of hasSub-key
 * @params {String} [options.idName] name of id-key
 * @params {String} [options.linkedName] name of linked-key
 * @params {String} [options.publishedName] name of published-key
 * @params {String} [options.typeName] name of type-key
 * @params {String} [options.titleName] name of title-key
 * @params {Number} [options.visibleRatio] minimum ratio of how much of a column must be visible to display the navigation
 *
 */
define([], function() {

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
            instanceName: 'undefined',
            hasSubName: 'hasSub',
            idName: 'id',
            linkedName: 'linked',
            publishedName: 'publishedState',
            titleName: 'title',
            typeName: 'type',
            minVisibleRatio: 1 / 2
        },

        DISPLAYEDCOLUMNS = 2, // number of displayed columns with content

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.column-navigation.',

        /**
         * @event husky.column-navigation.loaded
         * @description the component has loaded everything successfully and will be rendered
         */
            LOADED = eventNamespace + 'loaded',

        /**
         * @event husky.column-navigation.selected
         * @description an navigation element has been selected
         * @param {Object} selected object
         */
            SELECTED = eventNamespace + 'selected',

        /**
         * @event husky.column-navigation.settings
         * @description an navigation element has been selected and a item from selected dropdown clicked
         * @param {Object} selected column navigation object
         * @param {Object} clicked dropdown item
         */
            SETTINGS = eventNamespace + 'settings',

        /**
         * @event husky.column-navigation.add
         * @description the add button has been clicked
         * @param {Object} parent object from active column level
         */
            ADD = eventNamespace + 'add',

        /**
         * @event husky.column-navigation.edit
         * @description the edit icon has been clicked
         * @param {Object} clicked object
         */
            EDIT = eventNamespace + 'edit',

        /**
         * @event husky.column-navigation.get-breadcrumb
         * @description the breadcrumb will be returned
         * @param {Function} callback function which will process the breadcrumb objects
         */
            BREADCRUMB = eventNamespace + 'get-breadcrumb';

    return {

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.$element = this.sandbox.dom.$(this.options.el);
            this.$selectedElement = null;
            this.$addColumn = null;
            this.filledColumns = 0;
            this.columnLoadStarted = false;
            this.$loader = null;

            this.columns = [];
            this.selected = [];

            this.render();
            this.load(this.options.url, 0);
            this.bindDOMEvents();
            this.bindCustomEvents();
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {
            var $add, $settings, $wrapper;

            $wrapper = this.sandbox.dom.$(this.template.wrapper.call(this));
            this.sandbox.dom.append(this.$element, $wrapper);

            // navigation container

            this.$columnContainer = this.sandbox.dom.$(this.template.columnContainer.call(this));
            this.setContainerHeight();
            this.sandbox.dom.append($wrapper, this.$columnContainer);

            // options container - add and settings button
            this.addId = this.options.instanceName + "-column-navigation-add";
            this.settingsId = this.options.instanceName + "-column-navigation-settings";
            this.$optionsContainer = this.sandbox.dom.$(this.template.optionsContainer.call(this, this.options.column.width));
            $add = this.sandbox.dom.$(this.template.options.add(this.addId));
            $settings = this.sandbox.dom.$(this.template.options.settings(this.settingsId));
            this.sandbox.dom.append(this.$optionsContainer, $add);
            this.sandbox.dom.append(this.$optionsContainer, $settings);

            this.hideOptions();
            this.sandbox.dom.append($wrapper, this.$optionsContainer);

            this.setContainerHeight();
            this.setContainerMinWidth();

            //init dropdown for settings in options container
            if (!!this.options.data) {
                this.initSettingsDropdown(this.sandbox.dom.attr($settings, 'id'));
            }

        },

        /**
         * Sets the height of the container
         */
        setContainerHeight: function() {
            this.sandbox.dom.height(
                this.$columnContainer, (this.sandbox.dom.height(window) - this.sandbox.dom.offset(this.$columnContainer).top) * this.options.wrapper.height / 100
            );
        },

        /**
         * Instantiats the dropdown component
         * @param containerId dom id for element to start dropdown
         */
        initSettingsDropdown: function(containerId) {

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
        load: function(url, columnNumber) {
            if (!!url) {

                this.columnLoadStarted = true;
                this.sandbox.util.load(url)
                    .then(function(response) {
                        this.columnLoadStarted = false;
                        this.parseData(response, columnNumber);
                        this.alignWithColumnsWidth();
                        this.scrollIfNeeded(this.filledColumns + 1);
                        this.setOverflowClass();
                        this.sandbox.emit(LOADED);
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
         * Removes removes data and removes dom elements
         * @param {Number} newColumn
         */
        removeColumns: function(newColumn) {

            // removes all old columns except of next after clicked
            // next column after clicked will be emptied and used again
            var length = this.filledColumns + 1,
                i, tmp;

            for (i = length; i > newColumn; i--) {
                delete this.columns[i];
                this.sandbox.dom.remove('#column-' + i);
                this.filledColumns--;
            }

            // check if element in dom exists
            tmp = this.sandbox.dom.find('#column-' + newColumn);
            if (tmp.length === 1) {
                this.$addColumn = tmp[0];
            }

            this.sandbox.dom.remove('#column-' + newColumn + ' li');

        },

        /**
         * Parses the received data and renders columns
         * @param {String} data
         * @param {Number} columnNumber
         */
        parseData: function(data, columnNumber) {
            var $column, $list, newColumn, nodeWithSubNodes = null, lastSelected = null;

            if (columnNumber === 0) {  // case 1: no elements in container
                this.columns[0] = [];
                this.columns[0][data[this.options.idName]] = data;
                newColumn = 1;
            } else { // case 2: columns in container replace level after clicked column and clear following levels
                newColumn = columnNumber + 1;
            }

            $column = this.getDOMColumn(newColumn);
            this.sandbox.dom.append(this.$columnContainer, $column);

            $list = this.sandbox.dom.find('ul', $column);

            this.sandbox.util.each(data._embedded, function(index, value) {

                this.storeDataItem(newColumn, value);
                var $element = this.sandbox.dom.$(this.template.item.call(this, this.options.column.width, value));
                this.sandbox.dom.append($list, $element);

                this.setItemsTextWidth($element);

                // remember which item has subitems to display a whole tree when column navigation should be restored
                if (!!value[this.options.hasSubName] && value._embedded.length > 0) {
                    nodeWithSubNodes = value;
                    this.setElementSelected($element);
                    this.selected[newColumn] = value;
                }

                // needed to select node in last level of nodes
                if (!!this.options.selected && this.options.selected === value[this.options.idName]) {
                    this.setElementSelected($element);
                    this.selected[newColumn] = value;
                    lastSelected = value;
                }

            }.bind(this));

            this.removeLoadingIconForSelected();

            this.filledColumns++;


            if (!!nodeWithSubNodes) { // parse next column if data exists
                this.parseData(nodeWithSubNodes, newColumn);
            } else if (!!lastSelected && !lastSelected[this.options.hasSubName]) { // append add column if no children
                this.insertAddColumn(lastSelected, newColumn);
            }

        },

        /**
         * Sets the width of the text-container of an item
         * @param {Object} $item the dom-object of an item
         */
        setItemsTextWidth: function($item) {
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
        cropItemsText: function($itemText) {
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
        setElementSelected: function($element) {
            this.sandbox.dom.addClass($element, 'selected');
            var $arrowElement = this.sandbox.dom.find('.arrow', $element);
            this.sandbox.dom.removeClass($arrowElement, 'inactive');
        },

        /**
         * Returns column to put the node elements in
         * @param newColumn number of new column
         * @returns {Object} DOM column
         */
        getDOMColumn: function(newColumn) {
            var $column;

            if (!!this.$addColumn) { // take existing add-column
                $column = this.$addColumn;
                this.sandbox.dom.data(this.$addColumn, 'id', newColumn);
                this.sandbox.dom.attr(this.$addColumn, 'id', 'column-' + newColumn);
                this.$addColumn = null;
            } else { // create new column
                $column = this.sandbox.dom.$(this.template.column.call(this, newColumn, this.options.column.width));
            }

            return $column;
        },

        /**
         * Adds the loading icon to a contianer
         * @param $container
         */
        addLoadingIcon: function($container) {
            this.sandbox.dom.removeClass($container, 'inactive icon-chevron-right');

            if (this.$loader === null) {
                this.$loader = this.sandbox.dom.createElement('<div class="husky-column-navigation-loader"/>');

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
            this.sandbox.dom.html($container, this.$loader);
        },

        /**
         * Removes loading icon from selected element
         */
        removeLoadingIconForSelected: function() {
            if (!!this.$selectedElement) {
                var $arrow = this.sandbox.dom.find('.arrow', this.$selectedElement);
                this.sandbox.dom.detach(this.$loader);
                this.sandbox.dom.prependClass($arrow, 'icon-chevron-right');
            }
        },

        /**
         * Stores data in internal structure - seperated by column number
         * @param {Object} item
         * @param {Number} columnNumber
         */
        storeDataItem: function(columnNumber, item) {

            if (!this.columns[columnNumber]) {
                this.columns[columnNumber] = [];
            }
            this.columns[columnNumber][item[this.options.idName]] = item;

        },

        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.itemMouseEnter.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'mouseleave', this.itemMouseLeave.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.showOptions.bind(this), '.column');
            this.sandbox.dom.on(this.$el, 'click', this.addNode.bind(this), '#' + this.addId);
            this.sandbox.dom.on(this.$el, 'click', this.editNode.bind(this), '.edit');
            this.sandbox.dom.on(this.$el, 'dblclick', this.editNode.bind(this), 'li');

            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', function() {
                this.setContainerHeight();
                this.setContainerMaxWidth();
                this.setOverflowClass();
            }.bind(this));
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
            this.sandbox.on(BREADCRUMB, this.getBreadCrumb.bind(this));

            this.sandbox.on('husky.dropdown.' + this.options.instanceName + '.settings.dropdown.item.click', this.dropdownItemClicked.bind(this));
        },

        dropdownItemClicked: function(item) {
            if (!!this.selected[this.lastHoveredColumn]) {
                if (!!item.callback) {
                    item.callback(item, this.selected[this.lastHoveredColumn]);
                } else {
                    this.sandbox.emit(SETTINGS, item, this.selected[this.lastHoveredColumn]);
                }
            }
        },

        /**
         * Shows the edit icon
         * @param {Object} event
         */
        itemMouseEnter: function(event) {
            var $edit = this.sandbox.dom.find('.edit', event.currentTarget);
            this.sandbox.dom.toggle($edit);
            this.setItemsTextWidth(event.currentTarget);
        },

        /**
         * Hides the edit icon
         * @param {Object} event
         */
        itemMouseLeave: function(event) {
            var $edit = this.sandbox.dom.find('.edit', event.currentTarget);
            this.sandbox.dom.toggle($edit);
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
         * Shows the options below the last hovered column
         * @param {Object} event
         */
        showOptions: function(event) {
            var $currentTarget = this.sandbox.dom.$(event.currentTarget);

            this.displayOptions($currentTarget);

            this.sandbox.dom.off(this.$columnContainer, 'scroll.column-navigation.' + this.options.instanceName);
            this.sandbox.dom.on(this.$columnContainer, 'scroll.column-navigation.' + this.options.instanceName, this.displayOptions.bind(this, $currentTarget));
        },

        /**
         * Displays the options-navigation under a given column
         * @param $activeColumn {object} column for which the options will be inserted
         */
        displayOptions: function($activeColumn) {
            var visibleRatio;

            // calculate the ratio of how much of the hovered column is visible
            if (this.sandbox.dom.position($activeColumn).left + this.sandbox.dom.width($activeColumn) > this.sandbox.dom.width(this.$columnContainer)) {
                visibleRatio = (this.sandbox.dom.width(this.$columnContainer) - this.sandbox.dom.position($activeColumn).left ) / this.sandbox.dom.width($activeColumn);
            } else {
                visibleRatio = (this.sandbox.dom.width($activeColumn) + this.sandbox.dom.position($activeColumn).left) / this.sandbox.dom.width($activeColumn);
            }

            // display the option only if the column is visible enough
            if (visibleRatio >= this.options.minVisibleRatio) {
                this.lastHoveredColumn = this.sandbox.dom.data($activeColumn, 'column');
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
        updateOptionsMargin: function($activeColumn) {
            var marginLeft = this.sandbox.dom.position($activeColumn).left - 1;
            this.sandbox.dom.css(this.$optionsContainer, 'margin-left', marginLeft + 'px');
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
                this.$selectedElement = this.sandbox.dom.$(event.currentTarget);
                var id = this.sandbox.dom.data(this.$selectedElement, 'id'),
                    column = this.sandbox.dom.data(this.sandbox.dom.parent(this.sandbox.dom.parent(this.$selectedElement)), 'column'),
                    selectedItem = this.columns[column][id],
                    length = this.selected.length - 1,
                    i, $arrowElement;


                if (this.sandbox.dom.hasClass(this.$selectedElement, 'selected')) { // is element already selected

                    this.sandbox.emit(SELECTED, selectedItem);

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
                        this.sandbox.emit(SELECTED, selectedItem);

                        if (!!selectedItem[this.options.hasSubName]) {
                            this.load(selectedItem._links.children, column);
                        }

                        this.removeColumns(column + 1);
                    }
                }

                // insert add column when clicked element
                this.insertAddColumn(selectedItem, column);

                // scroll for add column
                if (!selectedItem.hasSub) {
                    this.alignWithColumnsWidth();
                    this.scrollIfNeeded(column);
                    this.setOverflowClass();
                }
            }

        },

        /**
         * Sets the width of the container equal to the width of its columns
         */
        alignWithColumnsWidth: function() {
            var $columnNavi = this.sandbox.dom.find('.column-navigation', this.$el);
            this.setContainerMaxWidth();

            this.sandbox.dom.width(this.$el, this.sandbox.dom.find('.column', $columnNavi).length * this.options.column.width);
        },

        /**
         * Sets the max width of the container
         */
        setContainerMaxWidth: function() {
            this.sandbox.dom.css(this.$el, {
                'max-width': this.sandbox.dom.width(this.sandbox.dom.$window) - this.sandbox.dom.offset(this.$el).left - this.options.paddingLeft + 'px'
            });
        },

        /**
         * Sets the min-width of the container
         */
        setContainerMinWidth: function() {
            this.sandbox.dom.css(this.$el, {'min-width': '100%'});
        },

        insertAddColumn: function(selectedItem, column) {

            if (!this.$addColumn && !selectedItem[this.options.hasSubName]) {
                // append empty column to add subpages
                this.$addColumn = this.sandbox.dom.createElement(this.template.column.call(this, column + 1, this.options.column.width));
                this.sandbox.dom.append(this.$columnContainer, this.$addColumn);
            }
        },

        /**
         * Scrolls if needed
         * @param column
         */
        scrollIfNeeded: function(column) {
            if (column > DISPLAYEDCOLUMNS) {
                this.sandbox.dom.scrollLeft(this.$columnContainer, (column - DISPLAYEDCOLUMNS) * this.options.column.width);
            }
        },

        /**
         * Removes the selected class from old elements
         * @param {Number} column
         */
        removeCurrentSelected: function(column) {
            var $items = this.sandbox.dom.find('li', '#column-' + column);

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
            this.sandbox.emit(ADD, parent);
        },

        /**
         * Emits an edit event
         * @param {Object} event
         */
        editNode: function(event) {
            var $listItem, id, item;

            if (this.sandbox.dom.hasClass(event.currentTarget, 'edit') === true) {
                $listItem = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget));
            } else {
                $listItem = this.sandbox.dom.$(event.currentTarget);
            }
            id = this.sandbox.dom.data($listItem, 'id');
            item = this.columns[this.lastHoveredColumn][id];

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.emit(EDIT, item);
        },

        /**
         * Templates for various parts
         */
        template: {

            wrapper: function() {
                return '<div class="column-navigation-wrapper"></div>';
            },

            columnContainer: function() {
                return ['<div class="column-navigation"></div>'].join('');
            },

            column: function(columnNumber, width) {
                return ['<div data-column="', columnNumber, '" class="column" id="column-', columnNumber, '" style="width: ', width, 'px"><ul></ul></div>'].join('');
            },

            item: function(width, data) {

                var item = ['<li data-id="', data[this.options.idName], '" class="pointer">'];

                // icons left
                item.push('<span class="icons-left">');
                // link
                if (!!data[this.options.linkedName]) {
                    if (data[this.options.linkedName] === 'internal') {
                        item.push('<span class="icon-internal-link pull-left m-right-5"></span>');
                    } else if (data[this.options.linkedName] === 'external') {
                        item.push('<span class="icon-external-link pull-left m-right-5"></span>');
                    }
                }

                // type (ghost, shadow)
                if (!!data[this.options.typeName]) {
                    if (data[this.options.typeName].name === 'ghost') {
                        item.push('<span class="ghost pull-left m-right-5">', data[this.options.typeName].value, '</span>');
                    } else if (data[this.options.typeName].name === 'shadow') {
                        item.push('<span class="icon-shadow-node pull-left m-right-5"></span>');
                    }
                }

                // published
                if (!data[this.options.publishedName]) {
                    item.push('<span class="not-published pull-left m-right-5">&bull;</span>');
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
                item.push('<span class="icon-edit-pen edit hidden pull-left"></span>');
                !!data[this.options.hasSubName] ? item.push('<span class="icon-chevron-right arrow inactive pull-left"></span>') : '';
                item.push('</span></li>');
                return item.join('');
            },

            optionsContainer: function(width) {
                return ['<div class="options grid-row" style="width:', width + 1, 'px"></div>'].join('');
            },

            options: {
                add: function(id) {
                    return ['<div id="', id, '" class="align-center add pointer">',
                        '<span class="icon-add"></span>',
                        '</div>'].join('');
                },

                settings: function(id) {
                    return ['<div id="', id, '" class="align-center settings pointer drop-down-trigger">',
                        '<span class="icon-cogwheel inline-block"></span><span class="dropdown-toggle inline-block"></span>',
                        '</div>'].join('');
                }
            }
        }
    };
});


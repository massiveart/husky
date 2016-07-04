/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/toolbar
 */

/**
 * @class Toolbar
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.instanceName] enables custom events (in case of multiple tabs on one page)
 * @param {String} [options.itemsRequestKey] key with result-array for requested dropdown items
 * @param {String} [options.appearance]
 * @param {Object} [options.searchOptions] options to pass to search component
 * @param {Object} [options.groups] array of groups with id and align to specify groups to put items in
 * @param {Object} [options.small] if true the toolbar is displayed smaller
 * @param {boolean} [options.hasSearch] if true a search item gets inserted in its own group at the end. A search item can also be added manually through the data
 * @param {String} [options.searchAlign] "right" or "left" to align the search if it's added automatically via the hasSearch option
 * @param {String} [options.skin] custom skin-class to add to the component
 * @param {Boolean} [options.showTitleAsTooltip] shows the title of the button only as tooltip
 * @param {Array} [options.data] if no url is provided
 * @param {String} [options.data.title]
 * @param {String} [options.data.id]
 * @param {Boolean} [options.data.disabled] is item disabled or enabled
 * @param {String} [options.data.disableIcon] icon in disable state
 * @param {String} [options.data.iconSize] large/medium/small
 * @param {String} [options.data.class] highlight/highlight-gray
 * @param {String} [options.data.group] id of the a group specified in the options
 * @param {Integer} [options.data.position] integer to sort the items - default 9000
 * @param {String} [options.data.type] if select, the selected item is displayed in main item (none/select)
 * @param {Function} [options.data.callback] callback function
 * @param {Boolean} [options.data.hidden] if true button gets hidden form the beginning on
 * @param {Boolean} [options.data.hideTitle] hide title from beginning
 * @param {Array} [options.data.items]
 * @param {String} [options.data.items.title]
 * @param {String} [options.data.items.icon] false will remove icon
 * @param {Function} [options.data.items.callback]
 * @param {Boolean} [options.data.items.divider] if true takes item as divider element
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            itemsRequestKey: '_embedded',
            searchOptions: null,
            hasSearch: false,
            searchAlign: 'right',
            groups: [
                {
                    id: 1,
                    align: 'left'
                }
            ],
            skin: 'default',
            small: false,
            showTitleAsTooltip: false
        },

        constants = {
            collapsedWidth: 50,
            dropdownToggleWidth: 5, //px
            loaderWhiteColor: 'white',
            loaderDarkColor: '#cccccc',
            markedClass: 'marked'
        },

        /** templates container */
        templates = {
            skeleton: [
                '<div class="husky-toolbar">',
                '</div>'
            ].join('')
        },


        /**
         * triggered when toolbar is initialized and ready to use
         *
         * @event husky.toolbar.[INSTANCE_NAME.]initialized
         */
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised when an item with no specified callback is clicked
         *
         * @event husky.toolbar.[INSTANCE_NAME].item.select
         * @param {Object} item Clicked item
         */
        ITEM_SELECT = function() {
            return createEventName.call(this, 'item.select');
        },

        /**
         * enable a button
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.enable
         * @param {string} id The id of the button which should be enabled
         */
        ITEM_ENABLE = function() {
            return createEventName.call(this, 'item.enable');
        },

        /**
         * disable a button
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.disable
         * @param {string} id The id of the button which should be disabled
         */
        ITEM_DISABLE = function() {
            return createEventName.call(this, 'item.disable');
        },

        /**
         * event to set button into loading state
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.loading
         * @param {string} id The id of the button
         */
        ITEM_LOADING = function() {
            return createEventName.call(this, 'item.loading');
        },

        /**
         * event to change a buttons selected dropdown-item
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.change
         * @param {string} button The id of the button
         * @param {string} item the id or the index of the dropdown-item
         * @param {boolean} executeCallback if true callback of dropdown item gets executed
         */
        ITEM_CHANGE = function() {
            return createEventName.call(this, 'item.change');
        },

        /**
         * event to hide a button
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.hide
         * @param {string} button The id of the button
         */
        ITEM_HIDE = function() {
            return createEventName.call(this, 'item.hide');
        },

        /**
         * event to show a button
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.show
         * @param {string} button The id of the button
         */
        ITEM_SHOW = function() {
            return createEventName.call(this, 'item.show');
        },

        /**
         * event to mark a subitem
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.mark
         * @param {string} button The id of the button
         */
        ITEM_MARK = function() {
            return createEventName.call(this, 'item.mark');
        },

        /**
         * event to unmark a subitem
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.unmark
         * @param {string} button The id of the button
         */
        ITEM_UNMARK = function() {
            return createEventName.call(this, 'item.unmark');
        },

        /**
         * event to change a buttons default title and default icon
         *
         * @event husky.toolbar.[INSTANCE_NAME.]button.set
         * @param {string} button The id of the button
         * @param {object} object with a icon and title
         */
        BUTTON_SET = function() {
            return createEventName.call(this, 'button.set');
        },

        /**
         * event to set new dropdown-items for a button
         *
         * @event husky.toolbar.[INSTANCE_NAME.]items.set
         * @param {string} button The id of the button
         * @param {array} items The items to set
         * @param {integer} itemId The id or the index of the item to set selected - optional
         */
        ITEMS_SET = function() {
            return createEventName.call(this, 'items.set');
        },

        /**
         * event to collapse the toolbar
         *
         * @event husky.toolbar.[INSTANCE_NAME.].collapse
         */
        COLLAPSE = function() {
            return createEventName.call(this, 'collapse');
        },

        /**
         * event to expand the toolbar
         *
         * @event husky.toolbar.[INSTANCE_NAME.].expand
         */
        EXPAND = function() {
            return createEventName.call(this, 'expand');
        },

        /** events bound to dom */
        bindDOMEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', toggleItem.bind(this), '.dropdown-toggle');
            this.sandbox.dom.on(this.$el, 'click', selectItem.bind(this), 'li');
        },

        /** events bound to sandbox */
        bindCustomEvents = function() {
            this.sandbox.on(ITEM_DISABLE.call(this), function(id, highlight) {
                if (!!this.items[id]) {
                    toggleEnabled.call(this, false, id, highlight);
                }
            }.bind(this));

            this.sandbox.on(ITEM_ENABLE.call(this), function(id, highlight) {
                if (!!this.items[id]) {
                    toggleEnabled.call(this, true, id, highlight);
                }
            }.bind(this));

            this.sandbox.on(ITEM_LOADING.call(this), function(id) {
                if (!!this.items[id]) {
                    itemLoading.call(this, id);
                }
            }.bind(this));

            this.sandbox.on(ITEM_HIDE.call(this), function(id) {
                if (!!this.items[id]) {
                    hideItem.call(this, this.items[id].$el);
                }
            }.bind(this));

            this.sandbox.on(ITEM_SHOW.call(this), function(id) {
                if (!!this.items[id]) {
                    showItem.call(this, this.items[id].$el);
                }
            }.bind(this));

            this.sandbox.on(COLLAPSE.call(this), function() {
                collapseAll.call(this);
            }.bind(this));

            this.sandbox.on(EXPAND.call(this), function() {
                expandAll.call(this);
            }.bind(this));

            this.sandbox.on(ITEM_MARK.call(this), uniqueMarkItem.bind(this));

            this.sandbox.on(ITEM_UNMARK.call(this), unmarkItem.bind(this));

            this.sandbox.on(ITEM_CHANGE.call(this), function(button, id, executeCallback) {
                if (!!this.items[button]) {
                    this.items[button].initialized.then(function() {
                        var index = getItemIndexById.call(this, id, this.items[button]);
                        changeMainListItem.call(this, this.items[button].$el, this.items[button].items[index]);
                        this.sandbox.emit(ITEM_MARK.call(this), this.items[button].items[index].id);
                        if (executeCallback === true || !!this.items[button].items[index].callback) {
                            if (typeof this.items[button].items[index].callback === 'function') {
                                this.items[button].items[index].callback();
                            }
                        }
                    }.bind(this));
                }
            }.bind(this));

            this.sandbox.on(BUTTON_SET.call(this), function(button, newData) {
                changeMainListItem.call(this, this.items[button].$el, newData);
            }.bind(this));

            this.sandbox.on(ITEMS_SET.call(this), function(button, items, itemId) {
                if (!!this.items[button]) {
                    if (items.length > 0) {
                        deleteDropdown.call(this, this.items[button]);
                        this.sandbox.dom.addClass(this.sandbox.dom.children(this.items[button].$el, 'a'), 'dropdown-toggle');
                        this.items[button].items = items;
                        createDropdownMenu.call(this, this.items[button].$el, this.items[button]);
                        setButtonWidth.call(this, this.items[button].$el, this.items[button]);
                        if (!!itemId) {
                            this.sandbox.emit(ITEM_CHANGE.call(this), this.items[button].id, itemId);
                        }
                    } else {
                        deleteDropdown.call(this, this.items[button]);
                        this.sandbox.dom.removeClass(this.sandbox.dom.children(this.items[button].$el, 'a'), 'dropdown-toggle');
                    }
                }
            }.bind(this));
        },

        /**
         * Sets an item enabled or disabled
         * @param enabled {boolean} If true button gets enabled if false button gets disabled
         * @param id {Number|String} id The id of the button
         * @param highlight {boolean} if true a highlight effect is played
         */
        toggleEnabled = function(enabled, id, highlight) {

            // check if toolbar has an item with specified id
            if (!this.items[id]) {
                return;
            }

            var item = this.items[id],
                $item = this.sandbox.dom.find('[data-id="' + id + '"]', this.$el),
                $iconItem = this.sandbox.dom.find('[data-id="' + id + '"] .icon', this.$el),
                $itemLink,
                enabledIconClass = createIconClass.call(this, item, true),
                disabledIconClass = createIconClass.call(this, item, false);

            this.items[id].disabled = !enabled;

            // in case of item has state loading, restore original state
            if (item.loading) {
                item.loading = false;
                $itemLink = this.sandbox.dom.find('a', $item);
                this.sandbox.stop(this.sandbox.dom.find('.item-loader', $item));
                this.sandbox.dom.remove(this.sandbox.dom.find('.item-loader', $item));
                this.sandbox.dom.show($itemLink);
            }

            if (highlight !== false) {
                // add color fading effect
                this.sandbox.dom.addClass($item, 'highlight-animation');

                // remove class after effect has finished
                this.sandbox.dom.on($item, 'animationend webkitAnimationEnd oanimationend MSAnimationEnd', function(ev) {
                    this.sandbox.dom.removeClass(ev.currentTarget, 'highlight-animation');
                }.bind(this));
            }

            if (!!enabled) {
                this.sandbox.dom.removeClass($item, 'disabled');
                this.sandbox.dom.removeClass($iconItem, disabledIconClass);
                this.sandbox.dom.prependClass($iconItem, enabledIconClass);
            } else {
                this.sandbox.dom.addClass($item, 'disabled');
                this.sandbox.dom.removeClass($iconItem, enabledIconClass);
                this.sandbox.dom.prependClass($iconItem, disabledIconClass);
            }
        },

        /**
         * Hides a button
         * @param $button
         */
        hideItem = function($button) {
            this.sandbox.dom.addClass($button, 'hidden');
        },

        /**
         * Shows a button
         * @param $button
         */
        showItem = function($button) {
            this.sandbox.dom.removeClass($button, 'hidden');
        },

        /**
         * Sets a button into loading state
         * @param id {Number|String} id The id of the button
         */
        itemLoading = function(id) {
            var item = this.items[id],
                $item = this.sandbox.dom.find('[data-id="' + id + '"]', this.$el),
                $itemLink = this.sandbox.dom.find('a', $item),
                $loader, size,
                color = constants.loaderWhiteColor;

            if (item.loading) {
                return;
            }

            if (this.options.small !== true) {
                size = '20px';
            } else {
                size = '14px';
            }

            item.loading = true;
            this.sandbox.dom.hide($itemLink);

            $loader = this.sandbox.dom.createElement('<span class="item-loader"></span>');
            this.sandbox.dom.append($item, $loader);

            if (this.sandbox.dom.hasClass($item, 'highlight-white')) {
                color = constants.loaderDarkColor;
            }

            this.sandbox.start([{
                name: 'loader@husky',
                options: {
                    el: $loader,
                    size: size,
                    color: color
                }
            }]);
        },


        /**
         * gets called when toggle item is clicked
         * opens dropdown submenu
         * @param event
         */
        toggleItem = function(event) {

            event.preventDefault();
            event.stopPropagation();

            var $list = this.sandbox.dom.parent(event.currentTarget),
                id = this.sandbox.dom.data($list, 'id'),
                item = this.items[id],
                visible;

            if (!item || !item.disabled) {
                if (this.sandbox.dom.hasClass($list, 'is-expanded')) {
                    visible = true;
                }
                hideDropdowns.call(this);

                if (!visible) {
                    this.sandbox.dom.addClass($list, 'is-expanded');

                    // TODO: check if dropdown overlaps screen: set ul to .right-aligned

                    // on every click remove sub-menu
                    this.sandbox.dom.one('body', 'click', hideDropdowns.bind(this));
                }
            }
        },

        /**
         * Determines the index of a dropdown-item by its id
         * @param id {integer} id of the dropdown-item
         * @param button {object} parent object of the item
         * @return {integer} the index of the item
         */
        getItemIndexById = function(id, button) {
            for (var i = -1, length = button.items.length; ++i < length;) {
                if (button.items[i].id === id) {
                    return i;
                }
            }
            return id;
        },

        /**
         * hides dropdowns of this instance
         */
        hideDropdowns = function() {
            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-expanded', this.$el), 'is-expanded');
        },

        /**
         * when an element gets selected
         * gets item from items array and delegates to triggerSelectEvent function
         * @param event
         */
        selectItem = function(event) {

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.dom.preventDefault(event);

            var item = this.items[this.sandbox.dom.data(event.currentTarget, 'id')],
                $parent = (!!this.items[item.parentId]) ? this.items[item.parentId].$el : null;

            // stop if item has subitems
            if ((item.items && item.items.length > 0) || item.loading) {
                return;
            }
            hideDropdowns.call(this);
            if (!!item.parentId && !!this.items[item.parentId].itemsOption &&
                this.items[item.parentId].itemsOption.markable === true) {
                uniqueMarkItem.call(this, item.id);
            }
            if (!item.disabled) {
                triggerSelectEvent.call(this, item, $parent);
            } else {
                return false;
            }
        },

        /**
         * either calls items callback (if set) or triggers select event
         * @param item
         * @param $parent
         */
        triggerSelectEvent = function(item, $parent) {

            var parentItem,
                original = item._original || item;

            // check if has parent and type of parent
            if (item.parentId) {
                parentItem = this.items[item.parentId];
                if (!!parentItem.type && parentItem.type === "select") {
                    changeMainListItem.call(this, $parent, item);
                }

                //check if itemsOption is set and pass clicked item to the callback
                if (!!parentItem.itemsOption) {
                    if (typeof parentItem.itemsOption.callback === 'function') {
                        parentItem.itemsOption.callback(original);
                    }
                }
            }

            // if callback is set call it, else trigger event
            if (item.callback) {
                item.callback();
            } else {
                this.sandbox.emit(ITEM_SELECT.call(this), item);
            }
        },

        /**
         * changes the list items icon and title
         * @param listElement
         * @param item
         */
        changeMainListItem = function(listElement, item) {
            // first get title
            var listItems = this.sandbox.dom.find('span', listElement);
            if (!!item.icon) {
                this.sandbox.dom.removeClass(listItems.eq(0), '');
                if (item.icon !== false) {
                    this.sandbox.dom.addClass(listItems.eq(0), createIconSupportClass.call(this, item, !item.disabled));
                }
            }
            if (!!item.title) {
                this.sandbox.dom.html(listItems.eq(1), item.title);
            }
        },

        /**
         * creates the class string of an icon
         * @param item
         * @param enabled
         * @returns {string}
         */
        createIconSupportClass = function(item, enabled) {
            var classArray,
                classString = '',
                icon = createIconClass.call(this, item, enabled);

            // create icon class
            if (item.icon) {
                classArray = [];
                classArray.push(icon);
                classArray.push('icon');
                if (item.iconSize) {
                    classArray.push(item.iconSize);
                }

                classString = classArray.join(' ');
            }

            return classString;
        },

        /**
         * returns valid class for item and state
         * @param item
         * @param enabled
         */
        createIconClass = function(item, enabled) {
            if (enabled === undefined) {
                enabled = true;
            }
            var icon = (!!enabled ? item.icon : !!item.disabledIcon ? item.disabledIcon : item.icon);
            return 'fa-' + icon;
        },

        /**
         * created dropdown menu
         * @param listItem
         * @param parent
         */
        createDropdownMenu = function(listItem, parent) {
            var $list = this.sandbox.dom.createElement('<ul class="toolbar-dropdown-menu" />'),
                $item;

            this.sandbox.dom.append(listItem, $list);
            this.sandbox.util.foreach(parent.items, function(item) {
                if (item.divider) {
                    // prevent divider when not enough items
                    if (this.items[parent.id].items.length <= 2) {
                        return
                    }
                    this.sandbox.dom.append($list, '<li class="divider"></li>');
                    return;
                }

                item.parentId = parent.id;
                // check id for uniqueness
                checkItemId.call(this, item);
                $item = this.sandbox.dom.createElement(
                    '<li data-id="' + item.id + '"><a href="#">' + item.title + '</a></li>'
                );
                item.$el = $item;
                this.items[item.id] = item;

                if (item.disabled === true) {
                    this.sandbox.dom.addClass($item, 'disabled');
                }
                if (item.marked === true) {
                    uniqueMarkItem.call(this, item.id);
                }
                this.sandbox.dom.append($list, $item);
            }.bind(this));
        },

        /**
         * Marks an item with a css class und unmarks all other items with the same parent
         * @param itemId {Number|String} the id of the item
         */
        uniqueMarkItem = function(itemId) {
            if (!!this.items[itemId] && !!this.items[itemId].parentId) {
                // unmark all items with the same parent
                this.sandbox.util.each(this.items, function(id, item) {
                    if (item.parentId === this.items[itemId].parentId) {
                        this.sandbox.dom.removeClass(item.$el, constants.markedClass);
                    }
                }.bind(this));
                // mark passed element
                this.sandbox.dom.addClass(this.items[itemId].$el, constants.markedClass);
            }
        },

        /**
         * Unmark an item by removing the marked class from the item
         * @param itemId {Number|String} the id of the item
         */
        unmarkItem = function(itemId){
            if (!!this.items[itemId] && !!this.items[itemId].parentId) {
                this.sandbox.dom.removeClass(this.items[itemId].$el, constants.markedClass);
            }
        },

        /**
         * set width for button with dropdown-items
         * @param listItem
         * @param parent
         */
        setButtonWidth = function(listItem, parent) {
            var maxwidth = 0, i, length;
            if (parent.type === 'select') {
                for (i = -1, length = parent.items.length; ++i < length;) {
                    changeMainListItem.call(this, listItem, parent.items[i]);
                    if (this.sandbox.dom.width(listItem) > maxwidth) {
                        maxwidth = this.sandbox.dom.width(listItem);
                    }
                }
                //set button back to default
                changeMainListItem.call(this, listItem, parent);
            }
        },

        /**
         * Handles requested items
         * @param requestedItems
         * @param buttonId
         */
        handleRequestedItems = function(requestedItems, buttonId) {
            var id, title, icon, callback, divider, i, length;
            this.items[buttonId].items = [];

            //for loop sets the the items[button].items - array together
            for (i = -1, length = requestedItems.length; ++i < length;) {

                if (!!this.items[buttonId].itemsOption.idAttribute) {
                    id = requestedItems[i][this.items[buttonId].itemsOption.idAttribute];
                } else if (!!requestedItems[i].id) {
                    id = requestedItems[i].id;
                }

                if (!!this.items[buttonId].itemsOption.titleAttribute) {
                    title = requestedItems[i][this.items[buttonId].itemsOption.titleAttribute];
                } else if (!!requestedItems[i].title) {
                    title = requestedItems[i].title;
                }

                if (!!this.items[buttonId].itemsOption.translate) {
                    title = this.sandbox.translate(this.items[buttonId].itemsOption.languageNamespace + title);
                }

                if (!!requestedItems[i].icon) {
                    icon = requestedItems[i].icon;
                }

                if (!!requestedItems[i].callback) {
                    callback = requestedItems[i].callback;
                }

                if (!!requestedItems[i].divider) {
                    divider = requestedItems[i].divider;
                } else {
                    divider = false;
                }

                this.items[buttonId].items[i] = {
                    id: id,
                    title: title,
                    icon: icon,
                    callback: callback,
                    divider: divider,
                    _original: requestedItems[i]
                };
            }

            //now generate the dropdown
            this.sandbox.emit(ITEMS_SET.call(this), buttonId, this.items[buttonId].items);
        },

        /**
         * Collapses all buttons
         */
        collapseAll = function() {
            for (var key in this.items) {
                if (this.items.hasOwnProperty(key)) {
                    collapseButton.call(this, this.items[key]);
                }
            }
            this.collapsed = true;
        },

        /**
         * Expands all buttons
         */
        expandAll = function() {
            for (var key in this.items) {
                if (this.items.hasOwnProperty(key)) {
                    if (this.items[key].hideTitle === true) {
                        expandButton.call(this, this.items[key], true);
                    } else {
                        expandButton.call(this, this.items[key], false);
                    }
                }
            }
            this.collapsed = false;
        },

        /**
         * Collapses a given button
         * @param button {Object}
         */
        collapseButton = function(button) {
            // collapsing is senseless for dropdown-items
            if (!button.parentId) {

                // remove set button width
                this.sandbox.dom.css(button.$el, {'min-width': ''});

                //hide title
                this.sandbox.dom.hide(this.sandbox.dom.find('.title', button.$el));

                //set button width
                if (!button.items) {
                    this.sandbox.dom.css(button.$el, {'min-width': constants.collapsedWidth + 'px'});
                }
            }
        },


        /**
         * Expands a given button
         * @param button {Object}
         * @param hideTitle {Boolean} if true title get hidden
         */
        expandButton = function(button, hideTitle) {
            if (!button.parentId) {
                // show title
                if (hideTitle === true) {
                    this.sandbox.dom.hide(this.sandbox.dom.find('.title', button.$el));
                } else {
                    this.sandbox.dom.show(this.sandbox.dom.find('.title', button.$el));
                }

                setButtonWidth.call(this, button.$el, button);
            }
        },

        /**
         * Sorts all items with their position-property
         * @param {array} data The list of items to sort
         * @return {array} returns the sorted array
         */
        sortData = function(data) {
            for (var i = -1, length = data.length; ++i < length;) {
                if (typeof data[i].position !== 'number') {
                    data[i].position = 9000;
                }
            }
            data = data.sort(function(a, b) {
                return a.position - b.position;
            });

            return data;
        },

        /**
         * function checks if id is set and unique among all items
         * otherwise a new id is generated for the element
         * @param item
         */
        checkItemId = function(item) {
            // if item has no id, generate random id
            if (!item.id || !!this.items[item.id]) {
                do {
                    item.id = this.sandbox.util.uniqueId();
                } while (!!this.items[item.id]);
            }
            // set enabled defaults
            if (!item.disabled) {
                item.disabled = false;
            }
        },

        /**
         * Removes the dropdown of a button
         * @param button
         */
        deleteDropdown = function(button) {
            if (!!button.items) {
                // remove the related stuff
                this.sandbox.dom.remove(this.sandbox.dom.find('.toolbar-dropdown-menu', button.$el));
                this.sandbox.dom.removeClass(this.sandbox.dom.children(button.$el, 'a'), 'dropdown-toggle');

                // delete JS related stuff
                for (var i = -1, length = button.items.length; ++i < length;) {
                    delete this.items[button.items[i].id];
                }
                button.items = [];
            }
        },

        /**
         * Inserts a search into an item
         * @param $item
         */
        insertSearch = function($item) {
            var searchOptions;

            this.sandbox.dom.removeClass($item);
            this.sandbox.dom.addClass($item, 'toolbar-search');
            this.sandbox.dom.append($item, '<div id="' + this.options.instanceName + '-toolbar-search"/>');

            searchOptions = {
                el: '#' + this.options.instanceName + '-toolbar-search',
                instanceName: this.options.instanceName,
                appearance: 'white small',
                slide: true
            };
            searchOptions = this.sandbox.util.extend(true, {}, searchOptions, this.options.searchOptions);
            // start search component
            this.sandbox.start([
                {
                    name: 'search@husky',
                    options: searchOptions
                }
            ]);
        },

        /**
         * Add the skin-classes to the component-element
         * @param $element {Object}
         */
        addSkinClass = function($element) {
            if (this.options.skin !== 'default') {
                this.sandbox.dom.addClass($element, this.options.skin);
            }
        },

        /**
         * Pushes a search item to a passed data array and creates a group where the new search item gets inserted to
         * @param data {Object} data Array of data to push the item to
         * @returns {Object} the data array
         */
        pushSearch = function(data) {
            // add own group for search item
            var searchGroup = {
                id: 'search',
                align: this.options.searchAlign
            };

            // this statement ensures that the the automatically added search always floats on the right of the rest
            if (this.options.searchAlign === 'left') {
                this.options.groups.push(searchGroup);
            } else {
                this.options.groups.unshift(searchGroup);
            }

            // push search item
            data.push({
                id: 'search',
                hasSearch: true,
                group: 'search'
            });

            return data;
        },

        /** returns normalized event names */
        createEventName = function(postFix) {
            return 'husky.toolbar.' + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        /**
         * initialize component
         */
        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.collapsed = false;
            this.itemGroups = {};
            this.items = {};


            // load data and call render
            if (!!this.options.url) {
                this.sandbox.util.load(this.options.url)
                    .then(this.render.bind(this))
                    .fail(function(data) {
                        this.sandbox.logger.log('data could not be loaded:', data);
                    }.bind(this));
            } else if (!!this.options.data) {
                this.render((this.options.data));
            } else {
                this.sandbox.logger.log('no data provided for tabs!');
            }

            bindDOMEvents.call(this);
            bindCustomEvents.call(this);

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * renders the toolbar
         * @param {Object} data
         */
        render: function(data) {

            var classArray, addTo,
                $listItem, $listLink,
                title;

            // if has search is set in options push a search item and it's own group
            if (this.options.hasSearch === true) {
                data = pushSearch.call(this, data);
            }

            //render container and groups
            this.renderSkeleton();

            data = sortData.call(this, data);

            // create all elements
            this.sandbox.util.foreach(data, function(item) {

                // check id for uniqueness
                checkItemId.call(this, item);

                var dfd = this.sandbox.data.deferred();

                // save to items array
                this.items[item.id] = item;
                this.items[item.id].initialized = dfd.promise();

                // create class array
                classArray = ['toolbar-item'];
                if (!!item['class']) {
                    classArray.push(item['class']);
                }

                if (item.hidden) {
                    classArray.push('hidden');
                }

                if (item.disabled) {
                    classArray.push('disabled');
                }

                if (typeof item.hideTitle === 'undefined') {
                    item.hideTitle = false;
                }

                // if group is set to and exists add it to that group else take the first group
                if (!!item.group && !!this.itemGroups[item.group]) {
                    addTo = this.itemGroups[item.group];
                } else {
                    addTo = this.itemGroups[Object.keys(this.itemGroups)[0]];
                }

                $listItem = this.sandbox.dom.createElement('<li class="' + classArray.join(' ') + '" data-id="' + item.id + '"/>');

                // if has-search is true render a search bar, else render the item normally
                if (item.hasSearch === true) {

                    insertSearch.call(this, $listItem);
                } else {

                    $listLink = this.sandbox.dom.createElement('<a href="#" />');
                    this.sandbox.dom.append($listItem, $listLink);

                    // create icon span
                    this.sandbox.dom.append($listLink, '<span class="' + createIconSupportClass.call(this, item, !item.disabled) + '" />');

                    // create title span
                    title = item.title ? item.title : '';
                    if (item.hideTitle === true || this.options.showTitleAsTooltip === true) {
                        this.sandbox.dom.append($listLink, '<span style="display:none" class="title">' + title + '</span>');
                    } else {
                        this.sandbox.dom.append($listLink, '<span class="title">' + title + '</span>');
                    }

                    //add tooltip to item
                    if (this.options.showTitleAsTooltip === true) {
                        this.sandbox.dom.attr($listItem, {'title': title});
                    }

                    //hide the item if hidden true
                    if (item.hidden === true) {
                        hideItem.call(this, $listItem);
                    }

                    if (!!item.itemsOption && !!item.itemsOption.url) {
                        this.sandbox.util.load(item.itemsOption.url)
                            .then(function(result) {
                                var data = result[this.options.itemsRequestKey];
                                if (!!item.itemsOption.resultKey) {
                                    data = data[item.itemsOption.resultKey];
                                }

                                // add items if present
                                if (!!item.items) {
                                    data = data.concat(item.items);
                                }

                                handleRequestedItems.call(this, data, item.id);
                                dfd.resolve();
                            }.bind(this))
                            .fail(function(result) {
                                this.sandbox.logger.log('dorpdown-items could not be loaded', result);
                            }.bind(this));
                    } else {
                        // now create subitems
                        if (!!item.items) {
                            this.sandbox.dom.addClass($listLink, 'dropdown-toggle');
                            createDropdownMenu.call(this, $listItem, item);
                        }
                        dfd.resolve();
                    }
                }

                // create button
                this.sandbox.dom.append(addTo, $listItem);

                //set width for buttons with dropdowns
                if (!!item.items) {
                    setButtonWidth.call(this, $listItem, item);
                }
                this.items[item.id].$el = $listItem;

            }.bind(this));
        },

        /**
         * Renders the main container and the groups
         */
        renderSkeleton: function() {
            var i, length, $group, $skeleton;

            $skeleton = this.sandbox.dom.createElement(templates.skeleton);

            // add small class to skeleton
            if (this.options.small === true) {
                this.sandbox.dom.addClass($skeleton, 'small');
            }

            // add skin class
            addSkinClass.call(this, $skeleton);

            // render groups
            for (i = -1, length = this.options.groups.length; ++i < length;) {
                $group = this.sandbox.dom.createElement('<ul class="group"/>');

                if (!!this.options.groups[i].align) {
                    this.sandbox.dom.addClass($group, this.options.groups[i].align);
                } else {
                    this.sandbox.dom.addClass($group, 'left');
                }

                this.sandbox.dom.append($skeleton, $group);
                this.itemGroups[this.options.groups[i].id] = $group;
            }

            // append skeleton to component element
            this.sandbox.dom.append(this.$el, $skeleton);

            //add last class
            this.sandbox.dom.addClass(
                this.sandbox.dom.last(this.sandbox.dom.find('.group.left', this.$el)),
                'last'
            );
        }
    };

});

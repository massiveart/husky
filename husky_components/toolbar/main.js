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
 * @param {String} [options.dropdownItemsKey] key with result-array for requested dropdown items
 * @param {Object} [options.searchOptions] options to pass to search component
 * @param {Object} [options.small] if true the toolbar is displayed smaller
 * @param {boolean} [options.hasSearch] if true a search item gets inserted in its own group at the end. A search item can also be added manually through the data
 * @param {String} [options.skin] custom skin-class to add to the component
 * @param {Boolean} [options.showTitleAsTooltip] shows the title of the button only as tooltip
 * @param {Boolean} [options.showTitle] if false doesn't display the title
 * @param {Boolean} [options.responsive] iff true to toolbar gets collapsed/expanded if it overflows it's element
 *
 * @param {Object} [options.groups] array of groups with id and align to specify groups to put items in
 * @param {String|Number} [options.groups.id] the id of the group
 * @param {String} [options.groups.id] the group of button will be aligned "left" or "right"
 *
 * @param {Array} [options.buttons] if no url is provided
 * @param {String} [options.buttons.title]
 * @param {String} [options.buttons.id]
 * @param {Boolean} [options.buttons.disabled] is item disabled or enabled
 * @param {String} [options.buttons.class] highlight/highlight-gray/highlight-white
 * @param {String} [options.buttons.group] id of the a group specified in the options
 * @param {Integer} [options.buttons.position] integer to sort the items - default 9000
 * @param {Function} [options.buttons.callback] callback function
 * @param {Boolean} [options.buttons.hidden] if true button gets hidden form the beginning on
 *
 * @param {Array} [options.buttons.dropdownItems]
 * @param {String} [options.buttons.dropdownItems.title]
 * @param {String} [options.buttons.dropdownItems.icon] false will remove icon
 * @param {Function} [options.buttons.dropdownItems.callback]
 * @param {Boolean} [options.buttons.dropdownItems.divider] if true takes item as divider element
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            buttons: [],
            instanceName: '',
            dropdownItemsKey: '_embedded',
            searchOptions: null,
            hasSearch: false,
            groups: [
                {
                    id: 1,
                    align: 'left'
                }
            ],
            skin: 'default',
            small: false,
            showTitleAsTooltip: false,
            showTitle: true,
            responsive: false
        },

        itemDefaults = {
            dropdownOptions: {}
        },

        constants = {
            collapsedWidth: 50,
            dropdownToggleWidth: 5, //px
            loaderWhiteColor: 'white',
            loaderDarkColor: '#cccccc',
            markedClass: 'marked'
        },

        selectors = {
            dropdownMenu: '.toolbar-dropdown-menu'
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
         * @event husky.toolbar.[INSTANCE_NAME].initialized
         */
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },


        /**
         * triggered when when a dropdown gets opened
         *
         * @event husky.toolbar.[INSTANCE_NAME].dropdown.opened
         */
        DROPDOWN_OPENED = function() {
            return createEventName.call(this, 'dropdown.opened');
        },

        /**
         * triggered when when a dropdown gets opened
         *
         * @event husky.toolbar.[INSTANCE_NAME].dropdown.closed
         */
        DROPDOWN_CLOSED = function() {
            return createEventName.call(this, 'dropdown.closed');
        },

        /**
         * triggered when the icon or the title of a button gets changed
         *
         * @event husky.toolbar.[INSTANCE_NAME].title.changed
         */
        BUTTON_CHANGED = function() {
            return createEventName.call(this, 'button.changed');
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
         * @param {string} buttonId The id of the button
         * @param {string} itemId The id or the index of the dropdown-item
         * @param {boolean} executeCallback If true callback of dropdown item gets executed
         */
        ITEM_CHANGE = function() {
            return createEventName.call(this, 'item.change');
        },

        /**
         * Event to reset a buttons and it's dropdown-items into original state.
         *
         * @event husky.toolbar.[INSTANCE_NAME.]item.reset
         * @param {string} buttonId The id of the button
         */
        ITEM_RESET = function() {
            return createEventName.call(this, 'item.reset');
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
         *  @param {function} callback to execute after collapsing
         */
        COLLAPSE = function() {
            return createEventName.call(this, 'collapse');
        },

        /**
         * event to expand the toolbar
         *
         * @event husky.toolbar.[INSTANCE_NAME.].expand
         * @param {function} callback to execute after expanding
         */
        EXPAND = function() {
            return createEventName.call(this, 'expand');
        },

        /** events bound to dom */
        bindDOMEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
            }.bind(this), 'li .content');
            this.sandbox.dom.on(this.$el, 'click', toggleItem.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'click', selectItem.bind(this), 'li');
            if (this.options.responsive === true) {
                $(window).on('resize.husky-toolbar-' + this.options.instanceName, updateOverflow.bind(this));
            }
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

            this.sandbox.on(COLLAPSE.call(this), function(callback) {
                collapseAll.call(this);
                if (typeof callback === 'function') {
                    callback();
                }
            }.bind(this));

            this.sandbox.on(EXPAND.call(this), function(callback) {
                expandAll.call(this);
                if (typeof callback === 'function') {
                    callback();
                }
            }.bind(this));

            this.sandbox.on(ITEM_MARK.call(this), uniqueMarkItem.bind(this));

            this.sandbox.on(ITEM_UNMARK.call(this), unmarkItem.bind(this));

            this.sandbox.on(ITEM_CHANGE.call(this), changeButton.bind(this));

            this.sandbox.on(ITEM_RESET.call(this), resetButton.bind(this));

            this.sandbox.on(BUTTON_SET.call(this), function(button, newData) {
                changeMainListItem.call(this, this.items[button].$el, newData);
            }.bind(this));

            this.sandbox.on(ITEMS_SET.call(this), function(button, items, itemId) {
                if (!!this.items[button]) {
                    if (items.length > 0) {
                        deleteDropdown.call(this, this.items[button]);
                        this.sandbox.dom.removeAttr(this.sandbox.dom.find('.dropdown-toggle', this.items[button].$el), 'style');
                        this.items[button].dropdownItems = items;
                        createDropdownMenu.call(this, this.items[button].$el, this.items[button]);
                        if (!!itemId) {
                            changeButton.call(this, this.items[button].id, itemId).then(function(item) {
                                if (!this.items[button].dropdownOptions
                                    || typeof this.items[button].dropdownOptions.preSelectedCallback !== 'function'
                                ) {
                                    return;
                                }

                                this.items[button].dropdownOptions.preSelectedCallback(item);
                            }.bind(this));
                        }
                    } else {
                        deleteDropdown.call(this, this.items[button]);
                        this.sandbox.dom.hide(this.sandbox.dom.find('.dropdown-toggle', this.items[button].$el));
                    }
                }
            }.bind(this));
        },

        /**
         * Changes a button text and icon.
         *
         * @param {String} button
         * @param {String|Number} itemId
         * @param {Bool} executeCallback
         */
        changeButton = function(buttonId, itemId, executeCallback) {
            // check if button exists
            if (!this.items[buttonId]) {
                return;
            }

            var button = this.items[buttonId],
                deferred = $.Deferred();

            button.initialized.then(function() {
                // update icon
                var index = getItemIndexById.call(this, itemId, button);
                if (index === true) {
                    index = 0;
                }

                changeMainListItem.call(this, button.$el, button.dropdownItems[index]);
                this.sandbox.emit(ITEM_MARK.call(this), button.dropdownItems[index].id);
                if (executeCallback === true || !!button.dropdownItems[index].callback
                    && typeof button.dropdownItems[index].callback === 'function'
                ) {
                    button.dropdownItems[index].callback();
                }

                deferred.resolve(button.dropdownItems[index]);
            }.bind(this));

            return deferred.promise();
        },

        /**
         * Resets button to its original state.
         *
         * @param {String} buttonId
         */
        resetButton = function(buttonId) {
            // check if button exists
            if (!this.items[buttonId]) {
                return;
            }

            this.items[buttonId].initialized.then(function() {
                resetMainListItem.call(this, this.items[buttonId].$el);
            }.bind(this));
        },

        /**
         * Depending on if the toolbar overflows or not collapses or expands the toolbar
         * collapsing - if the toolbar is expanded and overflown
         * expanding - if the toolbar is underflown and collapsed and the expanded version has enough space
         */
        updateOverflow = function() {
            if (this.$el.width() < this.$el[0].scrollWidth) {
                if (!this.collapsed) {
                    this.expandedWidth = this.$find('.husky-toolbar').outerWidth();
                    collapseAll.call(this);
                    updatedOverflowClass.call(this);
                } else {
                    updatedOverflowClass.call(this);
                }
            } else {
                if (this.collapsed && this.$el.width() >= this.expandedWidth) {
                    expandAll.call(this);
                    this.expandedWidth = this.$find('.husky-toolbar').outerWidth();
                    updatedOverflowClass.call(this);
                } else {
                    updatedOverflowClass.call(this);
                }
            }
        },

        /**
         * Sets an overflow-class on the element, depending on whether or ot
         * the toolbar overflows
         */
        updatedOverflowClass = function() {
            if (this.$el.width() < this.$el[0].scrollWidth) {
                this.$el.addClass('overflown');
            } else {
                this.$el.removeClass('overflown');
            }
        },

        /**
         * Makes the toolbar unscrollable and makes the toolbar-overflow's overflow visible
         * so the dropdown can be seen
         */
        lockToolbarScroll = function() {
            var scrollPos = this.$el.scrollLeft();
            this.$el.css({overflow: 'visible'});
            this.$find('.husky-toolbar').css({
                'margin-left': ((-1) * scrollPos) + 'px'
            });
        },

        /**
         * Makes the toolbar-container's overflow hidden and the wrapper itself scrollable
         */
        unlockToolbarScroll = function() {
            this.$el.removeAttr('style');
            this.$find('.husky-toolbar').removeAttr('style');
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
                $item = this.sandbox.dom.find('[data-id="' + id + '"]', this.$el);

            this.items[id].disabled = !enabled;

            // in case of item has state loading, restore original state
            if (item.loading) {
                item.loading = false;
                this.sandbox.stop(this.sandbox.dom.find('.item-loader', $item));
                this.sandbox.dom.remove(this.sandbox.dom.find('.item-loader', $item));
                this.sandbox.dom.removeClass($item, 'is-loading');
                this.sandbox.dom.width($item, '');
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
            } else {
                this.sandbox.dom.addClass($item, 'disabled');
            }

            if (this.options.responsive === true) {
                updateOverflow.call(this);
            }
        },

        /**
         * Hides a button
         * @param $button
         */
        hideItem = function($button) {
            var $list = $button.parent('.toolbar-dropdown-menu');
            this.sandbox.dom.addClass($button, 'hidden');

            if ($list.length > 0) {
                updateDropdownArrow.call(this, $list);
            }
        },

        /**
         * Shows a button
         * @param $button
         */
        showItem = function($button) {
            var $list = $button.parent('.toolbar-dropdown-menu');
            this.sandbox.dom.removeClass($button, 'hidden');

            if ($list.length > 0) {
                updateDropdownArrow.call(this, $list);
            }
        },

        /**
         * Sets a button into loading state
         * @param id {Number|String} id The id of the button
         */
        itemLoading = function(id) {
            var item = this.items[id],
                $item = this.sandbox.dom.find('[data-id="' + id + '"]', this.$el),
                $loader,
                color = constants.loaderWhiteColor;

            if (item.loading) {
                return;
            }

            item.loading = true;
            // fix width
            this.sandbox.dom.width($item, this.sandbox.dom.width($item));
            this.sandbox.dom.addClass($item, 'is-loading');

            $loader = this.sandbox.dom.createElement('<span class="item-loader"></span>');
            this.sandbox.dom.append($item, $loader);

            if (this.sandbox.dom.hasClass($item, 'highlight-white')) {
                color = constants.loaderDarkColor;
            }

            this.sandbox.start([{
                name: 'loader@husky',
                options: {
                    el: $loader,
                    size: this.options.small ? '14px' : '20px',
                    color: color
                }
            }]);

            if (this.options.responsive === true) {
                updateOverflow.call(this);
            }
        },


        /**
         * gets called when toggle item is clicked
         * opens dropdown submenu
         * @param event
         */
        toggleItem = function(event) {

            event.preventDefault();
            event.stopPropagation();

            var $list = this.sandbox.dom.$(event.currentTarget),
                id = this.sandbox.dom.data($list, 'id'),
                item = this.items[id],
                visible;
            if (!!this.sandbox.dom.find('.dropdown-toggle', $list).length) {
                // abort if disabled or dropdown-arrow wasn't clicked and but the onlyOnClickOnArrow option was true
                if (!item
                    || item.disabled
                    || (item.dropdownOptions.onlyOnClickOnArrow === true && !this.sandbox.dom.hasClass(event.target, 'dropdown-toggle'))
                    || !countVisibleItemsInDropdown($list.children('.toolbar-dropdown-menu'))
                ) {
                    return false;
                }

                if (this.sandbox.dom.hasClass($list, 'is-expanded')) {
                    visible = true;
                }
                hideDropdowns.call(this);

                if (!visible) {
                    this.sandbox.dom.addClass($list, 'is-expanded');
                    this.sandbox.dom.show(this.sandbox.dom.find(selectors.dropdownMenu, $list));
                    // TODO: check if dropdown overlaps screen: set ul to .right-aligned

                    // on every click remove sub-menu
                    this.sandbox.dom.one('body', 'click', hideDropdowns.bind(this));

                    if (this.options.responsive === true) {
                        lockToolbarScroll.call(this);
                    }

                    this.sandbox.emit(DROPDOWN_OPENED.call(this));
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
            for (var i = -1, length = button.dropdownItems.length; ++i < length;) {
                if (button.dropdownItems[i].id === id) {
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
            this.sandbox.dom.hide(this.$find(selectors.dropdownMenu));
            if (this.options.responsive === true) {
                unlockToolbarScroll.call(this);
            }
            this.sandbox.emit(DROPDOWN_CLOSED.call(this));
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

            // stop if loading or the dropdown gets opened
            if (item.loading || (
                    !!item.dropdownItems
                    && item.dropdownOptions.onlyOnClickOnArrow !== true
                    && !!countVisibleItemsInDropdown($(event.currentTarget).children('.toolbar-dropdown-menu'))
                ) || this.sandbox.dom.hasClass(event.target, 'dropdown-toggle')
            ) {
                return false;
            }
            hideDropdowns.call(this);
            if (!!item.parentId && !!this.items[item.parentId].dropdownOptions &&
                this.items[item.parentId].dropdownOptions.markSelected === true) {
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
                original = item._original || item,
                $content = this.sandbox.dom.find('.content', this.items[item.id].$el);

            // forward click to content
            if (!!$content.length) {
                this.sandbox.dom.click(this.sandbox.dom.children($content));
            }

            // check if has parent and type of parent
            if (item.parentId) {
                parentItem = this.items[item.parentId];
                if (!!parentItem.dropdownOptions.changeButton) {
                    changeMainListItem.call(this, $parent, item);
                }

                //check if dropdownOptions is set and pass clicked item to the callback
                if (!!parentItem.dropdownOptions) {
                    if (typeof parentItem.dropdownOptions.callback === 'function') {
                        parentItem.dropdownOptions.callback(original);
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
         * Resets the list items icon and title. Tries to set to default, otherwise to null.
         *
         * @param listElement
         */
        resetMainListItem = function(listElement) {
            var listItems = this.sandbox.dom.find('span', listElement),
                itemId = this.sandbox.dom.data(listElement).id,
                item = this.items[itemId];

            // reset icon
            this.sandbox.dom.removeClass(listItems.eq(0), '');
            item.icon = item.defaultIcon;
            if (!!item.defaultIcon) {
                this.sandbox.dom.addClass(listItems.eq(0), createIconSupportClass.call(this, item));
            }

            // reset title
            item.title = this.sandbox.translate(item.defaultTitle);
            this.sandbox.dom.html(listItems.eq(1), item.title);
            this.items[itemId].title = item.title;

            // remove marked class from dropdown-item
            if (!!item.dropdownItems) {
                this.sandbox.dom.removeClass(selectors.dropdownMenu + ' li', 'marked');
            }

            if (this.options.responsive === true) {
                updateOverflow.call(this);
            }

            this.sandbox.emit(BUTTON_CHANGED.call(this));
        },

        /**
         * Changes the list items icon and title.
         *
         * @param listElement
         * @param item
         */
        changeMainListItem = function(listElement, item) {
            var listItems = this.sandbox.dom.find('span', listElement),
                itemId = this.sandbox.dom.data(listElement).id;
            if (!!item.icon) {
                this.sandbox.dom.removeClass(listItems.eq(0), '');
                this.sandbox.dom.addClass(listItems.eq(0), createIconSupportClass.call(this, item));
                this.items[itemId].icon = item.icon;
            }
            if (!!item.title) {
                item.title = this.sandbox.translate(item.title);
                this.sandbox.dom.html(listItems.eq(1), item.title);
                this.items[itemId].icon = item.title;
            }
            if (this.options.responsive === true) {
                updateOverflow.call(this);
            }
            this.sandbox.emit(BUTTON_CHANGED.call(this));
        },

        /**
         * creates the class string of an icon
         * @param item
         * @returns {string}
         */
        createIconSupportClass = function(item) {
            var classArray,
                classString = '',
                icon = createIconClass.call(this, item);

            // create icon class
            if (item.icon) {
                classArray = [];
                classArray.push(icon);
                classArray.push('icon');

                classString = classArray.join(' ');
            }

            return classString;
        },

        /**
         * returns valid class for item and state
         * @param item
         * @param enabled
         */
        createIconClass = function(item) {
            return 'fa-' + item.icon;
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
            this.sandbox.util.foreach(parent.dropdownItems, function(dropdownItem) {
                dropdownItem.title = this.sandbox.translate(dropdownItem.title);
                if (dropdownItem.divider) {
                    // prevent divider when not enough items
                    if (this.items[parent.id].dropdownItems.length <= 2) {
                        return
                    }
                    this.sandbox.dom.append($list, '<li class="divider"></li>');
                    return;
                }

                dropdownItem.parentId = parent.id;
                // check id for uniqueness
                checkItemId.call(this, dropdownItem);
                $item = this.sandbox.dom.createElement(
                    '<li data-id="' + dropdownItem.id + '"><a href="#">' + dropdownItem.title + '</a></li>'
                );
                dropdownItem.$el = $item;
                this.items[dropdownItem.id] = dropdownItem;

                if (dropdownItem.disabled === true) {
                    this.sandbox.dom.addClass($item, 'disabled');
                }
                if (dropdownItem.marked === true) {
                    uniqueMarkItem.call(this, dropdownItem.id);
                }
                this.sandbox.dom.append($list, $item);
            }.bind(this));

            updateDropdownArrow.call(this, $list);
        },

        countVisibleItemsInDropdown = function($list) {
            return $list.children('li:not(.hidden)').length;
        },

        updateDropdownArrow = function($list) {
            var $dropdownToggle = $list.siblings('.dropdown-toggle');
            if (!!countVisibleItemsInDropdown($list)) {
                $dropdownToggle.css('display', '');
            } else {
                $dropdownToggle.css('display', 'none');
            }
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
        unmarkItem = function(itemId) {
            if (!!this.items[itemId] && !!this.items[itemId].parentId) {
                this.sandbox.dom.removeClass(this.items[itemId].$el, constants.markedClass);
            }
        },

        /**
         * Handles requested items
         * @param requestedItems
         * @param buttonId
         */
        handleRequestedItems = function(requestedItems, buttonId) {
            var id, title, icon, callback, divider, i, length;
            this.items[buttonId].dropdownItems = [];

            //for loop sets the the items[button].dropdownItems - array together
            for (i = -1, length = requestedItems.length; ++i < length;) {

                if (!!this.items[buttonId].dropdownOptions.idAttribute) {
                    id = requestedItems[i][this.items[buttonId].dropdownOptions.idAttribute];
                } else if (!!requestedItems[i].id) {
                    id = requestedItems[i].id;
                }

                if (!!this.items[buttonId].dropdownOptions.titleAttribute) {
                    title = requestedItems[i][this.items[buttonId].dropdownOptions.titleAttribute];
                } else if (!!requestedItems[i].title) {
                    title = requestedItems[i].title;
                }
                if (!!this.items[buttonId].dropdownOptions.languageNamespace) {
                    title += this.items[buttonId].dropdownOptions.languageNamespace + title;
                }
                title = this.sandbox.translate(title);

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

                this.items[buttonId].dropdownItems[i] = {
                    id: id,
                    title: title,
                    icon: icon,
                    callback: callback,
                    divider: divider,
                    _original: requestedItems[i]
                };
            }

            //now generate the dropdown
            this.sandbox.emit(
                ITEMS_SET.call(this),
                buttonId,
                this.items[buttonId].dropdownItems,
                this.items[buttonId].dropdownOptions.preSelected
            );
        },

        /**
         * Collapses all buttons
         */
        collapseAll = function() {
            for (var key in this.items) {
                if (this.items.hasOwnProperty(key)) {
                    toggleCollapseButton.call(this, this.items[key], true);
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
                    toggleCollapseButton.call(this, this.items[key], false);
                }
            }
            this.collapsed = false;
        },


        /**
         * Expands or collapses a given button
         * @param button {Object}
         * @param collapse {Boolean} if true button gets collapsed
         */
        toggleCollapseButton = function(button, collapse) {
            if (!button.parentId && !!button.icon) {
                // show title
                if (collapse === true) {
                    this.sandbox.dom.hide(this.sandbox.dom.find('.title', button.$el));
                } else {
                    this.sandbox.dom.removeAttr(this.sandbox.dom.find('.title', button.$el), 'style');
                }
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
            if (!!button.dropdownItems) {
                // remove the related stuff
                this.sandbox.dom.remove(this.sandbox.dom.find(selectors.dropdownMenu, button.$el));
                this.sandbox.dom.hide(this.sandbox.dom.find('.dropdown-toggle', button.$el));

                // delete JS related stuff
                for (var i = -1, length = button.dropdownItems.length; ++i < length;) {
                    delete this.items[button.dropdownItems[i].id];
                }
                button.dropdownItems = [];
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
                align: 'right'
            };

            this.options.groups.unshift(searchGroup);

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
            this.expandedWidth = 0;

            // load data and call render
            if (!!this.options.url) {
                this.sandbox.util.load(this.options.url)
                    .then(this.render.bind(this))
                    .fail(function(data) {
                        this.sandbox.logger.log('data could not be loaded:', data);
                    }.bind(this));
            } else if (!!this.options.buttons) {
                this.render((this.options.buttons));
            } else {
                this.sandbox.logger.log('no data provided for tabs!');
            }

            bindDOMEvents.call(this);
            bindCustomEvents.call(this);

            if (this.options.responsive === true) {
                updateOverflow.call(this);
            }

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Destroys the component
         */
        destroy: function() {
            $(window).off('resize.husky-toolbar-' + this.options.instanceName);
        },

        /**
         * renders the toolbar
         * @param {Object} data
         */
        render: function(data) {

            var classArray, addTo,
                $listItem,
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
                item = this.sandbox.util.extend(true, {}, item, itemDefaults);
                item.title = this.sandbox.translate(item.title);

                // check id for uniqueness
                checkItemId.call(this, item);

                var dfd = this.sandbox.data.deferred();

                // set default title and icon
                item.defaultTitle = item.title;
                item.defaultIcon = item.icon;

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
                    if (!!item.icon) {
                        // create icon span
                        this.sandbox.dom.append($listItem, '<span class="' + createIconSupportClass.call(this, item) + '" />');
                    }

                    // create content span
                    if (!!item.content) {
                        var $contentSpan = this.sandbox.dom.createElement('<span class="content"/>');
                        this.sandbox.dom.append($contentSpan, item.content);
                        this.sandbox.dom.append($listItem, $contentSpan);
                        this.sandbox.start($contentSpan);
                    }

                    // create title span
                    title = (!!item.title && this.options.showTitle === true) ? item.title : '';
                    this.sandbox.dom.append($listItem, '<span class="title">' + title + '</span>');

                    // add dropdown-toggle element (hidden at default)
                    this.sandbox.dom.append($listItem, this.sandbox.dom.createElement('<span class="dropdown-toggle" />'));
                    this.sandbox.dom.hide(this.sandbox.dom.find('.dropdown-toggle', $listItem));

                    //add tooltip to item
                    if (this.options.showTitleAsTooltip === true) {
                        this.sandbox.dom.attr($listItem, {'title': title});
                    }

                    //hide the item if hidden true
                    if (item.hidden === true) {
                        hideItem.call(this, $listItem);
                    }

                    if (!!item.dropdownOptions && !!item.dropdownOptions.url) {
                        this.sandbox.util.load(item.dropdownOptions.url)
                            .then(function(result) {
                                var data = result[this.options.dropdownItemsKey];
                                if (!!item.dropdownOptions.resultKey) {
                                    data = data[item.dropdownOptions.resultKey];
                                }

                                // add items if present
                                if (!!item.dropdownItems) {
                                    data = data.concat(item.dropdownItems);
                                }

                                handleRequestedItems.call(this, data, item.id);
                                dfd.resolve();
                            }.bind(this))
                            .fail(function(result) {
                                this.sandbox.logger.log('dorpdown-items could not be loaded', result);
                            }.bind(this));
                    } else {
                        // now create subitems
                        if (!!item.dropdownItems) {
                            this.sandbox.dom.removeAttr(this.sandbox.dom.find('.dropdown-toggle', $listItem), 'style');
                            createDropdownMenu.call(this, $listItem, item);
                        }
                        dfd.resolve();
                    }
                }

                // create button
                this.sandbox.dom.append(addTo, $listItem);

                //set width for buttons with dropdowns
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

            //add responsive class
            if (this.options.responsive === true) {
                this.$el.addClass('husky-toolbar-responsive');
            }
        }
    };

});

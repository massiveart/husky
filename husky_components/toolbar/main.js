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

/*
 *
 *  Tabs
 *
 *  Options (defaults)
 *      - url: url to fetch data from
 *      - data: if no url is provided
 *      - selected: the item that's selected on initialize
 *      - instanceName - enables custom events (in case of multiple tabs on one page)
 *      - hasSearch - adds a search element at the end
 *  Provides Events
 *      -
 *  Triggers Events
 *      - husky.toolbar.<<instanceName>>.item.select - triggered when item was clicked
 *
 *
 */

/**
 * @class Toolbar
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.data] if no url is provided
 * @param {String} [options.selected] the item that's selected on initialize
 * @param {String} [options.instanceName] enables custom events (in case of multiple tabs on one page)
 * @param {String} [options.hasSearch] adds a search element at the end
 * @param {Object} [options.dropdownComponent=null] adds a dropdowncomponent as dropdown menu
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            hasSearch: false,
            appearance: 'large',
            searchOptions: null,
            dropdownComponent: null
        },


        /**
         * triggered when component is completely initialized
         * @event husky.toolbar[.INSTANCE_NAME].initialized
         */
            INITIALIZED = function() {
            return getEventName.call(this, 'initialized');

        },

        /**
         * triggered when item got clicked
         * @event husky.toolbar[.INSTANCE_NAME].item.selected
         * @param {Object} item
         */
            ITEM_SELECTED = function() {
            return getEventName.call(this, 'item.selected');

        },

        /**
         * used to enable an item
         * @event husky.toolbar[.INSTANCE_NAME].item.enable
         * @param {String} itemId Id of item to enable
         */
            ITEM_ENABLE = function() {
            return getEventName.call(this, 'item.enable');

        },

        /**
         * used to disable an item
         * @event husky.toolbar[.INSTANCE_NAME].initialized
         * @param {String} itemId Id of item to disable
         */
            ITEM_DISABLE = function() {
            return getEventName.call(this, 'item.disable');

        },


        selectItem = function(event) {
            event.preventDefault();

            var item = this.items[this.sandbox.dom.data(event.currentTarget, 'id')],
                $parent;

            if (item.disabled) {
                return;
            }

            // if toggle item do not trigger event
            if (!item.items) {
                $parent = this.sandbox.dom.find('button', this.sandbox.dom.closest(event.currentTarget, '.group'));
                triggerSelectEvent.call(this, item, $parent);
            }
        },

        getEventName = function(postFix) {
            return 'husky.toolbar.' + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },

        triggerSelectEvent = function(item, $parent) {
            var parentId, icon;
            parentId = this.sandbox.dom.data($parent, 'id');

            if (this.items[parentId].type === "select") {
                icon = this.sandbox.dom.find('span', $parent);
                this.sandbox.dom.removeClass(icon);
                this.sandbox.dom.addClass(icon, item.icon);
            }

            // if callback is set call it, else trigger event
            if (item.callback) {
                item.callback();
            } else {
                this.sandbox.emit(ITEM_SELECTED.call(this), item);
            }
        },

        bindDOMEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', selectItem.bind(this), 'button:not(:disabled), li');
            this.sandbox.dom.on(this.$el, 'click', toggleItem.bind(this), '.dropdown-toggle');
        },

        bindCustomEvents = function() {
            this.sandbox.on(ITEM_ENABLE.call(this), enableItem.bind(this));
            this.sandbox.on(ITEM_DISABLE.call(this), disableItem.bind(this));
        },

        /**
         * created dropdown menu
         * @param listItem
         * @param parent
         */
            createDropdownMenu = function(listItem, parent) {
            var $list = this.sandbox.dom.createElement('<ul class="toolbar-dropdown-menu" />'),
                classString = '';
            this.sandbox.dom.after(listItem, $list);
            this.sandbox.util.foreach(parent.items, function(item) {
                if (item.divider) {
                    this.sandbox.dom.append($list, '<li class="divider"></li>');
                    return;
                }

                item.parentId = parent.id;
                // check id for uniqueness
                checkItemId.call(this, item);
                this.items[item.id] = item;

                classString = '';
                if (item.disabled) {
                    classString = ' class="disabled"';
                }

                this.sandbox.dom.append($list, '<li data-id="' + item.id + '"' + classString + '><a href="#">' + item.title + '</a></li>');
            }.bind(this));
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
                    item.id = this.sandbox.util._.uniqueId();
                } while (!!this.items[item.id]);
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

            var $list = this.sandbox.dom.parent(event.currentTarget),
                visible;

            if (this.sandbox.dom.hasClass($list, 'is-expanded')) {
                visible = true;
            }
            hideDropdowns.call(this);

            if (!visible) {
                this.sandbox.dom.addClass($list, 'is-expanded');

                // TODO: check if dropdown overlaps screen: set ul to .right-aligned

                // on every click remove submenu
                this.sandbox.dom.one('body', 'click', hideDropdowns.bind(this));
            }
        },

        hideDropdowns = function() {
            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-expanded', this.$el), 'is-expanded');
        },

        enableItem = function(id) {
            var $domItem,
                item = this.items[id];
            if (item.disabled) {
                item.disabled = false;
                $domItem = this.sandbox.dom.find('[data-id="' + id + '"]');

                if (this.sandbox.dom.is($domItem, 'button')) {
                    this.sandbox.dom.removeAttr($domItem, 'disabled');
                } else {
                    this.sandbox.dom.removeClass($domItem, 'disabled');
                }
            }
        },

        disableItem = function(id) {
            var $domItem,
                item = this.items[id];
            if (!item.disabled) {
                item.disabled = true;
                $domItem = this.sandbox.dom.find('[data-id="' + id + '"]');

                if (this.sandbox.dom.is($domItem, 'button')) {
                    this.sandbox.dom.attr($domItem, 'disabled', 'disabled');
                } else {
                    this.sandbox.dom.addClass($domItem, 'disabled');
                }
            }
        };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$el = this.sandbox.dom.$(this.options.el);

            bindCustomEvents.call(this);

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

        },

        render: function(data) {

            // TODO: add appearance class

            var $container = this.sandbox.dom.createElement('<div class="toolbar-container" />'),
                classArray, addTo, disabledString, button, $group, searchOptions;

            this.sandbox.dom.append(this.options.el, $container);

            // create items array
            this.items = [];
            // save item groups in array
            this.itemGroup = [];


            // create all elements
            this.sandbox.util.foreach(data, function(item) {

                checkItemId.call(this, item);
                // save to items array
                this.items[item.id] = item;
                // create classes array
                classArray = [];

                // check if item is in a group
                if (!!item.group) {
                    // create group if not created yet
                    if (!this.itemGroup[item.group]) {
                        this.itemGroup[item.group] = this.sandbox.dom.createElement('<div id="' + item.group + '" class="btn-group" />');
                        this.sandbox.dom.append($container, this.itemGroup[item.group]);
                        this.sandbox.dom.addClass(this.itemGroup[item.group], this.options.appearance);
                    }
                    addTo = this.itemGroup[item.group];
                } else {
                    addTo = $container;
                }


                if (!!item['class']) {
                    classArray.push(item['class']);
                }

                disabledString = '';
                if (item.disabled) {
                    disabledString = 'disabled';
                }
                // create button
                $group = this.sandbox.dom.createElement('<div class="group ' + this.options.appearance + '" />');
                this.sandbox.dom.append(addTo, $group);
                button = this.sandbox.dom.createElement('<button data-id="' + item.id + '" class="' + classArray.join(' ') + '" title="' + item.title + '" ' + disabledString + '><span class="icon-' + item.icon + '"/></button>');
                this.sandbox.dom.append($group, button);

                // now create subitems
                if (item.dropdownComponent) {
                    this.sandbox.dom.addClass(button, 'dropdown-toggle');
                    // define element
                    item.dropdownComponent.options.el = $group;
                    item.dropdownComponent.options.trigger = button;
                    this.sandbox.start([
                        item.dropdownComponent
                    ]);
                } else if (!!item.items) {
                    this.sandbox.dom.addClass(button, 'dropdown-toggle');
                    createDropdownMenu.call(this, button, item);
                }

            }.bind(this));

            // add search
            if (this.options.hasSearch) {
                this.sandbox.dom.append($container, '<div id="' + this.options.instanceName + '-toolbar-search" class="toolbar-search" />');

                searchOptions = {
                    el: '#' + this.options.instanceName + '-toolbar-search',
                    instanceName: this.options.instanceName,
                    appearance: 'white small'
                };
                searchOptions = this.sandbox.util.extend(true, {}, searchOptions, this.options.searchOptions);
                // start search component
                this.sandbox.start([
                    {
                        name: 'search@husky',
                        options: searchOptions
                    }
                ]);
            }

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        }
    };

});

/*****************************************************************************
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
 *****************************************************************************/

define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            hasSearch: false,
            appearance: 'large'
        },

        selectItem = function(event) {
            event.preventDefault();

            var item = this.items[this.sandbox.dom.data(event.currentTarget, 'id')];

            // if toggle item do not trigger event
            if (!item.items) {
                triggerSelectEvent.call(this, item);
            }
        },

        triggerSelectEvent = function(item) {
            // if callback is set call it, else trigger event
            if (item.callback) {
                item.callback();
            } else {
                var instanceName = this.options.instanceName ? this.options.instanceName + '.' : '';
                this.sandbox.emit('husky.toolbar.' + instanceName + 'item.select', item);
            }
        },

        bindDOMEvents = function() {
            this.sandbox.dom.on(this.options.el, 'click', selectItem.bind(this), 'button:not(:disabled), li');
            this.sandbox.dom.on(this.options.el, 'click', toggleItem.bind(this), '.dropdown-toggle');
        },

        /**
         * created dropdown menu
         * @param listItem
         * @param items
         */
        createDropdownMenu = function(listItem, parent) {
            var $list = this.sandbox.dom.createElement('<ul class="toolbar-dropdown-menu" />');
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

                this.sandbox.dom.append($list, '<li data-id="' + item.id + '"><a href="#">' + item.title + '</a></li>');
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
                    item.id = createUniqueId();
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
            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-expanded', this.$el), 'is-expanded');

            if (!visible) {
                this.sandbox.dom.addClass($list, 'is-expanded');

                // TODO: check if dropdown overlaps screen: set ul to .right-aligned

                // on every click remove submenu
                this.sandbox.dom.one('body', 'click', toggleItem.bind(this));
            }
        },

        /**
         * function generates a unique id
         * @returns string
         */
        createUniqueId = function() {
            return 'xxxxyxxyx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$el = this.sandbox.dom.$(this.options.el);

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
                classArray, addTo, disabledString, button, $group;

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
                if (item.icon) {
//                    classArray.push('icon-' + item.icon);
                }

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
//                    classArray.push(this.options.appearance);

                    addTo = $container;
                }


                if (!!item.class) {
                    classArray.push(item.class);
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
                if (!!item.items) {
                    this.sandbox.dom.addClass(button, 'dropdown-toggle');
                    createDropdownMenu.call(this, button, item);
                }

            }.bind(this));

            // add search
            if (this.options.hasSearch) {
                this.sandbox.dom.append($container, '<div id="' + this.options.instanceName + '-toolbar-search" class="toolbar-search" />');
            }
            // start search component
            this.sandbox.start([
                {name: 'search@husky', options: {el: '#' + this.options.instanceName + '-toolbar-search', instanceName: this.options.instanceName, appearance: 'white small'}}
            ]);

            // initialization finished
            this.sandbox.emit('husky.tabs.initialized');
        }
    };

});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/column-options
 */


/**
 * @class Column-Options
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.instanceName] name of the instance - will affect events name
 * @param {Object} [options.data] if no url is provided
 * @param {String} [options.trigger] the dom item which opens the component
 * @param {Object} [options.header] Configuration object for the header
 * @param {Boolean} [options.header.disabled] defines if header should be shown
 * @param {String} [options.header.title] headline of the header
 * @param {Object} [options.footer] Configuration object for the header
 * @param {Boolean} [options.footer.disabled] defines if footer should be shown
 * @param {Boolean} [options.hidden] defines if component should be hidden when component is initialized
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            trigger: null,
            instanceName: null,
            header: {
                disabled: false,
                title: 'Column Options'
            },
            footer: {
                disabled: false
            },
            hidden: false
        },

        templates = {
            listItem: [
                '<li class="column-options-list-item" data-id="<%= id %>" draggable="true">',
                '   <span class="move">&#8942;</span>',
                '   <span class="text"><%= title %></span>',
                '   <span class="<%= toggleIcon %> visibility-toggle"></span>',
                '</li>'].join(''),
            header: [
                '<div class="column-options-header">',
                '   <span class="title"><%= title %></span>',
                '   <a href="#" class="fa-times close-button"></a>',
                '</div>'
            ].join('')
        },

        iconClasses = {
            visible: 'fa-eye',
            hidden: 'fa-eye-slash'
        },


        /**
         * triggered when component is completely initialized
         * @event husky.column-options[.INSTANCE_NAME].initialized
         */
        INITIALIZED = function() {
            return getEventName.call(this, 'initialized');

        },

        /**
         * triggered when item was enabled
         * @event husky.column-options[.INSTANCE_NAME].item.enabled
         * @param {Object} item that was enabled
         */
        ENABLED = function() {
            return getEventName.call(this, 'item.enabled');

        },

        /**
         * triggered when item was disabled
         * @event husky.column-options[.INSTANCE_NAME].item.disabled
         * @param {Object} item that was disabled
         */
        DISABLED = function() {
            return getEventName.call(this, 'item.disabled');

        },

        /**
         * triggered when save was clicked
         * @event husky.column-options[.INSTANCE_NAME].saved
         * @param {Array} Contains all visible items
         */
        SAVED = function() {
            return getEventName.call(this, 'saved');

        },

        /**
         * used for receiving all visible columns
         * @event husky.column-options[.INSTANCE_NAME].get-selected
         */
        GET_SELECTED = function() {
            return getEventName.call(this, 'get-selected');

        },

        /**
         * used for receiving all columns
         * @event husky.column-options[.INSTANCE_NAME].get-all
         */
        GET_ALL = function() {
            return getEventName.call(this, 'get-all');

        },


        /**
         * DOM events
         */
        bindDOMEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', customStopPropagation.bind(this), this.$container); // prevent from unwanted events
            this.sandbox.dom.on(this.$el, 'mouseover', onMouseOver.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'mouseout', onMouseOut.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'click', toggleVisibility.bind(this), '.visibility-toggle');
        },


        /**
         * custom events
         */
        bindCustomEvents = function() {
            this.sandbox.on(GET_SELECTED.call(this), getSelectedItems.bind(this));
            this.sandbox.on(GET_ALL.call(this), getAllItems.bind(this));
        },

        getEventName = function(postFix) {
            return 'husky.column-options.' + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },

        /**
         * returns all items that are visible
         * @param callbackFunction
         */
        getSelectedItems = function(callbackFunction) {
            var id, items,
                $visibleItems = this.sandbox.dom.find('li:not(.disabled)', this.$el);

            items = [];
            this.sandbox.util.foreach($visibleItems, function($domItem) {
                id = this.sandbox.dom.data($domItem, 'id');
                items.push(this.items[id]);
            }.bind(this));

            callbackFunction(items);
        },

        /**
         * returns all items that are visible
         * @param callbackFunction
         */
        getAllItems = function(callbackFunction) {
            var id, items,
                $visibleItems = this.sandbox.dom.find('li', this.$el);

            items = [];
            this.sandbox.util.foreach($visibleItems, function($domItem) {
                id = this.sandbox.dom.data($domItem, 'id');
                items.push(this.items[id]);
            }.bind(this));

            callbackFunction(items);
        },


        onMouseOver = function(event) {
            this.sandbox.dom.addClass(event.currentTarget, 'hover-style');
        },

        onMouseOut = function(event) {
            this.sandbox.dom.removeClass(event.currentTarget, 'hover-style');
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
        customStopPropagation = function(event) {
            event.preventDefault();
            event.stopPropagation();
        },

        /**
         * called when save was clicked
         */
        submit = function() {
            var $items = this.sandbox.dom.find('.column-options-list-item', this.$list),
                items = [],
                id;


            // resort array
            this.sandbox.util.foreach($items, function($item) {
                id = this.sandbox.dom.data($item, 'id');
                items.push(this.items[id]);
            }.bind(this));
            this.data = items;

            // make permanent
            this.options.data = this.data;

            getAllItems.call(this, function(items) {
                this.sandbox.emit(SAVED.call(this), items);
            }.bind(this));

        },

        /**
         * close dropdown - callback
         */
        close = function() {
            this.sandbox.dom.remove(this.$el);
        },

        /**
         * renders list items
         */
        renderItems = function() {
            var $listItem;

            // create items array
            this.items = [];

            this.sandbox.util.foreach(this.data, function(item) {
                checkItemId.call(this, item);
                // save to items array
                this.items[item.id] = item;

                // append to list
                $listItem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.listItem, {
                    id: item.id,
                    toggleIcon: (item.default === true || item.default === 'true') ? '' : iconClasses.visible,
                    title: this.sandbox.translate(item.translation)}));
                this.sandbox.dom.append(this.$list, $listItem);

                // set to disabled
                if (typeof item.disabled !== 'undefined' && item.disabled !== "false" && item.disabled !== false) {
                    toggleVisibility.call(this, {currentTarget: this.sandbox.dom.find('.visibility-toggle', $listItem), doNotEmitEvents: true, preventDefault: function() {
                    }});
                }
            }.bind(this));
        },

        startOverlay = function() {
            if (this.overlayLoaded === false) {
                var $element = this.sandbox.dom.createElement('<div/>');
                this.sandbox.dom.append(this.$el, $element);

                this.sandbox.start([
                    {
                        name: 'overlay@husky',
                        options: {
                            el: $element,
                            container: this.$el,
                            data: this.$list,
                            okCallback: function() {
                                submit.call(this);
                                close.call(this);
                            }.bind(this),
                            closeCallback: function() {
                                close.call(this);
                            }.bind(this),
                            instanceName: 'column-options-' + this.options.instanceName,
                            title: this.options.header.title,
                            openOnStart: !this.options.hidden,
                            removeOnClose: true
                        }
                    }
                ]);

                this.overlayLoaded = true;
            }
        },

        /**
         * toggles the classes of an item
         * @param event
         */
        toggleVisibility = function(event) {
            event.preventDefault();

            var $listItem = this.sandbox.dom.parent(event.currentTarget),
                isDisabled = this.sandbox.dom.hasClass($listItem, 'disabled'),
                id = this.sandbox.dom.data($listItem, 'id'),
                item = this.items[id],
                visible = iconClasses.visible,
                hidden = iconClasses.hidden;

            if (isDisabled) {
                // enable
                this.numVisible++;
                this.sandbox.dom.removeClass(event.currentTarget, hidden);
                this.sandbox.dom.prependClass(event.currentTarget, visible);
            } else {
                // disable
                // one column must stay visible
                if (this.numVisible === 1) {
                    return;
                }

                this.numVisible--;
                this.sandbox.dom.prependClass(event.currentTarget, hidden);
                this.sandbox.dom.removeClass(event.currentTarget, visible);
            }

            this.sandbox.dom.toggleClass($listItem, 'disabled');
            item.disabled = !isDisabled;

            if (!event.doNotEmitEvents) {
                this.sandbox.emit(isDisabled ? ENABLED.call(this) : DISABLED.call(this), item);
            }
        };


    return {

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.overlayLoaded = false;

            // define handle object to trigger
            this.options.trigger = this.options.trigger || this.$el;

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
        },

        /**
         * renders list
         * @param data
         */
        render: function(data) {

            this.numVisible = data.length;

            this.options.data = data;
            // temporary data save
            this.data = this.sandbox.util.extend(true, [], this.options.data);

            this.sandbox.dom.addClass(this.$el, 'column-options-parent');

            // init list
            this.$list = this.sandbox.dom.createElement('<ul class="column-options-list" />');

            // render list items
            renderItems.call(this);

            // make list sortables
            this.sandbox.dom.sortable(this.$list, {handle: '.move'});
            startOverlay.call(this);

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * rerenders list items (reset)
         */
        rerender: function() {
            this.data = this.sandbox.util.extend(true, [], this.options.data);
            this.sandbox.dom.html(this.$list, '');
            renderItems.call(this);
            // make list sortable
            this.sandbox.dom.sortable(this.$list, {handle: '.move'});
        }
    };
});

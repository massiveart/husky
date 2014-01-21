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
 * @class Toolbar
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {Object} [options.data] if no url is provided
 * @param {String} [options.trigger] the dom item which opens the component
 * @param {Object} [options.header] Configuration object for the header
 * @param {Boolean} [options.header.disabled] defines if header should be shown
 * @param {String} [options.header.title] headline of the header
 * @param {Object} [options.footer] Configuration object for the header
 * @param {Boolean} [options.footer.disabled] defines if footer should be shown
 * @param {Boolean} [options.hidden] defines if component should be hidden when component is initialized
 * @param {Boolean} [options.destroyOnClose] will remove the container from dom, when closed
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            trigger: null,
            header: {
                disabled: false,
                title: 'Column Options'
            },
            footer: {
                disabled: false
            },
            hidden: false,
            destroyOnClose: true
        },

        templates = {
            listItem: [
                '<li class="column-options-list-item" data-id="<%= id %>" draggable="true">',
                '   <span class="move">&#8942;</span>',
                '   <span class="text"><%= title %></span>',
                '   <span class="icon-half-eye-open visibility-toggle"></span>',
                '</li>'].join(''),
            header: [
                '<div class="column-options-header">',
                '   <span class="title"><%= title %></span>',
                '   <a href="#" class="icon-remove2 close-button"></a>',
                '</div>'
            ].join('')
        },


        namespace = 'husky.column-options',

        /**
         * triggered when component is completely initialized
         * @event husky.column-options.initialized
         */
            INITIALIZED = namespace + '.initialized',

        /**
         * triggered when item was enabled
         * @event husky.column-options.item.enabled
         * @param {Object} item that was enabled
         */
            ENABLED = namespace + '.item.enabled',

        /**
         * triggered when item was disabled
         * @event husky.column-options.item.disabled
         * @param {Object} item that was disabled
         */
            DISABLED = namespace + '.item.disabled',

        /**
         * triggered when save was clicked
         * @event husky.column-options.saved
         * @param {Array} Contains all visible items
         */
            SAVED = namespace + '.saved',

        /**
         * used for receiving all visible columns
         * @event husky.column-options.get-selected
         */
            GET_SELECTED = namespace + '.get-selected',

        /**
         * used for receiving all columns
         * @event husky.column-options.get-all
         */
            GET_ALL = namespace + '.get-all',


        /**
         * DOM events
         */
            bindDOMEvents = function() {

            this.sandbox.dom.on(this.options.trigger, 'click', toggleDropdown.bind(this));
            this.sandbox.dom.on(this.$el, 'click', stopPropagation.bind(this), '.column-options-container'); // prevent from unwanted events
            this.sandbox.dom.on(this.$el, 'mouseover', onMouseOver.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'mouseout', onMouseOut.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'click', toggleVisibility.bind(this), '.visibility-toggle');
            this.sandbox.dom.on(this.$el, 'click', submit.bind(this), '.save-button');
            this.sandbox.dom.on(this.$el, 'click', hideDropdown.bind(this, true), '.close-button');
        },

        /**
         * custom events
         */
            bindCustomEvents = function() {
            this.sandbox.on(GET_SELECTED, getSelectedItems.bind(this));
            this.sandbox.on(GET_ALL, getAllItems.bind(this));
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
            stopPropagation = function(event) {

            event.preventDefault();
            event.stopPropagation();
        },

        /**
         * gets called when toggle item is clicked
         * opens dropdown submenu
         * @param event
         */
            toggleDropdown = function(event) {

            event.preventDefault();
            event.stopPropagation();

            var $container = this.sandbox.dom.find('.column-options-container', this.$el),
                isVisible = this.sandbox.dom.is($container, ':visible');

            if (isVisible) {
                closeDropdown.call(this, $container, true);
            } else {
                this.sandbox.dom.show($container);
                this.sandbox.dom.one('body', 'click', closeDropdown.bind(this, $container, true));
            }
        },

        /**
         * simply hides container
         */
            hideDropdown = function(reset) {
            var $container = this.sandbox.dom.find('.column-options-container', this.$el);
            closeDropdown.call(this, $container, reset);
        },

        /**
         * close dropdown
         * @param $container container to hide
         * @param rerender - rerender list after close
         */
            closeDropdown = function($container, rerender) {
            this.sandbox.dom.hide($container);
            if (this.options.destroyOnClose) {
                this.sandbox.dom.remove(this.$el);
            } else if (rerender) {
                // reset unsaved changes
                this.rerender();
            }
        },

        /**
         * called when save was clicked
         */
            submit = function() {
            var $items = this.sandbox.dom.find('.column-options-list-item', this.$el),
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
                this.sandbox.emit(SAVED, items);
                hideDropdown.call(this);

                this.sandbox.dom.off('body', 'click');

            }.bind(this));

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
                $listItem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.listItem, {id: item.id, title: this.sandbox.translate(item.translation)}));
                this.sandbox.dom.append(this.$list, $listItem);

                // set to disabled
                if (item.disabled !== "false" && item.disabled !== false ) {
                    toggleVisibility.call(this, {currentTarget: this.sandbox.dom.find('.visibility-toggle', $listItem), doNotEmitEvents: true, preventDefault: function() {
                    }});
                }
            }.bind(this));
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
                classEyeOpen = 'icon-half-eye-open',
                classEyeClose = 'icon-half-eye-close';

            this.sandbox.dom.toggleClass($listItem, 'disabled');

            if (isDisabled) {
                this.sandbox.dom.removeClass(event.currentTarget, classEyeClose);
                this.sandbox.dom.prependClass(event.currentTarget, classEyeOpen);
            } else {
                this.sandbox.dom.prependClass(event.currentTarget, classEyeClose);
                this.sandbox.dom.removeClass(event.currentTarget, classEyeOpen);
            }

            item.disabled = !isDisabled;

            if (!event.doNotEmitEvents) {
                this.sandbox.emit(isDisabled ? ENABLED : DISABLED, item);
            }
        };


    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$el = this.sandbox.dom.$(this.options.el);

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

            this.options.data = data;
            // temporary data save
            this.data = this.sandbox.util.extend(true, [], this.options.data);

            this.sandbox.dom.addClass(this.$el, 'column-options-parent');

            // init container
            var $container = this.sandbox.dom.createElement('<div class="column-options-container" />');
            this.sandbox.dom.append(this.$el, $container);

            // render header
            if (!this.options.header.disabled) {
                this.sandbox.dom.append($container, this.sandbox.template.parse(templates.header, {title: this.options.header.title}));
            }

            // init list
            this.$list = this.sandbox.dom.createElement('<ul class="column-options-list" />');
            this.sandbox.dom.append($container, this.$list);

            // render list items
            renderItems.call(this);

            // render footer
            if (!this.options.footer.disabled) {
                this.sandbox.dom.append($container, '<div class="column-options-footer"><a href="#" class="icon-half-ok save-button btn btn-highlight"></a></div>');
            }

            // make list sortables
            this.sandbox.dom.sortable('.column-options-list', {handle: '.move'});

            // show on startup
            if (!this.options.hidden) {
                this.sandbox.dom.show($container);
            }

            // initialization finished
            this.sandbox.emit(INITIALIZED);
        },

        /**
         * rerenders list items (reset)
         */
        rerender: function() {
            this.data = this.sandbox.util.extend(true, [], this.options.data);
            this.sandbox.dom.html(this.$list, '');
            renderItems.call(this);
            // make list sortable
            this.sandbox.dom.sortable('.column-options-list', {handle: '.move'});
        }
    };
});

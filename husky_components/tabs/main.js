/*****************************************************************************
 *
 *  Tabs
 *
 *  Options (defaults)
 *      - url: url to fetch data from
 *      - data: if no url is provided
 *      - selected: the item that's selected on initialize
 *      - instanceName - enables custom events (in case of multiple tabs on one page)
 *      - preselect - defines if actions are going to be checked against current URL and preselected (current URL mus be provided by data.url)
 *      - forceReload - defines if tabs are forcing page to reload
 *      - forceSelect - forces tabs to select first item, if no selected item has been found
 *  Provides Events
 *      - husky.tabs.<<instanceName>>.getSelected [callback(item)] - returns item with callback
 *  Triggers Events
 *      - husky.tabs.<<instanceName>>.item.select [item] - triggered when item was clicked
 *      - husky.tabs.<<instanceName>>.initialized [selectedItem]- triggered when tabs have been initialized
 *
 *  Data options
 *      - items
 *          - forceReload: overwrites default-setting for certain item
 *
 *  TODO select first (or with parameter) item after load
 *
 *****************************************************************************/

define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            preselect: true,
            forceReload: false,
            forceSelect: true
        },

        selectItem = function(event) {
            event.preventDefault();
            if (this.active === true) {
                this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el), 'is-selected');
                this.sandbox.dom.addClass(event.currentTarget, 'is-selected');
                triggerSelectEvent.call(this, this.items[this.sandbox.dom.data(event.currentTarget, 'id')]);
            } else {
                return false;
            }
        },

        triggerSelectEvent = function(item) {

            item.forceReload = (item.forceReload && typeof item.forceReload !== "undefined") ? item.forceReload : this.options.forceReload;
            this.sandbox.emit(createEventString.call(this, 'item.select'), item);
        },

        bindDOMEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', selectItem.bind(this), 'li');
        },

        bindCustomEvents = function() {
            this.sandbox.on(createEventString.call(this, 'getSelected'), function(callback) {
                var selection = this.sandbox.dom.find('.is-selected', this.options.el);
                callback.call(this.items[this.sandbox.dom.data(selection, 'id')]);
            }.bind(this));

            this.sandbox.on(createEventString.call(this, 'activate'), function() {
                this.activate();
            }.bind(this));

            this.sandbox.on(createEventString.call(this, 'deactivate'), function() {
                this.deactivate();
            }.bind(this));
        },

        createEventString = function(ending) {
            var instanceName = this.options.instanceName ? this.options.instanceName + '.' : '';
            return 'husky.tabs.' + instanceName + ending;
        };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$el = this.sandbox.dom.$(this.options.el);
            this.active = true;

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

        deactivate: function() {
            this.active = false;
            this.sandbox.dom.addClass(this.sandbox.dom.find('.tabs-container', this.$el), 'deactivated');
        },

        activate: function() {
            this.active = true;
            this.sandbox.dom.removeClass(this.sandbox.dom.find('.tabs-container', this.$el), 'deactivated');
        },

        generateIds: function(data) {
            if (!data.id) {
                data.id = this.getRandId();
            }
            this.sandbox.util.foreach(data.items, function(item) {
                if (!item.id) {
                    item.id = this.getRandId();
                }
            }.bind(this));
            return data;
        },

        getRandId: function() {
            return Math.floor((Math.random()*1677721500000000)).toString(16);
        },

        render: function(data) {
            data = this.generateIds(data);

            var $element = this.sandbox.dom.createElement('<div class="tabs-container"></div>'),
                $list = this.sandbox.dom.createElement('<ul/>'),
                selected = '', selectedItem = null;

            this.sandbox.dom.append(this.$el, $element);
            this.sandbox.dom.append($element, $list);

            this.items = [];

            this.sandbox.util.foreach(data.items, function(item) {
                // check if item got selected
                if (this.options.preselect && !!data.url && data.url === item.action) {
                    selected = ' class="is-selected"';
                    selectedItem = item;
                } else {
                    selected = '';
                }

                this.items[item.id] = item;
                this.sandbox.dom.append($list, '<li ' + selected + ' data-id="' + item.id + '"><a href="#">' + this.sandbox.translate(item.title) + '</a></li>');
            }.bind(this));

            // force selection of first element
            if (!selectedItem && this.options.forceSelect) {
                selectedItem = this.options.data[0];
                this.sandbox.dom.addClass(this.sandbox.dom.find('li',$list).eq(0),'is-selected');
            }

            // initialization finished
            this.sandbox.emit(createEventString.call(this, 'initialized'), selectedItem);
        }
    };

});

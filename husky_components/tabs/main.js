/*****************************************************************************
 *
 *  Tabs
 *
 *  Options (defaults)
 *      - url: url to fetch data from
 *      - data: if no url is provided
 *      - selected: the item that's selected on initialize
 *      - instanceName - enables custom events (in case of multiple tabs on one page)
 *      - preselect - either true (for url) or position / title  (see preselector for more information)
 *      - preselector:
 *          - url: defines if actions are going to be checked against current URL and preselected (current URL mus be provided by data.url) - preselector itself is not going to be taken into account in this case
 *          - position: compares items position against whats defined in options.preselect
 *          - title: compares items title against whats defined in options.preselect
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
            preselector: 'url',
            forceReload: false,
            callback: null,
            forceSelect: true
        },

        selectItem = function(event) {
            event.preventDefault();
            var item = this.items[this.sandbox.dom.data(event.currentTarget, 'id')];

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el), 'is-selected');
            this.sandbox.dom.addClass(event.currentTarget, 'is-selected');

            // callback
            if (item.hasOwnProperty('callback') && typeof item.callback === 'function') {
                item.callback.call(this, item);
            } else if (!!this.options.callback && typeof this.options.callback === 'function') {
                this.options.callback.call(this, item);
            } else {
                triggerSelectEvent.call(this, item);
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

            this.sandbox.util.foreach(data.items, function(item, index) {
                // check if item got selected
                selected = '';
                if (!!this.options.preselect) {
                    if ((this.options.preselector === 'url' && !!data.url && data.url === item.action) ||
                        (this.options.preselector === 'position' && (index+1).toString() === this.options.preselect.toString()) ||
                        (this.options.preselector === 'title' && item.title === this.options.preselect))
                    {
                        selected = ' class="is-selected"';
                        selectedItem = item;
                    }
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

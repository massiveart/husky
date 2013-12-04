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
 *  Provides Events
 *      -
 *  Triggers Events
 *      - husky.tabs.<<instanceName>>.item.select - triggered when item was clicked
 *
 *
 *****************************************************************************/

define(function() {

    'use strict';

    var defaults = {
        url: null,
        data: [],
        selected: null,
        instanceName: '',
        preselect: true
    },

    selectItem = function(event) {
        event.preventDefault();
        this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el), 'is-selected');
        this.sandbox.dom.addClass(event.currentTarget, 'is-selected');
        triggerSelectEvent.call(this, this.items[this.sandbox.dom.data(event.currentTarget, 'id')]);
    },

    triggerSelectEvent = function(item) {
        var instanceName = this.options.instanceName ? this.options.instanceName+'.':'';
        this.sandbox.emit('husky.tabs.'+instanceName+'item.select', item);
    };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$el = this.sandbox.dom.$(this.options.el);

            // load Data
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

            this.bindDOMEvents();
        },

        render: function(data) {

            var $element = this.sandbox.dom.createElement('<div class="husky-tabs"></div>'),
                $list = this.sandbox.dom.createElement('<ul/>'),
                selected = '';

            this.sandbox.dom.append(this.$el, $element);
            this.sandbox.dom.append($element, $list);

            this.items = [];

            this.sandbox.util.foreach(data.items, function(item) {
                // check if item got selected
                if (this.options.preselect && !!data.url && data.url === item.action) {
                    selected = ' class="is-selected"';
                } else {
                    selected = '';
                }
                this.items[item.id] = item;
                this.sandbox.dom.append($list,'<li '+selected+' data-id="'+item.id+'"><a href="#">'+item.title+'</a></li>');
            }.bind(this));
        },

        // bind dom elements
        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el,'click',selectItem.bind(this),'li');
        }

    };

});

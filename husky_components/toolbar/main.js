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

        triggerSelectEvent.call(this, this.items[this.sandbox.dom.data(event.currentTarget, 'id')]);
    },

    triggerSelectEvent = function(item) {
        // if callback is set call it, else trigger event
        if (item.callback) {
            item.callback();
        } else {
            var instanceName = this.options.instanceName ? this.options.instanceName+'.':'';
            this.sandbox.emit('husky.toolbar.'+instanceName+'item.select', item);
        }
    },

    bindDOMEvents = function() {
        this.sandbox.dom.on(this.options.el,'click',selectItem.bind(this),'button:not(:disabled)');
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
                classArray, addTo, disabledString;

            this.sandbox.dom.append(this.options.el, $container);

            // create items array
            this.items = [];
            // save item groups in array
            this.itemGroup = [];


            // create all elements
            this.sandbox.util.foreach(data, function(item) {

                // if item has no id, generate random id
                if (!item.id) {
                    item.id = 'xxxxyxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                        return v.toString(16);
                    });
                }
                // save to items array
                this.items[item.id] = item;
                // create classes array
                classArray = [];
                if (item.icon) {
                    classArray.push('icon-'+item.icon);
                }

                // check if item is in a group
                if (!!item.group) {
                    // create group if not created yet
                    if (!this.itemGroup[item.group]) {
                        this.itemGroup[item.group] = this.sandbox.dom.createElement('<div id="'+item.group+'" class="btn-group" />');
                        this.sandbox.dom.append($container, this.itemGroup[item.group]);
                        this.sandbox.dom.addClass(this.itemGroup[item.group], this.options.appearance);
                    }
                    addTo = this.itemGroup[item.group];
                } else {
                    addTo = $container;
                    classArray.push(this.options.appearance);
                }




                if (!!item.class) {
                    classArray.push(item.class);
                }

                disabledString ='';
                if (item.disabled) {
                    disabledString = 'disabled';
                }
                // create button
                this.sandbox.dom.append(addTo, '<button data-id="'+item.id+'" class="'+classArray.join(' ')+'" title="'+item.title+'" '+disabledString+'/>');

            }.bind(this));

            // add search
            if (this.options.hasSearch) {
                this.sandbox.dom.append($container, '<div id="'+this.options.instanceName+'-toolbar-search" class="toolbar-search" />');
            }
            // start search component
            this.sandbox.start([
                {name: 'search@husky', options: {el: '#'+this.options.instanceName+'-toolbar-search', instanceName: this.options.instanceName, appearance:'white small'}}
            ]);

            // initialization finished
            this.sandbox.emit('husky.tabs.initialized');
        }
    };

});

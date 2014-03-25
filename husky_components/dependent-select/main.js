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
 * @class Dependant Select
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {Array} [options.data] array of dropdown items elements
 *
 * @param {String} [options.selected] the item that's selected on initialize
 * @param {String} [options.instanceName] enables custom events (in case of multiple tabs on one page)
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            appearance: 'side-by-side'
        },
        constants = {
            childContainerClass: 'dependent-select-container'
        },


        /**
         * triggered when component is completely initialized
         * @event husky.dependent-select[.INSTANCE_NAME].initialized
         */
            INITIALIZED = function() {
            return getEventName.call(this, 'initialized');

        },

        /**
         * triggered when item got clicked
         * @event husky.dependent-select[.INSTANCE_NAME].item.selected
         * @param {Object} item
         */
            ITEM_SELECTED = function() {
            return getEventName.call(this, 'item.selected');

        },


        getEventName = function(postFix) {
            return 'husky.dependent-select.' + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },


        bindDOMEvents = function() {
//            this.sandbox.dom.on(this.$el, 'click', selectItem.bind(this), 'button:not(:disabled), li');
//            this.sandbox.dom.on(this.$el, 'click', toggleItem.bind(this), '.dropdown-toggle');
        },

        bindCustomEvents = function() {
//            this.sandbox.on(ITEM_ENABLE.call(this), enableItem.bind(this));
//            this.sandbox.on(ITEM_DISABLE.call(this), disableItem.bind(this));
        },

        renderEmpty = function() {
            var i, len, $container, $child;
            for (i = 0, len = this.options.container.length; ++i < len;) {
                $container = this.$find(this.options.container[i]);
                $child = this.sandbox.dom.createElement('<div class="' + constants.childContainerClass + '" />');
                this.sandbox.dom.append($container, $child);
                this.sandbox.start([
                    {
                        name: 'select@husky',
                        options: {
                            el: $child,
                            singleSelect: true,
                            instanceName: i,
                            data: []
                        }
                    }
                ]);
            }
        },

        getDataById = function(data, id) {
            for (var i = -1, len = data.length; ++i < len;) {
                if (data[i].id === id) {
                    return data[i];
                }
            }
        },

        renderSelect = function(data, depth) {

            depth = typeof depth !== 'undefined' ? depth : 0;

            if (!this.options.container[depth]) {
                throw "no container at this depth specified";
            }

            var $container = this.$find(this.options.container[depth]),
                $child = this.sandbox.dom.find('.'+constants.childContainerClass, $container);
            if (!!$child) {
                this.sandbox.stop($child);
            }
            $child = this.sandbox.dom.createElement('<div class="' + constants.childContainerClass + '" />');
            this.sandbox.dom.append($container, $child);

//            // create all elements
//            this.sandbox.util.foreach(data, function(item) {
//
//            }.bind(this));

            this.sandbox.start([
                {
                    name: 'select@husky',
                    options: {
                        el: $child,
                        singleSelect: true,
                        instanceName: depth,
                        data: data
                    }
                }
            ]);

            if (this.options.container.length > depth && !!data[0].items) {
                this.sandbox.on('husky.select.' + depth + '.selected.item', function(id) {
                    var items = getDataById.call(this, data, id).items;
                    renderSelect.call(this, items, depth + 1);
                }, this);
            }
        };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

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
                this.sandbox.logger.log('no data provided for dependent select!');
            }

            bindDOMEvents.call(this);

        },

        render: function(data) {

            // TODO: add appearance class

            // create items array
            this.items = [];
            this.selects = [];

            renderSelect.call(this, data, 0);
            renderEmpty.call(this);

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        }



    };

});

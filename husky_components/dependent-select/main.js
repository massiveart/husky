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
 * @param {String} [options.preselect] the item that's selected on initialization
 * @param {String} [options.instanceName] enables custom events (in case of multiple tabs on one page)
 * @param {Array} [options.data] array of dropdown items elements
 * @param {String|Array} [options.defaultLabels] which text is displayed after select is initialized; can be customized for each and every select by defining an array
 * @param {Array} [options.selectOptions] array of Options to pass to the select at certain depth (first item's options will be assigned to first select)
 */
define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            preselect: null,
            defaultLabels: 'Please choose',
            selectOptions: []
        },
        constants = {
            childContainerClass: 'dependent-select-container',
            namespace: 'husky.dependent-select.'
        },


        /**
         * triggered when component is completely initialized
         * @event husky.dependent-select[.INSTANCE_NAME].initialized
         */
            INITIALIZED = function() {
            return getEventName.call(this, 'initialized');

        },

        // creates event strings based on
        getEventName = function(postFix) {
            return constants.namespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },

        // empties all selects beginning from a certain depth
        renderEmpty = function(depth) {
            var i, len, $child;
            for (i = depth, len = this.options.container.length; ++i < len;) {
                $child = findStopAndRestartChild.call(this, this.options.container[i]);
                this.sandbox.start([
                    {
                        name: 'select@husky',
                        options: {
                            el: $child,
                            disabled: true,
                            singleSelect: true,
                            instanceName: i,
                            data: []
                        }
                    }
                ]);
            }
        },

        // searches array for a certain id
        getDataById = function(data, id) {
            for (var i = -1, len = data.length; ++i < len;) {
                if (data[i].id === id) {
                    return data[i];
                }
            }
        },

        /**
         * creates a child element in a container
         * @param containerId
         * @returns {domObject}
         */
        findStopAndRestartChild = function(containerId) {
            var $container = this.$find(containerId),
                $child = this.sandbox.dom.find('.' + constants.childContainerClass, $container);
            // stop child, if running
            if (!!$child) {
                this.sandbox.stop($child);
            }
            // create new child
            $child = this.sandbox.dom.createElement('<div class="' + constants.childContainerClass + '" />');
            this.sandbox.dom.append($container, $child);
            return $child;
        },

        // renders selects at a certain depth
        renderSelect = function(data, depth, preselect) {

            depth = typeof depth !== 'undefined' ? depth : 0;

            if (!this.options.container[depth]) {
                throw "no container at this depth specified";
            }

            var selectionCallback = null,
                deselectionCallback = null,
                options,
                // get child
                $child = findStopAndRestartChild.call(this, this.options.container[depth]);

            // create callback
            if (this.options.container.length > depth && !!data[0].items) {
                selectionCallback = function(id) {
                    var items = getDataById.call(this, data, id).items;
                    renderSelect.call(this, items, depth + 1);
                }.bind(this);
                deselectionCallback = function(id) {
                    if (id === null) {
                        renderEmpty.call(this, depth);
                    }
                }.bind(this);
            }


            // make it possible to set some data for select
            if (!!this.options.selectOptions[depth]) {
                options = this.options.selectOptions[depth];
            }
            options = this.sandbox.util.extend(true, {}, options, {
                el: $child,
                singleSelect: true,
                instanceName: depth,
                data: data,
                selectCallback: selectionCallback,
                deselectCallback: deselectionCallback,
                preSelectedElements: !!preselect ? [preselect] : [],
                defaultLabel: this.sandbox.dom.isArray(this.options.defaultLabels) ? this.options.defaultLabels[depth] : this.options.defaultLabels
            });

            // start select component
            this.sandbox.start([
                {
                    name: 'select@husky',
                    options: options
                }
            ]);
        },

        bindCustomEvents = function() {

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
        },

        render: function(data) {
            // create items array
            this.items = [];
            this.selects = [];

            renderSelect.call(this, data, 0, this.options.preselect);
            renderEmpty.call(this, !!this.options.preselect ? this.options.preselect.length : 0);

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        }



    };

})
;

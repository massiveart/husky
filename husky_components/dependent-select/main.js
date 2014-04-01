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
 * @param {String} [options.instanceName] instance name of this component
 * @param {Array} [options.data] Array of dropdown items
 * @param {Array} options.container array containers to put selects into
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
            selectOptions: [],
            container: null
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

        /**
         * triggered when a select item is selected
         * @event husky.dependent-select[.INSTANCE_NAME].item.selected
         * @param id of the select that was selected
         * @param depth of the select that was selected
         */
            ITEM_SELECTED = function() {
            return getEventName.call(this, 'item.selected');
        },

        /**
         * triggered when a select item is deselected
         * @event husky.dependent-select[.INSTANCE_NAME].item.deselected
         * @param id of the select that was deselected
         * @param depth of the select that was deselected
         */
            ITEM_DESELECTED = function() {
            return getEventName.call(this, 'item.deselected');
        },

        /**
         * triggered when a not all items are selected anymore
         * @event husky.dependent-select[.INSTANCE_NAME].all.items.deselected
         * @param id of the select that was changed
         */
            ALL_ITEMS_DESELECTED = function() {
            return getEventName.call(this, 'all.items.deselected');
        },

        /**
         * triggered when all selects have been set
         * @event husky.dependent-select[.INSTANCE_NAME].all.items.selected
         * @param id of the last item that was selected
         */
            ALL_ITEMS_SELECTED = function() {
            return getEventName.call(this, 'all.items.selected');
        },

    // creates event strings based on
        getEventName = function(postFix) {
            return constants.namespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },

    // empties all selects beginning from a certain depth
        renderEmptySelect = function(depth) {
            var i, len, $child;
            for (i = depth, len = this.options.container.length; ++i < len;) {
                $child = findStopAndCreateNewChild.call(this, this.options.container[i]);
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
                if (data[i].id.toString() === id.toString()) {
                    return data[i];
                }
            }
            return null;
        },

        /**
         * creates a child element in a container
         * @param containerId
         * @returns {domObject}
         */
            findStopAndCreateNewChild = function(containerId) {
            var $container = this.$find(containerId),
                $child = this.sandbox.dom.find('.' + constants.childContainerClass, $container);
            if (!$container) {
                throw 'dependent-select: no container with id ' + containerId + ' could be found';
            }
            // stop child, if running
            if (!!$child) {
                this.sandbox.stop($child);
            }
            // create new child
            $child = this.sandbox.dom.createElement('<div class="' + constants.childContainerClass + '" />');
            this.sandbox.dom.append($container, $child);
            return $child;
        },

        // checks if all selects are selected
        checkAllSelected = function() {
            var $lastContainer = this.$find(this.options.container[this.options.container.length-1]),
                lastSelectElement = this.sandbox.dom.children($lastContainer)[0],
                selection = this.sandbox.dom.attr(lastSelectElement,'data-selection');

            // if last element is selected
            if (!!lastSelectElement && typeof selection !== 'undefined') {
                if (!this.allSelected) {
                    this.allSelected = true;
                    this.sandbox.emit(ALL_ITEMS_SELECTED.call(this));
                }
            } else if (this.allSelected) {
                this.allSelected = false;
                this.sandbox.emit(ALL_ITEMS_DESELECTED.call(this));
            }
        },

    // renders selects at a certain depth
        renderSelect = function(data, depth, preselect) {

            depth = typeof depth !== 'undefined' ? depth : 0;

            if (!this.options.container || !this.options.container[depth]) {
                throw 'dependent-select: no container at depth ' + depth + ' specified';
            }

            var selectionCallback = null,
                deselectionCallback = null,
                options,
            // get child
                $child = findStopAndCreateNewChild.call(this, this.options.container[depth]);

            // create callback

            selectionCallback = function(id) {
                // if there are more selects left
                if (this.options.container.length > depth && !!data[0].items) {
                    var items = getDataById.call(this, data, id).items;
                    renderSelect.call(this, items, depth + 1);
                }
                // trigger events
                this.sandbox.emit(ITEM_SELECTED.call(this), id, depth);
                checkAllSelected.call(this);
            }.bind(this);
            deselectionCallback = function(id) {
                if (this.options.container.length > depth && !!data[0].items) {
                    if (id === null) {
                        renderEmptySelect.call(this, depth);
                    }
                }
                this.sandbox.emit(ITEM_DESELECTED.call(this), id, depth);
                checkAllSelected.call(this);
            }.bind(this);

            // make it possible to set some data for select
            if (!!this.options.selectOptions[depth]) {
                options = this.options.selectOptions[depth];
            }
            options = this.sandbox.util.extend(true, {}, {
                el: $child,
                singleSelect: true,
                instanceName: depth,
                data: data,
                selectCallback: selectionCallback,
                deselectCallback: deselectionCallback,
                preSelectedElements: !!preselect ? [preselect] : [],
                defaultLabel: this.sandbox.dom.isArray(this.options.defaultLabels) ? this.options.defaultLabels[depth] : this.options.defaultLabels
            }, options);

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
                this.render(this.options.data);
            } else {
                this.sandbox.logger.log('no data provided for dependent select!');
            }
        },

        render: function(data) {
            // create items array
            renderSelect.call(this, data, 0, this.options.preselect);
            renderEmptySelect.call(this, !!this.options.preselect ? this.options.preselect.length : 0);

            // initialization finished
            this.sandbox.emit(INITIALIZED.call(this));
        }
    };
})
;

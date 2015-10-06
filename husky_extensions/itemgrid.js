/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

/**
 * Introduces functionality used by multiple components, which are displaying some items in a list
 */
define(function() {

    'use strict';

    var defaults = {
            instanceName: null,
            url: null,
            eventNamespace: 'husky.itemgrid',
            idsParameter: 'ids',
            resultKey: null,
            idKey: 'id',
            dataAttribute: '',
            dataDefault: {},
            sortable: false,
            removable: true,
            translations: {
                noContentSelected: 'listbox.nocontent-selected',
                viewAll: 'public.view-all',
                viewLess: 'public.view-less',
                of: 'public.of',
                visible: 'public.visible',
                elementsSelected: 'public.elements-selected'
            }
        },

        constants = {
            noContentClass: 'no-content',
            addIcon: 'fa-plus-circle',
            deleteIcon: 'fa-trash-o'
        },

        /**
         * returns the normalized event names
         * @param eventName {string} The name of the concrete event without prefix
         * @returns {string} Returns the prefixed event name
         */
        createEventName = function(eventName) {
            return [
                this.options.eventNamespace,
                '.',
                (this.options.instanceName ? this.options.instanceName + '.' : ''),
                eventName
            ].join('');
        },

        templates = {
            skeleton: function() {
                return [
                    '<div class="listgrid" id="', this.ids.container, '">',
                    '    <div class="header">',
                    '        <span class="', constants.addIcon ,' icon left action add-button" id="', this.ids.addButton, '"></span>',
                    '        <span class="', constants.deleteIcon ,' icon left action delete-button" id="', this.ids.deleteButton, '"></span>',
                    '    </div>',
                    '    <div class="content" id="', this.ids.content, '"></div>',
                    '</div>'
                ].join('');
            }
        },

        bindCustomEvents = function() {
            this.sandbox.on(this.DATA_CHANGED(), this.changeData.bind(this));

            this.sandbox.on(this.DELETE_BUTTON_CLICKED(), function() {
                this.sandbox.emit('husky.datagrid.' + this.options.instanceName + '.items.get-selected', function(ids) {
                    deleteItems.call(this, ids);
                }.bind(this));
            }.bind(this));

            this.sandbox.on(this.ITEM_ADD(), function(item) {
                addItem.call(this, item);
            }.bind(this));

            this.sandbox.on(this.ITEM_SAVE(), function(item) {
                editItem.call(this, item);
            }.bind(this));
        },

        bindDomEvents = function() {
            // click on the add button
            this.sandbox.dom.on(this.$addButton, 'click', function() {
                this.sandbox.emit(this.ADD_BUTTON_CLICKED());
            }.bind(this));

            // click on the config button
            this.sandbox.dom.on(this.$deleteButton, 'click', function() {
                this.sandbox.emit(this.DELETE_BUTTON_CLICKED());
            }.bind(this));
        },

        addItem = function(newItem) {
            var data = [];

            if (App.util.typeOf(this.getData()) === 'array' && App.util.typeOf(this.getData()[0]) === 'object') {
                data = this.getData();
            }

            data.push(newItem);
            this.setData(data);
        },

        editItem = function(editedItem) {
            var newData = [], data = this.getData();
            data.forEach(function(item) {
                if (item.id === editedItem.id) {
                    newData.push(editedItem);
                } else {
                    newData.push(item);
                }
            }.bind(this));

            this.setData(newData);
        },

        deleteItems = function(ids) {
            this.sandbox.sulu.showDeleteDialog(function(wasConfirmed) {
                if (wasConfirmed) {
                    var newData = [], data = this.getData();
                    data.forEach(function(item) {
                        if (ids.indexOf(item.id) > -1) {
                            this.sandbox.emit('husky.datagrid.' + this.options.instanceName + '.record.remove', item.id);
                            this.sandbox.emit('sulu.header.toolbar.item.enable', 'save', false);
                        } else {
                            newData.push(item);
                        }
                    }.bind(this));

                    this.setData(newData);
                }
            }.bind(this));
        },

        itemgrid = {
            /**
             * raised when the data changed and the list should be reloaded
             * @event husky.itembox.data-changed
             * @return {string}
             */
            DATA_CHANGED: function() {
                return createEventName.call(this, 'data-changed');
            },

            /**
             * raised when the add button was clicked
             * @event husky.itembox.add-button-clicked
             * @return {string}
             */
            ADD_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'add-button-clicked');
            },

            /**
             * raised when the config button was clicked
             * @event husky.itembox.config-button-clicked
             * @return {string}
             */
            DELETE_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'delete-button-clicked');
            },

            /**
             * raised when a new item should be persisted
             * @event husky.itembox.config-button-clicked
             * @return {string}
             */
            ITEM_ADD: function() {
                return createEventName.call(this, 'add-item');
            },

            /**
             * raised when an existing item should be persisted
             * @event husky.itembox.config-button-clicked
             * @return {string}
             */
            ITEM_SAVE: function() {
                return createEventName.call(this, 'save-item');
            },
            /**
             * render the itembox
             */
            render: function() {
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

                var data = this.getData();

                this.viewAll = true;

                this.ids = {
                    container: 'listbox-' + this.options.instanceName + '-container',
                    addButton: 'listbox-' + this.options.instanceName + '-add',
                    deleteButton: 'listbox-' + this.options.instanceName + '-delete',
                    content: 'listbox-' + this.options.instanceName + '-content'
                };

                this.sandbox.dom.html(this.$el, templates.skeleton.call(this));

                this.$container = this.sandbox.dom.find(this.getId('container'), this.$el);
                this.$addButton = this.sandbox.dom.find(this.getId('addButton'), this.$el);
                this.$deleteButton = this.sandbox.dom.find(this.getId('deleteButton'), this.$el);
                this.$content = this.sandbox.dom.find(this.getId('content'), this.$el);

                bindCustomEvents.call(this);
                bindDomEvents.call(this);

                this.renderContent(data);
            },

            /**
             * Returns the data currently stored in this component
             * @param deepCopy {boolean} True if deep cop should be returned, otherwise false
             * @returns {object}
             */
            getData: function() {
                return this.sandbox.util.deepCopy(this.sandbox.dom.data(this.$el, this.options.dataAttribute));
            },

            /**
             * Throws a data-changed event if the data actually has changed
             * @param data {object} The data to set
             * @param reload {boolean} True if the itembox list should be reloaded afterwards
             */
            setData: function(data, reload) {
                this.sandbox.emit(this.DATA_CHANGED(), data, this.$el, reload);
            },

            /**
             * Event handler for the changed data event, sets data to element and reloads the list if specified
             * @param data {object} The data to set
             * @param $el {object} The element to which the data should be bound
             * @param reload {boolean} True if the list should be reloaded, otherwise false
             */
            changeData: function (data) {
                this.updateOrder(data);

                this.sandbox.emit('husky.datagrid.' + this.options.instanceName + '.data.set', data);

                this.sandbox.dom.data(this.$el, this.options.dataAttribute, data);

                this.sandbox.emit('sulu.header.toolbar.item.enable', 'save', false);
            },

            /**
             * Gets data and returns them in sorted order
             * @param data {object} The data, which should be set into the grid
             */
            updateOrder: function(data) {
                throw new Error('"updateOrder" not implemented');
            },

            /**
             * Returns the selector for the given id
             * @param type {string} The type of the element, for which the id should be returned
             * @returns {string} The id of the element
             */
            getId: function(type) {
                return ['#', this.ids[type]].join('');
            },

            /**
             * Renders the data into the list
             * @param data {object} The data to render
             */
            renderContent: function(data) {
                var template = [
                        '<div id="', this.options.instanceName, '-list-toolbar-container"></div>',
                        '<div id="itemgrid-list-', this.options.instanceName, '"></div>'
                    ].join('');

                this.sandbox.dom.html(this.$content, template);

                //start list-toolbar and datagrid
                this.sandbox.start([
                    {
                        name: 'datagrid@husky',
                        options: {
                            el: '#itemgrid-list-' + this.options.instanceName,
                            instanceName: this.options.instanceName,
                            view: 'table',
                            data: data,
                            matchings: this.options.fieldList,
                            viewOptions: {
                                table: {
                                    noItemsText: 'public.empty-list'
                                }
                            }
                        }
                    }
                ]);
            }
        };

    return {
        name: 'itemgrid',

        initialize: function(app) {
            app.components.addType('itemgrid', itemgrid);
        }
    }
});

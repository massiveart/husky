/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: navigation
 * Options:
 *
 * Provided Events:
 *
 * Used Events:
 *
 */

define(function() {
    'use strict';

    var render = function() {
            prepareColumn.call(this);
            this.$columnItemsList = prepareColumnItems.call(this);
            this.sandbox.dom.append(this.$el, this.$columnItemsList);

            bindCustomEvents.call(this);
        },

        bindCustomEvents = function() {
            this.sandbox.on('husky.navigation.column.show', show.bind(this));
            this.sandbox.on('husky.navigation.column.collapse', collapse.bind(this));
            this.sandbox.on('husky.navigation.column.hide', hide.bind(this));
        },

        show = function(index) {
            if (index === this.options.index) {
                this.sandbox.dom.removeClass(this.$el, 'hide collapsed');
            }
        },

        collapse = function(index) {
            if (index === this.options.index) {
                this.sandbox.dom.addClass(this.$el, 'collapsed');
            }
        },

        hide = function(index) {
            if (index === this.options.index) {
                this.sandbox.dom.addClass(this.$el, 'hide');
            }
        },

        prepareColumn = function() {
            var columnClasses = [];

            if (!!this.options.data && !!this.options.data.type) {
                // add a class that defines display-options
                columnClasses.push(this.options.data.type + '-column');
            }
            if (this.options.index === 0) {
                // if the column is the second column
                columnClasses.push('first-column');
            } else if (this.options.index === 1) {
                // if the column is the second column
                columnClasses.push('second-column');
            }

            this.id = 'column-' + this.options.index;

            this.sandbox.dom.attr(this.$el, {
                'id': this.id,
                'data-column-id': this.options.index,
                'class': 'navigation-column ' + columnClasses.join(' ')
            });
        },

        prepareColumnItems = function() {
            var $columnItemsList = this.sandbox.dom.createElement('<ul/>', {
                class: 'navigation-items'
            });

            this.options.data.sub.items.forEach(function(item) {
                $columnItemsList.append(prepareColumnItem.call(this, item));
            }.bind(this));

            return $columnItemsList;
        },

        prepareColumnItem = function(item) {
            var $item = this.sandbox.dom.createElement('<li/>');

            this.sandbox.start([
                {
                    name: 'navigation/item@husky',
                    options: {
                        el: $item,
                        data: item,
                        clickCallback: clickCallback.bind(this)
                    }
                }
            ]);

            return $item;
        },

        clickCallback = function(item) {
            var itemId = '#' + item.id,
                $item = this.sandbox.dom.find(itemId);

            // reset selected item
            this.sandbox.dom.removeClass('#' + this.id + ' .selected:not(' + itemId + ')', 'selected');

            if (!!this.options.selectedCallback && typeof this.options.selectedCallback === 'function') {
                this.options.selectedCallback(this.options.index, item);
            } else {
                this.sandbox.emit('husky.navigation.column.item-selected', this.options.index, this.options.index, item);
            }

            if (this.sandbox.dom.hasClass($item, 'selected') && this.options.index === 0) {
                // add a column to navigation
                if (!!this.options.selectedClickCallback && typeof this.options.selectedClickCallback === 'function') {
                    this.options.selectedClickCallback(this.options.index);
                } else {
                    this.sandbox.emit('husky.navigation.column.selected-click', this.options.index);
                }
            } else if (!!item.hasSub) {
                // add a column to navigation
                if (!!this.options.addColumnCallback && typeof this.options.addColumnCallback === 'function') {
                    this.options.addColumnCallback(this.options.index, item);
                } else {
                    this.sandbox.emit('husky.navigation.column.add-column', this.options.index, item);
                }
            } else if (item.type === 'content') {
                // show content
                if (!!this.options.contentCallback && typeof this.options.contentCallback === 'function') {
                    this.options.contentCallback(this.options.index, item);
                } else {
                    this.sandbox.emit('husky.navigation.column.show-content', this.options.index, this.options.data);
                }
            }
        };

    return {
        initialize: function() {
            render.call(this);
        }
    };
});

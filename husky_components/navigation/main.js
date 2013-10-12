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

    var load = function(url) {
            var deferred = new this.sandbox.data.deferred();

            this.sandbox.logger.log('load', url);

            this.sandbox.util.ajax({
                url: url,

                success: function(data) {
                    this.sandbox.logger.log('data loaded', data);
                    deferred.resolve(data);
                }.bind(this)
            });

            return deferred.promise();
        },

        prepareFirstColumn = function(data) {
            this.data = data;

            this.$subColumns = this.sandbox.dom.createElement('<li/>', {
                'class': 'navigation-sub-columns-container'
            });
            this.$navigationSubColumns = this.sandbox.dom.createElement('<ul/>', {
                'class': 'navigation-sub-columns'
            });
            this.sandbox.dom.append(this.$subColumns, this.$navigationSubColumns);

            this.sandbox.dom.append(this.$navigationColumns, startColumn.call(this, 0, data));
            this.sandbox.dom.append(this.$navigationColumns, this.$subColumns);
        },

        startColumn = function(index, data) {
            var $column = this.sandbox.dom.createElement('<li/>');

            this.sandbox.start([
                {
                    name: 'navigation/column@husky',
                    options: {
                        el: $column,
                        data: data,
                        index: index,
                        contentCallback: contentCallback.bind(this),
                        selectedCallback: selectedCallback.bind(this),
                        addColumnCallback: addColumnCallback.bind(this),
                        selectedClickCallback: selectedClickCallback.bind(this)
                    }
                }
            ]);

            return $column;
        },

        contentCallback = function(index, data) {
            this.sandbox.logger.log('content', index, data);

            // FIXME better solution
            if (index === 0) {
                this.sandbox.emit('husky.navigation.column.show', 0);
                this.sandbox.dom.remove('#column-1');
            } else if (index === 1) {
                this.sandbox.emit('husky.navigation.column.collapse', 0);
            } else if (index === 2) {
                this.sandbox.emit('husky.navigation.column.hide', 0);
                this.sandbox.emit('husky.navigation.column.collapse', 1);
            }

            this.sandbox.emit('navigation.item.content.show', {
                item: data,
                data: getNavigationData.call(this)
            });
        },

        updateColumns = function(index) {
            $('.navigation-column:gt(' + index + ')').remove();
        },

        selectedCallback = function(index, item) {
            this.sandbox.emit('navigation.item.selected', {
                item: item,
                data: getNavigationData.call(this)
            });
        },

        selectedClickCallback = function(index) {
            this.sandbox.emit('husky.navigation.column.show', index);
        },

        addColumnCallback = function(index, item) {
            if (!item.sub) {
                // TODO load data
            } else {
                updateColumns.call(this, index);
                addColumn.call(this, index + 1, item);
            }
        },

        addColumn = function(index, data) {
            var $column = startColumn.call(this, index, data);

            this.sandbox.dom.append(this.$navigationSubColumns, $column);
        },

        render = function() {
            this.$el.html(this.$navigation);
        },

        getNavigationWidth = function() {
            var $columns = this.sandbox.dom.find('.navigation-column'),
                width = 0,
                $column = null;

            this.sandbox.dom.each($columns, function(idx, column) {
                $column = this.sandbox.dom.createElement(column);

                if (!this.$navigationColumns.hasClass('show-content')) {
                    if (this.sandbox.dom.hasClass($column, 'collapsed')) {
                        width += 50;
                    } else if (this.sandbox.dom.hasClass($column, 'content-column')) {
                        width += 150;
                    } else {
                        width += 250;
                    }
                } else {
                    width = 200;
                }

            }.bind(this));

            return width;
        },

        getNavigationData = function() {
            return {
                // TODO
                navWidth: getNavigationWidth.call(this)
            };
        };

    return  {
        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // init container
            this.$navigation = this.sandbox.dom.createElement('<div/>', {
                class: 'navigation'
            });
            this.$navigationColumns = this.sandbox.dom.createElement('<ul/>', {
                class: 'navigation-columns'
            });
            this.$navigation.append(this.$navigationColumns);

            // init data
            this.data = null;
            this.columns = [];

            // load Data
            if (!!this.options.url) {
                load
                    .call(this, this.options.url)
                    .then(prepareFirstColumn.bind(this));

                render.call(this);
            }
        }
    };

});

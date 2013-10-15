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

define(['husky_components/navigation/navigation-item'], function(NavigationItem) {
    'use strict';

    var render = function() {
            prepareColumn.call(this);

            if (!!this.options.data.header) {
                this.sandbox.dom.append(this.$el, prepareColumnHeader.call(this));
            }

            this.$columnItemsList = prepareColumnItems.call(this);
            this.sandbox.dom.append(this.$el, this.$columnItemsList);

            bindCustomEvents.call(this);
            bindDomEvents.call(this);
        },

        prepareColumnHeader = function() {
            var $columnHeader = this.sandbox.dom.createElement('<div/>', {
                'class': 'navigation-column-header'
            });

            if (this.options.data.header.displayOption === 'link') {
                $columnHeader.html(template.columnHeaderLink.call(this, {
                    title: this.options.data.header.title,
                    icon: this.options.data.header.icon,
                    action: this.options.data.header.action
                }));
            } else {
                $columnHeader.html(template.columnHeader.call(this, {
                    title: this.options.data.header.title,
                    logo: this.options.data.header.logo
                }));
            }

            return $columnHeader;
        },

        bindDomEvents = function() {
            // FIXME better solution
            this.sandbox.dom.on('body', 'click', clickColumn.bind(this), '#' + this.id + '.collapsed');
        },

        clickColumn = function() {
            if (!!this.options.selectedClickCallback && typeof this.options.selectedClickCallback === 'function') {
                this.options.selectedClickCallback(this.options.index);
            } else {
                this.sandbox.emit('husky.navigation.column.selected-click', this.options.index);
            }
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
                this.sandbox.dom.removeClass(this.$el, 'hide');
                this.sandbox.dom.addClass(this.$el, 'collapsed');
            }
        },

        hide = function(index) {
            if (index === this.options.index) {
                this.sandbox.dom.addClass(this.$el, 'hide');
                this.sandbox.dom.removeClass(this.$el, 'collapsed');
            }
        },

        prepareColumn = function() {
            var columnClasses = ['navigation-column'];

            if (!!this.options.data && !!this.options.data.displayOption) {
                // add a class that defines display-options
                columnClasses.push(this.options.data.displayOption + '-column');
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
                'class': columnClasses.join(' ')
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
            var $item = this.sandbox.dom.createElement('<li/>'),
                navigationItem = new NavigationItem();



            navigationItem.sandbox = this.sandbox;
            navigationItem.setOptions({
                $el: $item,
                data: item,
                clickCallback: clickCallback.bind(this)
            });

            navigationItem.render();

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

            if (this.sandbox.dom.hasClass($item, 'selected') && this.sandbox.dom.hasClass(this.$el, 'collapsed')) {
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
        },
        template = {
            columnHeaderLink: function(data) {
                data.title = data.title || this.sandbox.translate('navigation.list');
                data.icon = data.icon || 'list';
                data.action = data.action || '';

                return [
                    '<div class="navigation-header-link pointer" data-action="', data.action, '"><span class="icon-', data.icon, '"></span>&nbsp;', data.title, '</div>'
                ].join('');
            },

            columnHeader: function(data) {
                var titleTemplate = null;

                data = data || {};

                data.title = data.title || '';
                data.logo = data.logo || '';

                if (!!data.logo) {
                    titleTemplate = '<span class="navigation-column-logo"><img alt="' + data.title + '" src="' + data.logo + '"/></span>';
                }

                return [
                    titleTemplate,
                    '<h2 class="navigation-column-title">', data.title, '</h2>'
                ].join('');
            },

            // TODO: Remove search
            search: function(data) {
                data = data || {};

                data.action = data.action || '';
                data.icon = data.icon || '';

                return [
                    '<input type="text" class="search" autofill="false" data-action="', data.action, '" placeholder="Search ..."/>' // TODO Translate
                ].join('');
            }
        };

    return function() {
        return {
            render: function() {
                render.call(this);
            },

            setOptions: function(options) {
                if (!options) {
                    throw('No options were defined!');
                }
                this.options = options;
                this.$el = this.options.$el;
            }
        };         
    };
});

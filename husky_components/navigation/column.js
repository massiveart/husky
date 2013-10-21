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

define(['husky_components/navigation/item'], function(NavigationItem) {
    'use strict';

    var render = function() {
            prepareColumn.call(this);

            if (!!this.options.data.displayOption && this.options.data.displayOption === 'portals') {
                renderPortals.call(this);
            } else {
                if (this.options.data.displayOption !== 'portal' && (this.sandbox.dom.data(this.$el, 'columnId') < 2 || !!this.options.data.displayOption)) {
                    this.sandbox.dom.append(this.$el, prepareColumnHeader.call(this));
                }

                this.$columnItemsList = prepareColumnItems.call(this);
                this.sandbox.dom.append(this.$el, this.$columnItemsList);
            }

            bindDomEvents.call(this);
        },

        renderPortals = function() {
            var $columnHeader = this.sandbox.dom.createElement('<div/>', {
                'class': 'navigation-column-header'
            });

            $columnHeader.html(template.columnHeaderPortal.call(this, {
                title: this.options.data.sub.items[0].title,
                logo: !!this.options.data.header ? this.options.data.header.logo : null
            }));

            this.sandbox.dom.append(this.$el, $columnHeader);

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: $columnHeader.find('#portal-header'),
                        data: this.options.data.sub.items,
                        alignment: 'right',
                        instanceName: 'portalHeader',
                        valueName: 'title',
                        setParentDropDown: true,
                        trigger: '.navigation-column-title, .dropdown-toggle',
                        clickCallback: portalClick.bind(this)
                    }
                }
            ]);

            preparePortalsColumnList.call(this, this.options.data.sub.items[0]).then(function($columnItemsList) {
                this.sandbox.dom.append(this.$el, $columnItemsList);
            }.bind(this));
        },

        portalClick = function(item) {
            if (!!this.locked) {
                return;
            }
            this.sandbox.logger.log('item clicked', item);
            this.sandbox.dom.text('#portal-header h2', item.title);
            this.sandbox.dom.find('#' + this.id + ' .navigation-items').remove();

            if (!!this.options.updateColumnCallback) {
                this.options.updateColumnCallback(this.index, true);
            }

            preparePortalsColumnList.call(this, item).then(function($columnItemsList) {
                this.sandbox.dom.append(this.$el, $columnItemsList);
            }.bind(this));
        },

        preparePortalsColumnList = function(item) {
            var $columnItemsList,
                dfd = new this.sandbox.data.deferred();

            if (!!item.hasSub && !!item.sub) {
                $columnItemsList = prepareColumnItems.call(this, item);
                dfd.resolve($columnItemsList);
            } else {
                this.locked = true;
                this.sandbox.util.load(item.action)
                    .then(function(data) {
                        this.locked = false;
                        $columnItemsList = prepareColumnItems.call(this, data);
                        dfd.resolve($columnItemsList);
                    }.bind(this));
            }

            return dfd.promise();
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
                    logo: this.options.data.header.logo || this.options.data.logo || null
                }));
            }

            return $columnHeader;
        },

        bindDomEvents = function() {
            // FIXME better solution
            this.sandbox.dom.on('body', 'click', clickColumn.bind(this), '#' + this.id + '.collapsed');
            this.sandbox.dom.on('body', 'click', clickColumn.bind(this), '#' + this.id + '.hide');
        },

        clickColumn = function() {
            if (!!this.options.selectedClickCallback && typeof this.options.selectedClickCallback === 'function') {
                this.options.selectedClickCallback(this.options.index);
            } else {
                this.sandbox.emit('husky.navigation.column.selected-click', this.options.index);
            }
        },

        prepareColumn = function() {
            var columnClasses = ['navigation-column'];

            if (!!this.options.data && !!this.options.data.displayOption) {
                // add a class that defines display-options
                columnClasses.push(this.options.data.displayOption + '-column');
            } else if (this.options.index === 0) {
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

        prepareColumnItems = function(data) {
            if (!data) {
                data = this.options.data;
            }

            var $columnItemsList = this.sandbox.dom.createElement('<ul/>', {
                class: 'navigation-items'
            });

            data.sub.items.forEach(function(item) {
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
            this.items[item.id] = navigationItem;

            return $item;
        },

        clickCallback = function(item) {
            var itemId = '#' + item.id,
                $item = this.sandbox.dom.find(itemId);

            item.columnIndex = this.options.index;

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

            columnHeaderPortal: function(data) {
                var titleTemplate;
                data.title = data.title || '';
                data.logo = data.logo || '';

                if (!!data.logo) {
                    titleTemplate = '<span class="navigation-column-logo"><img alt="' + data.title + '" src="' + data.logo + '"/></span>';
                }

                return [
                    '<div id="portal-header">',
                    titleTemplate,
                    '   <h2 class="navigation-column-title pointer">', data.title, '</h2>',
                    '   <span class="dropdown-toggle inline-block pointer"></span>',
                    '</div>'
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
                this.items = {};

                render.call(this);
            },

            setOptions: function(options) {
                if (!options) {
                    throw('No options were defined!');
                }
                this.options = options;
                this.$el = this.options.$el;
            },

            show: function() {
                this.sandbox.dom.removeClass(this.$el, 'hide collapsed');
            },

            collapse: function() {
                this.sandbox.dom.removeClass(this.$el, 'hide');
                this.sandbox.dom.addClass(this.$el, 'collapsed');
            },

            hide: function() {
                this.sandbox.dom.addClass(this.$el, 'hide');
                this.sandbox.dom.removeClass(this.$el, 'collapsed');
            },

            loadingItem: function(index, onOff) {
                this.items[index].loadingItem(onOff);
            },

            selectItem: function(index, onOff) {
                this.items[index].selectItem(onOff);
            },

            getSelectedItemId: function() {
                return this.sandbox.dom.attr(this.$el, 'id');
            },

            isSubColumn: function() {
                return this.options.index >= 2 && this.options.data.displayOption !== 'content';
            },

            isContentColumn: function() {
                return this.options.data.displayOption === 'content'
            },

            getIndex: function() {
                return this.options.index;
            },

            remove: function() {
                this.sandbox.dom.remove(this.$el);
            }
        };
    };
});

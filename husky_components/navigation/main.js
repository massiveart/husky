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

define(['husky_components/navigation/navigation-column'], function(NavigationColumn) {

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

            this.sandbox.dom.append(this.$navigationColumns, startColumn.call(this, 0, data));
        },

        startColumn = function(index, data) {
            var $column = this.sandbox.dom.createElement('<li/>'),
                navigationColumn = new NavigationColumn();

            navigationColumn.sandbox = this.sandbox;

            navigationColumn.setOptions({
                $el: $column,
                data: data,
                index: index,
                contentCallback: contentCallback.bind(this),
                selectedCallback: selectedCallback.bind(this),
                addColumnCallback: addColumnCallback.bind(this),
                selectedClickCallback: selectedClickCallback.bind(this)
            });

            navigationColumn.render();

            return $column;
        },

        contentCallback = function(index, data) {
            this.sandbox.logger.log('content', index, data);

            if (index >= 1) {
                if (!$('#' + data.id).parent().parent().hasClass('content-column')) {
                    updateColumns.call(this, 1, true);
                }
            } else {
                updateColumns.call(this, 1, true);
            }

            // FIXME better solution
            if (index === 0) {
                this.sandbox.emit('husky.navigation.column.show', 0);
                this.sandbox.dom.remove('#column-1');
            } else if (index === 1) {
                this.sandbox.emit('husky.navigation.column.collapse', 0);
                this.sandbox.emit('husky.navigation.column.show', 1);
            } else if (index >= 2) {
                this.sandbox.emit('husky.navigation.column.collapse', 0);
                this.sandbox.emit('husky.navigation.column.show', 1);
            }

            this.sandbox.emit('navigation.item.content.show', {
                item: data,
                data: getNavigationData.call(this)
            });
        },

        updateColumns = function(index, removeSubColumns) {
            if (!!removeSubColumns) {
                this.sandbox.dom.remove(this.$subColumns);
                delete this.$navigationSubColumns;
            }
            this.sandbox.dom.remove('.navigation-column:gt(' + index + ')');
        },

        selectedCallback = function(index, item) {
            this.sandbox.emit('navigation.item.selected', {
                item: item,
                data: getNavigationData.call(this)
            });
        },

        selectedClickCallback = function(index) {
            this.sandbox.emit('husky.navigation.column.show', index);
            if (index > 0) {
                this.sandbox.emit('husky.navigation.column.collapse', index - 1);
            }
        },

        addColumnCallback = function(index, item) {
            if (!item.sub) {
                if (!!item.action) {
                    if (index < 1) {
                        updateColumns.call(this, index, true);
                    } else {
                        this.sandbox.emit('husky.navigation.column.collapse', 0);
                        updateColumns.call(this, index, false);
                    }

                    this.sandbox.emit('husky.navigation.column.show', index);
                    this.sandbox.emit('husky.navigation.item.loading', item.id, true);
                    load
                        .call(this, item.action)
                        .then(function(data) {
                            addColumn.call(this, index + 1, data);
                            this.sandbox.emit('husky.navigation.item.loading', item.id, false);
                        }.bind(this));
                }
            } else {
                updateColumns.call(this, index, true);
                addColumn.call(this, index + 1, item);
            }
        },

        addColumn = function(index, data) {
            var $column = startColumn.call(this, index, data);

            removeContentColumn.call(this);

            if (index >= 2) {
                if (!this.$navigationSubColumns) {
                    initSubColumns.call(this);
                }
                this.sandbox.dom.append(this.$navigationSubColumns, $column);
                scrollToLastSubColumn.call(this);
            } else {
                this.sandbox.dom.append(this.$navigationColumns, $column);
            }

            setNavigationSize.call(this);
        },

        scrollToLastSubColumn = function() {
            this.$navigationSubColumns.delay(250).animate({
                'scrollLeft': 1000
            }, 500);
        },

        initSubColumns = function() {
            this.$subColumns = this.sandbox.dom.createElement('<li/>', {
                'class': 'navigation-sub-columns-container'
            });
            this.$navigationSubColumns = this.sandbox.dom.createElement('<ul/>', {
                'class': 'navigation-sub-columns'
            });
            this.sandbox.dom.append(this.$subColumns, this.$navigationSubColumns);
            this.sandbox.dom.append(this.$navigationColumns, this.$subColumns);
        },

        render = function() {
            this.$el.html(this.$navigation);

            bindDomEvents.call(this);
            bindCustomEvents.call(this);
        },

        bindDomEvents = function() {
            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize load', setNavigationSize.bind(this));
            this.sandbox.dom.on('.navigation', 'click', headerLinkClick.bind(this), '.navigation-header-link');
            this.sandbox.dom.on('.navigation', 'mousewheel DOMMouseScroll', scrollSubColumns.bind(this), '.navigation-sub-columns-container');
        },

        bindCustomEvents = function() {
            this.sandbox.on('navigation.route', routeNavigation.bind(this));
            this.sandbox.on('navigation.item.column.show', showColumn.bind(this));
        },

        // FIXME better solution?
        headerLinkClick = function() {
            removeContentColumn.call(this);

            if (this.sandbox.dom.hasClass('#column-0', 'hide') &&
                this.sandbox.dom.hasClass('#column-1', 'collapsed')) {
                this.sandbox.emit('husky.navigation.column.collapse', 0);
            } else if (this.sandbox.dom.hasClass('#column-0', 'collapsed')) {
                this.sandbox.emit('husky.navigation.column.show', 0);
            }

            this.sandbox.emit('navigation.item.content.show', {
                item: {
                    action: $('.navigation-header-link').data('action')
                },
                data: getNavigationData.call(this)
            });
        },

        removeContentColumn = function() {
            this.sandbox.dom.removeClass('.navigation', 'show-content');
            this.sandbox.dom.remove('.content-column');
        },

        showColumn = function(params) {
            if (!params.data.displayOption || params.data.displayOption === 'content') {
                removeContentColumn.call(this);
            }

            if (this.sandbox.dom.find('#column-0').length === 1 &&
                this.sandbox.dom.find('#column-1').length === 1) {
                this.sandbox.emit('husky.navigation.column.hide', 0);
                this.sandbox.emit('husky.navigation.column.collapse', 1);
            } else {
                this.sandbox.emit('husky.navigation.column.collapse', 0);
            }

            // TODO: show
            addColumn.call(this, 9, params.data);

            this.sandbox.dom.addClass('.navigation', 'show-content');

            setTimeout(function() {
                this.sandbox.emit('navigation.size.changed', {
                    data: getNavigationData.call(this)
                });
            }.bind(this), 10);
        },

        scrollSubColumns = function(event) {
            var direction = event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ? 1 : -1,
                scrollSpeed = 25,
                scrollLeft = 0;

            event.preventDefault();

            if (this.scrollLocked) {
                this.scrollLocked = false;

                // normalize scrolling
                setTimeout(function() {
                    this.scrollLocked = true;

                    if (direction < 0) {
                        // left scroll
                        scrollLeft = this.$navigationSubColumns.scrollLeft() + scrollSpeed;
                        this.$navigationSubColumns.scrollLeft(scrollLeft);
                    } else {
                        // right scroll
                        scrollLeft = this.$navigationSubColumns.scrollLeft() - scrollSpeed;
                        this.$navigationSubColumns.scrollLeft(scrollLeft);
                    }
                }.bind(this), 25);
            }
        },

        getNavigationWidth = function() {
            var $columns = this.sandbox.dom.find('.navigation-column'),
                width = 0,
                $column = null;

            this.sandbox.dom.each($columns, function(idx, column) {
                $column = this.sandbox.dom.createElement(column);

                // TODO: refactore
                if (this.sandbox.dom.hasClass($column, 'collapsed')) {
                    width += 50;
                } else if (this.sandbox.dom.hasClass($column, 'content-column')) {
                    width += 150;
                } else if (this.sandbox.dom.hasClass($column, 'hide')) {
                    width += 0;
                } else {
                    width += 250;
                }
            }.bind(this));

            // 5px margin
            return width + 5;
        },

        setNavigationSize = function() {
            var $window = this.sandbox.dom.$window,
                $navigation = this.sandbox.dom.$('.navigation'),
                $navigationSubColumnsCont = this.sandbox.dom.$('.navigation-sub-columns-container'),
                $navigationSubColumns = this.sandbox.dom.$('.navigation-sub-columns'),
                paddingRight = 100;

            setTimeout(function() {
                this.sandbox.dom.css($navigationSubColumns, {
                    width: 'auto'
                });

                $navigationSubColumnsCont.removeClass('scrolling');

                if (this.sandbox.dom.width($window) < this.sandbox.dom.width($navigation) + paddingRight) {
                    this.sandbox.dom.css($navigationSubColumns, {
                        width: (this.sandbox.dom.width($window) - paddingRight) - this.sandbox.dom.width($navigation) - this.sandbox.dom.width($navigationSubColumns),
                        height: this.sandbox.dom.height($navigation)
                    });
                    this.sandbox.dom.addClass($navigationSubColumnsCont, 'scrolling');
                } else {
                    this.sandbox.dom.css($navigationSubColumns, {
                        height: $navigation.height() + 5
                    });
                }
            }.bind(this), 250);
        },

        getNavigationData = function() {
            return {
                // TODO
                navWidth: getNavigationWidth.call(this)
            };
        },
        // TODO
        prepareRoute = function(params) {
            var routes = params.route.split('/'),
                route = '',
                items = this.data.sub.items,
                retItems = [],
                i = 0,
                j = 0;

            for (i; i <= routes.length; i++) {
                j = 0;
                route = '';

                for (j; j <= items.length; j++) {
                    if (!!retItems.length) {
                        route = routes.slice(0, retItems.length).join('/') + '/';
                        console.log(route);
                    }

                    if (route + items[j].route === routes[i]) {
                        retItems.push(items[j]);
                        items = items[j].sub.items;
                        break;
                    }
                }
            }

            return retItems;
        },

        routeNavigation = function(params) {
            var preparedRoute;
            if (!params) {
                throw('No params were defined!');
            }
            this.sandbox.dom.remove('.navigation-column:gt(0)');
            preparedRoute = prepareRoute.call(this, params);

            console.log(preparedRoute);
        };

    return  {
        scrollLocked: true,

        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialize');
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

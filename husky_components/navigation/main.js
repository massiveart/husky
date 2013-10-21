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

define(['husky_components/navigation/column'], function(NavigationColumn) {

    'use strict';

    var prepareFirstColumn = function(data) {
            this.data = data;

            this.options.data = data;

            var $column = startColumn.call(this, 0, data);
            this.sandbox.dom.append(this.$navigationColumns, $column);
        },

        startColumn = function(index, data) {
            var $column = this.sandbox.dom.createElement('<li/>'),
                navigationColumn = new NavigationColumn();

            navigationColumn.sandbox = this.sandbox;

            if (!data.header || !data.header.logo) {
                if (!data.header) {
                    data.header = {
                        title: data.title
                    };
                }
                data.header.logo = !!this.options.data.header && !!this.options.data.header.logo ? this.options.data.header.logo : null;
            }

            navigationColumn.setOptions({
                $el: $column,
                data: data,
                index: index,
                contentCallback: contentCallback.bind(this),
                selectedCallback: selectedCallback.bind(this),
                addColumnCallback: addColumnCallback.bind(this),
                selectedClickCallback: selectedClickCallback.bind(this),
                updateColumnCallback: updateColumns.bind(this)
            });

            navigationColumn.render();
            this.columns[index] = navigationColumn;

            return $column;
        },

        contentCallback = function(index, data) {
            this.sandbox.logger.log('content', index, data);

            if (index >= 1) {
                // FIXME abstract
                if (!$('#' + data.id).parent().parent().hasClass('content-column')) {
                    updateColumns.call(this, 1, true);
                }
            } else {
                updateColumns.call(this, 1, true);
            }

            hideSubColumns.call(this);

            // TODO improvement for different sates

            if (index === 0) { // first column click, display content

                this.columns[0].show();
                this.sandbox.dom.remove('#column-1');

            } else if (index === 1) { // second column click, display content

                this.columns[0].collapse();
                this.columns[1].show();

            } else if (index >= 2) { // all other columns, display content

                this.columns[0].hide();
                this.columns[1].collapse();

            }

            this.sandbox.emit('navigation.item.content.show', {
                item: data,
                data: getNavigationData.call(this)
            });
        },

        updateColumns = function(index, removeSubColumns) {
            var selector = '.navigation-column:gt(' + index + ')';

            if (!!removeSubColumns) {
                hideSubColumns.call(this);
                selector += ':not(.portal-column)';
            }

            // FIXME context this.$el
            this.sandbox.dom.remove(selector);

            this.contentColumn = false;
        },

        selectedCallback = function(index, item) {
            this.sandbox.emit('navigation.item.selected', {
                item: item,
                data: getNavigationData.call(this)
            });
        },

        selectedClickCallback = function(index) {

            if (isHiddenSubColumns.call(this) && !!this.columns[1] &&
                this.sandbox.dom.data(this.$navigationSubColumns, 'parent') === this.columns[0].getSelectedItemId()) {
                showSubColumns.call(this);
            }

            if (index === 0) {

                this.columns[0].show();
                this.columns[1].show();

            } else if (index === 1) {

                this.columns[0].collapse();
                this.columns[1].show();

            }
        },

        hideSubColumns = function() {
            this.sandbox.dom.addClass('.navigation-sub-columns .navigation-column', 'hide-portal');

            this.sandbox.dom.css(this.$navigationSubColumns, 'display', 'none');
        },

        isHiddenSubColumns = function() {
            return this.sandbox.dom.css(this.$navigationSubColumns, 'display') === 'none';
        },

        showSubColumns = function() {
            scrollToLastSubColumn.call(this);
            this.sandbox.dom.css(this.$navigationSubColumns, 'display', 'block');
        },

        addColumnCallback = function(index, item) {
            if (!!this.locked) {
                return;
            }

            if (index === 1) {
                if (this.sandbox.dom.data(this.$navigationSubColumns, 'parent') === item.id &&
                    isHiddenSubColumns.call(this) &&
                    this.sandbox.dom.find('.navigation-sub-columns-container .navigation-column').length > 0) {
                    showSubColumns.call(this);

                    this.columns[0].collapse();
                    return;
                }
            }

            if (!item.sub) {
                if (!!item.action) {
                    if (index < 1) {
                        updateColumns.call(this, index, true);
                    } else {

                        this.columns[0].collapse();
                        updateColumns.call(this, index, false);

                    }

                    this.columns[index].show();

                    this.columns[item.columnIndex].loadingItem(item.id, true);
                    this.locked = true;
                    this.sandbox.util.load(item.action)
                        .then(function(data) {
                            this.locked = false;
                            addColumn.call(this, index + 1, data, item.id);
                            this.columns[item.columnIndex].loadingItem(item.id, false);
                        }.bind(this));
                }
            } else {
                updateColumns.call(this, index, true);
                addColumn.call(this, index + 1, item, item.id);
            }
        },

        addColumn = function(index, data, subColumnParentId) {
            var $column = startColumn.call(this, index, data);

            if (data.displayOption !== 'content') {
                removeContentColumn.call(this);
            }

            if (index >= 2 && data.displayOption !== 'content') {
                if (!this.$navigationSubColumns) {
                    initSubColumns.call(this);
                    this.sandbox.dom.data(this.$navigationSubColumns, 'parent', subColumnParentId);
                } else {
                    showSubColumns.call(this);
                }
                this.sandbox.dom.append(this.$navigationSubColumns, $column);
                scrollToLastSubColumn.call(this);
            } else {
                this.sandbox.dom.insertAt(index, 'li.navigation-column:not(.portal-column)', this.$navigationColumns, $column);
            }

            setNavigationSize.call(this);
        },

        scrollToLastSubColumn = function() {
            if (!!this.$navigationSubColumns) {
                this.$navigationSubColumns.delay(250).animate({
                    'scrollLeft': 1000
                }, 500);
            }
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
            var action = this.sandbox.dom.data('.navigation-header-link', 'action');

            removeContentColumn.call(this);

            // FIXME abstract these states
            if (this.sandbox.dom.hasClass('#column-0', 'hide') &&
                this.sandbox.dom.hasClass('#column-1', 'collapsed')) {

                this.columns[0].collapse();
                this.columns[1].show();

            } else if (this.sandbox.dom.find('#column-1').length === 0) {

                this.columns[0].show();

            } else if (!this.sandbox.dom.hasClass('#column-0', 'collapsed') && !this.sandbox.dom.hasClass('#column-1', 'collapsed')) {

                this.columns[0].collapse();

            }

            if (isHiddenSubColumns.call(this) && !!this.columns[1] &&
                this.sandbox.dom.data(this.$navigationSubColumns, 'parent') === this.columns[0].getSelectedItemId()) {
                showSubColumns.call(this);
            }

            this.sandbox.emit('navigation.item.content.show', {
                item: {
                    action: action
                },
                data: getNavigationData.call(this)
            });
        },

        removeContentColumn = function() {
            this.sandbox.dom.removeClass('.navigation', 'show-content');
            this.sandbox.dom.remove('.content-column');

            this.contentColumn = false;
        },

        getCurrentIndex = function(contentColumn) {
            var selector = '.navigation-column:not(.hide-portal)',
                index, currentIndex = 0;
            if (!contentColumn) {
                selector += ':not(.content-column)';
            }
            this.sandbox.dom.each(selector, function(key, value) {
                index = this.sandbox.dom.data(value, 'columnId');
                if (currentIndex < index) {
                    currentIndex = index;
                }
            }.bind(this));

            return currentIndex;
        },

        showColumn = function(params) {
            var currentIndex = getCurrentIndex.call(this, false);

            if (!params.data.displayOption || params.data.displayOption === 'content') {
                if (compareContentColumn.call(this, params)) {
                    return;
                }
                removeContentColumn.call(this);
                this.contentColumn = params;
            }

            if (this.sandbox.dom.find('#column-0').length === 1 &&
                this.sandbox.dom.find('#column-1').length === 1) {

                this.columns[0].hide();
                this.columns[1].collapse();

            } else {

                this.columns[0].collapse();

            }

            addColumn.call(this, currentIndex + 1, params.data);

            if (!!this.contentColumnSelected) {
                this.columns[currentIndex + 1].selectItem(this.contentColumnSelected.id, true);
            }

            this.sandbox.dom.addClass('.navigation', 'show-content');

            setTimeout(function() {
                this.sandbox.emit('navigation.size.changed', {
                    data: getNavigationData.call(this)
                });
            }.bind(this), 10);
        },

        compareContentColumn = function(params) {
            if (!this.contentColumn) {
                return false;
            }

            var result = compare.call(this, this.contentColumn, params, ['selected', 'logo', 'columnIndex']);
            return result;
        },

        compare = function(obj1, obj2, excludeProperties) {
            for (var p in obj1) {
                if (!this.sandbox.util.contains(excludeProperties, p)) {
                    if (obj1.hasOwnProperty(p) && obj2.hasOwnProperty(p)) {
                        if (typeof obj1[p] === 'object') {
                            if (!compare.call(this, obj1[p], obj2[p], excludeProperties)) {
                                return false;
                            }
                        } else if (obj1[p] !== obj2[p]) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (p === 'selected' && !!obj2[p]) {
                        this.contentColumnSelected = obj2;
                    }
                }
            }
            return true;
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

//        FIXME deprecated
//        getNavigationWidth = function() {
//            var $columns = this.sandbox.dom.find('.navigation-column'),
//                width = 0,
//                $column = null;
//
//            this.sandbox.dom.each($columns, function(idx, column) {
//                $column = this.sandbox.dom.createElement(column);
//
//                if (this.sandbox.dom.hasClass($column, 'collapsed')) {
//                    width += 50;
//                } else if (this.sandbox.dom.hasClass($column, 'content-column')) {
//                    width += 150;
//                } else if (this.sandbox.dom.hasClass($column, 'hide')) {
//                    width += 0;
//                } else {
//                    width += 250;
//                }
//            }.bind(this));
//
//            // 5px margin
//            return width + 5;
//        },

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
                // FIXME remove? navWidth: getNavigationWidth.call(this)
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
                        this.sandbox.logger.log(route);
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

            this.sandbox.logger.log(preparedRoute);
        };

    return  {
        scrollLocked: true,

        view: true,

        // current content column
        contentColumn: false,

        // helper var for selected item
        contentColumnSelected: false,

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
                this.sandbox.util.load(this.options.url)
                    .then(prepareFirstColumn.bind(this));

                render.call(this);
            }
        }
    };

});

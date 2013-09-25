define(['jquery'], function($) {

    'use strict';

    var sandbox;

    return {

        view: true,

        initialize: function() {

            sandbox = this.sandbox;
            sandbox.logger.log('initialize', this);
            sandbox.logger.log(arguments);

            this.$navigation = $('<div/>', {
                class: 'navigation'
            });

            this.currentColumnIdx = 0;

            this.data = null;

            this.columnHeader = null;
            this.columnItems = null;

            if (!!this.options.url) {
                this.load({
                    url: this.options.url,
                    success: function() {
                        this.prepareNavigation();
                        this.render();
                    }.bind(this)
                });
            }

        },

        load: function(params) {
            sandbox.logger.log('load', params);

            sandbox.util.ajax({
                url: params.url,
                success: function(data) {
                    sandbox.logger.log('load', params);

                    this.data = data;

                    this.columnHeader = this.data.header || null;
                    this.columnItems = this.data.sub.items || null;

                    this.setConfigs(data);

                    if (typeof params.success === 'function') {
                        params.success(this.data);
                    }
                }.bind(this)
            });
        },

        setConfigs: function(params) {
            this.configs = {
                displayOption: params.displayOption || null
            };
        },

        prepareNavigation: function() {
            this.$navigationColumns = $('<ul/>', {
                class: 'navigation-columns'
            });

            this.$navigationColumns.append(this.prepareNavigationColumn());
            this.$navigation.append(this.$navigationColumns);

            return this;
        },

        setNavigationSize: function() {
            var $window = $(window),
                $navigationSubColumnsCont = $('.navigation-sub-columns-container'),
                $navigationSubColumns = $('.navigation-sub-columns'),
                paddingRight = 100;

            setTimeout(function() {
                $navigationSubColumns.css({
                    width: 'auto'
                });

                $navigationSubColumnsCont.removeClass('scrolling');

                if ($window.width() < this.$navigation.width() + paddingRight) {
                    $navigationSubColumns.css({
                        width: ($window.width() - paddingRight) - (this.$navigation.width() - $navigationSubColumns.width()),
                        height: this.$navigation.height()
                    });
                    $navigationSubColumnsCont.addClass('scrolling');
                } else {
                    $navigationSubColumns.css({
                        height: this.$navigation.height() + 5
                    });
                }
            }.bind(this), 250);
        },

        prepareNavigationColumn: function() {
            var $column, columnClasses;

            columnClasses = [' '];

            this.$navigationColumns.removeClass('show-content');

            if (this.configs.displayOption === 'content') {
                // if the column is a content column
                columnClasses.push('content-column');
                this.$navigationColumns.addClass('show-content');
            } else if (this.currentColumnIdx === 1) {
                // if the column is the second column
                columnClasses.push('second-column');
            }

            $column = $('<li/>', {
                'id': 'column-' + this.currentColumnIdx,
                'data-column-id': this.currentColumnIdx,
                'class': 'navigation-column' + ((columnClasses.length > 1) ? columnClasses.join(' ') : '')
            });

            if (!!this.columnHeader) {
                $column.append(this.prepareColumnHeader());
            }

            $column.append(this.prepareColumnItems());

            return $column;
        },

        prepareNavigationSubColumn: function() {
            this.$navigationSubColumns = $('<ul/>', {
                'class': 'navigation-sub-columns'
            });

            return this.$navigationSubColumns;
        },

        prepareColumnHeader: function() {
            var $columnHeader;

            $columnHeader = $('<div/>', {
                'class': 'navigation-column-header'
            });

            $columnHeader.html(this.template.columnHeader({
                title: this.columnHeader.title,
                logo: this.columnHeader.logo
            }));

            return $columnHeader;
        },

        prepareColumnItems: function() {
            var $columnItemsList, columnItems, columnItemClass,
                columnItemClasses, columnItemUri, columnItemHasSub,
                columnItemIcon, columnItemTitle, itemModel,
                columnItemId;

            columnItems = [];

            $columnItemsList = $('<ul/>', {
                class: 'navigation-items'
            });

            if (!!this.columnItems) {
                if (!!this.itemsCollection) {
                    delete this.itemsCollection;
                }

                this.itemsCollection = new this.collections.items();

                this.columnItems.forEach(function(item) {

                    itemModel = this.models.item(item);
                    this.itemsCollection.add(itemModel);

                    // prepare classes
                    columnItemClasses = [];

                    !!itemModel.get('class') && columnItemClasses.push(itemModel.get('class'));
                    columnItemClasses.push('navigation-column-item');

                    columnItemClass = ' class="' + columnItemClasses.join(' ') + '"';

                    // prepare data-attributes
                    columnItemHasSub = (!!itemModel.get('hasSub')) ? ' data-has-sub="true"' : '';

                    // prepare title
                    columnItemTitle = 'title="' + itemModel.get('title') + '"';

                    // prepare icon
                    columnItemIcon = (!!itemModel.get('icon')) ? '<span class="icon-' + itemModel.get('icon') + '"></span>' : '';

                    // prepare id
                    columnItemId = 'id="' + itemModel.get('id') + '"';

                    columnItems.push(
                        '<li ', columnItemId, columnItemTitle, columnItemClass, columnItemUri, columnItemHasSub, '>',
                        columnItemIcon,
                        itemModel.get('title'),
                        '</li>'
                    );
                }.bind(this));

                $columnItemsList.append(columnItems.join(''));
            }

            return $columnItemsList;
        },

        addColumn: function() {
            var $subColumns,
                $subColumnsContainer = $('.navigation-sub-columns-container');

            this.currentColumnIdx++;

            if (this.currentColumnIdx === 2 && !$subColumnsContainer.size()) {
                $subColumns = $('<li/>', {
                    'class': 'navigation-sub-columns-container'
                });

                $subColumns.append(this.prepareNavigationSubColumn());
                this.$navigationColumns.append($subColumns);
            }

            if (!!$subColumnsContainer.size()) {
                this.$navigationSubColumns.append(this.prepareNavigationColumn());
                this.scrollToLastSubColumn();
            } else {
                this.$navigationColumns.append(this.prepareNavigationColumn());
            }

            this.setNavigationSize();
        },

        collapseFirstColumn: function() {
            sandbox.logger.log('collapseFirstColumn');
            var $firstColumn;

            $firstColumn = $('#column-0');
            $firstColumn.addClass('collapsed');
        },

        showNavigationColumns: function(event) {
            var $firstColumn, $secondColumn, $element;

            $element = $(event.target);
            $firstColumn = $('#column-0');
            $secondColumn = $('#column-1');

            this.$navigationColumns.removeClass('show-content');

            this.showContent = false;

            if (!$element.hasClass('navigation-column-item') && !$element.is('span')) {
                $firstColumn.removeClass('hide');
                $secondColumn.removeClass('collapsed');

                this.hideColumn();
            } else {
                $firstColumn.removeClass('hide');
                $secondColumn.removeClass('collapsed');
            }

            this.setNavigationSize();
        },

        // lock selection during column loading
        selectionLocked: true,

        showContent: false,

        // TODO: cleanup and simplify selectItem function
        selectItem: function(event) {
            sandbox.logger.log('selectItem');

            var $element, $elementColumn, elementId,
                itemModel;

            this.showContent = false;

            $element = $(event.currentTarget);
            $elementColumn = $element.parent().parent();

            elementId = $element.attr('id');

            itemModel = this.itemsCollection.get(elementId);

            this.currentColumnIdx = $elementColumn.data('column-id');
            this.currentColumnIdx = $elementColumn.data('column-id');

            if (!!itemModel && this.selectionLocked) {
                // reset all navigation items...
                $elementColumn
                    .find('.selected')
                    .removeClass('selected');

                // ... and add class to selected element
                $element.addClass('selected');

                sandbox.emit('navigation.item.selected', {
                    item: itemModel,
                    data: this.getNavigationData()
                });

                if (!!itemModel.get('hasSub')) {

                    if (!itemModel.get('sub')) {
                        this.selectionLocked = false;

                        this.addLoader($element);
                        this.updateColumns();

                        this.load({
                            url: itemModel.get('action'),
                            success: function() {
                                this.selectionLocked = true;

                                this.addColumn();
                                this.hideLoader($element);

                                if (this.currentColumnIdx > 1) {
                                    this.collapseFirstColumn();
                                }

                                sandbox.emit('navigation.item.sub.loaded', {
                                    item: itemModel,
                                    data: this.getNavigationData()
                                });
                            }.bind(this)
                        });
                    } else {
                        this.setConfigs({});

                        this.columnHeader = itemModel.get('header') || null;
                        this.columnItems = itemModel.get('sub').items;
                        this.updateColumns();
                        this.addColumn();

                        if (this.currentColumnIdx > 1) {
                            this.collapseFirstColumn();
                        }

                        sandbox.emit('navigation.item.sub.show', {
                            item: itemModel,
                            data: this.getNavigationData()
                        });
                    }

                } else if (itemModel.get('type') === 'content') {
                    this.showContent = true;

                    this.updateColumns();
                    this.collapseFirstColumn();

                    sandbox.emit('navigation.item.content.show', {
                        item: itemModel,
                        data: this.getNavigationData()
                    });
                }
            }
        },

        // remove old columns before loading new ones
        updateColumns: function() {
            $('.navigation-columns > li:gt(' + this.currentColumnIdx + ')').remove();
            $('.navigation-column:gt(' + this.currentColumnIdx + ')').remove();
        },

        getNavigationWidth: function() {
            var $columns = $('.navigation-column'),
                width = 0,
                $column = null;

            $.each($columns, function(idx, column) {
                $column = $(column);

                if (!this.$navigationColumns.hasClass('show-content')) {
                    if ($column.hasClass('collapsed')) {
                        width += 50;
                    } else {
                        width += 250;
                    }
                } else {
                    width = 200;
                }

            }.bind(this));

            return width;
        },

        getNavigationData: function() {
            return {
                // TODO
                navWidth: this.getNavigationWidth()
            };
        },

        showFirstNavigationColumn: function(event) {
            sandbox.logger.log('showFirstNavigationColumn');

            var $element = $(event.target);

            $('#column-0')
                .removeClass('hide')
                .removeClass('collapsed');

            if (!$element.hasClass('navigation-column-item') && !$element.is('span')) {
                this.currentColumnIdx = 1;
                this.updateColumns();
                $('#column-1')
                    .find('.selected')
                    .removeClass('selected');
            }
        },

        // TODO
        showColumn: function(params) {
            sandbox.logger.log('showColumn');

            var $showedColumn;

            params = params || {};

            if (!!params.data) {
                this.columnHeader = params.data.header || null;
                this.columnItems = params.data.sub.items || null;

                this.setConfigs(params.data);

                $showedColumn = $('#column-' + this.addedColumn);

                $('#column-0').addClass('hide');
                $('#column-1').addClass('collapsed');

                if (!!$showedColumn.size()) {
                    this.currentColumnIdx--;
                    $showedColumn.remove();
                }

                this.showContent = true;

                this.addColumn();

                this.addedColumn = this.currentColumnIdx;

                sandbox.emit('navigation.column.content.show', {
                    data: this.getNavigationData()
                });

            } else {
                sandbox.logger.error('showColumn', 'No data was defined!');
            }
        },

        // TODO
        hideColumn: function() {
            var $showedColumn;
            $showedColumn = $('#column-' + this.addedColumn);

            if (!!$showedColumn.size()) {
                $showedColumn.remove();

                $('#column-0').removeClass('hide');
                $('#column-1').removeClass('collapsed');
            }

            this.addedColumn = null;
        },

        // for normalized scrolling
        scrollLocked: true,

        scrollSubColumns: function(event) {
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

        scrollToLastSubColumn: function() {
            this.$navigationSubColumns.delay(250).animate({
                'scrollLeft': 1000
            }, 500);
        },

        bindEvents: function() {
            // external events
            sandbox.on('navigation.item.column.show', this.showColumn.bind(this));

            // internal events
        },

        bindDOMEvents: function() {
            sandbox.logger.log('bindDOMEvents');

            this.$el.off();

            $(window).on('resize load', this.setNavigationSize.bind(this));

            this.$el.on('click', '.navigation-column-item', this.selectItem.bind(this));
            this.$el.on('click', '.navigation-column:eq(1)', this.showNavigationColumns.bind(this));
            this.$el.on('click', '.navigation-column:eq(0).collapsed', this.showFirstNavigationColumn.bind(this));
            this.$el.on('mousewheel DOMMouseScroll', '.navigation-sub-columns-container', this.scrollSubColumns.bind(this));
        },

        render: function() {
            this.$el.html(this.$navigation);

            this.bindEvents();
            this.bindDOMEvents();
        },

        addLoader: function($elem) {
            $elem.addClass('is-loading');
        },

        hideLoader: function($elem) {
            $elem.removeClass('is-loading');
        },

        collections: {
            items: function() {
                return $.extend({}, sandbox.data.Collection);
            }
        },

        models: {
            item: function(data) {
                var defaults = {
                    // defaults
                    title: '',
                    hasSub: false
                };

                return $.extend({}, sandbox.data.Model, defaults, data);
            }
        },

        template: {
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
        }
    };
});

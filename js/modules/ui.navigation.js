(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.Navigation';

    Husky.Ui.Navigation = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$element = $(element);

        this.$navigation = $('<div/>', {
            class: 'navigation'
        });

        this.currentColumnIdx = 0;
        this.lastColumnIdx = 0;

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
    };

    $.extend(Husky.Ui.Navigation.prototype, Husky.Events, {

        vent: (function() {
            return $.extend({}, Husky.Events); 
        })(),

        load: function(params) {
            Husky.DEBUG && console.log(this.name, 'load');

            Husky.Util.ajax({
                url: params.url,
                success: function(data) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success', data);

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

        prepareColumnHeader: function() {
            var $columnHeader;

            $columnHeader = $('<div/>', {
                'class': 'navigation-column-header'
            });

            $columnHeader.html(this.template.columnHeader({
                title: this.columnHeader.title,
                logo: this.columnHeader.logo
            }))

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
            var $column, i, $firstColumn,
                $secondColumn;

            $firstColumn = $('#column-0');
            $secondColumn = $('#column-1');

            this.currentColumnIdx++;

            // TODO: create function
            if (this.currentColumnIdx > 1) {
                $firstColumn.addClass('collapsed');
            } else {
                $firstColumn.removeClass('collapsed');
            }

            if (this.currentColumnIdx > 2) {
                $firstColumn.addClass('hide');
                $secondColumn.addClass('collapsed');
            } else {
                $firstColumn.removeClass('hide');
                $secondColumn.removeClass('collapsed');
            }

            if (this.currentColumnIdx < this.lastColumnIdx ||
                this.currentColumnIdx === this.lastColumnIdx) {

                for (i = this.currentColumnIdx; i <= this.lastColumnIdx; i++) {
                    $column = this.$navigationColumns.find('#column-' + i);

                    if (!!$column.size()) {
                        $column.remove();
                    }
                }
            }
            this.$navigationColumns.append(this.prepareNavigationColumn());
        },

        showNavigation: function() {
            var $firstColumn;

            $firstColumn = $('#column-0');
            $firstColumn.removeClass('hide');
        },

        // TODO: cleanup and simplify selectItem function
        selectItem: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectItem');

            var $element, $elementColumn, elementId, 
                itemModel;

            $element = $(event.currentTarget);
            $elementColumn = $element.parent().parent();

            elementId = $element.attr('id');

            itemModel = this.itemsCollection.get(elementId);

            this.lastColumnIdx = this.currentColumnIdx;
            this.currentColumnIdx = $elementColumn.data('column-id');

            if (!!itemModel) {
                // reset all navigation items...
                $elementColumn
                    .find('.selected')
                    .removeClass('selected');

                // ... and add class to selected element
                $element.addClass('selected');

                this.trigger('navigation:item:selected', itemModel);

                if (!!itemModel.get('hasSub')) {

                    if (!itemModel.get('sub')) {
                        this.addLoader($element);
                        this.load({
                            url: itemModel.get('action'),
                            success: function() {
                                this.addColumn();
                                this.hideLoader($element);

                                this.trigger('navigation:item:sub:loaded', itemModel);
                            }.bind(this)
                        });
                    } else {
                        this.columnHeader = itemModel.get('header') || null;
                        this.columnItems = itemModel.get('sub').items;
                        this.addColumn();
                    }

                } else if (itemModel.get('type') == 'content') {
                    this.trigger('navigation:item:content:show', itemModel);
                }
            }
        },

        showColumn: function(params) {
            Husky.DEBUG && console.log(this.name, 'showColumn');

            params = params || {};

            if (!!params.data) {
                this.columnHeader = params.data.header || null;
                this.columnItems = params.data.sub.items || null;

                this.setConfigs(params.data);

                this.addColumn();
            } else {
                Husky.DEBUG && console.error(this.name, 'showColumn', 'No data was defined!');
            }
        },

        bindEvents: function() {
            // external events
            this.on('navigation:item:column:show', this.showColumn.bind(this));

            // internal events
        },

        bindDOMEvents: function() {
            this.$element.off();

            this.$element.on('click', '.navigation-column-item:not(.selected)', this.selectItem.bind(this));
            this.$element.on('click', '.navigation-column:eq(1)', this.showNavigation.bind(this));
        },

        render: function() {
            this.$element.html(this.$navigation);

            this.bindEvents();
            this.bindDOMEvents();
        },

        addLoader: function($elem) {
            $elem.addClass('loading');
        },

        hideLoader: function($elem) {
            $elem.removeClass('loading');
        },

        collections: {
            items: function() {
                return $.extend({}, Husky.Collection);    
            }
        },

        models: {
            item: function(data) {
                var defaults = {
                    // defaults
                    title: '',
                    hasSub: false
                };

                return $.extend({}, Husky.Model, defaults, data);  
            }
        },

        template: {
            columnHeader: function(data) {
                data = data || {};

                data.title = data.title || '';
                data.logo = data.logo || '';

                return [
                    '<h2 class="navigation-column-title">', data.title, '</h2>'
                ].join('');
            },

            // TODO: Remove search
            search: function(data) {
                data = data || {};

                data.action = data.action || '';
                data.icon = data.icon || '';

                return [
                    '<input type="text" class="search" autofill="false" data-action="', data.action, '" placeholder="Search ..."/>', // TODO Translate
                ].join('');
            }
        }
    });

    $.fn.huskyNavigation = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyNavigation.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.Navigation(this, options));

        return this;
    };

    $.fn.huskyNavigation.defaults = {
        url: '',
        collapse: false 
    };

})(Husky.$, this, this.document);

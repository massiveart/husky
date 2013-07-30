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

                    if (typeof params.success === 'function') {
                        params.success(this.data);
                    }
                }.bind(this)
            });
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
            var $column;

            $column = $('<li/>', {
                'id': 'column-' + this.currentColumnIdx,
                'data-column-id': this.currentColumnIdx,
                'class': 'navigation-column'
            });

            $column.append(this.prepareColumnItems());

            return $column;
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

                    !!item.class && columnItemClasses.push(item.class);
                    columnItemClasses.push('navigation-column-item');

                    columnItemClass = ' class="' + columnItemClasses.join(' ') + '"';

                    // prepare data-attributes
                    columnItemHasSub = (!!item.hasSub) ? ' data-has-sub="true"' : '';

                    // prepare title
                    columnItemTitle = 'title="' + item.title + '"';

                    // prepare icon
                    columnItemIcon = (!!item.icon) ? '<span class="icon-' + item.icon + '"></span>' : '';

                    // prepare id
                    columnItemId = 'id="' + itemModel.get('id') + '"';

                    columnItems.push(
                        '<li ', columnItemId, columnItemTitle, columnItemClass, columnItemUri, columnItemHasSub, '>',
                            columnItemIcon,
                            item.title,
                        '</li>'
                    );
                }.bind(this));

                $columnItemsList.append(columnItems.join(''));
            }

            return $columnItemsList;
        },

        addColumn: function() {
            var $column, i;

            this.currentColumnIdx++;

            if (this.currentColumnIdx < this.lastColumnIdx ||
                this.currentColumnIdx === this.lastColumnIdx) {

                for (i = this.currentColumnIdx; i <= this.lastColumnIdx; i++) {
                    $column = this.$navigationColumns.find('#column-' + i);

                    if ($column.size()) {
                        $column.remove();
                    }
                }
            }

            this.$navigationColumns.append(this.prepareNavigationColumn());
        },

        selectItem: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectItem');

            var $element, $elementColumn, $firstColumn, 
                $elementId, itemModel;

            $element = $(event.currentTarget);
            $elementId = $element.attr('id');
            $elementColumn = $element.parent().parent();
            $firstColumn = $('#column-0');

            itemModel = this.itemsCollection.get($elementId);

            this.lastColumnIdx = this.currentColumnIdx;
            this.currentColumnIdx = $elementColumn.data('column-id');

            if (!!itemModel) {
                $elementColumn
                    .find('.selected')
                    .removeClass('selected');

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
                                console.log(this.currentColumnIdx);
                                if (this.currentColumnIdx > 0) {
                                    $firstColumn.addClass('collapsed');
                                } else {
                                    $firstColumn.removeClass('collapsed');
                                }

                                this.trigger('navigation:item:sub:loaded', itemModel);
                            }.bind(this)
                        });
                    } else {
                        // this.columnHeader = this.data.header || null;
                        this.columnItems = this.itemsCollection.get($element.attr('id')).get('sub').items;
                        this.addColumn();
                    }

                } else {

                    this.trigger('navigation:item:content:show', itemModel);
                }
            }
        },

        bindDOMEvents: function() {
            this.$element.on('click', '.navigation-column-item:not(.selected)', this.selectItem.bind(this));
        },

        render: function() {
            this.$element.html(this.$navigation);

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
            search: function(data) {
                data = data || {};

                data.action = data.action || '';
                data.icon = data.icon || '';

                return [
                    '<form action="', data.action, '">',
                        '<input type="text" class="search" autofill="false" placeholder="Search ..."/>', // TODO Translate
                    '</form>'
                ].join();
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

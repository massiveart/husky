(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.Navigation';

    Husky.Ui.Navigation = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

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
        this.columnEntries = null;

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

        getUrl: function(params) {
            var url = params.url;
            if (!!params.uri) {
                url += '/' + params.uri;
            }
            return url;
        },

        load: function(params) {
            Husky.DEBUG && console.log(this.name, 'load');

            Husky.Util.ajax({
                url: this.getUrl(params),
                success: function(data) {
                    console.log(data);
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    this.data = data;

                    this.columnHeader = this.data.header || null;
                    this.columnEntries = this.data.sub.entries || null;

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

            $column.append(this.prepareColumnEntries());

            return $column;
        },

        prepareColumnEntries: function() {
            var $columnEntriesList, columnEntries, columnEntryClass, 
                columnEntryClasses, columnEntryUri, columnEntryHasChildren, 
                columnEntryIcon, columnEntryTitle, entryModel,
                columnEntryId;

            columnEntries = [];

            $columnEntriesList = $('<ul/>', {
                class: 'navigation-entries'
            });

            if (!!this.columnEntries) {
                if (!!this.entriesCollection) {
                    delete this.entriesCollection;
                }

                this.entriesCollection = new this.collections.entries();

                this.columnEntries.forEach(function(entry) {
                    
                    entryModel = this.models.entry(entry);
                    this.entriesCollection.add(entryModel);

                    // prepare classes
                    columnEntryClasses = [];

                    !!entry.class && columnEntryClasses.push(entry.class);
                    columnEntryClasses.push('navigation-column-entry');

                    columnEntryClass = ' class="' + columnEntryClasses.join(' ') + '"';

                    // prepare data-attributes
                    columnEntryHasChildren = (!!entry.hasChildren) ? ' data-has-children="true"' : '';

                    // prepare title
                    columnEntryTitle = 'title="' + entry.title + '"';

                    // prepare icon
                    columnEntryIcon = (!!entry.icon) ? '<span class="icon-' + entry.icon + '"></span>' : '';

                    // prepare id
                    columnEntryId = 'id="' + entryModel.get('id') + '"';

                    columnEntries.push(
                        '<li ', columnEntryId, columnEntryTitle, columnEntryClass, columnEntryUri, columnEntryHasChildren, '>',
                            columnEntryIcon,
                            entry.title,
                        '</li>'
                    );
                }.bind(this));

                $columnEntriesList.append(columnEntries.join(''));
            }

            return $columnEntriesList;
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

        selectEntry: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectEntry');

            var $element, $elementColumn, $firstColumn, 
                $elementId, entryModel;

            $element = $(event.currentTarget);
            $elementId = $element.attr('id');
            $elementColumn = $element.parent().parent();
            $firstColumn = $('#column-0');

            entryModel = this.entriesCollection.get($elementId);

            this.lastColumnIdx = this.currentColumnIdx;
            this.currentColumnIdx = $elementColumn.data('column-id');

            if (!!entryModel && entryModel.get('hasChildren')) {
                $elementColumn
                    .find('.selected')
                    .removeClass('selected');

                $element.addClass('selected');

                if (!entryModel.get('sub')) {
                    this.addLoader($element);
                    this.load({
                        url: this.options.url,
                        uri: this.entriesCollection.get($element.attr('id')).get('action'),
                        success: function() {
                            this.addColumn();
                            this.hideLoader($element);

                            if (this.currentColumnIdx > 0) {
                                $firstColumn.addClass('collapsed');
                            } else {
                                $firstColumn.removeClass('collapsed');
                            }
                        }.bind(this)
                    });
                } else {
                    // this.columnHeader = this.data.header || null;
                    this.columnEntries = this.entriesCollection.get($element.attr('id')).get('sub').entries;
                    this.addColumn();
                }

                this.trigger('navigation:entry:select');
            }
        },

        bindDOMEvents: function() {
            this.$element.on('click', '.navigation-column-entry:not(.selected)', this.selectEntry.bind(this));
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
            entries: function() {
                return $.extend({}, Husky.Collection);    
            }
        },

        models: {
            entry: function(data) {
                var defaults = {
                    // defaults
                    title: '',
                    hasChildren: false
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
                        '<input type="text" class="search" autofill="false" placeholder="Search ..."></input>',
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
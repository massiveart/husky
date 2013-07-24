(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.Navigation';

    Husky.Ui.Navigation = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;

        this.configs = {};

        this.$element = $(element);
        this.$navigation = $('<ul/>', {
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

            console.log(this.getUrl(params));

            Husky.Util.ajax({
                url: this.getUrl(params),
                success: function(data) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    this.data = data;

                    this.columnHeader = this.data.header || null;
                    this.columnEntries = this.data.entries || null;

                    if (typeof params.success === 'function') {
                        params.success(this.data);
                    }
                }.bind(this)
            });
        },

        prepareNavigation: function() {
            var i;

            for (i = -1; i < this.currentColumnIdx; i++) {
                this.$navigation.append(this.prepareNavigationColumn());
            }

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
                columnEntryIcon, columnEntryTitle;

            columnEntries = [];

            $columnEntriesList = $('<ul/>', {
                class: 'navigation-enties'
            });

            if (!!this.columnEntries) {
                this.columnEntries.forEach(function(entry) {

                    // prepare classes
                    columnEntryClasses = [];

                    !!entry.class && columnEntryClasses.push(entry.class);
                    columnEntryClasses.push('navigation-column-entry');

                    columnEntryClass = ' class="' + columnEntryClasses.join(' ') + '"';

                    // prepare data-attributes
                    columnEntryUri = (!!entry.uri) ? ' data-uri="' + entry.uri + '"' : '';
                    columnEntryHasChildren = (!!entry.hasChildren && entry.hasChildren === 'true') ? ' data-has-children="true"' : '';

                    // prepare title
                    columnEntryTitle = 'title="' + entry.title + '"';

                    // prepare icon
                    columnEntryIcon = (entry.icon === 'true') ? '<span class="icon-' + entry.id + '"></span>' : '';

                    columnEntries.push(
                        '<li ', columnEntryTitle, columnEntryClass, columnEntryUri, columnEntryHasChildren, '>',
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
                    $column = this.$navigation.find('#column-' + i);

                    if ($column.size()) {
                        $column.remove();
                    }
                }
            }

            this.$navigation.append(this.prepareNavigationColumn());
        },

        selectEntry: function(event) {
            Husky.DEBUG && console.log(this.name, 'selectEntry');

            var $element, $elementColumn, $firstColumn;

            $element = $(event.currentTarget);
            $elementColumn = $element.parent().parent();
            $firstColumn = $('#column-0');

            this.lastColumnIdx = this.currentColumnIdx;
            this.currentColumnIdx = $elementColumn.data('column-id');

            if (this.currentColumnIdx > 0) {
                $firstColumn.addClass('collapsed');
            } else {
                $firstColumn.removeClass('collapsed');
            }

            if ($element.data('has-children') && !!$element.data('uri')) {

                $elementColumn
                    .find('.selected')
                    .removeClass('selected');

                $element.addClass('selected');

                this.load({
                    url: this.options.url,
                    uri: $element.data('uri'),
                    success: function() {
                        this.addColumn();
                    }.bind(this)
                });

                this.trigger('navigation:entry:select');
            }
        },

        bindDOMEvents: function() {
            this.$element.on('click', '.navigation-column-entry:not(.selected)', this.selectEntry.bind(this));
        },

        render: function() {
            this.$element.html(this.$navigation);

            this.bindDOMEvents();
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
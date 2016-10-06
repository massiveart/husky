/**
 * @class Tiles (Datagrid Decorator)
 * @constructor
 *
 * @param {String} [icon] The icon to display in the rendered tiles
 * @param {Object} [fields] Describes the fields from which the title and the description get constructed
 * @param {Array} [fields.title] The fields from which the title gets constructed
 * @param {Array} [fields.description] The fields from which the description gets constructed
 * @param {Object} [translations] Contains the translation keys used by this view
 * @param {Boolean} [showAddNewTile] True to show a tile which emits an add new
 * @param {Boolean} [addNewIcon] The icon to show in the "add new"-tile
 *
 * @param {Boolean} [rendered] property used by the datagrid-main class
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the view and unbind events
 */
define(function() {

    'use strict';

    var defaults = {
        icon: 'fa-folder',
        showAddNewTile: true,
        addNewIcon: 'fa-plus-circle',
        fields: {
            title: ['title'],
            description: ['elementsCount']
        },
        translations: {
            items: 'public.items',
            addNew: 'public.add-new'
        }
    },

    templates = {
        tile: [
            '<div class="tile">',
            '   <span class="<%= icon %> icon"></span>',
            '   <span title="<%= title %>" class="title"><%= title %></span>',
            '   <span class="description"><%= description %></span>',
            '</div>'
        ].join(''),
        addNewTile: [
            '<div class="add-new-tile">',
            '   <span class="<%= icon %> icon"></span>',
            '   <span class="title"><%= title %></span>',
            '</div>'
        ].join('')
    },

    /**
     * Apply datagrid-content-filters on the given record column by column.
     * Datagrid-content-filters are used to format the raw database-values (for the number of elements)
     *
     * @param {Object} record The record data
     * @returns {Object} the modified record
     */
    processContentFilters = function(record) {
        var modifiedRecord = this.sandbox.util.extend(false, {}, record), argument;
        this.datagrid.matchings.forEach(function(matching) {
            argument = null;
            if (matching.type === this.datagrid.types.COUNT) {
                argument = this.sandbox.translate(this.options.translations.items);
            }

            modifiedRecord[matching.attribute] = this.datagrid.processContentFilter.call(
                this.datagrid,
                matching.attribute,
                modifiedRecord[matching.attribute],
                matching.type,
                argument
            );
        }.bind(this));

        return modifiedRecord;
    },

    /**
     * Emitted when the add tile gets clicked
     *
     * @event husky.datagrid.tiles.add-clicked
     */
    ADD_CLICKED = function() {
        return this.datagrid.createEventName.call(this.datagrid, 'tiles.add-clicked');
    };

    return {

        /**
         * Initializes the view, gets called only once
         * @param {Object} context The context of the datagrid class
         * @param {Object} options The options used by the view
         */
        initialize: function(context, options) {
            // context of the datagrid-component
            this.datagrid = context;

            // make sandbox available in this-context
            this.sandbox = this.datagrid.sandbox;

            // merge defaults with options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);
        },

        /**
         * Method to render this view.
         *
         * @param data object containing the data which is rendered
         * @param $container dom-element to render datagrid in
         */
        render: function(data, $container) {
            this.rendered = false;
            this.$el = null;
            this.$tiles = {};

            this.renderContainer($container);
            data.embedded.map(this.renderRecord.bind(this));
            if (!!this.options.showAddNewTile) {
                this.renderAddNewTile();
            }
            this.bindDomEvents();
            this.rendered = true;
        },

        /**
         * Binds dom related events for the view
         */
        bindDomEvents: function() {
            this.$el.on('click', '.tile', function(event) {
                this.datagrid.itemAction.call(this.datagrid, $(event.currentTarget).data('id'));
            }.bind(this));
        },

        /**
         * Renders the main container of the decorator
         *
         * @param {Object} $container The element to render the decorator into.
         */
        renderContainer: function($container) {
            this.$el = $('<div class="tiles-view"/>');
            $container.append(this.$el);
        },

        /**
         * Renders the add new tile and binds its click event
         */
        renderAddNewTile: function() {
            var $addNew = $(_.template(templates.addNewTile, {
                icon: this.options.addNewIcon,
                title: this.sandbox.translate(this.options.translations.addNew)
            }));

            $addNew.on('click', function() {
                this.sandbox.emit(ADD_CLICKED.call(this));
            }.bind(this));

            this.$el.append($addNew);
        },

        /**
         * Renders a single record into the view
         *
         * @param {Object} record The data of the record
         */
        renderRecord: function(record) {
            record = processContentFilters.call(this, record);
            var title = this.getTitle(record),
                description = this.getDescription(record),
                $title, lineHeight, countLinesOfTitle, isOverflownHorizontally;

            this.$tiles[record.id] = $(_.template(templates.tile, {
                icon: this.options.icon,
                title: title,
                description: this.sandbox.util.cropMiddle(description, 18)
            }));
            this.$tiles[record.id].data('id', record.id);

            this.$el.append(this.$tiles[record.id]);

            $title = this.$tiles[record.id].find('.title');
            lineHeight = parseInt($title.css('line-height').replace('px', ''));
            countLinesOfTitle = $title.height() / lineHeight;
            isOverflownHorizontally = $title.get(0).scrollWidth > $title.innerWidth();
            if (countLinesOfTitle > 2 || !!isOverflownHorizontally) {
                this.$tiles[record.id].find('.title').html(this.sandbox.util.cropMiddle(title, 18));
            }
        },

        /**
         * Constructs and returns the title string to render
         *
         * @param {Object} record the data to construct the title from
         * @return {String} the constructed title
         */
        getTitle: function(record) {
            var title = '';
            this.options.fields.title.forEach(function(titleField) {
                title += record[titleField] + ' ';
            });

            return title.trim();
        },

        /**
         * Constructs and returns the description string to render
         *
         * @param {Object} record the data to construct the description from
         * @return {String} the constructed description
         */
        getDescription: function(record) {
            var description = '';
            this.options.fields.description.forEach(function(descriptionField) {
                description += record[descriptionField] + ' ';
            });

            return description.trim();
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.$el.remove();
        }
    };
});

/**
 * @class ThumbnailView (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [viewOptions] Configuration object
 * @param {Boolean} [viewOptions.large] If true large thumbnails get rendered
 * @param {Number} [viewOptions.fadeInDuration] duration of the fade in animation
 *
 * @param {Boolean} [rendered] property used by the datagrid-main class
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the view and unbind events
 * @param {Boolean} [unselectOnBackgroundClick] should the items be deselcted on docuemnt click
 */
define(function() {

    'use strict';

    var defaults = {
            large: false,
            fadeInDuration: 400,
            largeThumbnailFormat: '170x170',
            smallThumbnailFormat: '50x50',
            unselectOnBackgroundClick: true,
            selectable: true
        },

        constants = {
            containerClass: 'husky-thumbnails',
            itemClass: 'item',
            smallClass: 'small',
            largeClass: 'large',
            titleClass: 'title',
            downloadClass: 'download',
            downloadIcon: 'cloud-download',
            checkboxClass: 'checkbox',
            descriptionClass: 'description',
            thumbnailSrcProperty: 'url',
            thumbnailAltProperty: 'alt',
            idProperty: 'id',
            textClass: 'text',
            imageClass: 'image',
            descriptionDelimiter: ', ',
            selectedClass: 'is-selected'
        },

        templates = {
            item: [
                '<div class="' + constants.itemClass + ' <%= styleClass %>">',
                '   <div class="' + constants.imageClass + '">',
                '       <div class="fa-coffee empty"></div>',
                '       <img src="<%= imgSrc %>" alt="<%= imgAlt %>"/>',
                '   </div>',
                '   <div class="' + constants.textClass + '">',
                '       <span class="' + constants.titleClass + '"><%= title %></span><br />',
                '       <span class="' + constants.descriptionClass + '"><%= description %></span>',
                '   </div>',
                '<% if (!!selectable) { %>',
                '   <div class="' + constants.checkboxClass + ' custom-checkbox no-spacing">',
                '       <input type="checkbox"<% if (!!checked) { %> checked<% } %>/>',
                '       <span class="icon"></span>',
                '   </div>',
                '<% } %>',
                '   <div class="fa-' + constants.downloadIcon + ' ' + constants.downloadClass + '"></div>',
                '</div>'
            ].join('')
        },

        /**
         * triggered when a when the download icon gets clicked
         * @event husky.datagrid.download-clicked
         * @param {Number|String} the id of the data-record
         */
        DOWNLOAD_CLICKED = function() {
            return this.datagrid.createEventName.call(this.datagrid, 'download-clicked');
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

            this.setVariables();
        },

        /**
         * Takes an object with options and extends the current ones
         * @param options {Object} new options to merge to the current ones
         */
        extendOptions: function(options) {
            this.options = this.sandbox.util.extend(true, {}, this.options, options);
        },

        /**
         * Sets the starting variables for the view
         */
        setVariables: function() {
            this.rendered = false;
            this.data = null;
            this.$el = null;
            this.thumbnailFormat = null;

            // global array to store the dom elements
            this.$thumbnails = {};
        },

        /**
         * Method to render data in this view
         */
        render: function(data, $container) {
            this.$el = this.sandbox.dom.createElement('<div class="' + constants.containerClass + '"/>');
            this.sandbox.dom.append($container, this.$el);
            this.data = data;

            this.renderThumbnails(this.data.embedded);
            this.sandbox.dom.on('body', 'click.grid-thumbnails.' + this.datagrid.options.instanceName, function() {
                if (this.options.unselectOnBackgroundClick) {
                    this.unselectAll();
                }
            }.bind(this));
            this.rendered = true;
        },

        /**
         * Parses the data and passes it to a render function
         * @param thumbnails {Array} array with thumbnails to render
         */
        renderThumbnails: function(thumbnails, appendAtBottom) {
            var imgSrc, imgAlt, title, description, id, thumbnail;

            this.thumbnailFormat = (this.options.large === false) ? this.options.smallThumbnailFormat : this.options.largeThumbnailFormat;

            // loop through each data record
            this.sandbox.util.foreach(thumbnails, function(record) {
                imgSrc = imgAlt = title = '';
                description = [];

                // foreach matching configured get the corresponding datum from the record
                this.sandbox.util.foreach(this.datagrid.matchings, function(matching) {
                    var argument, result;

                    // get argument
                    if (matching.type === this.datagrid.types.THUMBNAILS) {
                        argument = this.thumbnailFormat;
                    }

                    // process
                    result = this.datagrid.processContentFilter.call(this.datagrid,
                        matching.attribute,
                        record[matching.attribute],
                        matching.type,
                        argument
                    );

                    // get the thumbnail and the title data (to place it on top)
                    // with the rest generate a description string
                    if (matching.type === this.datagrid.types.THUMBNAILS) {
                        imgSrc = result[constants.thumbnailSrcProperty];
                        imgAlt = result[constants.thumbnailAltProperty];
                    } else if (matching.type === this.datagrid.types.TITLE) {
                        title = result;
                    } else if (matching.type === this.datagrid.types.BYTES) {
                        description.push(result);
                    }
                }.bind(this));

                id = record[constants.idProperty];
                description = description.join(constants.descriptionDelimiter);

                // pass the found data to a render method
                this.renderThumbnail(id, imgSrc, imgAlt, title, description, record, appendAtBottom);
            }.bind(this));
        },

        /**
         * Renders the actual thumbnail element
         * @param id {String|Number} the identifier of the data record
         * @param imgSrc {String} the thumbnail src of the data record
         * @param imgAlt {String} the thumbnail alt tag of the data record
         * @param title {String} the title of the data record
         * @param description {String} the thumbnail description to render
         * @param record {Object} the original data record
         */
        renderThumbnail: function(id, imgSrc, imgAlt, title, description, record, appendAtBottom) {
            this.$thumbnails[id] = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.item)({
                    imgSrc: imgSrc,
                    imgAlt: imgAlt,
                    title: this.sandbox.util.cropMiddle(String(title), 24),
                    description: this.sandbox.util.cropMiddle(String(description), 32),
                    styleClass: (this.options.large === true) ? constants.largeClass : constants.smallClass,
                    checked: !!this.datagrid.itemIsSelected.call(this.datagrid, record.id),
                    selectable: this.options.selectable
                })
            );
            if (this.datagrid.itemIsSelected.call(this.datagrid, record.id)) {
                this.selectItem(id, true);
            }
            this.sandbox.dom.data(this.$thumbnails[id], 'id', id);
            this.sandbox.dom.hide(this.$thumbnails[id]);
            if (!!appendAtBottom) {
                this.sandbox.dom.append(this.$el, this.$thumbnails[id]);
            } else {
                this.sandbox.dom.prepend(this.$el, this.$thumbnails[id]);
            }
            this.sandbox.dom.fadeIn(this.$thumbnails[id], this.options.fadeInDuration);

            this.bindThumbnailDomEvents(id);
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.sandbox.dom.off('body', 'click.grid-thumbnails.' + this.datagrid.options.instanceName);
            this.sandbox.dom.remove(this.$el);
        },

        /**
         * Binds Dom-Events for a thumbnail
         * @param id {Number|String} the identifier of the thumbnail to bind events on
         */
        bindThumbnailDomEvents: function(id) {
            this.sandbox.dom.on(this.$thumbnails[id], 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                if (!!this.options.selectable) {
                    this.toggleItemSelected(id);
                } else {
                    this.selectItem(id);
                }
            }.bind(this));

            this.sandbox.dom.on(this.$thumbnails[id], 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                this.downloadHandler(id);
            }.bind(this), '.' + constants.downloadClass);

            this.sandbox.dom.on(this.$thumbnails[id].find('img'), 'error', function() {
                this.$thumbnails[id].find('img').remove();
            }.bind(this));

            this.sandbox.dom.on(this.$thumbnails[id].find('img'), 'load', function() {
                this.$thumbnails[id].find('.fa-coffee').remove();
            }.bind(this));

            if (!!this.options.selectable) {
                this.sandbox.dom.on(this.$thumbnails[id], 'dblclick', function() {
                    this.datagrid.itemAction.call(this.datagrid, id);
                    this.selectItem(id);
                }.bind(this));
            }
        },

        /**
         * Selects a record with a given id
         * @param recordId {Number|String} the id of the record to select or deselect
         */
        selectRecord: function(recordId) {
            this.selectItem(recordId, false);
        },

        /**
         * Deselects all records
         */
        deselectAllRecords: function() {
            this.unselectAll();
        },

        /**
         * Toggles an item with a given id selected or unselected
         * @param id {Number|String} the id of the item
         */
        toggleItemSelected: function(id) {
            if (this.datagrid.itemIsSelected.call(this.datagrid, id) === true) {
                this.unselectItem(id, false);
            } else {
                this.selectItem(id, false);
            }
        },

        /**
         * Selects an item with a given id
         * @param id {Number|String} the id of the item
         * @param onlyView {Boolean} if true the selection only affects this view and not the data array
         */
        selectItem: function(id, onlyView) {
            if (!!this.options.selectable) {
                this.sandbox.dom.addClass(this.$thumbnails[id], constants.selectedClass);
                if (!this.sandbox.dom.is(this.sandbox.dom.find('input[type="checkbox"]', this.$thumbnails[id]), ':checked')) {
                    this.sandbox.dom.prop(this.sandbox.dom.find('input[type="checkbox"]', this.$thumbnails[id]), 'checked', true);
                }
                if (onlyView !== true) {
                    this.datagrid.setItemSelected.call(this.datagrid, id);
                }
            } else {
                this.datagrid.itemAction(id);
            }
        },

        /**
         * Unselects an item with a given id
         * @param id {Number|String} the id of the item
         * @param onlyView {Boolean} if true the selection only affects this view and not the data array
         */
        unselectItem: function(id, onlyView) {
            this.sandbox.dom.removeClass(this.$thumbnails[id], constants.selectedClass);
            if (this.sandbox.dom.is(this.sandbox.dom.find('input[type="checkbox"]', this.$thumbnails[id]), ':checked')) {
                this.sandbox.dom.prop(this.sandbox.dom.find('input[type="checkbox"]', this.$thumbnails[id]), 'checked', false);
            }
            if (onlyView !== true) {
                this.datagrid.setItemUnselected.call(this.datagrid, id);
            }
        },

        /**
         * Adds a record to the view
         * @param record
         * @public
         */
        addRecord: function(record, appendAtBottom) {
            this.renderThumbnails([record], appendAtBottom);
        },

        /**
         * Handles the click onto the download button of an item
         * @param id {Number|String} the id of the item
         */
        downloadHandler: function(id) {
            this.sandbox.emit(DOWNLOAD_CLICKED.call(this), id);
        },

        /**
         * Removes a data record from the view
         * @param recordId {Number|String} the records identifier
         * @returns {Boolean} true if deleted succesfully
         */
        removeRecord: function(recordId) {
            if (!!this.$thumbnails[recordId]) {
                this.sandbox.dom.remove(this.$thumbnails[recordId]);
                this.datagrid.removeRecord.call(this.datagrid, recordId);
                return true;
            }
            return false;
        },

        /**
         * Unselects all thumbnails
         */
        unselectAll: function() {
            this.sandbox.util.each(this.$thumbnails, function(id) {
                this.unselectItem(id, true);
            }.bind(this));
            this.datagrid.deselectAllItems.call(this.datagrid);
        }
    };
});

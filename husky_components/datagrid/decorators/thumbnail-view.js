/**
 * @class ThumbnailView (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [viewOptions] Configuration object
 *
 * @param {Boolean} [rendered] property used by the datagrid-main class
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the view and unbind events
 *
 */
define(function() {

    'use strict';

    /**
     * Variable to store the datagrid context
     */
    var datagrid,

        defaults = {
            matchings: []
        },

        constants = {
            containerClass: 'thumbnail-container',
            itemClass: 'item',
            smallClass: 'small',
            titleClass: 'title',
            extensionClass: 'extension',
            sizeClass: 'size',
            thumbnailSrcProperty: 'thumb',
            thumbnailAltProperty: 'alt',
            idProperty: 'id'
        },

        templates = {
            itemSmall: [
                '<div class="'+ constants.itemClass +' '+ constants.smallClass +'">',
                '<img src="<%= imgSrc %>" alt="<%= imgAlt %>"/>',
                '<span class="'+ constants.titleClass +'"><%= title %></span>',
                '<span class="'+ constants.extensionClass +'"><%= extension %></span>',
                '<span class="'+ constants.sizeClass +'"><%= fileSize %></span>',
                '</div>'
            ].join('')
        };

    return {

        /**
         * Initializes the view, gets called only once
         * @param {Object} the context of the datagrid class
         * @param {Object} the options used by the view
         */
        initialize: function(context, options) {
            // context of the datagrid-component
            datagrid = context;

            // make sandbox available in this-context
            this.sandbox = datagrid.sandbox;

            // merge defaults with options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
        },

        /**
         * Sets the starting variables for the view
         */
        setVariables: function() {
            this.rendered = false;
            this.data = null;
            this.$el = null;
        },

        /**
         * Method to render data in this view
         */
        render: function(data, $container) {
            this.$el = this.sandbox.dom.createElement('<div class="'+ constants.containerClass +'"/>');
            this.sandbox.dom.append($container, this.$el);
            this.data = data;

            this.renderThumbnails();

            this.rendered = true;
        },

        /**
         * Parses the data and passes it to a render function
         */
        renderThumbnails: function() {
            var imgSrc, imgAlt, title, extension, fileSize, id;

            // loop through each data record
            this.sandbox.util.foreach(this.data.embedded, function(record) {
                imgSrc = imgAlt = title = extension = fileSize = '';

                // foreach matching configured get the corresponding datum from the record
                this.sandbox.util.foreach(this.options.matchings, function(matching) {

                    if (matching.type === datagrid.types.THUMBNAIL) {
                        imgSrc = record[matching.attribute][constants.thumbnailSrcProperty];
                        imgAlt = record[matching.attribute][constants.thumbnailAltProperty];
                    } else if (matching.type === datagrid.types.TITLE) {
                        title = record[matching.attribute];
                    } else if (matching.type === datagrid.types.EXTENSION) {
                        extension = record[matching.attribute];
                    } else if (matching.type === datagrid.types.FILESIZE) {
                        fileSize = record[matching.attribute];
                    }
                }.bind(this));

                id = record[constants.idProperty]

                // pass the found data to a render method
                this.renderThumbnail(id, imgSrc, imgAlt, title, extension, fileSize);
            }.bind(this));
        },

        /**
         * Renders the actual thumbnail element
         * @param id {String|Number} the identifier of the data record
         * @param imgSrc {String} the thumbnail src of the data record
         * @param imgAlt {String} the thumbnail alt tag of the data record
         * @param title {String} the title of the data record
         * @param extension {String} the extension of the data record
         * @param fileSize {String} the fileSize of the data record
         */
        renderThumbnail: function(id, imgSrc, imgAlt, title, extension, fileSize) {
            console.log(id, imgSrc, imgAlt, title, extension, fileSize);
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.sandbox.dom.remove(this.$el);
        }
    };
});

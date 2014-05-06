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

        },

        constants = {
            containerClass: 'thumbnail-container'
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
         * Renders the actual thumbnails
         */
        renderThumbnails: function() {
            for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                console.log(this.data.embedded[i]);
            }
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.sandbox.dom.remove(this.$el);
        }
    };
});

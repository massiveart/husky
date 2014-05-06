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
            this.$el = this.sandbox.dom.createElement('<div/>');
            this.sandbox.dom.append($container, this.$el);

            this.sandbox.dom.html(this.$el, JSON.stringify(data));

            this.rendered = true;
        },

        /**
         * Destroys the view
         */
        destroy: function() {
            this.sandbox.dom.remove(this.$el);
        }
    };
});

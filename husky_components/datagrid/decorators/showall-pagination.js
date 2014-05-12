/**
 * @class ShowAllPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 *
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [rerender] function to rerender itself
 * @param {Function} [destroy] function to destroy the pagination and unbind events
 */
define(function () {

    'use strict';

    /**
     * Variable to store the datagrid context
     */
    var datagrid,

        defaults = {
            pageSize: 10
        },

        constants = {
            paginationClass: 'pagination-wrapper showall',
            squareClass: 'square',
            textClass: 'text'
        },

        /**
         * Translation keys used by this class
         */
            translations = {
            showAll: 'pagination.show-all',
            elements: 'pagination.elements'
        },

        /**
         * Templates used by this class
         */
            templates = {
            structure: [
                '<div class="' + constants.squareClass + '"></div>',
                '<div class="' + constants.textClass + '">',
                translations.showAll,
                ' <strong><%= number %></strong> ',
                translations.elements,
                '</div>'
            ].join('')
        };

    return {

        /**
         * Initailizes the pagination
         * @param {Object} the context of the datagrid
         * @param {Object} the options used by this pagination
         */
        initialize: function (context, options) {
            // context of the datagrid-component
            datagrid = context;

            // make sandbox available in this-context
            this.sandbox = datagrid.sandbox;

            // merge defaults with pagination options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
        },

        /**
         * Renders the pagination
         */
        render: function (data, $container) {
            this.$el = $container;
            this.data = data;

            this.$paginationContainer = this.sandbox.dom.createElement('<div class="' + constants.paginationClass + '"/>');
            this.sandbox.dom.html(this.$paginationContainer, this.sandbox.util.template(templates.structure)({
                number: this.data.numberOfAll
            }));

            this.sandbox.dom.append(this.$el, this.$paginationContainer);

            this.bindDomEvents();
        },

        /**
         * Rerenders the pagination
         */
        rerender: function () {
            this.destroy();
            this.render(this.data, this.$el);
        },

        /**
         * Returns the pagination page size
         * @returns {Number} current Page size
         */
        getPageSize: function () {
            return this.options.pageSize;
        },

        /**
         * Sets the classes properties
         */
        setVariables: function () {
            this.$el = null;
            this.$paginationContainer = null;
            this.data = null;
        },

        /**
         * Destroys the pagination
         */
        destroy: function () {
            this.unbindDomEvents();
            this.sandbox.dom.remove(this.$paginationContainer);
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function () {
            this.sandbox.dom.on(this.$paginationContainer, 'click', function() {
                this.showAll();
            }.bind(this));
        },

        /**
         * Shows all elements in the datagrid
         */
        showAll: function() {
            datagrid.changePage.call(datagrid, this.data.links.all);
        },

        /**
         * Unbinds all events from the class
         */
        unbindDomEvents: function () {
            this.sandbox.dom.off(this.$paginationContainer);
        }
    };
});

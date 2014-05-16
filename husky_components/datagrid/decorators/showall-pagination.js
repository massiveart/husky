/**
 * @class ShowAllPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 * @param {Number} [paginationOptions.pageSize] maximum elements per page
 * @param {Function} [paginationOptions.showAllHandler] function to call if pagination is clicked. Default action gets not executed if set
 *
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [rerender] function to rerender itself
 * @param {Function} [destroy] function to destroy the pagination and unbind events
 */
define(function () {

    'use strict';

    var defaults = {
            pageSize: 9,
            showAllHandler: null
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
            showOnly: 'pagination.show-only',
            elements: 'pagination.elements'
        },

        /**
         * Templates used by this class
         */
            templates = {
            structure: [
                '<div class="' + constants.squareClass + '"></div>',
                '<div class="' + constants.textClass + '">',
                    '<%= desc %>',
                    '<strong><%= number %></strong> ',
                    translations.elements,
                '</div>'
            ].join('')
        };

    return {

        /**
         * Initializes the pagination
         * @param {Object} context The context of the datagrid
         * @param {Object} options The options used by this pagination
         */
        initialize: function (context, options) {
            // context of the datagrid-component
            this.datagrid = context;

            // make sandbox available in this-context
            this.sandbox = this.datagrid.sandbox;

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
            if (this.data.numberOfAll > this.data.total) {
                this.renderShowAll();
            } else if (this.data.numberOfAll > this.options.pageSize) {
                this.renderShowOnly();
            } else {
                return false;
            }

            this.sandbox.dom.append(this.$el, this.$paginationContainer);

            this.bindDomEvents();

            return true;
        },

        /**
         * Renders the markup for showing all records
         */
        renderShowAll: function() {
            this.sandbox.dom.html(this.$paginationContainer, this.sandbox.util.template(templates.structure)({
                desc: translations.showAll,
                number: this.data.numberOfAll
            }));
        },

        /**
         * Renders the markup for not showing all records
         */
        renderShowOnly: function() {
            this.sandbox.dom.html(this.$paginationContainer, this.sandbox.util.template(templates.structure)({
                desc: translations.showOnly,
                number: this.options.pageSize
            }));
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
                if (this.data.numberOfAll > this.data.total) {
                    this.showAll();
                } else {
                    this.showOnly();
                }
            }.bind(this));
        },

        /**
         * Shows all elements in the datagrid
         * or just executes the handler if passed
         */
        showAll: function() {
            if (typeof this.options.showAllHandler !== 'function') {
                this.datagrid.changePage.call(this.datagrid, this.data.links.all);
            } else {
                this.options.showAllHandler();
            }
        },

        /**
         * Shows only the configured amount of elements in the datagrid
         */
        showOnly: function() {
            this.datagrid.changePage.call(this.datagrid, null, 1, this.options.pageSize);
        },

        /**
         * Unbinds all events from the class
         */
        unbindDomEvents: function () {
            this.sandbox.dom.off(this.$paginationContainer);
        }
    };
});

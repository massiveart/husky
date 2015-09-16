/**
 * @class InfiniteScrollPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 * @param {Number} [options.limit] Data records per page
 * @param {Number} [options.scrollContainer] CSS selector of the element which holds the datagrid items and is scrollable
 *
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the pagination and unbind events
 * @param {Function} [getHeight] function which returns the height of the pagination
 */
define(function() {

    'use strict';

    var defaults = {
            scrollContainer: '.page',
            limit: 20
        },

        constants = {
            paginationClass: 'pagination-wrapper infinite-scroll',
            paginationElementClass: 'pagination',
            loaderClass: 'pagination-loader'
        },

        /**
         * Templates used by this class
         */
        templates = {
            paginationContainer: [
                '<div class="' + constants.paginationClass + '">',
                '   <div class="' + constants.loaderClass + '"/>',
                '</div>'
            ].join('')
        };

    return {

        /**
         * Initializes the pagination
         * @param {Object} context The context of the datagrid
         * @param {Object} options The options used by this pagination
         */
        initialize: function(context, options) {
            // context of the datagrid-component
            this.datagrid = context;

            // make sandbox available in this-context
            this.sandbox = this.datagrid.sandbox;

            // merge defaults with pagination options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
        },

        /**
         * Sets the classes properties
         */
        setVariables: function() {
            this.$el = null;
            this.$paginationContainer = null;
            this.$loader = null;
            this.data = null;
        },

        /**
         * Returns the total height of the pagination
         * @returns {number}
         */
        getHeight: function() {
            return this.sandbox.dom.outerHeight(this.$paginationContainer, true);
        },

        /**
         * Renders the pagination
         */
        render: function(data, $container) {
            this.$el = $container;
            this.data = data;

            this.$paginationContainer = this.sandbox.dom.createElement(templates.paginationContainer);
            this.$loader = $(this.$paginationContainer).find('.' + constants.loaderClass);
            this.sandbox.dom.append(this.$el, this.$paginationContainer);

            this.startLoader();
            this.bindInfiniteScroll();
            this.fillScrollContainer();
        },

        /**
         * Starts a small loader
         */
        startLoader: function() {
            this.sandbox.start([
                {
                    name: 'loader@husky',
                    options: {
                        el: this.$loader,
                        size: '40px',
                        color: '#cccccc'
                    }
                }
            ]);
            this.$loader.css('opacity', '0');
        },

        /**
         * Returns the pagination page size
         * @returns {Number} current limit
         */
        getLimit: function() {
            return this.options.limit;
        },

        /**
         * Destroys the pagination
         */
        destroy: function() {
            // stop components
            this.sandbox.stop(this.sandbox.dom.find('*', this.$paginationContainer));
            // unbind events
            this.sandbox.dom.unbind(this.sandbox.dom.find('*', this.$paginationContainer));
            this.sandbox.infiniteScroll.destroy(this.options.scrollContainer);
            // remove container
            this.sandbox.dom.remove(this.$paginationContainer);
        },

        /**
         * Binds dom related events
         */
        bindInfiniteScroll: function() {
            this.sandbox.infiniteScroll.initialize(this.options.scrollContainer, this.appendNextPage.bind(this));
        },

        fillScrollContainer: function() {
            if ($(this.options.scrollContainer)[0].clientHeight >= $(this.options.scrollContainer)[0].scrollHeight){
                this.appendNextPage().then(function(hasNextPage) {
                    if (hasNextPage) {
                        this.fillScrollContainer();
                    }
                }.bind(this));
            }
        },

        appendNextPage: function() {
            var promise = $.Deferred();

            if (!!this.datagrid.data.links && !!this.datagrid.data.links.next) {
                this.$loader.css('opacity', '1');

                this.sandbox.util.load(this.datagrid.data.links.next.href).then(function(data) {
                    this.updateDatagrid(data);
                    this.$loader.css('opacity', '0');

                    promise.resolve(true);
                }.bind(this))
            } else {
                promise.resolve(false);
            }

            return promise;
        },

        updateDatagrid: function(data) {
            this.datagrid.data.links = this.datagrid.parseLinks(data._links);
            this.datagrid.data.total = data.total;
            this.datagrid.data.page = data.page;
            this.datagrid.data.pages = data.pages;
            this.datagrid.data.limit = data.limit;

            this.addRecordsToDatagrid(data._embedded[this.datagrid.options.resultKey]);
        },

        addRecordsToDatagrid: function(records) {
            this.sandbox.util.foreach(records, function(record) {
                if (!!record.id) {
                    this.datagrid.data.embedded.push(record);
                    this.datagrid.gridViews[this.datagrid.viewId].addRecord(record);
                }
            }.bind(this));
        }
    };
});

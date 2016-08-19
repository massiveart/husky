/**
 * @class InfiniteScrollPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 * @param {Number} [options.limit] Data records per page
 * @param {Number} [options.scrollContainer] CSS selector of the scrollable container which contains the records
 * @param {Number} [options.reachedBottomMessage] message or translation key to display when all items are loaded
 * @param {Number} [options.scrollOffset] Defines an offset to the bottom, new pages are loaded when reaching this offset
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
            reachedBottomMessage: 'you reached the end of the list',
            scrollOffset: 0,
            limit: 50
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
                '   <span class="pagination-message"><%= reachedBottomMessage %></span>',
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

            this.$paginationContainer = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.paginationContainer, {
                    reachedBottomMessage: this.sandbox.translate(this.options.reachedBottomMessage)
                })
            );

            this.$loader = $(this.$paginationContainer).find('.' + constants.loaderClass);
            this.sandbox.dom.append(this.$el, this.$paginationContainer);

            this.startLoader();
            this.bindInfiniteScroll();
            this.fillScrollContainer();
        },

        /**
         * Starts a small loader in pagination container. loader is hidde per css
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
         * Binds the scroll event in the given scrollContainer
         */
        bindInfiniteScroll: function() {
            this.sandbox.infiniteScroll.initialize(
                this.options.scrollContainer, this.appendNextPage.bind(this), this.options.scrollOffset
            );
        },

        /**
         * Add records to the datagrid until scroll-container is filled or all records are displayed
         */
        fillScrollContainer: function() {
            var $scrollContainer = $(this.options.scrollContainer);

            // check if scroll-container has an scroll-bar
            if ($scrollContainer[0].clientHeight >= $scrollContainer[0].scrollHeight) {
                // check if there are unrendered items
                if (!!this.datagrid.data.links && !!this.datagrid.data.links.next) {
                    this.appendNextPage().then(function() {
                        this.fillScrollContainer();
                    }.bind(this));
                }
            }
        },

        /**
         * Load next page and append records at the bottom of the datagrid
         * If there isn't a next page, render a reached-bottom message
         * @returns {*}
         */
        appendNextPage: function() {
            var promise = $.Deferred();

            if (!!this.datagrid.data.links && !!this.datagrid.data.links.next) {
                this.$paginationContainer.addClass('loading');

                this.sandbox.util.load(this.datagrid.data.links.next.href).then(function(data) {
                    this.updateDatagrid(data);
                    this.$paginationContainer.data('showReachedEnd', true);
                    this.$paginationContainer.removeClass('loading');

                    promise.resolve();
                }.bind(this))
            } else {
                if (!!this.$paginationContainer.data('showReachedEnd')) {
                    this.$paginationContainer.addClass('reached-end');
                }
                promise.resolve();
            }

            return promise;
        },

        /**
         * Update datagrid properties to the given data
         * Append embedded records to the datagrid
         * @param data
         */
        updateDatagrid: function(data) {
            this.datagrid.data.links = this.datagrid.parseLinks(data._links);
            this.datagrid.data.total = data.total;
            this.datagrid.data.page = data.page;
            this.datagrid.data.pages = data.pages;
            this.datagrid.data.limit = data.limit;

            this.addRecordsToDatagrid(data._embedded[this.datagrid.options.resultKey]);
        },

        /**
         * Append given records tothe bottom of the datagrid
         * @param records
         */
        addRecordsToDatagrid: function(records) {
            var recordsToAdd = [];
            records.forEach(function(record) {
                if (!!record.id) {
                    recordsToAdd.push(record);
                    this.datagrid.data.embedded.push(record);
                }
            }.bind(this));

            // Add records all at once if possible
            if (!!this.datagrid.gridViews[this.datagrid.viewId].addRecords) {
                this.datagrid.gridViews[this.datagrid.viewId].addRecords(recordsToAdd, true);
            } else {
                recordsToAdd.forEach(function(record) {
                    this.datagrid.gridViews[this.datagrid.viewId].addRecord(record, true);
                }.bind(this));
            }
        }
    };
});

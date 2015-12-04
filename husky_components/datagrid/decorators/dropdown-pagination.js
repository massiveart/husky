/**
 * @class DropdownPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 * @param {Array} [options.showElementsSteps] Array which contains the steps for the Show-Elements-dropdown as integers
 * @param {Number} [options.limit] Data records per page
 *
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the pagination and unbind events
 * @param {Function} [getHeight] function which returns the height of the pagination
 */
define(function() {

    'use strict';

    var defaults = {
            showElementsSteps: [10, 20, 50, 100, 200],
            limit: 20
        },

        constants = {
            paginationClass: 'pagination-wrapper dropdowns',
            paginationElementClass: 'pagination',
            prevClass: 'previous',
            nextClass: 'next',
            inputClass: 'page-input',
            pageLabelClass: 'page-label',
            sizeChangeClass: 'size-change',
            loaderClass: 'pagination-loader'
        },

        /**
         * Templates used by this class
         */
        templates = {
            pageLabel: [
                '<div class="', constants.pageLabelClass, '">',
                '    <%= translate("pagination.page") %>',
                '    <input type="text" class="form-element ', constants.inputClass, '" value="<%= i %>" />',
                '    <%= translate("pagination.of") %> <%= pages %>',
                '</div>'
            ].join(''),

            pageChanger: [
                '<span class="inline-block"><%= label %></span>',
                '<div class="', constants.nextClass, ' pagination-prev pull-right pointer"></div>',
                '<div class="' + constants.prevClass + ' pagination-next pull-right pointer"></div>'
            ].join(''),

            loader: [
                '<div class="', constants.loaderClass, '"></div>'
            ].join(''),

            showElements: [
                '<div class="show-elements">',
                '<span class="text"><%= translate(text) %>:</span>',
                '<div class="' + constants.sizeChangeClass + ' dropdown-trigger">',
                '<%= desc %>',
                '<span class="dropdown-toggle"></span>',
                '</div>',
                '</div>'
            ].join('')
        },

        /**
         * Translation keys used by this class
         */
        translations = {
            show: 'pagination.show',
            elementsOf: 'pagination.elements-of',
            elementsPerPage: 'pagination.elements-per-page'
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
            this.bindCustomEvents();
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

            this.$paginationContainer = this.sandbox.dom.createElement('<div class="' + constants.paginationClass + '"/>');
            this.preparePagination();
            this.sandbox.dom.append(this.$el, this.$paginationContainer);
            this.bindDomEvents();
        },

        /**
         * Returns the pagination page size
         * @returns {Number} current limit
         */
        getLimit: function() {
            return this.options.limit;
        },

        /**
         * Sets the classes properties
         */
        setVariables: function() {
            this.$el = null;
            this.$paginationContainer = null;
            this.data = null;
        },

        /**
         * Destroys the pagination
         */
        destroy: function() {
            this.sandbox.stop(this.sandbox.dom.find('*', this.$paginationContainer));
            this.unbindDomEvents();
            this.sandbox.dom.remove(this.$paginationContainer);
        },

        /**
         * Binds custom related events
         */
        bindCustomEvents: function() {
            // show-elements dropdown item clicked
            this.sandbox.on('husky.dropdown.' + this.datagrid.options.instanceName + '-pagination-dropdown-show.item.click', function(item) {
                if (this.data.limit !== item.id || this.data.embedded.length === this.data.total) {
                    this.startLoader();
                    // always jump to the first page
                    this.datagrid.changePage.call(this.datagrid, null, 1, item.id);
                }
            }.bind(this));
        },

        /**
         * Starts a small loader
         */
        startLoader: function() {
            var $container = this.sandbox.dom.createElement(templates.loader);
            this.sandbox.dom.append(this.$paginationContainer, $container);
            this.sandbox.start([
                {
                    name: 'loader@husky',
                    options: {
                        el: $container,
                        size: '20px',
                        color: '#999999'
                    }
                }
            ]);
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function() {
            var $element = this.sandbox.dom.find('input.' + constants.inputClass, this.$el),
                fontSize = parseInt($element.css('font-size'), 10),
                minWidth = parseInt($element.css('min-width'), 10),
                maxWidth = parseInt($element.css('max-width'), 10);

            // next page
            this.sandbox.dom.on(
                this.sandbox.dom.find('.' + constants.nextClass, this.$el),
                'click',
                this.nextPage.bind(this)
            );

            // previous page
            this.sandbox.dom.on(
                this.sandbox.dom.find('.' + constants.prevClass, this.$el),
                'click',
                this.prevPage.bind(this)
            );

            this.sandbox.dom.on(
                $element,
                'focusout',
                this.inputHandler.bind(this)
            );

            this.sandbox.dom.on(
                $element,
                'keydown',
                function() {
                    if (event.which === 13) {
                        this.inputHandler(event);
                        return;
                    }

                    var width = 50 + (($element.val().length * fontSize) / 2);

                    if (width > minWidth && width <= maxWidth) {
                        $element.css({width: width + 'px'});
                    }
                }.bind(this)
            );
        },

        inputHandler: function(event) {
            var $element = this.sandbox.dom.find(event.currentTarget),
                page = parseInt($element.val(), 10);

            if (isNaN(page)) {
                $element.val(this.data.page);
                return;
            }

            if (page < 1) {
                page = 1;
            }

            if (page > this.data.pages) {
                page = this.data.pages;
            }

            if (page === this.data.page) {
                return;
            }

            this.startLoader();
            this.datagrid.changePage.call(this.datagrid, null, page);
        },

        /**
         * Triggers a page change to the next change
         */
        nextPage: function() {
            if (!!this.data.links.next) {
                this.startLoader();
                this.datagrid.changePage.call(this.datagrid, this.data.links.next.href);
            }
        },

        /**
         * Triggers a page change to the previous page
         */
        prevPage: function() {
            if (!!this.data.links.previous) {
                this.startLoader();
                this.datagrid.changePage.call(this.datagrid, this.data.links.previous.href);
            }
        },

        /**
         * Unbinds all events from the class
         */
        unbindDomEvents: function() {
            this.sandbox.dom.unbind(this.sandbox.dom.find('*', this.$paginationContainer));
            this.sandbox.dom.unbind(this.$paginationContainer);
        },

        /**
         * Delegates the rendering of the pagination when pagination is needed
         * @returns {*}
         */
        preparePagination: function() {
            var $pagination,
                $showElements,
                paginationLabel,
                description;

            // if first defined step is bigger than the number of all elements don't display show-elements dropdown
            if (this.data.total > this.options.showElementsSteps[0]) {
                description = this.data.embedded.length;
                $showElements = this.sandbox.dom.createElement(this.sandbox.util.template(templates.showElements)({
                    desc: description,
                    text: translations.elementsPerPage,
                    translate: this.sandbox.translate
                }));
                this.sandbox.dom.append(this.$paginationContainer, '<span></span>');
                this.sandbox.dom.append(this.$paginationContainer, $showElements);

                this.prepareShowElementsDropdown();
            }

            if (parseInt(this.data.pages, 10) > 1) {
                $pagination = this.sandbox.dom.createElement('<div/>');
                $pagination.addClass(constants.paginationElementClass);

                this.sandbox.dom.append(this.$paginationContainer, $pagination);

                paginationLabel = this.renderPaginationRow(this.data.page, this.data.pages);

                this.sandbox.dom.append($pagination, this.sandbox.util.template(templates.pageChanger)({
                    label: paginationLabel
                }));
            }
        },

        /**
         * Renders template for one row in the pagination
         * @param i current page number
         * @param pages total number of pages
         */
        renderPaginationRow: function(i, pages) {
            var defaults = {
                translate: this.sandbox.translate,
                i: i,
                pages: pages
            };

            return this.sandbox.util.template(templates.pageLabel, defaults);
        },

        /**
         * Prepares and initializes the dropdown for showing elements
         */
        prepareShowElementsDropdown: function() {
            var i, length, data = [];

            for (i = -1, length = this.options.showElementsSteps.length; ++i < length;) {
                data.push({
                    id: this.options.showElementsSteps[i],
                    name: this.options.showElementsSteps[i]
                });
            }

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: this.sandbox.dom.find('.' + constants.sizeChangeClass, this.$paginationContainer),
                        setParentDropDown: true,
                        instanceName: this.datagrid.options.instanceName + '-pagination-dropdown-show',
                        alignment: 'left',
                        verticalAlignment: this.options.verticalAlignment,
                        data: data
                    }
                }
            ]);
        }
    };
});

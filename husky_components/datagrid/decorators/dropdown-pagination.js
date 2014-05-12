/**
 * @class DropdownPagination (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [paginationOptions] Configuration object
 * @param {Array} [options.showElementsSteps] Array which contains the steps for the Show-Elements-dropdown as integers
 * @param {Number} [options.pageSize] Data records per page
 *
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the pagination and unbind events
 */
define(function() {

    'use strict';

    /**
     * Variable to store the datagrid context
     */
    var datagrid,

        defaults = {
            showElementsSteps: [10, 20, 50, 100, 500],
            pageSize: 4
        },

        constants = {
            paginationClass: 'pagination-wrapper dropdowns',
            paginationElementClass: 'pagination',
            prevClass: 'previous',
            nextClass: 'next',
            pageChangeClass: 'page-change',
            sizeChangeClass: 'size-change'
        },

        /**
         * Templates used by this class
         */
        templates = {
            pageLabel: [
                '<%=translate("pagination.page")%>',
                '<strong> <%= i %> </strong>',
                '<%=translate("pagination.of")%> <%= pages %>'
            ].join(''),

            pageChanger: [
                '<div class="', constants.nextClass ,' pagination-prev pull-right pointer"></div>',
                '<div class="', constants.pageChangeClass ,' pagination-main pull-right pointer">',
                    '<span class="inline-block"><%= label %></span>',
                    '<span class="dropdown-toggle inline-block"></span>',
                '</div>',
                '<div class="'+ constants.prevClass +' pagination-next pull-right pointer"></div>'
            ].join(''),

            showElements: [
                '<div class="show-elements">',
                    '<div class="'+ constants.sizeChangeClass +' dropdown-trigger">',
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
            showAllElements: 'pagination.show-all-elements',
            show: 'pagination.show',
            elementsOf: 'pagination.elements-of',
            elementsPerPage: 'pagination.elements-per-page'
        };

    return {

        /**
         * Initailizes the pagination
         * @param {Object} the context of the datagrid
         * @param {Object} the options used by this pagination
         */
        initialize: function(context, options) {
            // context of the datagrid-component
            datagrid = context;

            // make sandbox available in this-context
            this.sandbox = datagrid.sandbox;

            // merge defaults with pagination options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
            this.bindCustomEvents();
        },

        /**
         * Renders the pagination
         */
        render: function(data, $container) {
            this.$el = $container;
            this.data = data;

            this.$paginationContainer = this.sandbox.dom.createElement('<div class="'+ constants.paginationClass +'"/>');
            this.preparePagination();
            this.sandbox.dom.append(this.$el, this.$paginationContainer);

            this.preparePaginationDropdown();
            this.prepareShowElementsDropdown();

            this.bindDomEvents();
        },

        /**
         * Rerenders the pagination
         */
        rerender: function() {
            this.destroy();
            this.render(this.data, this.$el);
        },

        /**
         * Returns the pagination page size
         * @returns {Number} current Page size
         */
        getPageSize: function() {
            return this.options.pageSize;
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
            this.unbindDomEvents();
            // uncommented just for testing purposes, if you see this uncomment it!!
            //this.sandbox.stop(this.sandbox.dom.find('*', this.$paginationContainer));
            this.sandbox.dom.remove(this.$paginationContainer);
        },

        /**
         * Binds custom related events
         */
        bindCustomEvents: function() {
            // pagination dropdown item clicked
            this.sandbox.on('husky.dropdown.'+ datagrid.options.instance +'-pagination-dropdown.item.click', function(item) {
                datagrid.changePage.call(datagrid, null, item.id);
            }.bind(this));

            // show-elements dropdown item clicked
            this.sandbox.on('husky.dropdown.'+ datagrid.options.instance +'-pagination-dropdown-show.item.click', function(item) {
                if (this.data.pageSize !== item.id || this.data.total === this.data.numberOfAll) {
                    // show all
                    if (item.id === 0) {
                        // only if not already all are shown
                        if (this.data.total !== this.data.numberOfAll) {
                            datagrid.changePage.call(datagrid, this.data.links.all);
                        }
                    } else {
                        // always jump to the first page
                        datagrid.changePage.call(datagrid, null, 1, item.id);
                    }
                }
            }.bind(this));
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function() {
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
        },

        /**
         * Triggers a page change to the next change
         */
        nextPage: function() {
            if (!!this.data.links.next) {
                datagrid.changePage.call(datagrid, this.data.links.next);
            }
        },

        /**
         * Triggers a page change to the previous page
         */
        prevPage: function() {
            if (!!this.data.links.prev) {
                datagrid.changePage.call(datagrid, this.data.links.prev);
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
            if (this.data.numberOfAll > this.options.showElementsSteps[0]) {
                if (this.data.total === this.data.numberOfAll) {
                    description = this.sandbox.translate(translations.showAllElements);
                } else {
                    description = this.sandbox.translate(translations.show) +
                                  ' <strong>'+ this.data.total +'</strong> '+
                                  this.sandbox.translate(translations.elementsOf) +' '+ this.data.numberOfAll;
                }
                $showElements = this.sandbox.dom.createElement(this.sandbox.util.template(templates.showElements)({
                    'desc': description
                }));
                this.sandbox.dom.append(this.$paginationContainer, $showElements);
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
         * Prepares and initializes the dropdown used for the pagination
         */
        preparePaginationDropdown: function() {

            var data = [], i, name;

            for (i = 1; i <= this.data.pages; i++) {
                name = this.renderPaginationRow(i, this.data.pages);
                data.push({id: i, name: name});
            }

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: this.sandbox.dom.find('.' + constants.pageChangeClass, this.$paginationContainer),
                        setParentDropDown: true,
                        instanceName: datagrid.options.instance + '-pagination-dropdown',
                        alignment: 'right',
                        data: data
                    }
                }
            ]);
        },

        /**
         * Prepares and initializes the dropdown for showing elements
         */
        prepareShowElementsDropdown: function() {
            var i, length, data = [];

            for(i = -1, length = this.options.showElementsSteps.length; ++i < length;) {
                if (this.options.showElementsSteps[i] > this.data.numberOfAll) {
                    break;
                }
                data.push({
                    id: this.options.showElementsSteps[i],
                    name: '<strong>'+ this.options.showElementsSteps[i] +'</strong> ' + this.sandbox.translate(translations.elementsPerPage)
                });
            }

            data.push({divider: true});
            data.push({
                id: 0,
                name: this.sandbox.translate(translations.showAllElements)
            });

            this.sandbox.start([
                {
                    name: 'dropdown@husky',
                    options: {
                        el: this.sandbox.dom.find('.' + constants.sizeChangeClass, this.$paginationContainer),
                        setParentDropDown: true,
                        instanceName: datagrid.options.instance + '-pagination-dropdown-show',
                        alignment: 'left',
                        data: data
                    }
                }
            ]);
        }
    };
});

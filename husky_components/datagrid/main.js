/**
 * @class DataGrid
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {Boolean} [options.autoRemoveHandling] raises an event before a row is removed
 * @param {Array} [options.fieldsData] fields data will extend url and set tableHead automatically
 * @param {Object} [options.fieldsData.{}] fields object
 * @param {String} [options.fieldsData.{}.id] field name
 * @param {String} [options.fieldsData.{}.translation] translation key which will be translated automatically
 * @param {String} [options.fieldsData.{}.disabled] either 'true' or 'false'
 * @param {Boolean} [options.editable] will not set class is-selectable to prevent hover effect for complete rows
 * @param {String} [options.className] additional classname for the wrapping div
 * @param {Object} [options.data] if no url is provided (some functionality like search & sort will not work)
 * @param {String} [options.defaultMeasureUnit=px] the unit that should be taken
 * @param {String} [options.elementType=table] type of datagrid (currently only table is available)
 * @param {Array} [options.excludeFields=[id]] array of field to exclude
 * @param {Boolean} [options.pagination=false] display a pagination
 * @param {Object} [options.paginationOptions] Configuration Object for the pagination
 * @param {Number} [options.paginationOptions.pageSize] Number of items per page
 * @param {Boolean} [options.paginationOptions.showPages] show pages as visual numbers
 * @param {Number} [options.pageSize] lines per page
 * @param {Number} [options.showPages] amount of pages that will be shown
 * @param {Boolean} [options.removeRow] displays in the last column an icon to remove a row
 * @param {Object} [options.selectItem] Configuration object of select item (column)
 * @param {String} [options.selectItem.type] Type of select [checkbox, radio]
 * @param {String} [options.selectItem.width] Width of select column
 * @param {Boolean} [options.sortable] Defines if list is sortable
 * @param {Array} [options.columns] configuration array of columns
 * @param {String} [options.columns.content] column title
 * @param {String} [options.columns.width] width of column
 * @param {String} [options.columns.class] css class of th
 * @param {String} [options.columns.type] type of the column. Used to manipulate its content (e.g. 'date')
 * @param {String} [options.columns.attribute] mapping information to data (if not set it will just iterate of attributes)
 * @param {Boolean} [options.appendTBody] add TBODY to table
 * @param {String} [options.searchInstanceName=null] if set, a listener will be set for the corresponding search event
 * @param {String} [options.columnOptionsInstanceName=null] if set, a listener will be set for listening for column changes
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.paginationTemplate] template for pagination
 * @param {Boolean} [options.validation] enables validation for datagrid
 * @param {Boolean} [options.addRowTop] adds row to the top of the table when add row is triggered
 * @param {Boolean} [options.startTabIndex] start index for tabindex
 * @param {Boolean} [options.progressRow] has to be enabled when datagrid is editable to show progress of save action
 * @param {String} [options.columnMinWidth] sets the minimal width of table columns
 * @param {String|Object} [options.contentContainer] the container which holds the datagrid; this options resizes the contentContainer for responsiveness
 * @param {Array} [options.showElementsSteps] Array which contains the steps for the Show-Elements-dropdown as integers
 * @param {String} [options.fullWidth] If true datagrid style will be full-width mode
 */
(function() {

    require.config({
        paths: {
            decoratorTableView: 'husky_components/datagrid/decorators/tableView'
        }
    });

    define(function() {

        'use strict';

        /**
         *    Default values for options
         */
        var defaults = {
                view: 'table',
                autoRemoveHandling: true,
                editable: false,
                className: 'datagridcontainer',
                elementType: 'table',
                data: null,
                defaultMeasureUnit: 'px',
                excludeFields: ['id'],
                instance: 'datagrid',
                pagination: false,
                fullWidth: false,
                paginationOptions: {
                    pageSize: null,
                    showPages: null
                },
                contentContainer: null,
                removeRow: true,
                selectItem: {
                    type: null,      // checkbox, radio button
                    width: '50px'    // numerous value
                    //clickable: false   // defines if background is clickable TODO do not use until fixed
                },
                sortable: false,
                columns: [],
                url: null,
                appendTBody: true,   // add TBODY to table
                searchInstanceName: null, // at which search it should be listened to can be null|string|empty_string
                columnOptionsInstanceName: null, // at which search it should be listened to can be null|string|empty_string
                paginationTemplate: '<%=translate("pagination.page")%> <strong><%=i%></strong> <%=translate("pagination.of")%> <%=pages%>',
                fieldsData: null,
                validation: false, // TODO does not work for added rows
                validationDebug: false,
                addRowTop: false,
                progressRow: true,
                startTabIndex: 99999,
                columnMinWidth: '70px',
                showElementsSteps: [10, 20, 50, 100, 500]
            },

            types = {
                DATE: 'date'
            },

            views = {
                table: 'decoratorTableView' // name of require-path
            },

            constants = {
                fullWidthClass: 'fullwidth',
                // if datagrid is in fullwidth-mode (options.fullWidth is true)
                // this number gets subracted from the datagrids final width in the resize listener
                overflowIconSpacing: 30
            },

            namespace = 'husky.datagrid.',

        /* TRIGGERS EVENTS */

            /**
             * raised when the the current page changes
             * @event husky.datagrid.page.change
             */
                PAGE_CHANGE = namespace + 'page.change',

            /**
             * raised when the data is updated
             * @event husky.datagrid.updated
             */
                UPDATED = namespace + 'updated',

            /**
             * raised when husky.datagrid.data.get is triggered
             * @event husky.datagrid.data.provide
             */
                DATA_PROVIDE = namespace + 'data.provide',

            /**
             * raised when data is sorted
             * @event husky.datagrid.data.sort
             */
                DATA_SORT = namespace + 'data.sort',


        /* PROVIDED EVENTS */

            /**
             * used to trigger an update of the data
             * @event husky.datagrid.update
             */
                UPDATE = namespace + 'update',

            /**
             * used to filter data by search
             * @event husky.datagrid.data.filter
             * @param {String} searchField
             * @param {String} searchString
             */
                DATA_SEARCH = namespace + 'data.search',

            /**
             * used to filter data by updating an url parameter
             * @event husky.datagrid.url.update
             * @param {Object} url parameter : key
             */
                URL_UPDATE = namespace + 'url.update',

            /**
             * triggers husky.datagrid.data.provide
             * @event husky.datagrid.data.get
             */
                DATA_GET = namespace + 'data.get';

        return {

            initialize: function() {
                this.sandbox.logger.log('initialized datagrid');

                this.view = null;

                // extend default options and set variables
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

                // append datagrid to html element
                this.$element = this.sandbox.dom.$('<div class="husky-datagrid"/>');
                this.$el.append(this.$element);

                this.getData();

                // Should only be be called once
                this.bindCustomEvents();
            },

            /**
             * Gets the data either via the url or the array
             */
            getData: function() {
                var fieldsData, url;

                if (!!this.options.url) {
                    url = this.options.url;

                    // parse fields data
                    if (this.options.fieldsData) {
                        fieldsData = this.parseFieldsData(this.options.fieldsData);
                        url += '&fields=' + fieldsData.urlFields;
                        this.options.columns = fieldsData.columns;
                    }

                    this.sandbox.logger.log('load data from url');
                    this.load({ url: url});

                } else if (!!this.options.data.items) {

                    this.sandbox.logger.log('load data from array');
                    this.data = this.options.data;

                    this.prepare()
                        .appendPagination()
                        .render();
                }
            },

            /**
             * parses fields data retrieved from api
             * @param fields
             * @returns {{columns: Array, urlFields: string}}
             */
            parseFieldsData: function(fields) {
                var data = [],
                    urlfields = [],
                    fieldsCount = 0,
                    tmp;

                this.sandbox.util.foreach(fields, function(field) {

                    tmp = {};

                    if (field.disabled !== 'true' && field.disabled !== true) {

                        // data
                        for (var key in field) {
                            if (key === 'translation') {
                                tmp.content = this.sandbox.translate(field.translation);
                            } else if (key === 'id') {
                                tmp.attribute = field.id;
                            } else {
                                tmp[key] = field[key];
                            }
                        }

                        data.push(tmp);
                        urlfields.push(field.id);

                    } else if (field.id === 'id') {
                        urlfields.push(field.id);
                    }

                    fieldsCount++;

                }.bind(this));
                return {
                    columns: data,
                    urlFields: urlfields.join(',')
                };
            },

            /**
             * Loads contents via ajax
             * @param params url
             */
            load: function(params) {
                this.currentUrl = params.url;
                this.sandbox.util.load(this.getUrl(params), params.data)
                    .then(function(response) {
                        this.initRender(response, params);
                    }.bind(this))
                    .fail(function(status, error) {
                        this.sandbox.logger.error(status, error);
                    }.bind(this));
            },


            /**
             * Initializes the rendering of the datagrid
             */
            initRender: function(response, params) {

                this.data = {};
                this.data.links = response._links;
                this.data.embedded = response._embedded;
                this.data.total = response.total;
                this.data.numberOfAll = response.numberOfAll;
                this.data.page = response.page;
                this.data.pages = response.pages;
                this.data.pageSize = response.pageSize || this.options.paginationOptions.pageSize;
                this.data.pageDisplay = this.options.paginationOptions.showPages;

                this.getViewDecorator();
                this.bindDOMEvents();

                /*this.prepare()
                    .appendPagination()
                    .render();

                this.setHeaderClasses();

                if (!!params && typeof params.success === 'function') {
                    params.success(response);
                }

                this.windowResizeListener();*/
            },

            /**
             * Gets the view and starts the rendering of the data
             */
            getViewDecorator: function() {
                var viewDecorator = views[this.options.view];

                require([viewDecorator], function(view) {
                    this.view = view;
                    this.view.render(this);
                }.bind(this));
            },

            /**
             * Returns url with page size and page param at the end
             * @param params
             * @returns {string}
             */
            getUrl: function(params) {

                if (!!this.data && !!this.data.links) {
                    return params.url;
                }

                var delimiter = '?', url = params.url;

                if (!!this.options.pagination && !!this.options.paginationOptions.pageSize) {

                    if (params.url.indexOf('?') !== -1) {
                        delimiter = '&';
                    }

                    url = params.url + delimiter + 'pageSize=' + this.options.paginationOptions.pageSize;
                    if (params.page > 1) {
                        url += '&page=' + params.page;
                    }
                }

                return url;
            },

            /**
             * Prepares the structure of the datagrid (list, table)
             * @returns {*}
             */
            /*prepare: function() {
                this.$element.empty();

                if (this.options.elementType === 'list') {
                    // TODO this.$element = this.prepareList();
                    this.sandbox.logger.log("list is not yet implemented!");
                } else {
                    this.$tableContainer = this.sandbox.dom.createElement('<div class="table-container"/>');
                    this.sandbox.dom.append(this.$element, this.$tableContainer);
                    this.sandbox.dom.append(this.$tableContainer, this.prepareTable());
                }

                return this;
            },*/

            /**
             * Perapres the structure of the datagrid when element type is table
             * @returns {table} returns table element
             */
            prepareTable: function() {
                var $table, $thead, $tbody, tblClasses;

                this.$table = $table = this.sandbox.dom.createElement('<table' + (!!this.options.validationDebug ? 'data-debug="true"' : '' ) + '/>');

                if (!!this.data.head || !!this.options.columns) {
                    $thead = this.sandbox.dom.createElement('<thead/>');
                    $thead.append(this.prepareTableHead());
                    $table.append($thead);
                }

                if (!!this.data.embedded) {
                    if (!!this.options.appendTBody) {
                        $tbody = this.sandbox.dom.$('<tbody/>');
                    }
                    this.sandbox.dom.append($tbody, this.prepareTableRows());
                    this.sandbox.dom.append($table, $tbody);
                }

                // set html classes
                tblClasses = [];
                tblClasses.push((!!this.options.className && this.options.className !== 'table') ? 'table ' + this.options.className : 'table');

                // when list should not have the hover effect for whole rows do not set the is-selectable class
                if (!this.options.editable) {
                    tblClasses.push((this.options.selectItem && this.options.selectItem.type === 'checkbox') ? 'is-selectable' : '');
                }

                $table.addClass(tblClasses.join(' '));

                return $table;
            },

            /**
             * returns number and unit
             * @param numberUnit
             * @returns {{number: Number, unit: *}}
             */
            getNumberAndUnit: function(numberUnit) {
                numberUnit = String(numberUnit);
                var regex = numberUnit.match(/(\d+)\s*(.*)/);
                // no unit , set default
                if (!regex[2]) {
                    regex[2] = this.options.defaultMeasureUnit;
                }
                return {number: parseInt(regex[1], 10), unit: regex[2]};
            },

            /**
             * Manipulates the content of a cell with a process realted to the columns type
             * @param content {String} the content of the cell
             * @param type {String} the columns type
             * @returns {String} the manipualted content
             */
            manipulateContent: function(content, type) {
                if (type === types.DATE) {
                    content = this.parseDate(content);
                }
                return content;
            },

            /**
             * Brings a date into the right format
             * @param date {String} the date to parse
             * @returns {String}
             */
            parseDate: function(date) {
                var parsedDate = this.sandbox.date.format(date);
                if (parsedDate !== null) {
                    return parsedDate;
                }
                return date;
            },

            /**
             * Resets the arrays for selected items
             */
            resetItemSelection: function() {
                this.allItemIds = [];
                this.selectedItemIds = [];
            },

            /**
             * Selectes or deselects the clicked item
             * @param event
             */
            selectItem: function(event) {

                event.stopPropagation();

                // Todo review handling of events for new rows in datagrid (itemId empty?)

                var $element, itemId, oldSelectionId, parentTr;

                $element = this.sandbox.dom.$(event.currentTarget);

                if (!$element.is('input')) {
                    $element = this.sandbox.dom.find('input', this.sandbox.dom.parent($element));
                }

                parentTr = this.sandbox.dom.parents($element, 'tr');
                itemId = this.sandbox.dom.data(parentTr, 'id');

                if ($element.attr('type') === 'checkbox') {

                    if (this.sandbox.dom.prop($element, 'checked') === false) {
                        $element
                            .removeClass('is-selected')
                            .prop('checked', false);

                        // uncheck 'Select All'-checkbox
                        $('th.select-all')
                            .find('input[type="checkbox"]')
                            .prop('checked', false);

                        this.selectedItemIds.splice(this.selectedItemIds.indexOf(itemId), 1);
                        this.sandbox.emit(ITEM_DESELECT, itemId);
                    } else {
                        $element
                            .addClass('is-selected')
                            .prop('checked', true);

                        if (!!itemId) {
                            this.selectedItemIds.push(itemId);
                            this.sandbox.emit(ITEM_SELECT, itemId);
                        } else {
                            this.sandbox.emit(ITEM_SELECT, event);
                        }
                    }

                    this.sandbox.emit(NUMBER_SELECTIONS, this.getIdsOfSelectedRows().length);

                } else if ($element.attr('type') === 'radio') {

                    oldSelectionId = this.selectedItemIds.pop();

                    if (!!oldSelectionId && oldSelectionId > -1) {
                        this.sandbox.dom.$('tr[data-id="' + oldSelectionId + '"]').find('input[type="radio"]').removeClass('is-selected').prop('checked', false);
                        this.sandbox.emit(ITEM_DESELECT, oldSelectionId);
                    }

                    $element.addClass('is-selected').prop('checked', true);

                    if (!!itemId) {
                        this.selectedItemIds.push(itemId);
                        this.sandbox.emit(ITEM_SELECT, itemId);
                    } else {
                        this.sandbox.emit(ITEM_SELECT, event);
                    }
                    this.sandbox.emit(NUMBER_SELECTIONS, this.selectedItemIds.length);
                }

            },

            /**
             * Selects or deselect all available items of the list
             * @param event
             */
            selectAllItems: function(event) {

                event.stopPropagation();

                var $headCheckbox = this.sandbox.dom.find('th input[type="checkbox"]', this.$el)[0],
                    $checkboxes = this.sandbox.dom.find('input[type="checkbox"]', this.$el),
                    selectedElements,
                    tmp;

                if (this.sandbox.dom.prop($headCheckbox, 'checked') === false) {
                    this.sandbox.dom.prop($checkboxes, 'checked', false);
                    this.sandbox.dom.removeClass($checkboxes, 'is-selected');
                    this.sandbox.emit(ALL_DESELECT);
                } else {
                    this.sandbox.dom.prop($checkboxes, 'checked', true);
                    this.sandbox.dom.addClass($checkboxes, 'is-selected');
                    this.sandbox.emit(ALL_SELECT, this.getIdsOfSelectedRows());
                }

                tmp = this.sandbox.dom.find('input[type="checkbox"]:checked', this.$el).length - 1;
                selectedElements = tmp > 0 ? tmp : 0;

                this.sandbox.emit(NUMBER_SELECTIONS, selectedElements);
            },

            // TODO: create pagination module
            /**
             * Appends pagination when option is set
             * @returns {*}
             */
            appendPagination: function() {

                if (this.options.pagination && !!this.data.links) {
                    this.initPaginationIds();
                    this.$element.append(this.preparePagination());
                    this.preparePaginationDropdown();
                    this.prepareShowElementsDropdown();
                }
                return this;
            },

            /**
             * inits the dom ids needed for the pagination
             */
            initPaginationIds: function() {
                this.pagination = {
                    prevId: this.options.instance + '-prev',
                    nextId: this.options.instance + '-next',
                    dropdownId: this.options.instance + '-pagination-dropdown',
                    showElementsId: this.options.instance + '-show-elements'
                };
            },

            /**
             * Delegates the rendering of the pagination when pagination is needed
             * @returns {*}
             */
            preparePagination: function() {
                var $pagination,
                    $paginationWrapper,
                    $showElements,
                    paginationLabel;


                $paginationWrapper = this.sandbox.dom.$('<div/>');
                $paginationWrapper.addClass('pagination-wrapper m-top-20 grid-row small-font');

                // if first defined step is bigger than the number of all elements don't display show-elements dropdown
                if (this.data.numberOfAll > this.options.showElementsSteps[0]) {
                    $showElements = this.sandbox.dom.$(this.templates.showElements.call(this, this.pagination.showElementsId));
                    $paginationWrapper.append($showElements);
                }

                if (!!this.options.pagination && parseInt(this.data.pages, 10) > 1) {
                    $pagination = this.sandbox.dom.$('<div/>');
                    $pagination.addClass('pagination');

                    $paginationWrapper.append($pagination);

                    paginationLabel = this.renderPaginationRow(this.data.page, this.data.pages);

                    $pagination.append('<div id="' + this.pagination.nextId + '" class="pagination-prev pull-right pointer"></div>');
                    $pagination.append('<div id="' + this.pagination.dropdownId + '" class="pagination-main pull-right pointer"><span class="inline-block">' + paginationLabel + '</span><span class="dropdown-toggle inline-block"></span></div>');
                    $pagination.append('<div id="' + this.pagination.prevId + '" class="pagination-next pull-right pointer"></div>');
                }

                return $paginationWrapper;
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

                return this.sandbox.util.template(this.options.paginationTemplate, defaults);
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
                            el: this.sandbox.dom.find('#' + this.pagination.dropdownId, this.$el),
                            setParentDropDown: true,
                            instanceName: this.dropdownInstanceName,
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
                        name: '<strong>'+ this.options.showElementsSteps[i] +'</strong> ' + this.sandbox.translate('pagination.elements-per-page')
                    });
                }

                data.push({divider: true});
                data.push({
                    id: 0,
                    name: this.sandbox.translate('pagination.show-all-elements')
                });

                this.sandbox.start([
                    {
                        name: 'dropdown@husky',
                        options: {
                            el: this.sandbox.dom.find('#' + this.pagination.showElementsId, this.$el),
                            setParentDropDown: true,
                            instanceName: this.dropdownInstanceName + '-show',
                            alignment: 'left',
                            data: data
                        }
                    }
                ]);
            },

            /**
             * Called when the current page should change
             * Emits husky.datagrid.updated event on success
             * @param uri
             * @param event
             */
            changePage: function(uri, event) {
                var url, template;

                // when a valid uri is passed to this function - load from the uri
                if (!!uri) {
                    if (!!event) {
                        event.preventDefault();
                    }
                    url = uri;

                    // determine wether the page number received via the event from the dropdown is valid
                } else if (!!event.id && event.id > 0 && event.id <= this.data.pages) {
                    template = this.sandbox.uritemplate.parse(this.data.links.pagination);
                    url = this.sandbox.uritemplate.expand(template, {page: event.id, pageSize: this.data.pageSize});

                    // invalid - whether page number nor uri are valid
                } else {
                    this.sandbox.logger.log("invalid page number or reached start/end!");
                    return;
                }

                this.sandbox.emit(PAGE_CHANGE, url);
                this.addLoader();
                this.load({url: url,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED, 'updated page');
                    }.bind(this)});
            },

            resetSortingOptions: function() {
                this.sort.attribute = null;
                this.sort.direction = null;
            },

            bindDOMEvents: function() {

                /*if (this.options.pagination) {

                    // next page
                    this.$element.on('click', '#' + this.pagination.nextId, this.changePage.bind(this, this.data.links.next));

                    // previous page
                    this.$element.on('click', '#' + this.pagination.prevId, this.changePage.bind(this, this.data.links.prev));
                }

                if (this.options.removeRow) {
                    this.$element.on('click', '.remove-row > span', this.prepareRemoveRow.bind(this));
                }

                if (this.options.sortable) {
                    this.sandbox.dom.on(this.$el, 'click', this.changeSorting.bind(this), 'thead th[data-attribute]');
                }

                if (!!this.options.editable) {
                    this.sandbox.dom.on(this.$el, 'click', this.editCellValues.bind(this), '.editable');

                    // FIXME does not work with focus - causes endless loop in some cases (husky-validation?)
                    this.sandbox.dom.on(this.$el, 'click', this.focusOnRow.bind(this), 'tr');

                    this.sandbox.dom.on(this.$el, 'click', function(event) {
                        event.stopPropagation();
                    }, 'tr');

                    this.sandbox.dom.on(window, 'click', function() {
                        if (!!this.lastFocusedRow) {
                            this.prepareSave();
                        }
                    }.bind(this));
                }*/

                this.sandbox.dom.on(this.sandbox.dom.window, 'resize', this.windowResizeListener.bind(this));
            },

            /**
             * Shows input and hides span
             * @param event
             */
            editCellValues: function(event) {
                var $target = event.currentTarget,
                    $input = this.sandbox.dom.next($target, 'input');

                this.lockWidthsOfColumns(this.sandbox.dom.find('table th', this.$el));

                this.sandbox.dom.hide($target);
                this.sandbox.dom.removeClass($input, 'hidden');
                $input[0].select();
            },

            /**
             * Makes the widths of columns fixed when the table is in edit mode
             * prevents changes in column width
             * @param $th array of th elements
             */
            lockWidthsOfColumns: function($th) {

                var width, minwidth;
                this.columnWidths = [];

                this.sandbox.dom.each($th, function(index, $el) {
                    minwidth = this.sandbox.dom.css($el, 'min-width');
                    this.columnWidths.push(minwidth);

                    width = this.sandbox.dom.outerWidth($el);
                    this.sandbox.dom.css($el, 'min-width', width);
                    this.sandbox.dom.css($el, 'max-width', width);
                    this.sandbox.dom.css($el, 'width', width);
                }.bind(this));
            },

            /**
             * Resets the min-width of columns and
             * @param $th array of th elements
             */
            unlockWidthsOfColumns: function($th) {
                if (!!this.columnWidths) {
                    this.sandbox.dom.each($th, function(index, $el) {
                        // skip columns without data-attribute because the have min/max and normal widths by default
                        if (!!this.sandbox.dom.data($el, 'attribute')) {
                            this.sandbox.dom.css($el, 'min-width', this.columnWidths[index]);
                            this.sandbox.dom.css($el, 'max-width', '');
                            this.sandbox.dom.css($el, 'width', '');
                        }
                    }.bind(this));
                }
            },

            /**
             * Sets header classes and loads new data
             * Emits husky.datagrid.updated event on success
             * @param event
             */
            changeSorting: function(event) {

                var attribute = this.sandbox.dom.data(event.currentTarget, 'attribute'),
                    $element = event.currentTarget,
                    $span = this.sandbox.dom.children($element, 'span')[0],
                    url, template;

                if (!!attribute && !!this.data.links.sortable[attribute]) {

                    this.sandbox.emit(DATA_SORT);
                    this.sort.attribute = attribute;

                    if (this.sandbox.dom.hasClass($span, this.sort.ascClass)) {
                        this.sort.direction = "desc";
                    } else {
                        this.sort.direction = "asc";
                    }

                    this.addLoader();
                    template = this.sandbox.uritemplate.parse(this.data.links.sortable[attribute]);
                    url = this.sandbox.uritemplate.expand(template, {sortOrder: this.sort.direction});

                    this.load({
                        url: url,
                        success: function() {
                            this.removeLoader();
                            this.sandbox.emit(UPDATED, 'updated sort');
                        }.bind(this)
                    });
                }
            },

            /**
             * Sets the header classes used for sorting purposes
             * needs this.sort to be correctly initialized
             */
            setHeaderClasses: function() {
                var attribute = this.sort.attribute,
                    direction = this.sort.direction,
                    $element = this.sandbox.dom.find('thead th[data-attribute=' + attribute + ']', this.$element),
                    $span = this.sandbox.dom.children($element, 'span')[0];

                if (!!attribute) {

                    this.sandbox.dom.addClass($element, 'is-selected');

                    if (direction === 'asc') {
                        this.sandbox.dom.addClass($span, this.sort.ascClass + this.sort.additionalClasses);
                    } else {
                        this.sandbox.dom.addClass($span, this.sort.descClass + this.sort.additionalClasses);
                    }

                }
            },

            bindCustomEvents: function() {
                var searchInstanceName = '', columnOptionsInstanceName = '';

                this.sandbox.on('husky.navigation.size.changed', this.windowResizeListener.bind(this));

                // listen for private events
                this.sandbox.on(UPDATE, this.updateHandler.bind(this));

                this.sandbox.on(DATA_GET, this.provideData.bind(this));

                // filter data
                this.sandbox.on(DATA_SEARCH, this.triggerSearch.bind(this));

                // filter data
                this.sandbox.on(URL_UPDATE, this.updateUrl.bind(this));

                // pagination dropdown item clicked
                this.sandbox.on('husky.dropdown.' + this.dropdownInstanceName + '.item.click', this.changePage.bind(this, null));

                // show-elements dropdown item clicked
                this.sandbox.on('husky.dropdown.datagrid-pagination-dropdown-show.item.click', function(item) {
                    if (this.data.pageSize !== item.id || this.data.total === this.data.numberOfAll) {
                        // show all
                        if (item.id === 0) {
                            // only if not already all are shown
                            if (this.data.total !== this.data.numberOfAll) {
                                this.changePage(this.data.links.all);
                            }
                        } else {
                            this.data.pageSize = item.id;
                            this.changePage(null, {id: 1});
                        }
                    }
                }.bind(this));

                // listen to search events
                if (!!this.options.searchInstanceName) {
                    if (this.options.searchInstanceName !== '') {
                        searchInstanceName = '.' + this.options.searchInstanceName;
                    }
                    this.sandbox.on('husky.search' + searchInstanceName, this.triggerSearch.bind(this));
                    this.sandbox.on('husky.search' + searchInstanceName + '.reset', this.triggerSearch.bind(this, ''));
                }

                // listen to search events
                if (this.options.columnOptionsInstanceName || this.options.columnOptionsInstanceName === '') {
                    columnOptionsInstanceName = (this.options.columnOptionsInstanceName !== '') ? '.' + this.options.columnOptionsInstanceName : '';
                    this.sandbox.on('husky.column-options' + columnOptionsInstanceName + '.saved', this.filterColumns.bind(this));
                }
            },


            /**
             * Put focus on table row and remember values
             */
            focusOnRow: function(event) {

                var $tr = event.currentTarget,
                    domId = this.sandbox.dom.data($tr, 'dom-id');

                this.sandbox.logger.log("focus on row", domId);

                if (!!this.lastFocusedRow && this.lastFocusedRow.domId !== domId) { // new focus
                    this.prepareSave();
                    this.lastFocusedRow = this.getInputValuesOfRow($tr);
                    this.sandbox.logger.log("focused " + this.lastFocusedRow.domId + " now!");
                } else if (!this.lastFocusedRow) { // first focus
                    this.lastFocusedRow = this.getInputValuesOfRow($tr);
                    this.sandbox.logger.log("focused " + this.lastFocusedRow.domId + " now!");
                }
            },

            /**
             * Returns url without params
             */
            getUrlWithoutParams: function() {
                var url = this.data.links.self;

                if (url.indexOf('?') !== -1) {
                    return url.substring(0, url.indexOf('?'));
                }

                return url;
            },

            /**
             * Provides data of the list to the caller
             */
            provideData: function() {
                this.sandbox.emit(DATA_PROVIDE, this.data);
            },

            /**
             * Updates data in datagrid
             * Called when husky.datagrid.update event emitted
             * Emits husky.datagrid.updated event on success
             */
            updateHandler: function() {
                this.resetItemSelection();
                this.resetSortingOptions();

                this.load({
                    url: this.data.links.self,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },

            /**
             * triggers an api search
             * @param {String} searchString The String that will be searched
             * @param {String|Array} searchFields Fields that will be included into the search
             */
            triggerSearch: function(searchString, searchFields) {

                var template, url;

                this.addLoader();
                template = this.sandbox.uritemplate.parse(this.data.links.find);
                url = this.sandbox.uritemplate.expand(template, {searchString: searchString, searchFields: searchFields});

                this.load({
                    url: url,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED, 'updated after search');
                    }.bind(this)
                });
            },

            /**
             * updates the current url by given parameter object
             * @param {Object} parameters Object key is used as parameter name, value as parameter value
             */
            updateUrl: function(parameters) {

                var url, key;

                this.addLoader();
                url = this.currentUrl;

                for (key in parameters) {
                    url = this.setGetParameter(url, key, parameters[key]);
                }

                this.load({
                    url: url,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },

            /**
             * function updates an url by a given parameter name and value and returns it. The parameter is either added or updated.
             * If value is not set, the parameter will be removed from url
             * @param {String} url Url string to be updated
             * @param {String} paramName Parameter which should be added / updated / removed
             * @param {String|Null} paramValue Value of the parameter. If not set, parameter will be removed from url
             * @returns {String} updated url
             */
            setGetParameter: function(url, paramName, paramValue) {
                if (url.indexOf(paramName + "=") >= 0)
                {
                    var prefix = url.substring(0, url.indexOf(paramName)),
                        suffix = url.substring(url.indexOf(paramName));
                    suffix = suffix.substring(suffix.indexOf('=') + 1);
                    suffix = (suffix.indexOf('&') >= 0) ? suffix.substring(suffix.indexOf('&')) : '';
                    if (!!paramValue) {
                        url = prefix + paramName + '=' + paramValue + suffix;
                    } else {
                        if (url.substr(url.indexOf(paramName)-1,1) === '&' ) {
                            url = url.substring(0,prefix.length-1) + suffix;
                        } else {
                            url = prefix + suffix.substring(1, suffix.length);
                        }
                    }
                }
                else if (!!paramValue)
                {
                    if (url.indexOf("?") < 0)
                        url += "?" + paramName + "=" + paramValue;
                    else
                        url += "&" + paramName + "=" + paramValue;
                }
                return url;
            },


            /**
             * is called when columns are changed
             */
            filterColumns: function(fieldsData) {

                var template, url,
                    parsed = this.parseFieldsData(fieldsData);

                this.addLoader();

                template = this.sandbox.uritemplate.parse(this.data.links.filter);
                url = this.sandbox.uritemplate.expand(template, {fieldsList: parsed.urlFields.split(',')});

                this.options.columns = parsed.columns;

                this.sandbox.dom.width(this.$element, '100%');
                if (!!this.options.contentContainer) {
                    this.sandbox.dom.css(this.options.contentContainer, 'max-width', '');
                }

                this.load({
                    url: url,
                    success: function() {
                        this.removeLoader();
                        this.sandbox.emit(UPDATED, 'updated after search');
                    }.bind(this)
                });
            },


            /**
             * Renders datagrid element in container
             * Binds DOM events
             */
            render: function() {
                // add full-width class
                if (this.options.fullWidth === true) {
                    this.sandbox.dom.addClass(this.$element, constants.fullWidthClass);
                }

                this.$el.html(this.$element);
                this.bindDOMEvents();

                // initialize validation
                if (!!this.options.validation) {
                    this.sandbox.form.create(this.$el);
                }
            },

            /**
             * calls the funciton of the view responsible for the responsiveness
             */
            windowResizeListener: function() {
                this.view.onResize();
            },

            /**
             * Adds loading icon and keeps width and height
             * @returns {*}
             */
            addLoader: function() {
                this.$element
                    .outerWidth(this.$element.outerWidth())
                    .outerHeight(this.$element.outerHeight())
                    .empty();

                var $container = this.sandbox.dom.createElement('<div class="datagrid-loader"/>');
                this.sandbox.dom.append(this.$element, $container);

                this.sandbox.start([{
                    name: 'loader@husky',
                    options: {
                        el: $container,
                        size: '100px',
                        color: '#cccccc'
                    }
                }]);

                return this.$element;
            },

            /**
             * Removes loading icon, width and height of container
             * @returns {*}
             */
            removeLoader: function() {
                return this.$element.outerHeight("").outerWidth("");
                this.sandbox.stop(this.sandbox.dom.find('.datagrid-loader', this.$element));

                return this.$element;
            }
        };
    });
})();

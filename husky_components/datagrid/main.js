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
 * @param {Boolean|String} [options.pagination=dropdown] name of the pagination to use. If false no pagination will be initialized
 * @param {String} [options.pagination=table] name of the view to use
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

    define(['husky_components/datagrid/decorators/table-view',
            'husky_components/datagrid/decorators/dropdown-pagination'],
            function(decoratorTableView, decoratorDropdownPagination) {

        'use strict';

        /**
         *    Default values for options
         */
        var defaults = {
                view: 'table',
                pagination: 'dropdown',
                autoRemoveHandling: true,
                editable: false,
                className: 'datagridcontainer',
                elementType: 'table',
                data: null,
                defaultMeasureUnit: 'px',
                excludeFields: ['id'],
                instance: 'datagrid',
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

            decorators = {
                views: {
                    table: decoratorTableView
                },
                paginations: {
                    dropdown: decoratorDropdownPagination
                }
            },

            templates = {

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
             * raised when item is deselected
             * @event husky.datagrid.item.deselect
             * @param {String} id of deselected item
             */
                ITEM_DESELECT = namespace + 'item.deselect',

            /**
             * raised when selection of items changes
             * @event husky.datagrid.number.selections
             */
                NUMBER_SELECTIONS = namespace + 'number.selections',

            /**
             * raised when item is selected
             * @event husky.datagrid.item.select
             * @param {String} if of selected item
             */
                ITEM_SELECT = namespace + 'item.select',

            /**
             * raised when all items get deselected via the header checkbox
             * @event husky.datagrid.all.deselect
             */
                ALL_DESELECT = namespace + 'all.deselect',

            /**
             * raised when all items get deselected via the header checkbox
             * @event husky.datagrid.all.select
             * @param {Array} ids of all items that have been clicked
             */
                ALL_SELECT = namespace + 'all.select',


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
             * raised when data is sorted
             * @event husky.datagrid.data.sort
             */
                DATA_SORT = namespace + 'data.sort',

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
                DATA_GET = namespace + 'data.get',

            /**
             * triggers husky.datagrid.items.selected event, which returns all selected item ids
             * @event husky.datagrid.items.get-selected
             * @param  {Function} callback function receives array of selected items
             */
                ITEMS_GET_SELECTED = namespace + 'items.get-selected',


        /**
         * Private Methods
         * --------------------------------------------------------------------
         */

        /**
         * function updates an url by a given parameter name and value and returns it. The parameter is either added or updated.
         * If value is not set, the parameter will be removed from url
         * @param {String} url Url string to be updated
         * @param {String} paramName Parameter which should be added / updated / removed
         * @param {String|Null} paramValue Value of the parameter. If not set, parameter will be removed from url
         * @returns {String} updated url
         */
        setGetParameter = function(url, paramName, paramValue) {
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
                if (url.indexOf("?") < 0) {
                    url += "?" + paramName + "=" + paramValue;
                }
                else {
                    url += "&" + paramName + "=" + paramValue;
                }
            }
            return url;
        },

        /**
         * Brings a date into the right format
         * @param date {String} the date to parse
         * @returns {String}
         */
        parseDate = function(date) {
            var parsedDate = this.sandbox.date.format(date);
            if (parsedDate !== null) {
                return parsedDate;
            }
            return date;
        };

        return {

            /**
             * Initialize the datagrid component
             */
            initialize: function() {
                this.sandbox.logger.log('initialized datagrid');

                this.gridView = null;
                this.pagination = null;
                this.$loader = null;

                // extend default options and set variables
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

                // append datagrid to html element
                this.$element = this.sandbox.dom.$('<div class="husky-datagrid"/>');
                this.elId = this.sandbox.dom.attr(this.$el, 'id');
                this.$el.append(this.$element);

                this.sort = {
                    attribute: null,
                    direction: null
                };

                this.initRender();

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
             * @param fields {Array} array with columns-data
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

                this.loading();

                if (this.gridView.rendered === true) {
                    this.gridView.destroy();
                    this.pagination.destroy();
                }

                this.sandbox.util.load(this.getUrl(params), params.data)
                    .then(function(response) {
                        this.stopLoading();
                        this.parseData(response);
                        this.gridView.render(this.data, this.$element);
                        this.pagination.render(this.data, this.$element);
                        if (!!params.success && typeof params.success === 'function') {
                            params.success(response);
                        }
                    }.bind(this))
                    .fail(function(status, error) {
                        this.sandbox.logger.error(status, error);
                    }.bind(this));
            },

            /**
             * Displays a loading icon
             */
            loading: function() {
                this.$element
                    .outerWidth(this.$element.outerWidth())
                    .outerHeight(this.$element.outerHeight());

                this.sandbox.dom.addClass(this.$element, 'loading');

                if (!this.$loader) {
                    this.$loader = this.sandbox.dom.createElement('<div class="datagrid-loader"/>');
                    this.sandbox.dom.hide(this.$loader);
                    this.sandbox.dom.append(this.$element, this.$loader);

                    this.sandbox.start([{
                        name: 'loader@husky',
                        options: {
                            el: this.$loader,
                            size: '100px',
                            color: '#cccccc'
                        }
                    }]);
                }

                this.sandbox.dom.show(this.$loader);

                return this.$tableContainer;
            },

            /**
             * Hides the loading icon
             */
            stopLoading: function() {
                this.sandbox.dom.hide(this.$loader);

                this.sandbox.dom.removeClass(this.$element, 'loading');

                return this.$element.outerHeight('').outerWidth('');
            },

            /**
             * Gets the view and a load to get data and render it
             */
            initRender: function() {
                this.bindDOMEvents();
                this.getViewDecorator();
                this.getPaginationDecorator();
            },

            /**
             * Takes a data object and sets it to the global data-property
             * @param data {Object} data property
             */
            parseData: function(data) {
                this.data = {};
                this.data.links = data._links;
                this.data.embedded = data._embedded;
                this.data.total = data.total;
                this.data.numberOfAll = data.numberOfAll;
                this.data.page = data.page;
                this.data.pages = data.pages;
                this.data.pageSize = data.pageSize || this.options.paginationOptions.pageSize;
                this.data.pageDisplay = this.options.paginationOptions.showPages;
            },

            /**
             * Gets the view and starts the rendering of the data
             */
            getViewDecorator: function() {
                this.gridView = decorators.views[this.options.view];
                this.gridView.initialize(this);
                this.getData();
            },

            /**
             * Gets the Pagination and initializes it
             */
            getPaginationDecorator: function() {
                if (!!this.options.pagination) {
                    this.pagination = decorators.paginations[this.options.pagination];
                    this.pagination.initialize(this);
                }
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
                    content = parseDate.call(this, content);
                }
                return content;
            },

            resetSortingOptions: function() {
                this.sort.attribute = null;
                this.sort.direction = null;
            },

            bindDOMEvents: function() {
                this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', this.windowResizeListener.bind(this));
            },


            bindCustomEvents: function() {
                var searchInstanceName = '', columnOptionsInstanceName = '';

                this.sandbox.on('husky.navigation.size.changed', this.windowResizeListener.bind(this));

                // listen for private events
                this.sandbox.on(UPDATE, this.updateGrid.bind(this));

                this.sandbox.on(DATA_GET, this.provideData.bind(this));

                // filter data
                this.sandbox.on(DATA_SEARCH, this.searchGrid.bind(this));

                // filter data
                this.sandbox.on(URL_UPDATE, this.updateUrl.bind(this));

                // trigger selectedItems
                this.sandbox.on(ITEMS_GET_SELECTED, function(callback) {
                    callback(this.getSelectedItemIds());
                }.bind(this));

                // listen to search events
                if (!!this.options.searchInstanceName) {
                    if (this.options.searchInstanceName !== '') {
                        searchInstanceName = '.' + this.options.searchInstanceName;
                    }
                    this.sandbox.on('husky.search' + searchInstanceName, this.searchGrid.bind(this));
                    this.sandbox.on('husky.search' + searchInstanceName + '.reset', this.searchGrid.bind(this, ''));
                }

                // listen to events from column options
                if (this.options.columnOptionsInstanceName || this.options.columnOptionsInstanceName === '') {
                    columnOptionsInstanceName = (this.options.columnOptionsInstanceName !== '') ? '.' + this.options.columnOptionsInstanceName : '';
                    this.sandbox.on('husky.column-options' + columnOptionsInstanceName + '.saved', this.filterGrid.bind(this));
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
             * Returns the index of a data record for a given id
             * @param id {Number|String} the id to search for
             * @returns {Number|String} the index of the found record
             */
            getRecordIndexById: function(id) {
                for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                    if (this.data.embedded[i].id === id) {
                        return i;
                    }
                }
                return null;
            },

            /**
             * Sets all data records unselected
             */
            deselectAllItems: function() {
                for (var i = -1, length = this.data.embedded.length; ++i<length;) {
                    this.data.embedded[i].selected = false;
                }
                // emit events with selected data
                this.sandbox.emit(ALL_DESELECT);
                this.sandbox.emit(NUMBER_SELECTIONS, 0);
            },

            /**
             * Sets all data records selected
             */
            selectAllItems: function() {
                var ids = [], i, length;
                for (i = -1, length = this.data.embedded.length; ++i<length;) {
                    this.data.embedded[i].selected = true;
                    ids.push(this.data.embedded[i].id);
                }
                // emit events with selected data
                this.sandbox.emit(ALL_SELECT, ids);
                this.sandbox.emit(NUMBER_SELECTIONS, this.data.embedded.length);
            },

            /**
             * Returns the ids of all selected items
             * @return {Array} array with all ids
             */
            getSelectedItemIds: function() {
                var ids = [], i, length;
                for (i = -1, length = this.data.embedded.length; ++i < length;) {
                    if (this.data.embedded[i].selected === true) {
                        ids.push(this.data.embedded[i].id);
                    }
                }
                return ids;
            },

            /**
             * Sets all data records with their ids contained in the passed one selected and
             * deselects all data records not contained.
             * @param items {Array} array with all items that should be selected
             */
            setSelectedItems: function(items) {
                var count = 0, i, length;
                for (i = -1, length = this.data.embedded.length; ++i < length;) {
                    if (items.indexOf(this.data.embedded[i].id) !== -1) {
                        this.data.embedded[i].selected = true;
                        count++;
                    } else {
                        this.data.embedded[i].selected = false;
                    }
                }
                this.sandbox.emit(NUMBER_SELECTIONS, count);
            },

            /**
             * Sets a data record with a given id selected
             * @param id {String|Number} id of the item
             * @return {Boolean} true of operation was succesfull
             */
            setItemSelected: function(id) {
                var itemIndex = this.getRecordIndexById(id);
                if (itemIndex !== null) {
                    this.data.embedded[itemIndex].selected = true;
                    // emit events with selected data
                    this.sandbox.emit(ITEM_SELECT, id);
                    this.sandbox.emit(NUMBER_SELECTIONS, this.getSelectedItemIds().length);
                    return true;
                }
                return false;
            },

            /**
             * Sets a data record with a given id unselected
             * @param id
             * @return {Boolean} true of operation was succesfull
             */
            setItemUnselected: function(id) {
                var itemIndex = this.getRecordIndexById(id);
                if (itemIndex !== null) {
                    this.data.embedded[itemIndex].selected = false;
                    // emit events with selected data
                    this.sandbox.emit(ITEM_DESELECT, id);
                    this.sandbox.emit(NUMBER_SELECTIONS, this.getSelectedItemIds().length);
                    return true;
                }
                return false;
            },

            /**
             * Provides data of the list to the caller
             */
            provideData: function() {
                this.sandbox.emit(DATA_PROVIDE, this.data);
            },

            /**
             * updates the current url by given parameter object
             * @param {Object} parameters Object key is used as parameter name, value as parameter value
             */
            updateUrl: function(parameters) {

                var url, key;

                url = this.currentUrl;

                for (key in parameters) {
                    url = setGetParameter.call(this, url, key, parameters[key]);
                }

                this.load({
                    url: url,
                    success: function() {
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },

            /**
             * Called when the current page should change
             * Emits husky.datagrid.updated event on success
             * @param uri {String} Url to load the new data from
             * @param page {Number} the page to change to
             * @param pageSize {Number} new page size. Has to be set if no Uri is passed
             */
            changePage: function(uri, page, pageSize) {
                var url, uriTemplate;

                // if a url is passed load the data from this url
                if (!!uri) {
                    url = uri;

                    // else generate an own uri
                } else {
                    // return if no page is passed or passed invalidly
                    if (!page || page > this.data.pages || page < 1) {
                        this.sandbox.logger.log("invalid page number or reached start/end!");
                        return;
                    }
                    // if no pageSize is passed keep current pageSize
                    if (!pageSize) {
                        pageSize = this.data.pageSize;
                    }

                    // generate uri for loading
                    uriTemplate = this.sandbox.uritemplate.parse(this.data.links.pagination);
                    url = this.sandbox.uritemplate.expand(uriTemplate, {page: page, pageSize: pageSize});
                }

                this.sandbox.emit(PAGE_CHANGE, url);
                this.load({url: url,
                    success: function() {
                        this.sandbox.emit(UPDATED, 'changed page');
                    }.bind(this)});
            },

            /**
             * Updates data in datagrid
             * Called when husky.datagrid.update event emitted
             * Emits husky.datagrid.updated event on success
             */
            updateGrid: function() {
                this.resetSortingOptions();

                this.load({
                    url: this.data.links.self,
                    success: function() {
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },


            /**
             * Filters fields out of the data passed to the view
             * So its possible to hide fields/columns
             * Note that the also the arrangement of fields/columns can be changed and the view can react to it
             * @param fieldsData {Array}
             */
            filterGrid: function(fieldsData) {
                var template, url,
                    parsed = this.parseFieldsData(fieldsData);

                template = this.sandbox.uritemplate.parse(this.data.links.filter);
                url = this.sandbox.uritemplate.expand(template, {fieldsList: parsed.urlFields.split(',')});

                this.options.columns = parsed.columns;

                this.load({
                    url: url,
                    success: function() {
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },

            /**
             * Constructs the url to get sorted data and sets the request for it
             * @param attribute {String} The attribute to sort by
             * @param direction {String} the sort method to use 'asc' or 'desc'
             */
            sortGrid: function(attribute, direction) {
                var template, url;

                // if passed attribute is sortable
                if (!!attribute && !!this.data.links.sortable[attribute]) {

                    this.sort.attribute = attribute;
                    this.sort.direction = direction;

                    template = this.sandbox.uritemplate.parse(this.data.links.sortable[attribute]);
                    url = this.sandbox.uritemplate.expand(template, {sortOrder: direction});

                    this.sandbox.emit(DATA_SORT);

                    this.load({
                        url: url,
                        success: function() {
                            this.sandbox.emit(UPDATED);
                        }.bind(this)
                    });
                }
            },

            /**
             * triggers an api search
             * @param {String} searchString The String that will be searched
             * @param {String|Array} searchFields Fields that will be included into the search
             */
            searchGrid: function(searchString, searchFields) {

                var template, url;

                template = this.sandbox.uritemplate.parse(this.data.links.find);
                url = this.sandbox.uritemplate.expand(template, {searchString: searchString, searchFields: searchFields});

                this.load({
                    url: url,
                    success: function() {
                        this.sandbox.emit(UPDATED);
                    }.bind(this)
                });
            },

            /**
             * calls the funciton of the view responsible for the responsiveness
             */
            windowResizeListener: function() {
                this.gridView.onResize();
            }
        };
    });
})();

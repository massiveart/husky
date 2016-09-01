/**
 * @class DataGrid
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {Object} [options.data] if no url is provided (some functionality like search & sort will not work)
 * @param {String} [options.resultKey] the name of the data-array in the embedded in the response
 * @param {String} [options.defaultMeasureUnit] the unit that should be taken
 * @param {String} [options.view] name of the view to use.
 *                  external views can be used by configuring the path to decorator-js with require.config.paths
 * @param {Object} [options.viewOptions] Configuration Object for the view
 * @param {Boolean|String} [options.pagination] name the the pagination to use. If false no pagination will be initialized
 *                  external paginations can be used by configuring path to decorator-js with require.config.paths
 * @param {Object} [options.paginationOptions] Configuration Object for the pagination
 *
 * @param {Boolean} [options.sortable] Defines if records are sortable
 * @param {String} [options.searchInstanceName] if set, a listener will be set for the corresponding search events
 * @param {String} [options.columnOptionsInstanceName] if set, a listener will be set for listening for column changes
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.instanceName] name of the datagrid instance
 * @param {Array} [options.preselected] preselected ids
 * @param {Boolean|String} [options.childrenPropertyName] name of the property which contains the number of children. False to indaticate that list is flat
 * @param {Boolean} [options.onlySelectLeaves] If true only the outermost children can be selected
 * @param {Boolean} [options.resizeListeners] If true a resize-listener will be instantiated, which is responsible for responsiveness
 * @param {String|Function} [options.contentFilters] Used for filtering data at a specifig attribute / column.
 *        If defined as callback the rows value will be passed. If defined as a string, an existing filter template will be applied (see matching types).
 *        Passed will be (content, arguments, recordId).
 * @param {Array} [options.matchings] configuration array of columns if fieldsData isn't set
 * @param {String} [options.matchings.content] column title
 * @param {String} [options.matchings.width] width of column (used by the table view)
 * @param {String} [options.matchings.class] css class of the column
 * @param {String} [options.matchings.type] type of the column. Used to manipulate its content (e.g. 'date')
 * @param {String} [options.matchings.attribute] mapping information to data (if not set it will just iterate through attributes)
 * @param {Boolean} [options.selectedCounter] If true a counter will be displayed which shows how much elements have been selected
 * @param {String} [options.selectedCounterText] translation key or text used in the selected-counter
 * @param {Function} [options.clickCallback] callback for clicking an item - first parameter item id, second parameter the dataset of the clicked item
 * @param {Function} [options.actionCallback] action callback. E.g. executed on double-click in table-view - first parameter item id, second parameter the dataset of the clicked item
 * @param {Function} [options.idKey] the name of the id property
 * @param {Function} [options.childrenKey] the name of the children property
 */
(function() {

    'use strict';

    define([
        'husky_components/datagrid/decorators/table-view',
        'husky_components/datagrid/decorators/tiles-view',
        'husky_components/datagrid/decorators/dropdown-pagination',
        'husky_components/datagrid/decorators/infinite-scroll-pagination'
    ], function(decoratorTableView, decoratorTilesView, decoratorDropdownPagination, infiniteScrollPagination) {

        /* Default values for options */

        var defaults = {
                view: 'table',
                viewOptions: {
                    table: {},
                    thumbnail: {}
                },
                pagination: 'dropdown',
                paginationOptions: {
                    dropdown: {},
                    'infinite-scroll': {}
                },

                contentFilters: null,
                sortable: true,
                matchings: [],
                url: null,
                saveParams: {},
                data: null,
                instanceName: '',
                searchInstanceName: null,
                searchFields: [],
                columnOptionsInstanceName: null,
                defaultMeasureUnit: 'px',
                preselected: [],
                onlySelectLeaves: false,
                childrenPropertyName: false,
                resizeListeners: true,
                resultKey: 'items',
                selectedCounter: false,
                selectedCounterText: 'public.elements-selected',
                selectedCounterShowSelectedText: 'public.show-selected',
                selectedCounterShowAllText: 'public.show-all',
                viewSpacingBottom: 110,
                clickCallback: null,
                actionCallback: null,
                idKey: 'id',
                childrenKey: 'children'
            },

            types = {
                DATE: 'date',
                DATETIME: 'datetime',
                THUMBNAILS: 'thumbnails',
                TITLE: 'title',
                BYTES: 'bytes',
                RADIO: 'radio',
                CHECKBOX: 'checkbox',
                CHECKBOX_READONLY: 'checkbox_readonly',
                COUNT: 'count',
                TRANSLATION: 'translation',
                NUMBER: 'number',
                CURRENCY: 'currency'
            },

            decorators = {
                views: {
                    table: decoratorTableView,
                    tiles: decoratorTilesView
                },
                paginations: {
                    'dropdown': decoratorDropdownPagination,
                    'infinite-scroll': infiniteScrollPagination
                }
            },

            filters = {
                /**
                 * Takes bytes and returns a more readable string
                 * @param bytes {Number}
                 * @returns {string}
                 */
                bytes: function(bytes) {
                    return this.sandbox.util.formatBytes(bytes);
                },

                title: function(content) {
                    return content;
                },

                /**
                 * Brings a date into the right format
                 * @param date {String} the date to parse
                 * @returns {String}
                 */
                date: function(date) {
                    var parsedDate = this.sandbox.date.format(date);
                    if (parsedDate !== null) {
                        return parsedDate;
                    }
                    return date;
                },

                /**
                 * Brings a datetime into the right format
                 * @param datetime {String} the date to parse
                 * @returns {String}
                 */
                datetime: function(datetime) {
                    var parsedDate = this.sandbox.date.format(datetime, true);
                    if (parsedDate !== null) {
                        return parsedDate;
                    }
                    return datetime;
                },

                /**
                 * Translates a string
                 * @param val {String} the string to translate
                 * @returns {String}
                 */
                translation: function(val) {
                    return this.sandbox.translate(val);
                },

                /**
                 * Formats a float as culture specific number
                 * @param val {String} the string to format
                 * @returns {String}
                 */
                number: function(val) {
                    return this.sandbox.numberFormat(val, 'n');
                },


                /**
                 * Formats a float as culture specific currency
                 * @param val {String} the string to format
                 * @returns {String}
                 */
                currency: function(val) {
                    return this.sandbox.numberFormat(val, 'c');
                },

                /**
                 * Attaches a postfix to a number
                 * @param number
                 * @param postfix
                 */
                count: function(number, postfix) {
                    return (!!postfix) ? number + ' ' + postfix : number;
                },

                /**
                 * Takes an array of thumbnails and returns an object with url and and alt
                 * @param thumbnails {Array} array of thumbnails
                 * @param format {String} the format of the thumbnail
                 * @returns {Object} with url and alt property
                 */
                thumbnails: function(thumbnails, format) {
                    var thumbnail = {
                        url: null,
                        alt: null
                    };
                    if (!!thumbnails && !!thumbnails[format]) {
                        if (typeof thumbnails[format] === 'object') {
                            thumbnail.url = thumbnails[format].url;
                            thumbnail.alt = thumbnails[format].alt;
                        } else {
                            thumbnail.url = thumbnails[format];
                            thumbnail.alt = '';
                        }
                    }
                    return thumbnail;
                },

                /**
                 * checks for bool value and sets radio to true
                 */
                radio: function(content, index, columnName) {
                    return this.sandbox.util.template(templates.radio, {checked: !!content, columnName: columnName});
                },

                /**
                 * checks for bool value and renders a checkbox with value.
                 */
                checkbox: function(content, index, columnName) {
                    return this.sandbox.util.template(templates.checkbox, {
                        checked: !!content,
                        columnName: columnName,
                        readonly: false
                    });
                },

                /**
                 * checks for bool value and renders a readonly checkbox with value.
                 */
                checkbox_readonly: function(content, index, columnName) {
                    return this.sandbox.util.template(templates.checkbox, {
                        checked: !!content,
                        columnName: columnName,
                        readonly: true
                    });
                }
            },

            templates = {
                radio: [
                    '<div class="custom-radio custom-filter">',
                    '   <input name="radio-<%= columnName %>" type="radio" class="form-element" <% if (checked) { print("checked")} %>/>',
                    '   <span class="icon"></span>',
                    '</div>'
                ].join(''),
                checkbox: [
                    '<div class="custom-checkbox custom-filter">',
                    '   <input name="radio-<%= columnName %>" type="checkbox" class="form-element"',
                    '       <% if (readonly) { %>readonly="readonly"<% } %>',
                    '       <% if (checked) { %>checked<% } %>/>',
                    '   <span class="icon"></span>',
                    '</div>'
                ].join(''),
                selectedCounter: [
                    '<span class="selected-elements invisible smaller-font grey-font">',
                    '    <span class="number">0</span>',
                    '    &nbsp;<%= text %>',
                    '    <span class="show-selected-container" <% if (!showSelectedLink) { %>style="display: none;"<% } %>>',
                    '        &nbsp;(<span class="show-selected"><%= showText %></span>)',
                    '    </span>',
                    '</span>'
                ].join('')
            },

            namespace = 'husky.datagrid.',


        /* TRIGGERS EVENTS */

            /**
             * raised after initialization has finished
             * @event husky.datagrid.initialized
             */
            INITIALIZED = function() {
                return this.createEventName('initialized');
            },

            /**
             * raised after a view has been rendered
             * @event husky.datagrid.initialized
             */
            VIEW_RENDERED = function() {
                return this.createEventName('view.rendered');
            },

            /**
             * raised when the the current page changes
             * @event husky.datagrid.page.change
             */
            PAGE_CHANGE = function() {
                return this.createEventName('page.change');
            },

            /**
             * raised when the data is updated
             * @event husky.datagrid.updated
             */
            UPDATED = function() {
                return this.createEventName('updated');
            },

            /**
             * raised when the data is initially loaded
             * @event husky.datagrid.loaded
             */
            LOADED = function() {
                return this.createEventName('loaded');
            },

            /**
             * raised when item is deselected
             * @event husky.datagrid.item.deselect
             * @param {String} id of deselected item
             */
            ITEM_DESELECT = function() {
                return this.createEventName('item.deselect');
            },

            /**
             * raised when selection of items changes
             * @event husky.datagrid.number.selections
             */
            NUMBER_SELECTIONS = function() {
                return this.createEventName('number.selections');
            },

            /**
             * raised when item is selected
             * @event husky.datagrid.item.select
             * @param {String} if of selected item
             */
            ITEM_SELECT = function() {
                return this.createEventName('item.select');
            },

            /**
             * raised when clicked on an item
             * @event husky.datagrid.item.click
             * @param {String} id of item that was clicked
             */
            ITEM_CLICK = function() {
                return this.createEventName('item.click');
            },

            /**
             * raised when all items get deselected via the header checkbox
             * @event husky.datagrid.all.deselect
             */
            ALL_DESELECT = function() {
                return this.createEventName('all.deselect');
            },

            /**
             * raised when all items get deselected via the header checkbox
             * @event husky.datagrid.all.select
             * @param {Array} ids of all items that have been clicked
             */
            ALL_SELECT = function() {
                return this.createEventName('all.select');
            },

            /**
             * listens on and update the selected state of the given items
             * @event husky.datagrid.selected.update
             * @param {Array} ids of all items that should be selected
             */
            SELECTED_UPDATE = function() {
                return this.createEventName('selected.update');
            },

            /**
             * raised when data was saved
             * @event husky.datagrid.data.saved
             * @param {Object} data returned
             */
            DATA_SAVED = function() {
                return this.createEventName('updated');
            },

            /**
             * Raised when save of data failed.
             *
             * @event husky.datagrid.data.save.failed
             *
             * @param {String} jqXHR status
             * @param {String} text status
             * @param {String} error thrown
             */
            DATA_SAVE_FAILED = function() {
                return this.createEventName('data.save.failed');
            },

            /**
             * Raised when loading of data failed.
             *
             * @event husky.datagrid.loading.failed
             *
             * @param {String} jqXHR
             * @param {String} text status
             * @param {String} error thrown
             *
             */
            LOADING_FAILED = function() {
                return this.createEventName('loading.failed');
            },

            /**
             * raised when editable table is changed
             * @event husky.datagrid.data.save
             */
            DATA_CHANGED = function() {
                return this.createEventName('data.changed');
            },

        /* PROVIDED EVENTS */

            /**
             * raised when husky.datagrid.data.get is triggered
             * @event husky.datagrid.data.provide
             */
            DATA_PROVIDE = function() {
                return this.createEventName('data.provide');
            },

            /**
             * listens on and changes the view of the datagrid
             * @event husky.datagrid.view.change
             * @param {String} viewId The identifier of the view
             * @param {Object} Options to merge with the current view options
             */
            CHANGE_VIEW = function() {
                return this.createEventName('view.change');
            },

            /**
             * listens on and changes the view, pagination, page and limit of the datagrid
             * @event husky.datagrid.change
             * @param {Number} page The page
             * @param {Number} limit The limit
             * @param {String} viewId The identifier of the view
             * @param {Object} Options to merge with the current view options
             * @param {String} paginationId The identifier of the pagination
             */
            CHANGE = function() {
                return this.createEventName('change');
            },

            /**
             * listens on and changes the pagination of the datagrid
             * @event husky.datagrid.pagination.change
             * @param {String} paginationId The identifier of the pagination
             */
            CHANGE_PAGINATION = function() {
                return this.createEventName('pagination.change');
            },

            /**
             * listens on and changes the current rendered page
             * @event husky.datagrid.change.page
             * @param {Integer} page page to render
             */
            CHANGE_PAGE = function() {
                return this.createEventName('change.page');
            },

            /**
             * used to add a data record
             * @event husky.datagrid.record.add
             * @param {Object} the data of the new record
             */
            RECORD_ADD = function() {
                return this.createEventName('record.add');
            },

            /**
             * used to add multiple data records
             * @event husky.datagrid.records.add
             * @param {Object} the array of new records
             * @param callback {Function} callback to execute after process has been finished
             */
            RECORDS_ADD = function() {
                return this.createEventName('records.add');
            },

            /**
             * used to remove a data-record
             * @event husky.datagrid.record.remove
             * @param {String} id of the record to be removed
             */
            RECORD_REMOVE = function() {
                return this.createEventName('record.remove');
            },

            /**
             * used to remove multiple data-record
             * @event husky.datagrid.records.remove
             * @param {String} array of ids of the records to be removed
             */
            RECORDS_REMOVE = function() {
                return this.createEventName('records.remove');
            },


            /**
             * listens on and merges one or more data-records with a given ones
             * @event husky.datagrid.records.change
             * @param {Object|Array} the new data-record. Must at least contain an id-property. Can also be an array of data-records
             */
            RECORDS_CHANGE = function() {
                return this.createEventName('records.change');
            },

            /**
             * Deletes all records, sets given records and updates the view
             * @event husky.datagrid.records.set
             * @param {Array} array of data-records
             */
            RECORDS_SET = function() {
                return this.createEventName('records.set');
            },

            /**
             * used to get the currently displayed items
             * @event husky.datagrid.records.get
             * @param {Function} callback function receives array of records
             */
            RECORDS_GET = function() {
                return this.createEventName('records.get');
            },

            /**
             * raised when limit of request changed
             * @event husky.datagrid.page-size.changed
             * @param {Integer} pageSize new size
             * @param {String} paginationId current pagination
             */
            PAGE_SIZE_CHANGED = function() {
                return this.createEventName('page-size.changed');
            },

            /**
             * used to trigger an update of the data
             * @event husky.datagrid.update
             */
            UPDATE = function() {
                return this.createEventName('update');
            },

            /**
             * used to filter data by search
             * @event husky.datagrid.data.filter
             * @param {String} searchField
             * @param {String} searchString
             */
            DATA_SEARCH = function() {
                return this.createEventName('data.search');
            },

            /**
             * raised when data is sorted
             * @event husky.datagrid.data.sort
             */
            DATA_SORT = function() {
                return this.createEventName('data.sort');
            },

            /**
             * used to filter data by updating an url parameter
             * @event husky.datagrid.url.update
             * @param {Object} url parameter : key
             */
            URL_UPDATE = function() {
                return this.createEventName('url.update');
            },

            /**
             * triggers husky.datagrid.data.provide
             * @event husky.datagrid.data.get
             */
            DATA_GET = function() {
                return this.createEventName('data.get');
            },

            /**
             * sets new data to datagrid
             * @event husky.datagrid.data.set
             */
            DATA_SET = function() {
                return this.createEventName('data.set');
            },

            /**
             * triggers husky.datagrid.items.selected event, which returns all selected item ids
             * @event husky.datagrid.items.get-selected
             * @param  {Function} callback function receives array of selected items
             */
            ITEMS_GET_SELECTED = function() {
                return this.createEventName('items.get-selected');
            },

            /**
             * listens on and shows the medium loader above the view
             * @event husky.datagrid.medium-loader.show
             */
            MEDIUM_LOADER_SHOW = function() {
                return this.createEventName('medium-loader.show');
            },

            /**
             * listens on and shows the medium loader above the view
             * @event husky.datagrid.medium-loader.show
             */
            MEDIUM_LOADER_HIDE = function() {
                return this.createEventName('medium-loader.hide');
            },

            /**
             * selects an item with a given id
             * @event husky.datagrid.select.item
             * @param {String|Number} The id of the item to select
             */
            SELECT_ITEM = function() {
                return this.createEventName('select.item');
            },

            /**
             * deselects an item with a given id
             * @event husky.datagrid.deselect.item
             * @param {String|Number} The id of the item to deselect
             */
            DESELECT_ITEM = function() {
                return this.createEventName('deselect.item');
            },

            /**
             * toggle an item with a given id
             * @event husky.datagrid.toggle.item
             * @param {String|Number} The id of the item to toggle
             */
            TOGGLE_ITEM = function() {
                return this.createEventName('toggle.item');
            },

            /**
             * deselect all items
             * @event husky.datagrid.items.deselect
             */
            ITEMS_DESELECT = function() {
                return this.createEventName('items.deselect');
            },

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
                if (url.indexOf(paramName + "=") >= 0) {
                    var prefix = url.substring(0, url.indexOf(paramName + "=")),
                        suffix = url.substring(url.indexOf(paramName + "="));
                    suffix = suffix.substring(suffix.indexOf('=') + 1);
                    suffix = (suffix.indexOf('&') >= 0) ? suffix.substring(suffix.indexOf('&')) : '';
                    if (!!paramValue) {
                        url = prefix + paramName + '=' + paramValue + suffix;
                    } else {
                        if (url.substr(url.indexOf(paramName + '=') - 1, 1) === '&') {
                            url = url.substring(0, prefix.length - 1) + suffix;
                        } else {
                            url = prefix + suffix.substring(1, suffix.length);
                        }
                    }
                }
                else if (!!paramValue) {
                    if (url.indexOf("?") < 0) {
                        url += "?" + paramName + "=" + paramValue;
                    }
                    else {
                        url += "&" + paramName + "=" + paramValue;
                    }
                }
                return url;
            };

        return {

            /**
             * Creates the eventnames
             * @param postfix {String} event name to append
             */
            createEventName: function(postfix) {
                return namespace + ((!!this.options.instanceName) ? this.options.instanceName + '.' : '') + postfix;
            },

            /**
             * Initialize the datagrid component
             */
            initialize: function() {
                this.sandbox.logger.log('initialized datagrid');

                // extend default options and set variables
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

                this.matchings = [];
                this.requestFields = [];
                this.selectedItems = [];

                // make a copy of the decorators for each datagrid instance
                // if you directly access the decorators variable the datagrid-context in the decorators will be overwritten
                this.decorators = this.sandbox.util.extend(true, {}, decorators);

                this.types = types;

                this.gridViews = {};
                this.viewId = this.options.view;

                this.paginations = {};
                this.paginationId = this.options.pagination;

                this.$loader = null;
                this.$mediumLoader = null;
                this.isLoading = false;

                // append datagrid to html element
                this.$element = this.sandbox.dom.$('<div class="husky-datagrid"/>');
                this.$el.append(this.$element);

                this.dataGridWindowResize = null;

                this.sort = {
                    attribute: null,
                    direction: null
                };

                this.bindCustomEvents(); // Should only be be called once
                this.bindDOMEvents();
                this.renderMediumLoader();

                this.loadAndInitializeDecorators().then(function() {
                    if (this.options.selectedCounter === true) {
                        this.renderSelectedCounter();
                    }
                    this.loadAndEvaluateMatchings().then(function() {
                        // merge dom-selected and option-preselected items
                        this.preSelectItems();
                        this.loadAndRenderData();
                        this.sandbox.emit(INITIALIZED.call(this));
                    }.bind(this));
                }.bind(this));

            },

            remove: function() {
                this.unbindWindowResize();
                this.destroy();
            },

            /**
             * Gets the data either via the url or the array
             */
            loadAndRenderData: function() {
                var url;
                if (!!this.options.url) {
                    url = this.options.url;

                    if (this.requestFields.length > 0) {
                        url += (url.indexOf('?') === -1) ? '?' : '&';
                        url += 'fields=' + this.requestFields.join(',');
                    }

                    this.sandbox.logger.log('load data from url');

                    this.loading();
                    this.load({
                        url: url,
                        success: function(data) {
                            this.sandbox.emit(LOADED.call(this), data);
                        }.bind(this)
                    });
                } else if (!!this.options.data) {
                    this.sandbox.logger.log('load data from array');
                    this.data = {};
                    if (!!this.options.resultKey && !!this.options.data[this.options.resultKey]) {
                        this.data.embedded = this.parseEmbedded(this.options.data[this.options.resultKey]);
                    } else {
                        this.data.embedded = this.parseEmbedded(this.options.data);
                    }

                    this.render();
                    if (!!this.paginations[this.paginationId]) {
                        this.paginations[this.paginationId].render(this.data, this.$element);
                    }
                }
            },

            /**
             * Checks if matchings/fields are given as url or array.
             * If a url is given the appropriate fields are fetched.
             */
            loadAndEvaluateMatchings: function() {
                var def = this.sandbox.data.deferred();

                var matchings = this.options.matchings;
                if (typeof(matchings) === 'string') {
                    // Load matchings/fields from url
                    this.loading();
                    this.loadMatchings({
                        url: matchings,
                        success: function(response) {
                            this.filterMatchings(response);
                            def.resolve();
                        }.bind(this)
                    });
                } else {
                    this.filterMatchings(matchings);
                    def.resolve();
                }
                return def;
            },

            /**
             * Loads matchings via ajax
             * @param params url
             */
            loadMatchings: function(params) {
                this.sandbox.dom.addClass(this.$find('.selected-elements'), 'invisible');
                this.sandbox.util.load(params.url)
                    .then(function(response) {
                        this.updateSelectedCounter();
                        if (this.isLoading === true) {
                            this.stopLoading();
                        }
                        this.destroy();
                        if (!!params.success && typeof params.success === 'function') {
                            params.success(response);
                        }
                    }.bind(this))
                    .fail(function(jqXHR, textStatus, error) {
                        this.sandbox.emit(LOADING_FAILED.call(this), jqXHR, textStatus, error);
                    }.bind(this));
            },

            /**
             * Takes an array of matchings and filters disabled matchings out of it
             * Moreover it constructs the array of fields which should be requested from a server
             * The filtered matchings are available in this.matchings
             * The request-fields are available in this.requestFields
             *
             * @param {Array} matchings array with matchings
             */
            filterMatchings: function(matchings) {
                var matchingObject;
                this.matchings = [];
                this.requestFields = [];

                this.sandbox.util.foreach(matchings, function(matching) {
                    matchingObject = {};

                    // only add matching if it's not disabled
                    if ((matching.disabled !== 'true' && matching.disabled !== true)) {

                        // build up the matching with the keys of the passed matching
                        for (var key in matching) {
                            if (key === 'translation') {
                                matchingObject.content = this.sandbox.translate(matching.translation);
                            } else if (key === 'name') {
                                matchingObject.attribute = matching.name;
                            } else if (key === 'sortable') {
                                matchingObject.sortable = matching.sortable;
                                if (typeof matching.sortable === 'string') {
                                    matchingObject.sortable = JSON.parse(matching.sortable);
                                }
                            } else {
                                matchingObject[key] = matching[key];
                            }
                        }
                        // push the constructed matching to the global matchings array
                        this.matchings.push(matchingObject);
                        this.requestFields.push(matching.name);
                    } else if (matching.name === this.options.idKey) {
                        this.requestFields.push(matching.name);
                    }
                    // always load the id (never ever even think about not loading the id)
                }.bind(this));
            },

            /**
             * Renders the data of the datagrid
             */
            render: function() {
                this.renderView();
                if (!!this.paginations[this.paginationId]) {
                    this.paginations[this.paginationId].render(this.data, this.$element);
                }
                if (this.options.resizeListeners === true) {
                    this.windowResizeListener();
                }
            },

            /**
             * Renderes the counter which shows how many elements have been selected
             */
            renderSelectedCounter: function() {
                this.sandbox.dom.append(
                    this.$element,
                    this.sandbox.util.template(templates.selectedCounter, {
                            text: this.sandbox.translate(this.options.selectedCounterText),
                            showText: this.sandbox.translate(this.options.selectedCounterShowSelectedText),
                            showSelectedLink: !!this.gridViews[this.viewId].showSelected
                        }
                    )
                );
                this.updateSelectedCounter();
            },

            /**
             * Renderes the current view
             */
            renderView: function() {
                this.gridViews[this.viewId].render(this.data, this.$element);
                this.updateSelectedCounter();
                this.sandbox.emit(VIEW_RENDERED.call(this));
            },

            /**
             * Preselects items because of passed options via javascript and the dom
             */
            preSelectItems: function() {
                var dataSelected = this.sandbox.dom.data(this.$el, 'selected'),
                    convertedArray = [];
                if (!!dataSelected) {
                    this.options.preselected = this.sandbox.util.union(this.options.preselected, dataSelected);
                }
                // convert to an array which only contains ids as integers
                this.sandbox.util.foreach(this.options.preselected, function(element) {
                    if (typeof element === 'object') {
                        convertedArray.push(element.id);
                    } else {
                        convertedArray.push(element);
                    }
                }.bind(this));
                this.options.preselected = convertedArray;
                this.setSelectedItems(this.options.preselected);
                this.setSelectedItemsToData();
            },

            /**
             * Sets the ids of slected records into the dom
             */
            setSelectedItemsToData: function() {
                this.sandbox.dom.removeAttr(this.$el, 'data-selected');
                this.sandbox.dom.data(this.$el, 'selected', this.getSelectedItemIds());
            },

            /**
             * Destroys the view and the pagination
             */
            destroy: function() {
                if (!!this.gridViews[this.viewId] && !!this.gridViews[this.viewId].rendered) {
                    this.gridViews[this.viewId].destroy();
                    if (!!this.paginations[this.paginationId]) {
                        this.paginations[this.paginationId].destroy();
                    }
                }
            },

            /**
             * Rerenders the view
             */
            rerenderView: function() {
                this.gridViews[this.viewId].destroy();
                this.renderView();
            },

            /**
             * Rerenders the pagination
             */
            rerenderPagination: function() {
                if (!!this.paginations[this.paginationId]) {
                    this.paginations[this.paginationId].destroy();
                    this.paginations[this.paginationId].render(this.data, this.$element);
                }
            },

            /**
             * Loads contents via ajax
             * @param params url
             */
            load: function(params) {
                this.currentUrl = this.getUrl(params);

                if (!params.data) params.data = {};
                params.data['expandIds'] = this.getSelectedItemIds().join(',');

                this.sandbox.dom.addClass(this.$find('.selected-elements'), 'invisible');
                return this.sandbox.util.load(this.currentUrl, params.data)
                    .then(function(response) {
                        this.sandbox.dom.removeClass(this.$find('.selected-elements'), 'invisible');
                        if (this.isLoading === true) {
                            this.stopLoading();
                        }
                        this.destroy();
                        this.parseData(response);
                        this.getSortingFromUrl(this.currentUrl);
                        this.render();
                        if (!!params.success && typeof params.success === 'function') {
                            params.success(response);
                        }
                    }.bind(this))
                    .fail(function(jqXHR, textStatus, error) {
                        this.sandbox.emit(LOADING_FAILED.call(this), jqXHR, textStatus, error);
                    }.bind(this));
            },

            /**
             * Changes data in grid from array
             * @param data array
             */
            setData: function(data) {
                this.destroy();

                if (!!data.resultKey && !!data[data.resultKey]) {
                    this.data.embedded = data[data.resultKey];
                } else {
                    this.data.embedded = data;
                }

                if (!!this.paginations[this.paginationId]) {
                    this.paginations[this.paginationId].render(this.data, this.$element);
                }

                this.render();
            },

            /**
             * Parses the sorting params from the url
             * @param url
             */
            getSortingFromUrl: function(url) {
                if (url.indexOf('sortOrder') > -1 && url.indexOf('sortBy') > -1) {
                    var attribute = this.sandbox.util.getParameterByName('sortBy', url),
                        direction = this.sandbox.util.getParameterByName('sortOrder', url);

                    if (!!attribute && !!direction) {
                        this.sort.attribute = attribute;
                        this.sort.direction = direction;
                    }
                }
            },

            /**
             * Displays a loading icon
             */
            loading: function() {
                if (this.sandbox.dom.is(this.$element, ':visible')) {
                    this.sandbox.dom.height(this.$element, this.sandbox.dom.outerHeight(this.$element));
                    this.sandbox.dom.width(this.$element, this.sandbox.dom.outerWidth(this.$element));
                }

                this.sandbox.dom.addClass(this.$element, 'loading');

                if (!this.$loader) {
                    this.$loader = this.sandbox.dom.createElement('<div class="datagrid-loader"/>');
                    this.sandbox.dom.hide(this.$loader);
                    this.sandbox.dom.append(this.$element, this.$loader);

                    this.sandbox.start([
                        {
                            name: 'loader@husky',
                            options: {
                                el: this.$loader,
                                size: '100px',
                                color: '#cccccc'
                            }
                        }
                    ]);
                }

                this.sandbox.dom.show(this.$loader);
                this.isLoading = true;
            },

            /**
             * Hides the loading icon
             */
            stopLoading: function() {
                this.isLoading = false;
                this.sandbox.dom.hide(this.$loader);
                this.sandbox.dom.removeClass(this.$element, 'loading');

                this.sandbox.dom.height(this.$element, '');
                this.sandbox.dom.width(this.$element, '');
                return this.$element;
            },

            /**
             * Gets the view and a load to get data and render it
             */
            loadAndInitializeDecorators: function() {
                var def = this.sandbox.data.deferred();
                this.loadAndInitializePagination(this.paginationId).then(function() {
                    this.loadAndInitializeView(this.viewId).then(function() {
                        def.resolve();
                    }.bind(this));
                }.bind(this));
                return def;
            },

            /**
             * Renderes and starts the medium loader, which can
             * be displayed above a view with events
             */
            renderMediumLoader: function() {
                this.$mediumLoader = this.sandbox.dom.createElement('<div class="medium-loader"/>');
                this.sandbox.dom.append(this.$element, this.$mediumLoader);

                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: this.$mediumLoader,
                            size: '50px',
                            color: '#cccccc'
                        }
                    }
                ]);
            },

            /**
             * Displays the medium loader above the view
             */
            showMediumLoader: function() {
                this.sandbox.dom.addClass(this.$mediumLoader, 'show');
            },

            /**
             * Hides the medium loader
             */
            hideMediumLoader: function() {
                this.sandbox.dom.removeClass(this.$mediumLoader, 'show');
            },

            /**
             * Takes a data object and sets it to the global data-property
             * @param data {Object} data property
             */
            parseData: function(data) {
                this.data = {};
                this.data.links = this.parseLinks(data._links);
                this.data.embedded = this.parseEmbedded(data._embedded[this.options.resultKey]);
                this.data.total = data.total;
                this.data.page = data.page;
                this.data.pages = data.pages;
                this.data.limit = data.limit;
            },

            /**
             * Parses data and returns normalized embedded items.
             *
             * @param {Array} data
             * @param {Object} parent
             */
            parseEmbedded: function(data, parent) {
                var embedded = [];
                for (var i = 0, len = data.length; i < len; i++) {
                    var children = [];
                    if (!!parent) {
                        data[i].parent = parent;
                    }

                    data[i].id = data[i][this.options.idKey];
                    if (!data[i][this.options.childrenPropertyName]) {
                        data[i][this.options.childrenPropertyName] = false;
                    }

                    if (data[i].hasOwnProperty(this.options.childrenKey)) {
                        children = this.parseEmbedded(data[i][this.options.childrenKey], data[i].id);
                        data[i][this.options.childrenPropertyName] = (children.length > 0);
                    }

                    embedded.push(data[i]);
                    embedded = embedded.concat(children);
                }

                return embedded;
            },

            /**
             * Unescapes all passed links
             * @param links {Object}
             * @returns {Object}
             */
            parseLinks: function(links) {
                var linksObj = {};
                this.sandbox.util.each(links, function(index, link) {
                    linksObj[index] = {
                        href: decodeURI(link.href)
                    };
                }.bind(this));
                return linksObj;
            },

            /**
             * Load view decorator to given viewId and initialize it
             * @param viewId {String} the identifier of the decorator
             */
            loadAndInitializeView: function(viewId) {
                this.viewId = viewId;
                var def = this.sandbox.data.deferred();

                // view allready loaded
                if (!!this.gridViews[this.viewId]) {
                    def.resolve();
                }

                // load husky decorator
                else if (!!this.decorators.views[this.viewId]) {
                    this.gridViews[this.viewId] = this.decorators.views[this.viewId];
                    this.initializeViewDecorator();
                    def.resolve();
                }

                // not an husky decorator, try to load external decorator
                else {
                    require([viewId], function(view) {
                        // this will keep BC
                        if (typeof view === 'function') {
                            view = new view();
                        }

                        this.gridViews[this.viewId] = view;
                        this.initializeViewDecorator();
                        def.resolve();
                    }.bind(this));
                }

                return def;
            },

            /**
             * Initialize the current set view decorator. Log an error message to console if the view is not valid
             */
            initializeViewDecorator: function() {
                if (this.isViewValid(this.gridViews[this.viewId])) {
                    // merge view options with passed ones
                    this.gridViews[this.viewId].initialize(this, this.options.viewOptions[this.viewId]);
                } else {
                    this.sandbox.logger.log('Error: View does not meet the configured requirements. See the documentation');
                }
            },

            /**
             * Validates a given view
             * @param view {Object} the view to validate
             * @returns {boolean} returns true if the view is usable
             */
            isViewValid: function(view) {
                if (!view ||
                    typeof view.initialize === 'undefined' ||
                    typeof view.render === 'undefined' ||
                    typeof view.destroy === 'undefined') {
                    return false;
                }
                return true;
            },

            /**
             * Load pagination decorator to given paginationId and initialize it
             * @param {String} paginationId the identifier of the pagination
             */
            loadAndInitializePagination: function(paginationId) {
                this.paginationId = paginationId;
                var def = this.sandbox.data.deferred();

                // no pagination set or pagination allready loaded
                if (!paginationId || !!this.paginations[this.paginationId]) {
                    def.resolve();
                }

                // load husky decorator
                else if (!!this.decorators.paginations[this.paginationId]) {
                    this.paginations[this.paginationId] = this.decorators.paginations[this.paginationId];
                    this.initializePaginationDecorator();
                    def.resolve();
                }

                // not an husky decorator, try to load external decorator
                else {
                    require([paginationId], function(pagination) {
                        this.decorators.paginations[this.paginationId] = pagination;
                        this.initializePaginationDecorator();
                        def.resolve();
                    }.bind(this));
                }

                return def;
            },

            /**
             * Initialize the current set pagination decorator. Log an error message to console if the view is not valid
             */
            initializePaginationDecorator: function() {
                if (this.isPaginationValid(this.paginations[this.paginationId])) {
                    this.paginations[this.paginationId]
                        .initialize(this, this.options.paginationOptions[this.paginationId]);
                } else {
                    this.sandbox.logger
                        .log('Error: Pagination does not meet the configured requirements. See the documentation');
                }
            },

            /**
             * Changes the view of the datagrid
             * @param view {String} identifier of the new view to use
             * @param options {Object} an object with options to merge with the current view options for the view
             */
            changeView: function(view, options) {
                // only change if view or if options are passed (could be passed to the same view)
                if (view !== this.viewId || !!options) {
                    this.destroy();
                    return this.loadAndInitializeView(view).then(function() {
                        this.extendViewOptions(options);
                        this.render();
                    }.bind(this));
                }
            },

            /**
             * Changes the pagination of the datagrid
             * @param pagination {String} identifier of the new pagination to use
             */
            changePagination: function(pagination) {
                if (pagination !== this.paginationId) {
                    this.destroy();
                    this.loadAndInitializePagination(pagination).then(function() {
                        this.render();
                    }.bind(this));
                }
            },

            /**
             * Changes style and page of datagrid
             * @param {Number} page The page
             * @param {Number} limit The limit
             * @param {String} viewId The identifier of the view
             * @param {Object} options to merge with the current view options
             * @param {String} paginationId The identifier of the pagination
             */
            change: function(page, limit, viewId, options, paginationId) {
                if (paginationId === this.paginationId && view === this.viewId) {
                    return;
                }

                this.showMediumLoader();
                this.changePage(null, page, limit).then(function() {
                    this.changeView(viewId, options).then(function() {
                        this.changePagination(paginationId);
                        this.hideMediumLoader();
                    }.bind(this));
                }.bind(this));
            },

            /**
             * Takes an object with options and passes them to the view,
             * so the view can extend its current ones with them
             * @param options {Object} mew options
             */
            extendViewOptions: function(options) {
                if (!!options && !!this.gridViews[this.viewId].extendOptions) {
                    this.gridViews[this.viewId].extendOptions(options);
                }
            },

            /**
             * Validates a given pagination
             * @param pagination {Object} the pagination to validate
             * @returns {boolean} returns true if the pagination is usable
             */
            isPaginationValid: function(pagination) {
                if (!pagination ||
                    typeof pagination.initialize === 'undefined' ||
                    typeof pagination.render === 'undefined' ||
                    typeof pagination.getLimit === 'undefined' ||
                    typeof pagination.destroy === 'undefined') {
                    return false;
                }
                return true;
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
                if (!!this.options.pagination && !!this.paginations[this.paginationId].getLimit()) {
                    if (params.url.indexOf('?') !== -1) {
                        delimiter = '&';
                    }
                    url = params.url + delimiter + 'limit=' + this.paginations[this.paginationId].getLimit();
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
             * @param argument {Number|String} argument to pass to the processor
             * @param columnName {String} Name of the column
             * @returns {String} the manipulated content
             */
            manipulateContent: function(content, type, argument, columnName) {
                if (typeof type === 'function') {
                    return type(content, argument, columnName);
                } else if (filters.hasOwnProperty(type)) {
                    return filters[type].call(this, content, argument, columnName);
                }
                return content;
            },

            /**
             * Checks if a filter was set for specified column and processes it
             * @param {String} attributeName name of processed attribute
             * @param {String} content the content which is processed
             * @param {String} [type] if no filter is set, the type is processed
             * @param {Number|String} [argument] argument to pass to the processor
             * @returns {String} the manipulated content
             */
            processContentFilter: function(attributeName, content, type, argument, recordId) {
                // check if filter is set for current column
                if (!!this.options.contentFilters && this.options.contentFilters.hasOwnProperty(attributeName)) {
                    // check if filter is function or string and call filter
                    if (typeof this.options.contentFilters[attributeName] === 'function') {
                        return this.options.contentFilters[attributeName].call(this, content, argument, recordId);
                    } else if (typeof this.options.contentFilters[attributeName] === 'string') {
                        type = this.options.contentFilters[attributeName];
                        return this.manipulateContent(content, type, argument, attributeName);
                    }
                }
                // if no filter was set, check if type is set and calls
                else if (!!type) {
                    return this.manipulateContent(content, type, argument);
                }
                return content;
            },

            /**
             * Reset the sorting properties
             */
            resetSortingOptions: function() {
                this.sort.attribute = null;
                this.sort.direction = null;
            },

            /**
             * Binds Dom-related events
             */
            bindDOMEvents: function() {
                if (this.options.resizeListeners === true) {
                    this.dataGridWindowResize = this.windowResizeListener.bind(this);
                    this.sandbox.dom.on(
                        this.sandbox.dom.$window,
                        'resize.' + this.createEventName('dom'),
                        this.dataGridWindowResize
                    );
                }

                if (this.options.selectedCounter) {
                    this.sandbox.dom.on(this.$el,
                        'click',
                        this.toggleSelectedClickHandler.bind(this),
                        '.selected-elements .show-selected'
                    );
                }
            },

            /**
             * Handlers the click on the "show selected" and "show all" button.
             *
             * @param {Object} event The click event
             */
            toggleSelectedClickHandler: function(event) {
                this.sandbox.dom.stopPropagation(event);
                if (!this.gridViews[this.viewId].showSelected) {
                    return;
                }

                this.show = !this.show;
                this.gridViews[this.viewId].showSelected(this.show);
                if (!!this.show && !!this.paginations[this.paginationId]) {
                    this.paginations[this.paginationId].destroy();
                } else {
                    this.rerenderPagination();
                }

                this.updateSelectedCounter();
            },

            unbindWindowResize: function() {
                this.sandbox.dom.off(this.sandbox.dom.$window, 'resize.' + this.createEventName('dom'));
            },

            /**
             * Bind custom-related events
             */
            bindCustomEvents: function() {
                if (this.options.resizeListeners === true) {
                    this.sandbox.on('husky.navigation.size.changed', this.windowResizeListener.bind(this));
                }

                this.sandbox.on(UPDATE.call(this), this.updateGrid.bind(this));
                this.sandbox.on(DATA_SET.call(this), this.setData.bind(this));
                this.sandbox.on(DATA_GET.call(this), this.provideData.bind(this));
                this.sandbox.on(DATA_SEARCH.call(this), this.searchGrid.bind(this));
                this.sandbox.on(URL_UPDATE.call(this), this.updateUrl.bind(this));
                this.sandbox.on(CHANGE_VIEW.call(this), this.changeView.bind(this));
                this.sandbox.on(CHANGE.call(this), this.change.bind(this));
                this.sandbox.on(CHANGE_PAGINATION.call(this), this.changePagination.bind(this));
                this.sandbox.on(RECORD_ADD.call(this), this.addRecordHandler.bind(this));
                this.sandbox.on(RECORDS_ADD.call(this), this.addRecordsHandler.bind(this));
                this.sandbox.on(RECORD_REMOVE.call(this), this.removeRecordHandler.bind(this));
                this.sandbox.on(RECORDS_REMOVE.call(this), this.removeRecordsHandler.bind(this));
                this.sandbox.on(RECORDS_CHANGE.call(this), this.changeRecordsHandler.bind(this));
                this.sandbox.on(RECORDS_SET.call(this), this.setRecordsHandler.bind(this));
                this.sandbox.on(RECORDS_GET.call(this), this.getRecordsHandler.bind(this));
                this.sandbox.on(NUMBER_SELECTIONS.call(this), this.updateSelectedCounter.bind(this));
                this.sandbox.on(MEDIUM_LOADER_SHOW.call(this), this.showMediumLoader.bind(this));
                this.sandbox.on(MEDIUM_LOADER_HIDE.call(this), this.hideMediumLoader.bind(this));
                this.sandbox.on(SELECTED_UPDATE.call(this), this.updateSelection.bind(this));
                this.sandbox.on(SELECT_ITEM.call(this), this.selectItem.bind(this));
                this.sandbox.on(DESELECT_ITEM.call(this), this.deselectItem.bind(this));
                this.sandbox.on(TOGGLE_ITEM.call(this), this.toggleItem.bind(this));
                this.sandbox.on(ITEMS_DESELECT.call(this), function() {
                    this.gridViews[this.viewId].deselectAllRecords();
                }.bind(this));
                this.sandbox.on(ITEMS_GET_SELECTED.call(this), function(callback, returnItems) {
                    if (!!returnItems) {
                        var ids = this.getSelectedItemIds(),
                            items = [];

                        this.sandbox.util.foreach(ids, function(id) {
                            items.push(this.getRecordById(id));
                        }.bind(this));

                        callback(ids, items);
                    } else {
                        callback(this.sandbox.util.deepCopy(this.getSelectedItemIds()));
                    }
                }.bind(this));
                this.sandbox.on(CHANGE_PAGE.call(this), function(page, limit) {
                    if (!isNaN(page)) {
                        this.changePage(null, page, limit);
                    }
                }.bind(this));

                this.startColumnOptionsListener();
                this.startSearchListener();
            },

            /**
             * Listens on search events to trigger a grid search
             */
            startSearchListener: function() {
                if (this.options.searchInstanceName !== null) {
                    var searchInstanceName = '.' + this.options.searchInstanceName;
                    this.sandbox.on('husky.search' + searchInstanceName, this.searchGrid.bind(this));
                    this.sandbox.on('husky.search' + searchInstanceName + '.reset', this.searchGrid.bind(this, ''));
                }
            },

            /**
             * Starts a listener on column options to trigger a grid filter
             */
            startColumnOptionsListener: function() {
                // listen to events from column options
                if (this.options.columnOptionsInstanceName !== null) {
                    var columnOptionsInstanceName = (this.options.columnOptionsInstanceName !== '') ? '.' + this.options.columnOptionsInstanceName : '';
                    this.sandbox.on('husky.column-options' + columnOptionsInstanceName + '.saved', this.filterGrid.bind(this));
                }
            },

            /**
             * Returns url without params
             */
            getUrlWithoutParams: function() {
                var url = this.data.links.self.href;

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
                if (!!this.data && !!this.data.embedded) {
                    for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                        if (this.data.embedded[i].id === id) {
                            return i;
                        }
                    }
                }

                return null;
            },

            /**
             * Returns the item for a given id
             * @param id {Number|String} the id to search for
             * @returns {Number|String} the index of the found record
             */
            getRecordById: function(id) {
                for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                    if (this.data.embedded[i].id === id) {
                        return this.data.embedded[i];
                    }
                }

                return null;
            },

            /**
             * Provides data of the list to the caller
             */
            provideData: function() {
                this.sandbox.emit(DATA_PROVIDE.call(this), this.data);
            },

            /**
             * calls the funciton of the view responsible for the responsiveness
             */
            windowResizeListener: function() {
                if (!!this.gridViews[this.viewId] && !!this.gridViews[this.viewId].onResize) {
                    this.gridViews[this.viewId].onResize();
                }
            },

            /**
             * Handles the record add event
             */
            addRecordHandler: function(recordData) {
                if (!this.gridViews[this.viewId].addRecord) {
                    return;
                }

                if (!!recordData[this.options.idKey]) {
                    this.pushRecords([recordData]);
                }
                this.gridViews[this.viewId].addRecord(recordData, false);
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
            },

            /**
             * Handles the event for adding multiple records
             * to a view
             * @param records {Array} array with new records to add
             * @param callback {Function} callback to execute after process has been finished
             */
            addRecordsHandler: function(records, callback) {
                if (!this.gridViews[this.viewId].addRecord) {
                    return;
                }

                this.sandbox.util.foreach(records, function(record) {
                    if (!!record[this.options.idKey]) {
                        this.pushRecords([record]);
                        this.gridViews[this.viewId].addRecord(record, false);
                    }
                }.bind(this));
                if (typeof callback === 'function') {
                    callback();
                }
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
            },

            /**
             * Handles the row remove event
             */
            removeRecordHandler: function(recordId) {
                if (!this.gridViews[this.viewId].removeRecord || !recordId) {
                    return;
                }

                this.gridViews[this.viewId].removeRecord(recordId);
                this.removeRecordFromSelected(recordId);
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
            },

            /**
             * Handles the row remove event
             */
            removeRecordsHandler: function(recordIds) {
                if (!this.gridViews[this.viewId].removeRecord || !recordIds) {
                    return;
                }

                this.sandbox.util.foreach(recordIds, function(recordId) {
                    this.gridViews[this.viewId].removeRecord(recordId);
                    this.removeRecordFromSelected(recordId);
                }.bind(this));
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
            },

            /**
             * Removes a record from the selected items
             * @param recordId
             */
            removeRecordFromSelected: function(recordId) {
                var index = this.selectedItems.indexOf(recordId);
                if (index > -1) {
                    this.selectedItems.splice(index, 1);
                }
            },

            /**
             * Merges one or more data-records with a given ones and updates the view
             * @param {Object|Array} records the new data-record or an array of data-records
             */
            changeRecordsHandler: function(records) {
                if (!this.sandbox.dom.isArray(records)) {
                    records = [records];
                }
                this.sandbox.util.foreach(records, function(record) {
                    this.changeRecord(record);
                }.bind(this));

                this.rerenderView();
                this.rerenderPagination();
            },

            /**
             * Deletes all records, sets given records and updates the view
             * @param {Array} records array of data-records
             */
            setRecordsHandler: function(records) {
                // Delete all records.
                this.data.embedded = [];

                // Add the records.
                this.pushRecords(records);

                this.rerenderView();
                this.rerenderPagination();
            },

            /**
             * Calls the given callback-function with all displayed records.
             * @param {Array} records array of data-records
             */
            getRecordsHandler: function(callback) {
                callback(this.sandbox.util.deepCopy(this.data.embedded));
            },

            /**
             * calls the clickCallback for an item
             * @param {Number|String} id the id of the item
             */
            itemClicked: function(id) {
                if (typeof this.options.clickCallback === 'function') {
                    this.options.clickCallback(id, this.data.embedded[this.getRecordIndexById(id)]);
                }
                this.sandbox.emit(ITEM_CLICK.call(this), id, this.data.embedded[this.getRecordIndexById(id)]);
            },

            /**
             * calls the actionCallback for an item
             * @param id {Number|String} the id of the item
             */
            itemAction: function(id) {
                if (typeof this.options.actionCallback === 'function') {
                    this.options.actionCallback(id, this.data.embedded[this.getRecordIndexById(id)]);
                }
            },

            /**
             * Returns the maximum height for the view to fit on screen
             * @returns {number}
             */
            getRemainingViewHeight: function() {
                var height = this.sandbox.dom.height(this.sandbox.dom.window) - this.sandbox.dom.offset(this.$element).top;
                if (!!this.paginations[this.paginationId] && !!this.paginations[this.paginationId].getHeight) {
                    height -= this.paginations[this.paginationId].getHeight();
                }
                height -= this.options.viewSpacingBottom;

                return height;
            },

            /**
             * Updates the selected-elements counter
             */
            updateSelectedCounter: function() {
                if (this.options.selectedCounter === true) {
                    this.sandbox.dom.html(this.$find('.selected-elements .number'), this.getSelectedItemIds().length);
                    if (this.getSelectedItemIds().length === 0) {
                        this.sandbox.dom.addClass(this.$find('.selected-elements'), 'invisible');
                    } else {
                        this.sandbox.dom.removeClass(this.$find('.selected-elements'), 'invisible');
                    }

                    if (!!this.gridViews[this.viewId] && !!this.gridViews[this.viewId].showSelected &&
                        this.getSelectedItemIds().length === 0
                    ) {
                        if (this.show === true && !!this.gridViews[this.viewId].rendered) {
                            this.gridViews[this.viewId].showSelected(false);
                        }
                        this.show = false;
                    }

                    if (!!this.show) {
                        this.sandbox.dom.text(
                            this.$find('.show-selected'),
                            this.sandbox.translate(this.options.selectedCounterShowAllText)
                        );
                    } else {
                        this.sandbox.dom.text(
                            this.$find('.show-selected'),
                            this.sandbox.translate(this.options.selectedCounterShowSelectedText)
                        );
                    }

                    if (!!this.gridViews[this.viewId].showSelected) {
                        this.sandbox.dom.show(this.$find('.show-selected-container'));
                    } else {
                        this.sandbox.dom.hide(this.$find('.show-selected-container'));
                    }

                }
            },

            /**
             * Methods for data manipulation
             * --------------------------------------------------------------------
             */

            /**
             * Sets all data records unselected
             */
            deselectAllItems: function() {
                this.selectedItems = [];
                // emit events with selected data
                this.sandbox.emit(ALL_DESELECT.call(this));
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), 0);
                this.setSelectedItemsToData();
            },

            /**
             * Sets all data records selected
             */
            selectAllItems: function() {
                var i, length;
                for (i = -1, length = this.data.embedded.length; ++i < length;) {
                    this.setItemSelected(this.data.embedded[i].id);
                }
                this.sandbox.emit(ALL_SELECT.call(this), this.selectedItems);
                // emit events with selected data
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.selectedItems.length);
                this.setSelectedItemsToData();
            },

            /**
             * Returns the ids of all selected items
             * @param selection {Array} list of selected items
             */
            updateSelection: function(selection) {
                var i, length;

                this.gridViews[this.viewId].deselectAllRecords();

                for (i = -1, length = selection.length; ++i < length;) {
                    this.gridViews[this.viewId].selectRecord(selection[i]);
                }
            },

            /**
             * Selects an item with a given id
             * @param itemId {Number|String} the id of the item to select
             */
            selectItem: function(itemId) {
                this.gridViews[this.viewId].selectRecord(itemId);
            },

            /**
             * Deselects an item with a given id
             * @param itemId {Number|String} the id of the item to select
             */
            deselectItem: function(itemId) {
                if (!!this.gridViews[this.viewId].deselectRecord) {
                    this.gridViews[this.viewId].deselectRecord(itemId);
                }
            },

            /**
             * Toogle an item with a given id
             * @param itemId {Number|String} the id of the item to select
             */
            toggleItem: function(itemId) {
                if (this.itemIsSelected(itemId)) {
                    this.deselectItem(itemId);
                } else {
                    this.selectItem(itemId);
                }
            },

            /**
             * Returns the ids of all selected items
             * @return {Array} array with all ids
             */
            getSelectedItemIds: function() {
                return this.selectedItems;
            },

            /**
             * Sets all data records with their ids contained in the passed array selected and
             * deselects all data records not contained.
             * @param items {Array} array with all items that should be selected
             */
            setSelectedItems: function(items) {
                var count = 0, i, length, position;
                for (i = -1, length = items.length; ++i < length;) {
                    if (this.selectedItems.indexOf(items[i]) === -1 && this.selectingAllowed(items[i])) {
                        this.selectedItems.push(items[i]);
                        count++;
                    } else if ((position = this.selectedItems.indexOf(items[i])) !== -1) {
                        this.selectedItems.splice(position, 1);
                    }
                }
                this.sandbox.emit(NUMBER_SELECTIONS.call(this), count);
            },

            /**
             * Returns true if an item with a given id is selected
             * @param id {Number|String} id of the item
             * @returns {Boolean} returns true if item is selected
             */
            itemIsSelected: function(id) {
                return this.selectedItems.indexOf(id) !== -1;
            },

            /**
             * Sets a data record with a given id selected
             * @param id {String|Number} id of the item
             * @return {Boolean} true of operation was successfull
             */
            setItemSelected: function(id) {
                if (this.selectedItems.indexOf(id) === -1) {
                    this.selectedItems.push(id);
                    // emit events with selected data
                    this.sandbox.emit(ITEM_SELECT.call(this), id, this.getRecordById(id));
                    this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
                    this.setSelectedItemsToData();
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
                var position;

                if ((position = this.selectedItems.indexOf(id)) !== -1) {
                    this.selectedItems.splice(position, 1);
                    // emit events with selected data
                    this.sandbox.emit(ITEM_DESELECT.call(this), id);
                    this.sandbox.emit(NUMBER_SELECTIONS.call(this), this.getSelectedItemIds().length);
                    this.setSelectedItemsToData();
                    return true;
                }
                return false;
            },

            /**
             * Returns true if selection for the data-record is allowed
             * @param id {Number|String} the id of the data-record
             */
            selectingAllowed: function(id) {
                var itemIndex = this.getRecordIndexById(id);
                if (this.options.onlySelectLeaves === true && this.data.embedded[itemIndex][this.options.childrenPropertyName]) {
                    return false;
                }
                return true;
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

                this.destroy();
                this.loading();
                this.load({
                    url: url,
                    success: function(data) {
                        this.sandbox.emit(UPDATED.call(this), data);
                    }.bind(this)
                });
            },

            /**
             * Takes a record and overrides the one with the same id
             * @param record {Object} new record to set. Needs at leas an id property
             * @returns {boolean} true if record got successfully overridden
             */
            updateRecord: function(record) {
                for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                    if (record[this.options.idKey] === this.data.embedded[i].id) {
                        this.data.embedded[i] = record;
                        return true;
                    }
                }
                return false;
            },

            /**
             * Merges a data-record with a given one
             * @param record {Object} the new data-record. Must contain an id-property
             * @returns {Boolean} returns true if changed successfully
             */
            changeRecord: function(record) {
                if (!!record[this.options.idKey]) {
                    for (var i = -1, length = this.data.embedded.length; ++i < length;) {
                        if (record[this.options.idKey] === this.data.embedded[i].id) {
                            this.data.embedded[i] = this.sandbox.util.extend(true, {}, this.data.embedded[i], record);
                            return true;
                        }
                    }
                } else {
                    this.sandbox.logger.log('Error: Failed changing a record. Must contain id-property');
                    return false;
                }
            },

            /**
             * Deletes a record with a given id
             * @param recordId {Number|String} the id of the record to delete
             * @returns {boolean} true if record got successfully deleted
             */
            removeRecord: function(recordId) {
                if (!!recordId) {
                    var i, length;
                    for (i = -1, length = this.data.embedded.length; ++i < length;) {
                        if (recordId === this.data.embedded[i].id) {
                            this.removeRecordFromSelected(recordId);
                            this.data.embedded.splice(i, 1);
                            this.rerenderPagination();
                            return true;
                        }
                    }
                }
                return false;
            },

            /**
             * Takes an array of records and pushes them to the global array
             * @param records {Array} records to push
             */
            pushRecords: function(records) {
                for (var i = -1, length = records.length; ++i < length;) {
                    this.data.embedded.push(records[i]);
                }
                this.rerenderPagination();
            },

            /**
             * Takes an array of records and unshifts them to the global array
             * @param records {Array} records to push
             */
            unshiftRecords: function(records) {
                for (var i = -1, length = records.length; ++i < length;) {
                    this.data.embedded.unshift(records[i]);
                    this.rerenderPagination();
                }
            },

            /**
             * Called when the current page should change
             * Emits husky.datagrid.updated event on success
             * @param uri {String} Url to load the new data from
             * @param page {Number} the page to change to
             * @param limit {Number} new page size. Has to be set if no Uri is passed
             */
            changePage: function(uri, page, limit) {
                if (!!this.data.links.pagination || !!uri) {
                    var def = this.sandbox.data.deferred();
                    this.show = false;
                    this.updateSelectedCounter();

                    var url, uriTemplate;

                    // if a url is passed load the data from this url
                    if (!!uri) {
                        url = uri;

                        // else generate an own uri
                    } else {
                        // return if no page is passed or passed invalidly
                        if (!page || page > this.data.pages || page < 1) {
                            this.sandbox.logger.log("invalid page number or reached start/end!");
                            def.resolve();
                            return def;
                        }
                        // if no limit is passed keep current limit
                        if (!limit) {
                            limit = this.data.limit;
                        } else if (this.data.limit !== limit) {
                            this.sandbox.emit(PAGE_SIZE_CHANGED.call(this), limit, this.paginationId);
                        }

                        // generate uri for loading
                        uriTemplate = this.sandbox.uritemplate.parse(this.data.links.pagination.href);
                        url = this.sandbox.uritemplate.expand(uriTemplate, {page: page, limit: limit});
                    }

                    this.sandbox.emit(PAGE_CHANGE.call(this), url);
                    this.load({
                        url: url,
                        success: function() {
                            def.resolve();
                            this.sandbox.emit(UPDATED.call(this), 'changed page');
                        }.bind(this)
                    });

                    return def;
                }
            },

            /**
             * Updates data in datagrid
             * Called when husky.datagrid.update event emitted
             * Emits husky.datagrid.updated event on success
             */
            updateGrid: function() {
                if (!!this.data.links.self) {
                    this.resetSortingOptions();

                    this.load({
                        url: this.data.links.self.href,
                        success: function() {
                            this.sandbox.emit(UPDATED.call(this));
                        }.bind(this)
                    });
                }
            },

            /**
             * Filters fields out of the data passed to the view
             * So its possible to hide fields/columns
             * Note that the also the arrangement of fields/columns can be changed and the view can react to it
             * @param {Array} matchings
             */
            filterGrid: function(matchings) {
                if (!!this.data.links.filter) {
                    var uriTemplate, url;

                    this.filterMatchings(matchings);

                    uriTemplate = this.sandbox.uritemplate.parse(this.data.links.filter.href);
                    url = this.sandbox.uritemplate.expand(uriTemplate, {fieldsList: this.requestFields.join(',')});

                    this.destroy();
                    this.loading();
                    this.load({
                        url: url,
                        success: function() {
                            this.sandbox.emit(UPDATED.call(this));
                        }.bind(this)
                    });
                }
            },

            /**
             * Constructs the url to get sorted data and sets the request for it
             * @param attribute {String} The attribute to sort by
             * @param direction {String} the sort method to use 'asc' or 'desc'
             */
            sortGrid: function(attribute, direction) {
                if (this.options.sortable === true && !!this.data.links.sortable) {
                    var template, url;

                    // if passed attribute is sortable
                    if (!!attribute) {

                        this.sort.attribute = attribute;
                        this.sort.direction = direction;

                        template = this.sandbox.uritemplate.parse(this.data.links.sortable.href);
                        url = this.sandbox.uritemplate.expand(template, {sortBy: attribute, sortOrder: direction});

                        this.sandbox.emit(DATA_SORT.call(this), {attribute: attribute, direction: direction});

                        this.load({
                            url: url,
                            success: function(data) {
                                this.sandbox.emit(UPDATED.call(this), data);
                            }.bind(this)
                        });
                    }
                }
            },

            /**
             * Loads the children of a record
             * @param recordId {Number|String}
             */
            loadChildren: function(recordId) {
                var deferred = this.sandbox.data.deferred();

                if (!!this.data.links.children) {
                    var template = this.sandbox.uritemplate.parse(this.data.links.children.href),
                        url = this.sandbox.uritemplate.expand(template, {parentId: recordId});

                    this.sandbox.util.load(this.getUrl({url: url}))
                        .then(function(response) {
                            this.addRecordsHandler(response._embedded[this.options.resultKey]);
                            deferred.resolve();
                        }.bind(this))
                        .fail(function(status, error) {
                            this.sandbox.logger.error(status, error);
                            deferred.fail();
                        }.bind(this));
                } else {
                    deferred.resolve();
                }

                return deferred;
            },

            /**
             * triggers an api search
             * @param {String} searchString The String that will be searched
             * @param {String|Array} searchFields Fields that will be included into the search
             */
            searchGrid: function(searchString, searchFields) {
                if (!!this.data.links.find) {
                    var template, url;

                    template = this.sandbox.uritemplate.parse(this.data.links.find.href);

                    if (!!searchFields) {
                        url = this.sandbox.uritemplate.expand(template, {
                            searchString: searchString,
                            searchFields: searchFields
                        });
                    } else {
                        url = this.sandbox.uritemplate.expand(template, {
                            searchString: searchString,
                            searchFields: this.options.searchFields.join(',')
                        });
                    }

                    this.destroy();
                    this.loading();
                    this.load({
                        url: url,
                        success: function() {
                            this.sandbox.emit(UPDATED.call(this));
                        }.bind(this)
                    });
                }
            },

            /**
             * Takes a data-record and sends it to a url
             * @param data {Object} the data object to save
             * @param url {String} Url to send the data to
             * @param success {Function} callback to call after saving
             * @param fail {Function} callback to call if saving has failed
             * @param unshift {Boolean} If true newly added records will be unshifted instead of pushed
             */
            saveGrid: function(data, url, success, fail, unshift) {
                var method = 'POST',
                    isNewRecord = true;

                if (!!data.id) {
                    method = 'PUT';
                    isNewRecord = false;
                    url = url + '/' + data.id;
                }

                for (var key in this.options.saveParams) {
                    url = setGetParameter.call(this, url, key, this.options.saveParams[key]);
                }

                this.sandbox.emit(DATA_CHANGED.call(this));

                this.sandbox.util.save(url, method, data)
                    .then(function(data, textStatus) {
                        this.sandbox.emit(DATA_SAVED.call(this), data, textStatus);

                        if (typeof success === 'function') {
                            success(data, textStatus);
                        }

                        // update the global data array
                        if (isNewRecord === false) {
                            this.updateRecord(data);
                        } else if (unshift === true) {
                            this.unshiftRecords([data]);
                        } else {
                            this.pushRecords([data]);
                        }
                    }.bind(this))
                    .fail(function(jqXHR, textStatus, error) {
                        this.sandbox.emit(DATA_SAVE_FAILED.call(this), jqXHR, textStatus, error, data);

                        if (typeof fail === 'function') {
                            fail(jqXHR, textStatus, error);
                        }

                    }.bind(this));
            }
        };
    });
})();

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/matcher
 */

/**
 * @class Matcher
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.instanceName] name of the instance
 * @params {Array} [options.dbColumns] Array with objects containing DB-columns information
 * @params {Object} [options.data] columns to match
 * @params {Object} [options.translations] objects containing translation keys
 * @params {Boolean} [options.multiAssignDefault] default value for the multiAssign-property of DB-columns
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            dbColumns: [],
            data: null,
            translations: {},
            multiAssignDefault: false
        },

        constants = {
            componentClass: 'husky-matcher',
            headerClass: 'match-header',
            samplesClass: 'samples',
            matchedClass: 'matched',
            unmatchedClass: 'unmatched',
            skippedClass: 'skipped',
            editClass: 'edit',
            buttonClass: 'button',
            okButtonClass: 'ok-button',
            dropdownClass: 'column-dropdown',
            dropdownInstanceClass: 'dropdown-instance',
            overflowClass: 'overflow',
            wrapperClass: 'wrapper'
        },

        templates = {
            column: [
                '<div class="column">',
                '<div class="match-header"></div>',
                '<div class="column-title"><%= title %></div>',
                '<div class="samples"></div>',
                '</div>'
            ].join(''),
            header: [
                '<div class="inner">',
                '<span class="title"><%= title %></span>',
                '<span class="matched-desc"><%= matchedStr %></span>',
                '<div class="button"><%= editStr %></div>',
                '</div>'
            ].join(''),
            editHeader: [
                '<div class="inner">',
                '<span class="headline"><%= columnStr %></span>',
                '<div class="column-dropdown"></div>',
                '<a class="fa-check save-button btn btn-highlight btn-large ok-button" href="#"></a>',
                '<div class="button"><%= skipStr %></div>',
                '</div>'
            ].join(''),
            sample: [
                '<span><%= sampleStr %></span>'
            ].join('')
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.matcher.',

        /**
         * raised after initialization process
         * @event husky.matcher.<instance-name>.initialize
         */
            INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised after a column is matched
         * @event husky.matcher.<instance-name>.matched
         * @param {Object} Object with column and matched db-column
         */
            MATCHED = function() {
            return createEventName.call(this, 'matched');
        },

        /**
         * raised after a column is skipped
         * @event husky.matcher.<instance-name>.skipped
         * @param {Object} Object with column
         */
            SKIPPED = function() {
            return createEventName.call(this, 'skipped');
        },

        /**
         * raised after a column is edited (matched or skipped)
         * @event husky.matcher.<instance-name>.edited
         * @param {Number} Number of remaining unmatched columns
         */
            EDITED = function() {
            return createEventName.call(this, 'edited');
        },

        /**
         * listens on
         * @event husky.matcher.<instance-name>.get-data
         * @param {Function} Callback to pass the array with all columns
         */
            GET_DATA = function() {
            return createEventName.call(this, 'get-data');
        },

        /** returns normalized event names */
            createEventName = function(postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        /**
         * Initialize component
         */
        initialize: function() {
            this.sandbox.logger.log('initialize', this);

            this.sandbox.dom.addClass(this.$el, constants.componentClass);

            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.$wrapper = null;

            this.setProperties();
            this.parseData();

            this.render();
            this.bindDomEvents();
            this.bindCustomEvents();
            this.overflowObserver();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Set the properties default values
         */
        setProperties: function() {
            this.columns = [];
            this.dbColumns = [];

            this.translations = {
                matchedColumn: 'sulu.matcher.matched-column',
                unmatchedColumn: 'sulu.matcher.unmatched-column',
                edit: 'sulu.matcher.edit',
                column: 'sulu.matcher.column',
                skip: 'sulu.matcher.skip',
                skipped: 'sulu.matcher.skipped',
                pleaseChoose: 'sulu.matcher.please-choose'
            };

            //merge translations with translations passed with options
            this.translations = this.sandbox.util.extend(true, {}, this.translations, this.options.translations);
        },

        /**
         * Binds DOM related events
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', this.overflowObserver.bind(this));
        },

        /**
         * Binds custom events
         */
        bindCustomEvents: function() {
            this.sandbox.on(GET_DATA.call(this), function(callback) {
                callback(this.getPublicColumnsArray());
            }.bind(this));
        },

        /**
         * Returns the db-column for a given id
         * @param id
         */
        getDbColumnWithId: function(id) {
            for (var i = -1, length = this.dbColumns.length; ++i < length;) {
                if (this.dbColumns[i].id === id) {
                    return this.dbColumns[i];
                }
            }
            return null;
        },

        /**
         * Brings the passed data into the right format
         */
        parseData: function() {
            var id, samples, matched, suggestion;

            this.sandbox.util.foreach(this.options.data, function(column, i) {
                if (typeof column.id !== 'undefined') {
                    id = column.id;
                } else {
                    id = Math.floor((Math.random() * 10000) + 1);
                }

                if (typeof column.samples !== 'undefined') {
                    samples = column.samples;
                    matched = column.matched;
                } else {
                    samples = [];
                    matched = false;
                }

                if (typeof column.suggestion !== 'undefined') {
                    suggestion = column.suggestion;
                } else {
                    suggestion = null;
                }

                this.columns[i] = {
                    id: id,
                    title: column.title,
                    samples: samples,
                    suggestion: suggestion,
                    matched: matched,
                    match: null,
                    skipped: false,
                    inEdit: false,
                    $el: null,
                    $header: null,
                    origData: this.options.data[i]
                };
            }.bind(this));

            // parse the passed database-columns
            this.sandbox.util.foreach(this.options.dbColumns, function(dbColumn, i) {
                this.dbColumns[i] = {
                    id: dbColumn.table + '.' + dbColumn.col,
                    table: dbColumn.table,
                    col: dbColumn.col,
                    name: dbColumn.name,
                    disabled: false,
                    multiAssign: (typeof dbColumn.multiAssign !== 'undefined') ? dbColumn.multiAssign : this.options.multiAssignDefault
                };
            }.bind(this));
        },

        /**
         * Renders the columns
         */
        render: function() {
            this.$wrapper = this.sandbox.dom.createElement('<div class="' + constants.wrapperClass + '"/>');
            this.sandbox.dom.html(this.$el, this.$wrapper);

            this.sandbox.util.foreach(this.columns, function(column, i) {

                //render skeleton
                column.$el = this.sandbox.dom.createElement(_.template(templates.column)({
                    title: column.title
                }));
                column.$header = this.sandbox.dom.find('.' + constants.headerClass, column.$el);

                //render samples
                this.sandbox.dom.html(
                    this.sandbox.dom.find('.' + constants.samplesClass, column.$el),
                    this.getSampleHtml(column.samples)
                );

                if (column.matched === true) {
                    this.sandbox.dom.addClass(column.$el, constants.matchedClass);
                } else {
                    this.sandbox.dom.addClass(column.$el, constants.unmatchedClass);
                }

                this.columns[i].$el = column.$el;
                this.columns[i].$header = column.$header;

                this.renderHeader(this.columns[i]);

                this.sandbox.dom.append(this.$wrapper, this.columns[i].$el);
            }.bind(this));
        },

        /**
         * Returns the sample html for given samples
         * @param samples {Array} Array of strings
         * @returns {string} the samples html
         */
        getSampleHtml: function(samples) {
            var string = '';

            this.sandbox.util.foreach(samples, function(sample) {
                string += _.template(templates.sample)({
                    sampleStr: sample
                });
            }.bind(this));

            return string;
        },

        /**
         * Renders the header of a column
         * @param column
         */
        renderHeader: function(column) {

            if (column.inEdit === true) {
                this.sandbox.dom.html(column.$header, _.template(templates.editHeader)({
                    columnStr: this.sandbox.translate(this.translations.column),
                    skipStr: this.sandbox.translate(this.translations.skip)
                }));
                this.startColumnDropdown(column);

            } else if (column.matched === true) {
                this.stopColumnDropDown(column);

                this.sandbox.dom.html(column.$header, _.template(templates.header)({
                    title: column.match.name,
                    matchedStr: this.sandbox.translate(this.translations.matchedColumn),
                    editStr: this.sandbox.translate(this.translations.edit)
                }));
            } else if (column.skipped === true) {
                this.stopColumnDropDown(column);

                this.sandbox.dom.html(column.$header, _.template(templates.header)({
                    title: (column.suggestion !== null) ? column.suggestion.name : '',
                    matchedStr: this.sandbox.translate(this.translations.skipped),
                    editStr: this.sandbox.translate(this.translations.edit)
                }));
            } else if (column.matched === false) {
                this.stopColumnDropDown(column);

                this.sandbox.dom.html(column.$header, _.template(templates.header)({
                    title: (column.suggestion !== null) ? column.suggestion.name : '',
                    matchedStr: this.sandbox.translate(this.translations.unmatchedColumn),
                    editStr: this.sandbox.translate(this.translations.edit)
                }));
            }

            this.unbindHeaderDomEvents(column);
            this.bindHeaderDomEvents(column);
        },

        /**
         * Stops the dropdown-component for a given column
         * @param column
         */
        stopColumnDropDown: function(column) {
            this.sandbox.stop(this.sandbox.dom.find('.' + constants.dropdownInstanceClass, column.$header));
        },

        /**
         * Starts the Dropdown component for a given column
         * @param column
         */
        startColumnDropdown: function(column) {
            var $element = this.sandbox.dom.$('<div class="' + constants.dropdownInstanceClass + '">'),
                selected = [];

            this.sandbox.dom.html(this.sandbox.dom.find('.' + constants.dropdownClass, column.$header), $element);

            if (!!$element.length) {
                if (column.matched === true) {
                    selected = [column.match.id];
                } else if (column.suggestion !== null) {
                    selected = [column.suggestion.table + '.' + column.suggestion.col];
                }

                this.sandbox.start([
                    {
                        name: 'select@husky',
                        options: {
                            el: $element,
                            instanceName: this.options.instanceName + column.id,
                            defaultLabel: this.sandbox.translate(this.translations.pleaseChoose),
                            data: this.dbColumns,
                            preSelectedElements: selected
                        }
                    }
                ]);
            } else {
                this.sandbox.logger.log('ERROR: No container found to load the dropdown');
            }
        },

        /**
         * Gets the value of the dropdown for a given column
         * @param {Object} column
         * @param {Function} callback
         */
        getDropdownValue: function(column, callback) {
            this.sandbox.emit(
                'husky.select.' + this.options.instanceName + column.id + '.get-checked',
                callback
            );
        },

        /**
         * Binds the dom events for the header of a given column
         * @param column
         */
        bindHeaderDomEvents: function(column) {
            if (column.inEdit === false) {
                this.sandbox.dom.on(column.$header, 'click',
                    this.switchToEdit.bind(this, column), '.' + constants.buttonClass);
            } else {
                this.sandbox.dom.on(column.$header, 'click',
                    this.switchToSkipState.bind(this, column), '.' + constants.buttonClass);

                this.sandbox.dom.on(column.$header, 'click',
                    this.switchToMatchedState.bind(this, column), '.' + constants.okButtonClass);
            }
        },

        /**
         * Unbinds the dom events for the header of a given column
         * @param column
         */
        unbindHeaderDomEvents: function(column) {
            this.sandbox.dom.off(column.$header);
        },

        /**
         * Resets the state of a column
         * @param column
         */
        resetColumn: function(column) {
            column.matched = false;
            column.skipped = false;
            column.inEdit = false;
            column.match = null;
            this.removeStateClasses(column);
        },

        /**
         * Removes state-specific css-classes of a given column
         * @param column
         */
        removeStateClasses: function(column) {
            this.sandbox.dom.removeClass(column.$el, constants.matchedClass);
            this.sandbox.dom.removeClass(column.$el, constants.unmatchedClass);
            this.sandbox.dom.removeClass(column.$el, constants.skippedClass);
            this.sandbox.dom.removeClass(column.$el, constants.editClass);
        },

        /**
         * Sets a column in edit-state
         * @param column
         */
        switchToEdit: function(column) {
            this.removeStateClasses(column);
            column.inEdit = true;
            this.sandbox.dom.addClass(column.$el, constants.editClass);
            if (!!column.match) {
                column.match.disabled = false;
            }

            this.renderHeader(column);
        },

        /**
         * Sets a button in skipped-state
         * @param column
         */
        switchToSkipState: function(column) {
            this.resetColumn(column);
            column.skipped = true;

            this.sandbox.dom.addClass(column.$el, constants.skippedClass);

            this.renderHeader(column);

            this.sandbox.emit(SKIPPED.call(this), this.getPublicColumnObject(column));
            this.sandbox.emit(EDITED.call(this), this.getUnmatchedNumber());
            this.updateData();
        },

        /**
         * Sets a button in matched-state
         * @param column
         */
        switchToMatchedState: function(column, event) {
            var selectedDbColumn;

            this.sandbox.dom.preventDefault(event);

            this.getDropdownValue(column, function(selected) {
                // if something is selected
                if (selected.length === 1) {
                    selectedDbColumn = this.getDbColumnWithId(selected[0]);
                    // if db-column is not in use
                    if (!!selectedDbColumn && selectedDbColumn.disabled === false) {

                        if (selectedDbColumn.multiAssign !== true) {
                            selectedDbColumn.disabled = true;
                        }

                        this.resetColumn(column);
                        column.matched = true;
                        column.match = selectedDbColumn;
                        column.suggestion = selectedDbColumn;
                        this.sandbox.dom.addClass(column.$el, constants.matchedClass);

                        this.renderHeader(column);

                        this.sandbox.emit(MATCHED.call(this), this.getPublicColumnObject(column));
                        this.sandbox.emit(EDITED.call(this), this.getUnmatchedNumber());
                        this.updateData();
                    }
                }
            }.bind(this));
        },

        /**
         * Checks if el has a vertical-scrollbar and
         * sets an overflow-css-class
         */
        overflowObserver: function() {
            if (this.sandbox.dom.get(this.$wrapper, 0).scrollWidth > this.sandbox.dom.width(this.$wrapper)) {
                this.sandbox.dom.addClass(this.$el, constants.overflowClass);
            } else {
                this.sandbox.dom.removeClass(this.$el, constants.overflowClass);
            }
        },

        /**
         * Creates the object which is passed with events or written in the data-attr
         * @param column {Object} Column to create the object for
         * @returns {Object}
         */
        getPublicColumnObject: function(column) {
            return {
                column: column.origData,
                matched: column.matched,
                skipped: column.skipped,
                dbColumn: column.match
            };
        },

        /**
         * Creates the object which is passed with events or written in the data-attr
         * @returns {Array}
         */
        getPublicColumnsArray: function() {
            var arrReturn = [];
            this.sandbox.util.foreach(this.columns, function(column) {
                arrReturn.push(this.getPublicColumnObject(column));
            }.bind(this));
            return arrReturn;
        },

        /**
         * Returns the number of unmatched columns
         * @returns {Number}
         */
        getUnmatchedNumber: function() {
            var x = 0;
            this.sandbox.util.foreach(this.columns, function(column) {
                if (column.matched === false && column.skipped === false) {
                    x++;
                }
            });
            return x;
        },

        /**
         * Rewrites the data-attr
         */
        updateData: function() {
            this.sandbox.dom.data(this.$el, 'husky-matcher', this.getPublicColumnsArray());
        }
    };

});

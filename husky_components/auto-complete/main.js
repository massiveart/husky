/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/auto-complete
 */

/**
 * @class AutoComplete
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.prefetchUrl] url to prefetch data
 * @param {Array} [options.localData] array of local data
 * @param {String} [options.remoteUrl] url to fetch data on input
 * @param {String} [options.getParameter] name for GET-parameter in remote query
 * @param {String} [options.valueKey] Name of value-property in suggestion
 * @param {String} [options.totalKey] Key for total-property in JSON-result
 * @param {String} [options.resultKey] Key for suggestions-array in JSON result
 * @param {object} [options.value] with name (value of the input box), id (data-id of the input box)
 * @param {String} [options.instanceName] name of the component instance
 * @param {Boolean} [options.noNewValues] if true input value must have been suggested by auto-complete
 * @param {String} [options.suggestionClass] CSS-class for auto-complete suggestions
 * @param {String} [options.suggestionImg] Icon Class - Image gets rendered before every suggestion
 * @param {Boolean} [options.stickToInput] If true suggestions are always under the input field
 * @param {Boolean} [options.hint] if false typeahead hint-field will be removed
 * @param {Boolean} [options.emptyOnBlur] If true input field value gets deleted on blur
 * @param {Array} [options.excludes] Array of suggestions to exclude from the suggestion dropdown
 */

define([], function() {

    'use strict';

    /**
     * Default values for options
     */
    var defaults = {
            prefetchUrl: '',
            localData: [],
            remoteUrl: '',
            getParameter: 'query',
            valueKey: 'name',
            totalKey: 'total',
            resultKey: '_embedded',
            value: null,
            instanceName: 'undefined',
            noNewValues: false,
            suggestionClass: 'suggestion',
            suggestionImg: '',
            stickToInput: false,
            hint: false,
            emptyOnBlur: false,
            excludes: []
        },

        eventNamespace = 'husky.auto-complete.',

        /**
         * raised after initialization
         * @event husky.auto-complete.initialized
         */
            INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised after prefetched data is retrieved
         * @event husky.auto-complete.prefetch-data
         */
            PREFETCH_LOAD = function() {
            return createEventName.call(this, 'prefetch-data');
        },

        /**
         * raised before remoted data is loaded
         * @event husky.auto-complete.remote-data-load
         */
            REMOTE_LOAD = function() {
            return createEventName.call(this, 'remote-data-load');
        },

        /**
         * raised after remoted data is retrieved
         * @event husky.auto-complete.remote-data
         */
            REMOTE_RETRIEVE = function() {
            return createEventName.call(this, 'remote-data');
        },

        /**
         * raised before the component tries to request a match after blur
         * @event husky.auto-complete.request-match
         */
            REQUEST_MATCH = function() {
            return createEventName.call(this, 'request-match');
        },

        /**
         * raised after autocomplete suggestion is selected
         * @event husky.auto-complete.select
         * @param {object} selected datum with id and name
         */
            SELECT = function() {
            return createEventName.call(this, 'select');
        },

        /** returns normalized event names */
            createEventName = function(postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        /**
         * Returns the id of the options.value object
         * @returns {Integer}
         */
        getValueID: function() {
            if (!!this.options.value) {
                return this.options.value.id;
            } else {
                return null;
            }
        },

        /**
         * Returns the value of the options.value object
         * @returns {String}
         */
        getValueName: function() {
            if (!!this.options.value) {
                return this.options.value[this.options.valueKey];
            } else {
                return '';
            }
        },

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this._template = null;
            this.data = null;
            this.total = 0;
            this.matched = true;
            this.matches = [];
            this.executeBlurHandler = true;
            this.excludes = this.options.excludes;
            this.localData = {};
            this.localData[this.options.resultKey] = this.options.localData;
            this.localData[this.options.totalKey] = this.options.localData.length;

            this.setTemplate();

            this.render();
            this.setEvents();
            this.sandbox.emit(INITIALIZED.call(this), this.$valueField);
        },

        /**
         * Initializes the template for a suggestion element
         */
        setTemplate: function() {
            var iconHTML = '';
            if (this.options.suggestionImg !== '') {
                iconHTML = '<span class="icon-' + this.options.suggestionImg + ' icon"></span>';
            }
            this._template = this.sandbox.util.template('' +
                '<div class="' + this.options.suggestionClass + '" data-id="<%= id %>">' +
                '   <div class="border">' +
                iconHTML +
                '		<div class="text"><%= name %></div>' +
                '	</div>' +
                '</div>');
        },

        /**
         * @param context {object} context for template - id, name
         * @returns {String} html of suggestion element
         */
        buildTemplate: function(context) {
            if (this._template !== null) {
                return this._template(context);
            }
        },

        /**
         * Initializes and appends the input, starts the typeahead-auto-complete plugin
         */
        render: function() {
            this.sandbox.dom.addClass(this.$el, 'husky-auto-complete');
            this.initValueField();
            this.appendValueField();

            this.bindTypeahead();
        },

        /**
         * Assigns an input box to an object property
         */
        initValueField: function() {
            this.$valueField = this.sandbox.dom.createElement('<input id="' + this.options.instanceName + '" ' +
                'class="husky-validate" ' +
                'type="text" ' +
                'autofill="false" ' +
                'data-id="' + this.getValueID() + '" ' +
                'value="' + this.getValueName() + '"/>');
        },

        /**
         * Appends the input box to the component container
         */
        appendValueField: function() {
            if (!!this.$valueField.length) {
                this.sandbox.dom.append(this.$el, this.$valueField);
            }
        },

        /**
         * Starts the typeahead auto-complete plugin
         */
        bindTypeahead: function() {
            var delimiter = (this.options.remoteUrl.indexOf('?') === -1) ? '?' : '&';
            this.sandbox.autocomplete.init(this.$valueField, {
                name: this.options.instanceName,
                local: this.handleData(this.localData),
                valueKey: this.options.valueKey,
                template: function(context) {
                    //saves the fact that the current input has matches
                    this.matches.push(context);
                    this.matched = true;
                    return this.buildTemplate(context);
                }.bind(this),
                prefetch: {
                    url: this.options.prefetchUrl,
                    ttl: 1,
                    filter: function(data) {
                        this.sandbox.emit(PREFETCH_LOAD.call(this));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                },
                remote: {
                    url: this.options.remoteUrl + delimiter + this.options.getParameter + '=%QUERY',
                    beforeSend: function() {
                        this.sandbox.emit(REMOTE_LOAD.call(this));
                    }.bind(this),
                    filter: function(data) {
                        this.sandbox.emit(REMOTE_RETRIEVE.call(this));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                }
            });

            //looses the dropdown from the input box
            if (this.options.stickToInput === false) {
                this.sandbox.dom.css(this.sandbox.dom.find('.twitter-typeahead', this.$el), 'position', 'static');
            }

            //removes the typeahead hint box
            if (this.options.hint === false) {
                this.sandbox.dom.remove(this.sandbox.dom.find('.tt-hint', this.$el));
            }
        },

        /**
         * Returns true if id or name of context is contained within the excluded array
         * @param context {object} context with id and name
         * @returns {Boolean}
         */
        isExcluded: function(context) {
            for (var i = -1, length = this.excludes.length; ++i < length;) {
                if (context.id === this.excludes[i].id ||
                    context[this.options.valueKey] === this.excludes[i][this.options.valueKey]) {
                    return true;
                }
            }
            return false;
        },

        /**
         * sets several events
         */
        setEvents: function() {
            this.sandbox.dom.on(this.$valueField, 'typeahead:selected', function(event, datum) {
                this.sandbox.emit(SELECT.call(this), datum);
                this.setValueFieldId(datum.id);
            }.bind(this));

            //remove state and matches on new input
            this.sandbox.dom.on(this.$valueField, 'keydown', function() {
                this.matched = false;
                this.matches = [];
            }.bind(this));

            //ensures that the blur callback does not get called
            this.sandbox.dom.on(this.sandbox.dom.find('.tt-dropdown-menu', this.$el), 'mousedown', function() {
                this.executeBlurHandler = false;
            }.bind(this));

            this.sandbox.dom.on(this.$valueField, 'blur', function() {
                //don't do anything if the dropdown is clicked on
                if (this.executeBlurHandler === true) {
                    if (this.options.emptyOnBlur === false) {
                        this.handleBlur();
                    } else {
                        this.clearValueFieldValue();
                    }
                } else {
                    this.executeBlurHandler = true;
                }
            }.bind(this));
        },

        /**
         * Gets called when the input box triggers the blur event
         */
        handleBlur: function() {
            if (this.options.noNewValues === true) {
                //check input matches an auto-complete suggestion
                if (this.isMatched() === true && this.getClosestMatch() !== null) {
                    //set value o field to the closes match
                    this.setValueFieldValue(this.getClosestMatch().name);
                    this.setValueFieldId(this.getClosestMatch().id);
                } else {
                    //request to check if a match exists
                    if (this.getValueFieldValue() !== '') {
                        this.checkMatches();
                    }
                }
            } else {
                //check if new input or already contained in auto-complete suggestions
                if (this.isMatchedExactly() === true && this.getClosestMatch() !== null) {
                    this.setValueFieldValue(this.getClosestMatch().name);
                    this.setValueFieldId(this.getClosestMatch().id);
                }
            }
        },

        /**
         * Tries to request matches via the remoteUrl
         * and emits an event if matches do exist
         */
        checkMatches: function() {
            var delimiter = (this.options.remoteUrl.indexOf('?') === -1) ? '?' : '&';
            this.sandbox.emit(REQUEST_MATCH.call(this));
            this.sandbox.util.ajax({
                url: this.options.remoteUrl + delimiter + this.options.getParameter + '=' + this.getValueFieldValue(),

                success: function(data) {
                    this.matches = this.handleData(data);
                    if (this.matches.length > 0) {
                        this.setValueFieldValue(this.getClosestMatch().name);
                        this.setValueFieldId(this.getClosestMatch().id);
                    } else {
                        this.clearValueFieldValue();
                    }
                }.bind(this),

                error: function(error) {
                    this.sandbox.logger.log('Error requesting auto-complete-matches', error);
                }.bind(this)
            });
        },

        /**
         * Returns the closest match for an input
         * @returns {object} closest match with id and name
         */
        getClosestMatch: function() {
            if (!!this.matches.length && this.getValueFieldValue() !== '') {
                return this.matches[0];
            }
            return null;
        },

        /**
         * Returns the trimed value of the input field
         * @returns {String}
         */
        getValueFieldValue: function() {
            return this.sandbox.dom.val(this.$valueField);
        },

        /**
         * Sets the input box value
         * @param value {String} new input value
         */
        setValueFieldValue: function(value) {
            this.sandbox.autocomplete.setValue(this.$valueField, value);
        },

        /**
         * Deletes the input box value
         */
        clearValueFieldValue: function() {
            this.sandbox.autocomplete.setValue(this.$valueField, '');
        },

        /**
         * Sets the data-id attribute on the input box
         * @param id {Integer} new data-id attribute value
         */
        setValueFieldId: function(id) {
            this.sandbox.dom.attr(this.$valueField, {'data-id': id});
        },

        /**
         * returns the matched property (true if auto-complete suggestion exist)
         * @returns {boolean}
         */
        isMatched: function() {
            return this.matched;
        },

        /**
         * Returns true if input matches an auto-complete suggestion exactly
         * case-insensitive
         * @returns {boolean}
         */
        isMatchedExactly: function() {
            if (this.isMatched() === true) {
                if (this.getClosestMatch() !== null) {
                    if (this.getValueFieldValue().toLowerCase() === this.getClosestMatch().name.toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Assigns loaded data to properties
         * @param data {object} with total and data array
         */
        handleData: function(data) {
            this.total = data[this.options.totalKey];
            this.data = [];

            this.sandbox.util.foreach(data[this.options.resultKey], function(key) {
                if (this.isExcluded(key) === false) {
                    this.data.push(key);
                }
            }.bind(this));
            return this.data;
        }
    };
});

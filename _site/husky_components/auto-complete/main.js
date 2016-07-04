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
 * @param {String} [options.resultKey] Key for suggestions-array in JSON result
 * @param {object} [options.value] with name (value of the input box), id (data-id of the input box)
 * @param {String} [options.instanceName] name of the component instance
 * @param {Boolean} [options.noNewValues] if true input value must have been suggested by auto-complete
 * @param {String} [options.suggestionClass] CSS-class for auto-complete suggestions
 * @param {String} [options.suggestionIcon] Icon Class - Image gets rendered before every suggestion
 * @param {String} [options.autoCompleteIcon] Icon Class - Icon in auto complete input
 * @param {Boolean} [options.stickToInput] If true suggestions are always under the input field
 * @param {Boolean} [options.hint] if false typeahead hint-field will be removed
 * @param {Boolean} [options.emptyOnBlur] If true input field value gets deleted on blur
 * @param {Array} [options.excludes] Array of suggestions to exclude from the suggestion dropdown
 * @param {Function} [options.selectCallback] function which will be called when element is selected
 * @param {Array} [options.fields] A list of the fields to show inside the dropdown
 * @param {String} [options.dropdownSizeClass] The styling class for the dropdown. Defined inside the autocomplete stylesheet
 * @param {String} [options.footerContent] Could be a template or just text
 * @param {Integer} [options.limit] Max number of items displayed in the list. Defaults to 5.
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
        resultKey: 'countries',
        value: null,
        instanceName: 'undefined',
        noNewValues: false,
        suggestionClass: 'suggestion',
        suggestionIcon: '',
        autoCompleteIcon: 'search',
        stickToInput: false,
        hint: false,
        emptyOnBlur: false,
        excludes: [],
        selectCallback: null,
        fields: [],
        dropdownSizeClass: '',
        footerContent: '',
        limit: 5
    },

    templates = {
        main: [
            '<div class="husky-auto-complete <%= dropdownSizeClass %>">',
                '<div class="front">',
                    '<a class="fa-<%= autoCompleteIcon %>"></a>',
                '</div>',
                '<div class="input"></div>',
            '</div>'
        ].join('')
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

    /**
     * raised after selection has been removed
     * @event husky.auto-complete.selection-removed
     */
    SELECTION_REMOVED = function() {
        return createEventName.call(this, 'selection-removed');
    },

    /**
     * raised after autocomplete suggestion is selected
     * @event husky.auto-complete.set-excludes
     * @param {array} array of objects to exclude from suggestions
     */
    SET_EXCLUDES = function() {
        return createEventName.call(this, 'set-excludes');
    },

    /**
     * listens on and passes boolean to callback if input is matched exactly
     * @event husky.auto-complete.is-matched
     * @param {Function} Callback which gets the booloan passed
     */
    IS_MATCHED = function() {
        return createEventName.call(this, 'is-matched');
    },

    /**
     * raised after autocomplete footer was clicked
     * @event husky.auto-complete.footer.clicked
     */
    FOOTER_CLICKED = function() {
        return createEventName.call(this, 'footer.clicked');
    },

    /** returns normalized event names */
    createEventName = function(postFix) {
        return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
    };

    return {

        /**
         * Returns the id of the options.value object
         * @returns {Integer|null}
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
                return this.sandbox.util.escapeHtml(this.options.value[this.options.valueKey]);
            } else {
                return '';
            }
        },

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.suggestionTpl = null;
            this.footerTpl = null;
            this.data = null;
            this.matched = true;
            this.matches = [];
            this.excludes = this.parseExcludes(this.options.excludes);
            this.localData = {};
            this.localData._embedded = {};
            this.localData._embedded[this.options.resultKey] = this.options.localData;

            this.setTemplates();

            this.render();
            this.bindDomEvents();
            this.setCustomEvents();

            this.sandbox.emit(INITIALIZED.call(this), this.$valueField);
        },

        /**
         * Initializes the templates
         */
        setTemplates: function() {
            var iconHTML = '';
            if (this.options.suggestionIcon !== '') {
                iconHTML = '<span class="fa-' + this.options.suggestionIcon + ' icon"></span>';
            }

            // suggestions
            if (this.options.fields.length) {
                this.suggestionTpl = this.sandbox.util.template('' +
                    '<div class="' + this.options.suggestionClass + '" data-id="<%= context[\'id \']%>">' +
                    '   <div class="border">' +
                    '       <div class="text">' +
                    '           <% _.each(fields, function(field, idx) { %>' +
                    '           <div class="suggestion-column" style="width: <%= field.width %>;"><%= context[field.id] %></div>' +
                    '           <% }) %>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>');
            } else {
                this.suggestionTpl = this.sandbox.util.template('' +
                    '<div class="' + this.options.suggestionClass + '" data-id="<%= context[\'id \']%>">' +
                    '   <div class="border">' +
                            iconHTML +
                    '       <div class="text"><%= context[this.options.valueKey] %></div>' +
                    '   </div>' +
                    '</div>');
            }

            if (!!this.options.footerContent) {
                this.footerTpl = this.sandbox.util.template(
                    '<div class="auto-complete-footer">' +
                        this.options.footerContent +
                    '</div>'
                );
            }
        },

        /**
         * @param context {object} context for template - id, name
         * @returns {String} html of suggestion element
         */
        buildSuggestionTemplate: function(context) {
            var domObj;
            if (this.suggestionTpl !== null) {
                domObj = this.sandbox.dom.createElement(this.suggestionTpl({ context: context, fields: this.options.fields }));
                if (this.isExcluded(context)) {
                    this.sandbox.dom.addClass(domObj, 'disabled');
                }
                return this.sandbox.dom.html(this.sandbox.dom.append(this.sandbox.dom.$('<div/>'), domObj));
            }
        },

        /**
         * the main-template gets rendered and displayed
         */
        renderMain: function() {
            this.sandbox.dom.html(this.$el, this.sandbox.template.parse(templates.main, {
                autoCompleteIcon: this.options.autoCompleteIcon,
                dropdownSizeClass: this.options.dropdownSizeClass
            }));
        },

        /**
         * Initializes and appends the input, starts the typeahead-auto-complete plugin
         */
        render: function() {
            this.renderMain();
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
                'autocomplete="off"' +
                'data-id="' + this.getValueID() + '" ' +
                'value="' + this.getValueName() + '"/>');
        },

        /**
         * Appends the input box to the component container
         */
        appendValueField: function() {
            if (!!this.$valueField.length) {
                this.sandbox.dom.append(this.sandbox.dom.find('.input', this.$el), this.$valueField);
            }
        },

        /**
         * Starts the typeahead auto-complete plugin
         */
        bindTypeahead: function() {
            var delimiter = (this.options.remoteUrl.indexOf('?') === -1) ? '?' : '&',
                configs = {
                    name: this.options.instanceName,
                    local: this.handleData(this.localData),
                    limit: this.options.limit,
                    displayKey: this.options.valueKey,
                    templates: {
                        suggestion: function(context) {
                            //saves the fact that the current input has matches
                            this.matches.push(context);
                            this.matched = true;
                            return this.buildSuggestionTemplate(context);
                        }.bind(this),

                        footer: function() {
                            if (!!this.footerTpl) {
                                return this.footerTpl();
                            }
                            return null;
                        }.bind(this)
                    }
                };

            if (!!this.options.prefetchUrl) {
                configs.prefetch = {
                    url: this.options.prefetchUrl,
                    ttl: 1,
                    filter: function(data) {
                        this.sandbox.emit(PREFETCH_LOAD.call(this));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                };
            }

            if (!!this.options.remoteUrl) {
                configs.remote = {
                    url: this.options.remoteUrl + delimiter + this.options.getParameter + '=%QUERY',
                    beforeSend: function() {
                        this.sandbox.emit(REMOTE_LOAD.call(this));
                    }.bind(this),
                    filter: function(data) {
                        this.sandbox.emit(REMOTE_RETRIEVE.call(this));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                };
            }

            this.sandbox.autocomplete.init(this.$valueField, configs);

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
                if (context.id !== null && context.id === this.excludes[i].id) {
                    return true;
                } else if (context[this.options.valueKey] !== null &&
                    context[this.options.valueKey] === this.excludes[i][this.options.valueKey]) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Binds custom events
         */
        setCustomEvents: function() {
            this.sandbox.on(SET_EXCLUDES.call(this), function(excludes) {
                this.excludes = this.parseExcludes(excludes);
            }.bind(this));

            this.sandbox.on(IS_MATCHED.call(this), function(callback) {
                if (this.isMatchedExactly() === true && this.getClosestMatch() !== null) {
                    callback(true);
                } else {
                    this.checkMatches(this.getValueFieldValue(), callback, true);
                }
            }.bind(this));

            this.sandbox.on('husky.auto-complete.' + this.options.instanceName + '.select', function(data) {
                this.selectedElement = data;
            }.bind(this));
        },

        /**
         * Brings an array of suggestions to exclude into the right format
         * @param excludes
         */
        parseExcludes: function(excludes) {
            var arrayReturn = [];

            if (!!excludes.length) {
                this.sandbox.util.foreach(excludes, function(exclude) {
                    if (typeof exclude !== 'object') {
                        arrayReturn.push({
                            id: null,
                            name: exclude
                        });
                    } else {
                        arrayReturn.push(exclude);
                    }
                }.bind(this));
            }
            return arrayReturn;
        },

        /**
         * sets several events
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.$valueField, 'typeahead:selected', function(event, datum) {
                if (this.isExcluded(datum)) {
                    this.sandbox.dom.stopPropagation(event);
                    this.clearValueFieldValue();
                } else {
                    this.sandbox.emit(SELECT.call(this), datum);
                    this.setValueFieldId(datum.id);
                    if (typeof this.options.selectCallback === 'function') {
                        this.options.selectCallback.call(this, datum, event);
                    }
                }
            }.bind(this));

            //remove state and matches on new input
            this.sandbox.dom.on(this.$valueField, 'keypress', function(event) {
                if (event.keyCode !== 13) {
                    this.matched = false;
                    this.matches = [];
                }
            }.bind(this));

            this.sandbox.dom.on(this.sandbox.dom.find('.tt-dropdown-menu', this.$el), 'click', function() {
                return false;
            }.bind(this), '.disabled');

            this.sandbox.dom.on(this.$valueField, 'blur', function() {
                //don't do anything if the dropdown is clicked on
                if (this.options.emptyOnBlur === false) {
                    this.handleBlur();
                } else {
                    this.clearValueFieldValue();
                }
            }.bind(this));

            this.sandbox.dom.on(this.$el, 'click', function() {
                this.sandbox.dom.blur(this.$valueField);
                this.clearValueFieldValue();
                this.sandbox.emit(FOOTER_CLICKED.call(this));
            }.bind(this), '.auto-complete-footer');

            // clear data attribute when input is empty
            this.sandbox.dom.on(this.$valueField, 'focusout', function() {
                if (this.sandbox.dom.val(this.$valueField) === '') {
                    var dataId = this.sandbox.dom.attr(this.$valueField, 'data-id');
                    if (dataId != null && dataId !== 'null') {
                        this.sandbox.dom.removeAttr(this.$valueField, 'data-id');
                        this.sandbox.dom.data(this.$valueField, 'data-id', 'null');
                        this.sandbox.emit(SELECTION_REMOVED.call(this));
                    }
                }
            }.bind(this));
        },

        /**
         * Gets called when the input box triggers the blur event
         */
        handleBlur: function() {
            if (!!this.selectedElement) { // selected via dropdown
                this.selectedElement = null;
            } else if (this.options.noNewValues === true) {
                //check input matches an auto-complete suggestion
                if (this.isMatched() === true && this.getClosestMatch() !== null) {
                    //set value o field to the closes match
                    this.setValueFieldValue(this.getClosestMatch().name);
                    this.setValueFieldId(this.getClosestMatch().id);
                } else {
                    //request to check if a match exists
                    if (this.getValueFieldValue() !== '') {
                        this.checkMatches(this.getValueFieldValue(), function(isMatched) {
                            if (isMatched === true) {
                                this.setValueFieldValue(this.getClosestMatch().name);
                                this.setValueFieldId(this.getClosestMatch().id);
                            } else {
                                this.clearValueFieldValue();
                            }
                        }.bind(this), false);
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
         * @param {String} string The string to check if matches exist
         * @param {Function} callback to pass a boolean to
         * @param {Boolean} exactly If true string must be have an identical match
         */
        checkMatches: function(string, callback, exactly) {
            var delimiter = (this.options.remoteUrl.indexOf('?') === -1) ? '?' : '&';
            this.sandbox.emit(REQUEST_MATCH.call(this));
            this.sandbox.util.ajax({
                url: this.options.remoteUrl + delimiter + this.options.getParameter + '=' + string,

                success: function(data) {
                    this.matches = this.handleData(data);

                    if (exactly !== true) {
                        if (this.matches.length > 0) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    } else {
                        if (this.isMatchedExactly() === true) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    }
                }.bind(this),

                error: function(error) {
                    this.sandbox.logger.log('Error requesting auto-complete-matches', error);
                    callback(false);
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
            if (this.getClosestMatch() !== null) {
                if (this.getValueFieldValue().toLowerCase() === this.getClosestMatch().name.toLowerCase()) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Assigns loaded data to properties
         * @param data {object} with data array
         */
        handleData: function(data) {
            if (typeof data === 'object') {
                this.data = [];

                this.sandbox.util.foreach(data._embedded[this.options.resultKey], function(key) {
                    if (this.isExcluded(key) === false) {
                        this.data.push(key);
                    }
                }.bind(this));
                return this.data;
            }
            return false;
        }
    };
});

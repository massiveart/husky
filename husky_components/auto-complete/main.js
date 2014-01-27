/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: auto-complete
 * Options:
 *  url ... url to load data
 *  valueName ... propertyName for value
 *  minLength ... min length for request
 *  keyControl ... control with up/down key
 *  value ... value to display at start
 *  excludeItems ... items to filter
 *
 * Provided Events:
 *  auto-complete.load-data ... event to append data
 */

define([], function () {

    'use strict';

    var defaults = {
        prefetchUrl: '',                                        // url to prefetch data
        localData: [],                                          // array of local data
        remoteUrl: '',                                          // url to fetch data if prefetch or local don't have matches
        getParameter: 'query',                                  // name for GET-parameter in remote query
        valueKey: 'name',                                       // JSON-key for value
        totalKey: 'total',										// JSON-key for total-value
        resultKey: 'items',										// JSON-key for result
        typeaheadName: 'name',									// identifier - used by typeahead to cache intelligently
        value: null,                                            // value to display at start
        instanceName: 'undefined',                              // name of the component instance
        noNewValues: false,										// if false input value must be contained in autocomplete-suggestions
        successClass: 'husky-auto-complete-success',			// success-class if nowNewValues is false
        failClass: 'husky-auto-complete-error',					// fail-class if noNewValues is false
        suggestionClass: 'suggestion',                          // CSS-class for autocomplete suggestions
        suggestionImg: '<img src="../../img/sample.gif" />',    // HTML-Img Tag - Image gets rendered before every suggestion
        stickToInput: false,                                    // If true suggestions are always under the input field
        hint: false,                                            // if true typeahead hint-field will not be removed
        emptyOnBlur: false                                      // If true input field value gets deleted on blur
    };

    return {
        data: [],

        getEvent: function (append) {
            return 'husky.auto-complete.' + this.options.instanceName + '.' + append;
        },

        getValueID: function () {
            if (!!this.options.value) {
                return this.options.value.id;
            } else {
                return null;
            }
        },

        getValueName: function () {
            if (!!this.options.value) {
                return this.options.value[this.options.valueName];
            } else {
                return '';
            }
        },

        initialize: function () {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            this._template = null;
            this.data = null;
            this.total = 0;
            this.matched = true;
            this.matches = [];

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.setTemplate();

            this.render();
            this.setEvents();
            this.sandbox.emit(this.getEvent('initialized'), this.$valueField);
        },

        setTemplate: function () {
            this._template = this.sandbox.util.template('' +
                '<div class="' + this.options.suggestionClass + '" data-id="<%= id %>">' +
                '   <div class="border">' +
                '		<div class="img">' + this.options.suggestionImg + '</div>' +
                '		<div class="text"><%= name %></div>' +
                '	</div>' +
                '</div>');
        },

        buildTemplate: function (context) {
            if (this._template !== null) {
                return this._template(context);
            }
        },

        render: function () {
            this.sandbox.dom.addClass(this.$el, 'husky-auto-complete');
            this.initValueField();
            this.appendValueField();

            this.bindTypeahead();
        },

        initValueField: function() {
            this.$valueField = this.sandbox.dom.createElement('<input id="' + this.options.instanceName + '" ' +
                                                                     'class="husky-validate" ' +
                                                                     'type="text" ' +
                                                                     'autofill="false" ' +
                                                                     'data-id="' + this.getValueID() + '" ' +
                                                                     'value="' + this.getValueName() + '"/>');
        },

        appendValueField: function () {
            if (!!this.$valueField.length) {
                this.sandbox.dom.append(this.$el, this.$valueField);
            }
        },

        bindTypeahead: function () {
            var delimiter = (this.options.remoteUrl.indexOf('?') === -1) ? '?' : '&';
            this.sandbox.autocomplete.init(this.$valueField, {
                name: this.options.instanceName,
                local: this.options.localData,
                valueKey: this.options.valueKey,
                template: function (context) {
                    this.matches.push(context);
                    this.matched = true;
                    return this.buildTemplate(context);
                }.bind(this),
                prefetch: {
                    url: this.options.prefetchUrl,
                    ttl: 1,
                    filter: function (data) {
                        this.sandbox.emit(this.getEvent('prefetch-data'));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                },
                remote: {
                    url: this.options.remoteUrl + delimiter + this.options.getParameter + '=%QUERY',
                    beforeSend: function () {
                        this.sandbox.emit(this.getEvent('remote-data-load'));
                    }.bind(this),
                    filter: function (data) {
                        this.sandbox.emit(this.getEvent('remote-data'));
                        this.handleData(data);
                        return this.data;
                    }.bind(this)
                }
            });
            if (this.options.stickToInput === false) {
                this.sandbox.dom.css('.twitter-typeahead', 'position', 'static');
            }
            if (this.options.hint === false) {
                this.sandbox.dom.remove('.tt-hint');
            }
        },

        setEvents: function () {
            this.sandbox.dom.on(this.$valueField, 'typeahead:selected', function (event, datum) {
                this.sandbox.emit(this.getEvent('select'), datum);
                this.setValueFieldId(datum.id);
            }.bind(this));

            this.sandbox.dom.on(this.$valueField, 'keydown', function () {
                this.matched = false;
                this.matches = [];
                this.setNoState();
            }.bind(this));

            this.sandbox.dom.on(this.$valueField, 'blur', function () {
                if (this.options.emptyOnBlur === false) {
                    this.handleBlur();
                } else {
                    this.clearValueFieldValue();
                }
            }.bind(this));
        },

        handleBlur: function () {
            if (this.options.noNewValues === true) {
                if (this.isMatched() === true && this.getClosestMatch() !== null) {
                    this.setValueFieldValue(this.getClosestMatch().name);
                    this.setValueFieldId(this.getClosestMatch().id);
                    this.setSuccessState();
                } else {
                    this.setFailState();
                }
            } else {
                if (this.isMatchedExactly() === true && this.getClosestMatch() !== null) {
                    this.setValueFieldValue(this.getClosestMatch().name);
                    this.setValueFieldId(this.getClosestMatch().id);
                }
            }
        },

        getClosestMatch: function () {
            if (!!this.matches.length && this.getValueFieldValue() !== '') {
                return this.matches[0];
            }
            return null;
        },

        getValueFieldValue: function () {
            return this.sandbox.dom.val(this.$valueField).trim();
        },

        setValueFieldValue: function (value) {
            this.sandbox.dom.val(this.$valueField, value);
        },

        clearValueFieldValue: function () {
            this.sandbox.dom.clearVal(this.$valueField);
        },

        setValueFieldId: function (id) {
            this.sandbox.dom.attr(this.$valueField, {'data-id': id});
        },

        isMatched: function () {
            return this.matched;
        },

        isMatchedExactly: function () {
            if (this.isMatched() === true) {
                if (this.getClosestMatch() !== null) {
                    if (this.getValueFieldValue().toLowerCase() === this.getClosestMatch().name.toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        },

        handleData: function (data) {
            this.data = data[this.options.resultKey];
            this.total = data[this.options.totalKey];
            this.sandbox.logger.log(this.total);
        },

        setSuccessState: function () {
            this.sandbox.dom.addClass(this.$el, this.options.successClass);
        },

        setFailState: function () {
            this.sandbox.dom.addClass(this.$el, this.options.failClass);
        },

        setNoState: function () {
            this.sandbox.dom.removeClass(this.$el, this.options.successClass);
            this.sandbox.dom.removeClass(this.$el, this.options.failClass);
        }
    };
});

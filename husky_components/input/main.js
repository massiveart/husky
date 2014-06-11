/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/input
 */

/**
 * @class Input
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.instanceName] name if the the input instance
 * @params {String} [options.inputId] DOM-id to give the actual input-tag
 * @params {String} [options.inputName] DOM-name to give the actual input-tag. Can be usefull in forms
 * @params {String} [options.value] value to set at the beginning
 * @params {String} [options.placeholder] html5-placholder to use
 * @params {String} [options.skin] name of the skin to use. Currently 'phone', 'password', 'url', 'email', 'date', 'time', 'color'. Each skin brings it's own default values. For example the password skin has automatically inputType: 'password'
 * @params {Object} [options.datepickerOptions] config-object to pass to the datepicker component
 * @params {Object} [options.colorPickerOptions] config-object to pass to the colorpicker component
 * @params {String} [options.frontIcon] name of icon to display in front
 * @params {String} [options.frontText] text to display in front
 * @params {String} [options.frontHtml] html to display in front
 * @params {String} [options.backIcon] name of icon to display in front
 * @params {String} [options.backText] text to display in back
 * @params {String} [options.backHtml] html to display in back
 * @params {String} [options.renderMethod] name of a special render method to execute. Currently 'colorpicker', 'datepicker', 'time'. For example 'colorpicker' initializes a colorpicker and sets a css-class
 * @params {String} [options.inputType] the actual type of the input. e.g. 'text' or 'password'
 */
define([], function () {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            inputId: '',
            inputName: '',
            value: '',
            placeholder: '',
            skin: null,
            datepickerOptions: {},
            colorPickerOptions: {},
            frontIcon: null,
            frontText: null,
            frontHtml: null,
            backIcon: null,
            backText: null,
            backHtml: null,
            renderMethod: null,
            inputType: 'text'
        },

        constants = {
            componentClass: 'husky-input',
            frontClass: 'front',
            backClass: 'back',
            textClass: 'text',
            inputClass: 'input',
            actionClass: 'action',
            colorFieldClass: 'color-field',
            colorpickerClass: 'colorpicker',
            datepickerClass: 'pickdate'
        },

        templates = {
            input: '<input type="<%= type %>" value="<%= value %>" placeholder="<%= placeholder %>" id="<%= id %>" name="<%= name %>" data-from="false"/>',
            colorPickerFront: '<div class="'+ constants.colorFieldClass +'"/>'
        },

        renderMethods = {
            colorpicker: function() {
                this.renderColorPicker();
            },
            datepicker: function() {
                this.renderDatePicker();
            },
            time: function() {
                this.renderTime();
            }
        },

        skins = {
            color: {
                frontHtml: templates.colorPickerFront,
                renderMethod: 'colorpicker'
            },
            phone: {
                frontIcon: 'phone'
            },
            password: {
                frontIcon: 'key',
                inputType: 'password'
            },
            url: {
                frontText: 'http://'
            },
            email: {
                frontIcon: 'envelope'
            },
            date: {
                frontIcon: 'calendar',
                placeholder: 'TT - MM - JJJJ',
                renderMethod: 'datepicker'
            },
            time: {
                frontIcon: 'clock-o',
                placeholder: 'HH - MM',
                renderMethod: 'time'
            }
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.input.',

        /**
         * raised after initialization process
         * @event husky.input.<instance-name>.initialize
         */
            INITIALIZED = function () {
            return createEventName.call(this, 'initialized');
        },

        /** returns normalized event names */
            createEventName = function (postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        /**
         * Initialize component
         */
        initialize: function () {
            this.sandbox.logger.log('initialize', this);
            var defaults = defaults;

            // merge skin defaults with defaults
            if (!!this.options.skin && !!skins[this.options.skin]) {
                defaults = this.sandbox.util.extend(true, {}, defaults, skins[this.options.skin]);
            }
            // merge defaults, skin defaults and options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.input = {
                $front: null,
                $input: null,
                $back: null
            };

            this.render();
            this.bindDomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Renders the input component
         */
        render: function() {
            this.sandbox.dom.addClass(this.$el, constants.componentClass);
            // add action class if an action is set
            if (!!this.options.action) {
                this.sandbox.dom.addClass(this.$el, constants.actionClass);
            }
            this.renderFront();
            this.renderInput();
            this.renderBack();
            // call a render method specific for the skin
            // e.g. renderColorPicker
            if (!!this.options.renderMethod && !!renderMethods[this.options.renderMethod]) {
                renderMethods[this.options.renderMethod].call(this);
            }
        },

        /**
         * Binds Dom-related events
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', function() {
                this.sandbox.dom.focus(this.input.$input);
            }.bind(this));

            // change the input value if the data attribute got changed
            this.sandbox.dom.on(this.$el, 'data-changed', function() {
                this.updateValue();
            }.bind(this));
        },

        /**
         * Renders the front of the input
         */
        renderFront: function() {
            if (!!this.options.frontIcon || !!this.options.frontText || !!this.options.frontHtml) {
                this.input.$front = this.sandbox.dom.createElement('<div class="'+ constants.frontClass +'"/>');
                if (!!this.options.frontIcon) {
                    this.sandbox.dom.html(this.input.$front, '<span class="fa-'+ this.options.frontIcon +'"></span>');
                } else if (!!this.options.frontText) {
                    this.sandbox.dom.html(this.input.$front, '<span class="'+ constants.textClass +'">'+ this.options.frontText +'</span>');
                } else {
                    this.sandbox.dom.html(this.input.$front, this.options.frontHtml);
                }
                this.sandbox.dom.append(this.$el, this.input.$front);
            }
        },

        /**
         * Renders the actual html-input field
         * with validation constraints and so on
         */
        renderInput: function() {
            var $container = this.sandbox.dom.createElement('<div class="'+ constants.inputClass +'"/>');
            this.input.$input = this.sandbox.dom.createElement(this.sandbox.util.template(templates.input)({
                type: this.options.inputType,
                name: (!!this.options.inputName) ? this.options.inputName : 'husky-input-' + this.options.instanceName,
                id: (!!this.options.inputId) ? this.options.inputId : 'husky-input-' + this.options.instanceName,
                value: this.options.value,
                placeholder: this.options.placeholder
            }));
            this.sandbox.dom.append($container, this.input.$input);
            this.sandbox.dom.append(this.$el, $container);
        },

        /**
         * renders the back of the input
         */
        renderBack: function() {
            if (!!this.options.backIcon || !!this.options.backText || !!this.options.backHtml) {
                this.input.$back = this.sandbox.dom.createElement('<div class="'+ constants.backClass +'"/>');
                if (!!this.options.backIcon) {
                    this.sandbox.dom.html(this.input.$back, '<span class="fa-'+ this.options.backIcon +'"></span>');
                } else if (!!this.options.backText) {
                    this.sandbox.dom.html(this.input.$back, '<span class="'+ constants.textClass +'">'+ this.options.backText +'</span>');
                } else {
                    this.sandbox.dom.html(this.input.$back, this.options.backHtml);
                }
                this.sandbox.dom.append(this.$el, this.input.$back);
            }
        },

        /**
         * Starts the colorpicker
         */
        renderColorPicker: function() {
            this.sandbox.dom.addClass(this.$el, constants.colorpickerClass);
            this.changeColorPreview(this.sandbox.dom.val(this.input.$input));
            this.sandbox.colorpicker.init(this.input.$input, this.sandbox.util.extend(true, {}, {
                defaultValue: this.sandbox.dom.val(this.input.$input),
                change: this.changeColorPreview.bind(this)
            }, this.options.colorPickerOptions));
        },

        /**
         * Starts the datepicker
         */
        renderDatePicker: function() {
            this.sandbox.dom.addClass(this.$el, constants.datepickerClass);
            this.sandbox.dom.attr(this.input.$input, 'placeholder', this.sandbox.globalize.getDatePattern());
            this.sandbox.datepicker.init(this.input.$input, this.options.datepickerOptions).on('changeDate', function(event) {
                this.setDatepickerValueAttr(event.date);
            }.bind(this));
            this.updateValue();
        },

        /**
         * Renders time specific things
         */
        renderTime: function() {
            this.sandbox.dom.attr(this.input.$input, 'placeholder', this.sandbox.globalize.getTimePatter());
        },

        /**
         * Updates the square which shows the current color for the colorpicker
         * @param color {String} new hex color
         */
        changeColorPreview: function(color) {
            this.sandbox.dom.css(this.$find('.' + constants.colorFieldClass), {
                'background-color': color
            });
        },

        /**
         * Sets the input value
         * @param value {String} new value
         */
        setValue: function(value) {
            if (this.options.renderMethod === 'colorpicker') {
                if (!!value) {
                    this.sandbox.colorpicker.value(this.input.$input, value);
                } else {
                    this.sandbox.dom.val(this.input.$input, value);
                }
            } else if (this.options.renderMethod === 'datepicker') {
                // if a date-time was passed, extract the date
                if (!!value) {
                    value = this.isoToDate(value);
                    value = new Date(value);
                }
                this.sandbox.datepicker.setDate(this.input.$input, value);
                this.setDatepickerValueAttr(this.sandbox.datepicker.getDate(this.input.$input));
            } else {
                this.sandbox.dom.val(this.input.$input, value);
            }
        },

        /**
         * Takes a iso date-time string and returns only the date part
         * @param datetime {String} iso-datetime-string
         */
        isoToDate: function(datetime) {
            if (datetime.indexOf('T') > 0) {
                return datetime.substr(0, datetime.indexOf('T'));
            }
            return datetime;
        },

        /**
         * Sets the value attribute for the datepicker
         * @param date {Object} a UTC date pbject
         */
        setDatepickerValueAttr: function(date) {
            if (!!date) {
                date = date.getFullYear() + '-' +
                   ('0' + (date.getMonth()+1)).slice(-2) + '-' +
                   ('0' + date.getDate()).slice(-2);
            }
            this.sandbox.dom.data(this.$el, 'value', date);
        },

        /**
         * Updates the value with what is in the
         * data attribute
         */
        updateValue: function() {
            this.setValue(this.sandbox.dom.data(this.$el, 'value'));
        }
    };

});

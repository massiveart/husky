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
 * @params {String} [options.placeholder] html5-placeholder to use
 * @params {Boolean} [options.disabled] defines if input can be edited
 * @params {String} [options.skin] name of the skin to use. Currently 'phone', 'password', 'url', 'email', 'date', 'time', 'color'. Each skin brings it's own default values. For example the password skin has automatically inputType: 'password'
 * @params {Object} [options.datepickerOptions] config-object to pass to the datepicker component - you can find possible values here http://bootstrap-datepicker.readthedocs.org/en/release/options.html
 * @params {Object} [options.colorPickerOptions] config-object to pass to the colorpicker component
 * @params {Object} [options.lockOptions] config-object to pass to the lock component
 * @params {String} [options.frontIcon] name of icon to display in front
 * @params {String} [options.frontText] text to display in front
 * @params {String} [options.frontHtml] html to display in front
 * @params {String} [options.backIcon] name of icon to display in front
 * @params {String} [options.backText] text to display in back
 * @params {String} [options.backHtml] html to display in back
 * @params {String} [options.renderMethod] name of a special render method to execute. Currently 'colorpicker', 'datepicker', 'time'. For example 'colorpicker' initializes a colorpicker and sets a css-class
 * @params {String} [options.inputType] the actual type of the input. e.g. 'text' or 'password'
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            inputId: '',
            inputName: '',
            value: '',
            placeholder: '',
            disabled: false,
            skin: null,
            datepickerOptions: {
                orientation: 'auto',
                startDate: -Infinity,
                endDate: Infinity,
                todayHighlight: true
            },
            colorPickerOptions: {},
            lockOptions: {
                locked: false
            },
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
            datepickerClass: 'pickdate',
            linkClickableClass: 'clickable',
            lockIconClass: 'fa-lock',
            unlockIconClass: 'fa-unlock'
        },

        templates = {
            input: '<input type="<%= type %>" value="<%= value %>" placeholder="<%= placeholder %>" id="<%= id %>" name="<%= name %>" data-from="false" <%= disabled %>/>',
            colorPickerFront: '<div class="' + constants.colorFieldClass + '"/>'
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
            },
            url: function() {
                this.renderLink('http://');
            },
            email: function() {
                this.renderLink('mailto:');
            },
            lock: function() {
                this.renderLock();
            }
        },

        frontClickedCallbacks = {
            lock: function(event) {
                this.lockClickedCallback(event);
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
                frontText: 'http://',
                renderMethod: 'url'
            },
            email: {
                frontIcon: 'envelope',
                renderMethod: 'email'
            },
            date: {
                frontIcon: 'calendar',
                renderMethod: 'datepicker'
            },
            time: {
                frontIcon: 'clock-o',
                placeholder: 'HH - MM',
                renderMethod: 'time'
            },
            lock: {
                frontIcon: 'lock',
                renderMethod: 'lock'
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
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        LOCKED = function() {
            return createEventName.call(this, 'locked');
        },

        UNLOCKED = function() {
            return createEventName.call(this, 'unlocked');
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
            var instanceDefaults = this.sandbox.util.extend(true, {}, defaults);

            // merge skin defaults with defaults
            if (!!this.options.skin && !!skins[this.options.skin]) {
                instanceDefaults = this.sandbox.util.extend(true, {}, defaults, skins[this.options.skin]);
            }
            // merge defaults, skin defaults and options
            this.options = this.sandbox.util.extend(true, {}, instanceDefaults, this.options);

            this.input = {
                $front: null,
                $input: null,
                $back: null
            };
            this.linkProtocol = null;

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
            this.sandbox.dom.on(this.$el, 'change', function(event) {
                event.stopPropagation();
                event.preventDefault();

                this.$el.trigger('change');
            }.bind(this), 'input');

            this.sandbox.dom.on(this.$el.find('.' + constants.frontClass), 'click', function(event) {
                // check if input has custom functionality, when front is clicked
                if (frontClickedCallbacks.hasOwnProperty(this.options.skin)) {
                    frontClickedCallbacks[this.options.skin].call(this, event);
                }
            }.bind(this));

            this.sandbox.dom.on(this.$el, 'click', function() {
                this.sandbox.dom.focus(this.input.$input);
            }.bind(this));

            this.sandbox.dom.on(this.input.$input, 'click', function() {
                this.sandbox.dom.focus(this.input.$input);
            }.bind(this));

            // delegate labels on input
            if (!!this.sandbox.dom.attr(this.$el, 'id')) {
                this.sandbox.dom.on('label[for="' + this.sandbox.dom.attr(this.$el, 'id') + '"]', 'click', function() {
                    this.sandbox.dom.focus(this.input.$input);
                }.bind(this));
            }

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
                this.input.$front = this.sandbox.dom.createElement('<div class="' + constants.frontClass + '"/>');
                if (!!this.options.frontIcon) {
                    this.sandbox.dom.html(this.input.$front, '<a class="fa-' + this.options.frontIcon + '"></a>');
                } else if (!!this.options.frontText) {
                    this.sandbox.dom.html(this.input.$front,
                        '<a class="' + constants.textClass + '">' + this.options.frontText + '</a>');
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
            var $container = this.sandbox.dom.createElement('<div class="' + constants.inputClass + '"/>');
            this.input.$input = this.sandbox.dom.createElement(this.sandbox.util.template(templates.input)({
                type: this.options.inputType,
                name: (!!this.options.inputName) ? this.options.inputName : 'husky-input-' + this.options.instanceName,
                id: (!!this.options.inputId) ? this.options.inputId : 'husky-input-' + this.options.instanceName,
                value: this.options.value,
                placeholder: this.options.placeholder,
                disabled: (this.options.disabled === true) ? 'disabled' : ''
            }));
            this.sandbox.dom.append($container, this.input.$input);
            this.sandbox.dom.append(this.$el, $container);
        },

        /**
         * renders the back of the input
         */
        renderBack: function() {
            if (!!this.options.backIcon || !!this.options.backText || !!this.options.backHtml) {
                this.input.$back = this.sandbox.dom.createElement('<div class="' + constants.backClass + '"/>');
                if (!!this.options.backIcon) {
                    this.sandbox.dom.html(this.input.$back, '<span class="fa-' + this.options.backIcon + '"></span>');
                } else if (!!this.options.backText) {
                    this.sandbox.dom.html(this.input.$back,
                        '<span class="' + constants.textClass + '">' + this.options.backText + '</span>');
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
                change: this.changeColorPreview.bind(this)
            }, this.options.colorPickerOptions));
        },

        /**
         * Starts the datepicker
         */
        renderDatePicker: function() {
            this.sandbox.dom.addClass(this.$el, constants.datepickerClass);
            if (!this.options.placeholder) {
                this.sandbox.dom.attr(this.input.$input, 'placeholder', this.sandbox.globalize.getDatePattern());
            }

            // parse stard and end date
            if (!!this.options.datepickerOptions.startDate && typeof(this.options.datepickerOptions.startDate) === 'string') {
                this.options.datepickerOptions.startDate = new Date(this.options.datepickerOptions.startDate);
            }
            if (!!this.options.datepickerOptions.endDate && typeof(this.options.datepickerOptions.endDate) === 'string') {
                this.options.datepickerOptions.endDate = new Date(this.options.datepickerOptions.endDate);
            }

            this.sandbox.datepicker.init(this.input.$input, this.options.datepickerOptions).on('changeDate',
                function(event) {
                    this.setDatepickerValueAttr(event.date);
                }.bind(this));
            this.updateValue();

            this.bindDatepickerDomEvents();
        },

        /**
         * Attaches an event-listner to the input which makes an a-tag with clickable
         * @param protocol {String} a protocol to prepend to the input-value (e.g. 'http://' or 'mailto:')
         */
        renderLink: function(protocol) {
            this.linkProtocol = protocol;
            this.sandbox.dom.on(this.input.$input, 'keyup', this.changeFrontLink.bind(this));
            this.changeFrontLink();
        },

        /**
         * Lock-input specific actions. Makes sure the correct icon is rendered and the dom data is set.
         */
        renderLock: function() {
            var locked = this.options.lockOptions.locked;
            // always enable front icon
            this.sandbox.dom.addClass(this.sandbox.dom.find('a', this.input.$front), constants.linkClickableClass);
            this.renderLockIcon();
            this.$el.data('locked', locked);
        },

        /**
         * Gets called, when front icon of lock-input is clicked.
         *
         * @param {Object} event
         */
        lockClickedCallback: function(event) {

            if (this.options.disabled === true) {
                return;
            }

            var locked = !this.options.lockOptions.locked;

            // set options value
            this.options.lockOptions.locked = locked;
            // en/disable input
            this.sandbox.dom.prop(this.input.$input, 'disabled', locked);
            // render appropiate icon
            this.renderLockIcon();
            // set data
            this.$el.data('locked', locked);

            // trigger event
            if (locked) {
                this.sandbox.emit(LOCKED.call(this));
                event.stopPropagation();
            } else {
                this.sandbox.emit(UNLOCKED.call(this));
            }
        },

        /**
         * Renders the appropiate locked icon.
         */
        renderLockIcon: function() {
            var removeIcon = constants.lockIconClass,
                addIcon = constants.unlockIconClass;

            if (this.options.lockOptions.locked) {
                removeIcon = constants.unlockIconClass;
                addIcon = constants.lockIconClass;
            }

            this.exchangeFrontIconClass(addIcon, removeIcon);
        },

        /**
         * Exchanges a icon class with another.
         *
         * @param {String} addClass
         * @param {String} removeClass
         */
        exchangeFrontIconClass: function(addClass, removeClass) {
            var selector = this.sandbox.dom.find('a', this.input.$front);
            this.sandbox.dom.removeClass(selector, removeClass);
            this.sandbox.dom.addClass(selector, addClass);

            // if clickable-class is set, set it behind icon class
            if (this.sandbox.dom.hasClass(selector, constants.linkClickableClass)) {
                this.sandbox.dom.removeClass(selector, constants.linkClickableClass);
                this.sandbox.dom.addClass(selector, constants.linkClickableClass);
            }
        },

        /**
         * Changes the anchor-tag in the front-section
         */
        changeFrontLink: function() {
            var value = this.sandbox.dom.val(this.input.$input);
            if (!!value) {
                this.sandbox.dom.addClass(this.sandbox.dom.find('a', this.input.$front), constants.linkClickableClass);
                this.sandbox.dom.attr(this.sandbox.dom.find('a', this.input.$front), 'href', this.linkProtocol + value);
                if (this.linkProtocol.indexOf('mailto') < 0) {
                    this.sandbox.dom.attr(this.sandbox.dom.find('a', this.input.$front), 'target', '_blank');
                }
            } else {
                this.sandbox.dom.removeClass(this.sandbox.dom.find('a', this.input.$front),
                    constants.linkClickableClass);
                this.sandbox.dom.removeAttr(this.sandbox.dom.find('a', this.input.$front), 'href');
            }
        },

        /**
         * Binds Dom-events for the datepicker
         */
        bindDatepickerDomEvents: function() {
            this.sandbox.dom.on(this.input.$input, 'focusout', function() {
                this.setDatepickerValueAttr(this.sandbox.datepicker.getDate(this.input.$input));

                return false;
            }.bind(this));
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
                if (this.options.renderMethod === 'email' || this.options.renderMethod === 'url') {
                    this.changeFrontLink();
                }
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
                if (this.sandbox.dom.isNumeric(date.valueOf())) {
                    date = date.getFullYear() + '-' +
                        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + date.getDate()).slice(-2);
                } else {
                    date = '';
                    this.sandbox.dom.val(this.input.$input, '');
                }
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

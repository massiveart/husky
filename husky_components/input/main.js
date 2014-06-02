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
 */
define([], function () {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            inputId: '',
            inputName: '',
            value: '',
            placeholder: '',
            inputType: 'text',
            validators: null,
            type: null,
            frontIcon: null,
            frontText: null,
            frontHtml: null,
            backIcon: null,
            backText: null,
            backHtml: null,
            action: null
        },

        constants = {
            componentClass: 'husky-input',
            frontClass: 'front',
            backClass: 'back',
            textClass: 'text',
            inputClass: 'input',
            actionClass: 'action',
            colorFieldClass: 'color-field'
        },

        templates = {
            input: '<input type="<%= type %>" value="<%= value %>" placeholder="<%= placeholder %>" id="<%= id %>" name="<%= name %>"/>',
            colorPickerBack: '<div class="'+ constants.colorFieldClass +'"/>',
        },

        actions = {
            datepicker: function() {
                this.pickDate();
            },
            colorpicker: function() {
                this.pickColor();
            }
        },

        types = {
            color: {
                frontText: '#',
                action: 'colorpicker',
                backHtml: templates.colorPickerBack
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
                action: 'datepicker'
            },
            time: {
                frontIcon: 'clock-o'
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

            // merge type defaults with defaults
            if (!!this.options.type && !!types[this.options.type]) {
                var defaults = this.sandbox.util.extend(true, {}, defaults, types[this.options.type]);
            }
            // merge defaults, type defaults and options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.input = {
                $front: null,
                $input: null,
                $back: null
            };

            this.render();

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

            this.bindDomEvents();
        },

        /**
         * Binds Dom-related events
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', function() {
                this.sandbox.dom.focus(this.input.$input);
            }.bind(this));

            if (!!this.options.action && !!actions[this.options.action]) {
                this.sandbox.dom.on(this.$el, 'click', function() {
                    actions[this.options.action].call(this);
                }.bind(this))
            }
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
         * Displays a datepicker on the input
         */
        pickDate: function() {
            console.log('pick a date');
        },

        /**
         * Displays a colorpicker on the input
         */
        pickColor: function() {
            console.log('pick a color');
        },
    };

});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/process
 */

/**
 * @class Toggler
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {Boolean} [options.instanceName] name of the component instance, gets used for events and the checkbox name. Can also be set through the DOM-id
 * @params {Boolean} [options.checked] beginning state of the button
 * @params {Boolean} [options.outline] if true component gets a bright border
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            checked: false,
            hiddenCheckbox: true,
            outline: false
        },

        constants = {
            componentClass: 'husky-toggler',
            switchClass: 'switch',
            checkedClass: 'checked',
            wrapperClass: 'toggler-wrapper',
            outlineClass: 'outline',
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.toggler.',

        /**
         * raised after initialization process
         * @event husky.toggler.<instance-name>.initialize
         */
            INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised after initialization process
         * @event husky.toggler.<instance-name>.changed
         * @param {boolean} on True if button is on
         */
            CHANGED = function() {
            return createEventName.call(this, 'changed');
        },

        /**
         * event to turn the button on or off
         * @event husky.toggler.<instance-name>.change
         * @param {boolean} on To turn the button on or off
         */
            CHANGE = function() {
            return createEventName.call(this, 'change');
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
            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.hasId = false;
            this.checked = !!this.options.checked;
            this.$checkbox = null;
            this.$wrapper = null;

            this.render();
            this.bindDomEvents();
            this.bindCustomEvents();

            this.setData();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Renders the component
         */
        render: function() {
            this.sandbox.dom.addClass(this.$el, constants.componentClass);

            if (this.sandbox.dom.attr(this.$el, 'id')) {
                this.options.instanceName = this.sandbox.dom.attr(this.$el, 'id');
                this.hasId = true;
            }

            if (this.options.outline === true) {
                this.sandbox.dom.addClass(this.$el, constants.outlineClass);
            }

            //wrapper to insert all content into
            this.$wrapper = this.sandbox.dom.createElement('<div class="'+ constants.wrapperClass +'"/>');
            this.sandbox.dom.html(this.$el, this.$wrapper);

            this.generateHiddenCheckbox();

            if (this.checked === true) {
                this.setChecked(false);
            }

            this.sandbox.dom.append(this.$wrapper, this.sandbox.dom.createElement('<div class="'+ constants.switchClass +'"/>'));
        },

        /**
         * Binds the DOM related Events
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', function() {
               this.toggleButton();
            }.bind(this));

            //if toggler has id enable clicks on labels
            if (this.hasId === true) {
                this.sandbox.dom.on('label[for="'+ this.options.instanceName +'"]', 'click', function() {
                    this.toggleButton();
                }.bind(this));
            }
        },

        /**
         * Binds custom events
         */
        bindCustomEvents: function() {
            this.sandbox.on(CHANGE.call(this), function(checked) {
                if (this.checked !== checked) {
                    if (checked === true) {
                        this.setChecked(true);
                    } else {
                        this.unsetChecked(true);
                    }
                }
            }.bind(this));
        },

        /**
         * Toggles the button state
         */
        toggleButton: function() {
            if (this.checked === true) {
                this.unsetChecked(true);
            } else {
                this.setChecked(true);
            }
        },

        /**
         * Switches the toggler on
         */
        setChecked: function(emit) {
            this.sandbox.dom.addClass(this.$el, constants.checkedClass);
            this.checked = true;
            this.setData();
            this.updateCheckbox(this.checked);

            if (emit !== false) {
                this.sandbox.emit(CHANGED.call(this), true);
            }
        },

        /**
         * Switches the toggler off
         */
        unsetChecked: function(emit) {
            this.sandbox.dom.removeClass(this.$el, constants.checkedClass);
            this.checked = false;
            this.setData();
            this.updateCheckbox(this.checked);

            if (emit !== false) {
                this.sandbox.emit(CHANGED.call(this), false);
            }
        },

        /**
         * Generates a hidden checkbox useful using toggler in forms
         */
        generateHiddenCheckbox: function() {
            if (this.options.hiddenCheckbox === true) {
                this.$checkbox = this.sandbox.dom.createElement('<input type="checkbox" name="'+ this.options.instanceName +'"/>');
                this.sandbox.dom.append(this.$wrapper, this.$checkbox);
            }
        },

        /**
         * Updates the state of the checkbox
         * @param {boolean} checked True to set the sandbox checked, false to uncheck
         */
        updateCheckbox: function(checked) {
            if (this.$checkbox !== null) {
                this.sandbox.dom.prop(this.$checkbox, 'checked', checked);
            }
        },

        /**
         * Sets the data-checked attribute for the toggler
         */
        setData: function() {
            this.sandbox.dom.data(this.$el, 'checked', (!!this.checked) ? 'checked' : '');
        }
    };

});

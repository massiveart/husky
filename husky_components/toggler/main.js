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
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined'
        },

        constants = {
            componentClass: 'husky-toggler',
            switchClass: 'switch',
            checkedClass: 'checked',
            checked: false
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

            this.sandbox.dom.addClass(this.$el, constants.componentClass);
            this.render();
            this.bindDomEvents();
            this.bindCustomEvents();

            this.hasId = false;

            this.checked = this.options.checked;
            this.setData();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Renders the component
         */
        render: function() {
            if (this.sandbox.dom.attr(this.$el, 'id')) {
                this.options.instanceName = this.sandbox.dom.attr(this.$el, 'id');
                this.hasId = true;
            }
            this.html(this.sandbox.dom.createElement('<div class="'+ constants.switchClass +'"/>'));
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
                        this.setChecked();
                    } else {
                        this.unsetChecked();
                    }
                }
            }.bind(this));
        },

        /**
         * Toggles the button state
         */
        toggleButton: function() {
            if (this.checked === true) {
                this.unsetChecked();
            } else {
                this.setChecked();
            }
        },

        /**
         * Switches the toggler on
         */
        setChecked: function() {
            this.sandbox.dom.addClass(this.$el, constants.checkedClass);
            this.checked = true;
            this.sandbox.emit(CHANGED.call(this), true);
            this.setData();
        },

        /**
         * Switches the toggler off
         */
        unsetChecked: function() {
            this.sandbox.dom.removeClass(this.$el, constants.checkedClass);
            this.checked = false;
            this.sandbox.emit(CHANGED.call(this), false);
            this.setData();
        },

        /**
         * Sets the data-checked attribute for the toggler
         */
        setData: function() {
            this.sandbox.dom.data(this.$el, 'checked', this.checked);
        }
    };

});

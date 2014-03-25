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
            componentClass: 'husky-toggler'
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

            this.sandbox.emit(INITIALIZED.call(this));
        }
    };

});

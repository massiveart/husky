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
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined'
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.matcher.',

        /**
         * raised after initialization process
         * @event husky.overlay.<instance-name>.initialize
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
            this.sandbox.logger.log('initialize', this);

            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.sandbox.emit(INITIALIZED.call(this));
        }
    };

});

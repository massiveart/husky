/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/label
 */

/**
 * @class Label
 * @constructor
 *
 * @param {Object} [options] Configuration object
 */
define(function() {

    'use strict';

    var defaults = {
        instanceName: 'undefined'
    },

    eventNamespace = 'husky.label.',

    /**
     * raised after initialization process
     * @event husky.label.[INSTANCE_NAME.]initialized
     */
    INITIALIZED = function() {
        createEventName.call(this, 'initialized');
    },

    /** returns normalized event names */
        createEventName = function(postFix) {
        return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
    };

    return {

        /**
         * Initialize the component
         */
        initialize: function() {

            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.sandbox.emit(INITIALIZED.call(this));
        }
    };

});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/auto-complete-list
 */

/**
 * @class AutoCompleteList
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to load data
 **/
define([], function() {

        'use strict';

        var defaults = {
                url: '' // url to load data
            },
            eventNamespace = 'husky.auto-complete-list',

            /**
             * @event husky.auto-complete-list.rendered
             * @description fires when an animation begins.
             * @param {String} name Name of the ...
             */
                RENDERED = eventNamespace + 'rendered',

            /**
             * @event husky.auto-complete-list.rendered
             * @description fires when an animation begins.
             * @param {String} name Name of the ...
             */
                LOADED = eventNamespace + 'loaded';

        return {

            view: true,

            initialize: function() {
                this.sandbox.logger.log('initialize', this);
                this.sandbox.logger.log(arguments);

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.render();
            },

            render: function() {

            }

        };
    }
);

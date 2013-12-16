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
 * @param {String} [options.tags]
 * @param {String} [options.url] url to load autocomplete data
 * @param {String} [options.suggestions]
 * @param {String} [options.suggestionUrl] url to load suggestions
 */
define([
    'text!husky_components/auto-complete-list/main.html',
    'text!husky_components/auto-complete-list/tag.html',
    'text!husky_components/auto-complete-list/suggestions.html'
], function(tplMain, tplTag, tplSuggestions) {

        'use strict';

        var defaults = {
                tags: [],
                url: '', // url to load autocomplete data
                suggestions: [],
                suggestionUrl: '' // url to load suggestions
            },
            eventNamespace = 'husky.auto-complete-list.',

            /**
             * @event husky.auto-complete-list.rendered
             * @description the component has been rendered
             */
            RENDERED = eventNamespace + 'rendered';



        return {

            view: true,

            initialize: function() {
                this.sandbox.logger.log('initialize', this);

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.render();
            },

            render: function() {

                this.$el.html(
                    _.template(tplMain)({
                        label: 'Tags' // todo translate
                    })
                );

                this.sandbox.emit(RENDERED);
            }

        };
    }
);

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/collection-navigation
 */


define(['text!collection-navigation/collections-list.html'], function(collectionsListTpl) {

    /**
     * @class CollectionsListView
     * @constructor
     */
    return function CollectionsListView(options) {
        return {
            /**
             * @method init
             */
            init: function() {
                this.template = _.template(collectionsListTpl, {
                    nameKey: options.nameKey
                });
                this.$el = $('<div/>', {
                    'class': 'collection-navigation-list'
                });

                return this;
            },

            /**
             * Removes the view
             * @method destroy
             * @chainable
             */
            destroy: function() {
                this.$el.off();
                this.$el.remove();
                this.$el = null;

                return this;
            },

            /**
             * @method render
             * @param {Object} data
             * @param {Object} options
             * @chainable
             */
            render: function(data, options) {
                data = data || {};
                var tpl = this.template({ data: data, options: options });

                this.$el.html(tpl);

                return this;
            },

            /**
             * Insert the html into the dom
             * @method placeAt
             * @chainable
             */
            placeAt: function(container) {
                $(container).append(this.$el);

                return this;
            }
        };
    }
});

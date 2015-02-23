/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/data-navigation
 */

define([], function() {

    var templates = {
        list: function() {
            return [
                '<ul class="data-navigation-items">',
                '<% if (!!data.children && !!data.children.length) { %>',
                '<% _.each(data.children, function(child) { %>',
                '<li data-id="<%= child.id %>">',
                '<div class="data-navigation-item-thumb" style="background-image: url(', '\'http://lorempixel.com/35/35\'', ')"></div>',
                '<div class="data-navigation-item-name">',
                '<%= child[options.nameKey] %>',
                '<% if (!!child.hasSub) { %>',
                '<span class="fa-chevron-right data-navigation-item-next"></span>',
                '<% } %>',
                '</div>',
                '</li>',
                '<% }) %>',
                '<% } else if (!!data.children && data.children.length === 0) { %>',
                '<li class="not-selectable">',
                '<div class="data-navigation-info">',
                'No Data',
                '</div>',
                '</li>',
                '<% } else { %>',
                '<li class="not-selectable">',
                '<div class="data-navigation-loader-container">',
                '<div class="spinner">',
                '<div class="double-bounce1"></div>',
                '<div class="double-bounce2"></div>',
                '</div>',
                '</div>',
                '</li>',
                '<% } %>',
                '</ul>'
            ].join('');
        }
    };

    /**
     * @class ListView
     * @constructor
     */
    return function ListView() {
        return {
            /**
             * @method init
             */
            init: function() {
                this.template = _.template(templates.list());
                this.$el = $('<div/>', {
                    'class': 'data-navigation-list'
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

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
                '   <% if (!!data.children && !!data.children.length) { %>',
                templates.children(),
                '   <% } else if (!!data.children && data.children.length === 0) { %>',
                '       <li class="not-selectable">',
                '           <div class="data-navigation-info data-navigation-info-empty">',
                '               <div class="fa-coffee icon"></div>',
                '               <span><%=options.translates.noData%></span>',
                '           </div>',
                '       </li>',
                '   <% } else { %>',
                '       <li class="not-selectable">',
                '           <div class="data-navigation-loader-container">',
                '               <div class="spinner">',
                '                   <div class="double-bounce1" style="background-color: rgb(204, 204, 204);"></div>',
                '                   <div class="double-bounce2" style="background-color: rgb(204, 204, 204);"></div>',
                '               </div>',
                '           </div>',
                '       </li>',
                '   <% } %>',
                '</ul>'
            ].join('');
        },

        children: function() {
            return [
                '       <% _.each(data.children, function(child) { %>',
                '           <li data-id="<%= child.id %>" class="data-navigation-item">',
                '               <% if (!!child.preview) { %>',
                '                   <div class="data-navigation-item-thumb" style="background-image: url(\'<%=child.preview.url%>\')"></div>',
                '               <% } else { %>',
                '                   <div class="fa-coffee data-navigation-item-thumb" style="margin-top: 10px;padding-left: 10px;"></div>',
                '               <% } %>',
                '               <div class="data-navigation-item-name">',
                '                   <%= child[options.nameKey] %>',
                '                   <% if (!!child.hasSub) { %>',
                '                       <span class="fa-chevron-right data-navigation-item-next"></span>',
                '                   <% } %>',
                '               </div>',
                '           </li>',
                '       <% }) %>'
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
                this.children = _.template(templates.children());
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
                var tpl = this.template({data: data, options: options});

                this.$el.html(tpl);

                return this;
            },

            /**
             * @method render
             * @param {Object} data
             * @param {Object} options
             * @chainable
             */
            append: function(data, options) {
                var tpl = this.children({data: {children: data}, options: options});

                this.$el.find('ul').append(tpl);
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

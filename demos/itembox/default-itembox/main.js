/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/listbox
 */

define([], function() {
    var templates = {
            itemContent: function(title) {
                return ['<span class="title">', title, '</span>'].join('');
            }
        };

    return {
        type: 'itembox',

        getUrl: function(data) {
            var delimiter = (this.options.url.indexOf('?') === -1) ? '?' : '&';

            return [
                this.options.url, delimiter, this.options.idsParameter, '=', (data || []).join('')
            ].join('');
        },

        getItemContent: function(item) {
            return templates.itemContent(item.title);
        },

        sortHandler: function(ids) {
            this.setData(ids, false);
        },

        removeItem: function(data, id) {

        },

        initialize: function() {
            this.render();

            this.setData([1, 2, 3]);
        }
    }
});

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
        },

        bindCustomEvents = function() {
            this.sandbox.on(this.DISPLAY_OPTION_CHANGED, this.updateDisplayOption.bind(this));
        };

    return {
        type: 'itembox',

        getUrl: function(data) {
            var delimiter = (this.options.url.indexOf('?') === -1) ? '?' : '&',
                url = [
                    this.options.url, delimiter, this.options.idsParameter, '=', (data || []).join('')
                ].join('');

            return url;
        },

        getItemContent: function(item) {
            return templates.itemContent(item.title);
        },

        updateOrder: function(ids) {
            this.setData(ids, false);
        },

        initialize: function() {
            this.render();

            bindCustomEvents.call(this);

            this.setData([1, 2, 3]);
        }
    }
});

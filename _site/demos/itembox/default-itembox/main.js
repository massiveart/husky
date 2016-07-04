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
            this.sandbox.on('husky.demo.add-button-clicked', function() {
                var id = Math.ceil(Math.random() * 1000000),
                    data = this.getData();

                this.addItem({id: id, title: 'added'});

                data.push(id);
                this.setData(data, false);
            }, this);
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

        removeHandler: function(id) {
            var data = this.getData();
            data.splice(data.indexOf(id), 1);
            this.setData(data, false);
        },

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, this.options);

            this.render();

            this.setData([1, 2, 3]);

            bindCustomEvents.call(this);
        }
    }
});

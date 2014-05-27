/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([
    'type/default',
    'form/util'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: 'id',
                label: 'value',
                required: false
            },

            typeInterface = {
                setValue: function(data) {

                    if (data === undefined || data === '' || data === null) {
                        return;
                    }

                    if (typeof data === 'object') {
                        this.$el.data({
                            'selection': data[this.options.id],
                            'selectionValues': data[this.options.label]
                        }).trigger('data-changed');
                    } else {
                        this.$el.data({
                            'selection': data
                        }).trigger('data-changed');
                    }
                },

                getValue: function() {
                    // For single select
                    var data = {},
                        ids = this.$el.data('selection'),
                        values = this.$el.data('selection-values');

                    data[this.options.label] = Array.isArray(values) ? values[0] : values;
                    data[this.options.id] = Array.isArray(ids) ? ids[0] : ids;

                    return data;
                },

                needsValidation: function() {
                    return this.options.required;
                },

                validate: function() {
                    var value = this.getValue();
                    return !!value.id;
                }
            };

        return new Default($el, defaults, options, 'husky-select', typeInterface);
    };
});
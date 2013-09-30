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
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: 'id',
                label: 'name'
            },
            typeInterface = {
                setValue: function(value) {
                    if (!!value[this.options.label]) {
                        this.$el.text(value[this.options.label]);
                    }

                    if (!!value[this.options.id]) {
                        this.$el.data(this.options.id, value[this.options.id]);
                    }
                },

                getValue: function() {
                    var result = {};
                    result[this.options.id] = this.$el.data(this.options.id);
                    result[this.options.label] = this.$el.text();
                    return result;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'label', typeInterface);
    };
});

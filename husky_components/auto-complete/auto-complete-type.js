/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define([
    'type/default',
    'form/util'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: 'id',
                name: 'name',
                required: false
            },

            typeInterface = {
                setValue: function(data) {
                    var $input = $el.find('input');

                    if (!$input.length) {
                        $el.data('value', data);
                        $el.attr('data-value', JSON.stringify(data));
                    }

                    $input.data('id', data[this.options.id]);
                    $input.attr('data-id', data[this.options.id]);
                    $input.typeahead('val', data[this.options.name]);
                },

                getValue: function() {
                    var $input = $el.find('input');

                    // https://github.com/massiveart/husky/issues/682
                    if (!$input.data('id') || $input.data('id') === 'null') {
                        return;
                    }

                    var value = {};

                    value[this.options.id] = $input.data('id');
                    value[this.options.name] = $input.val();

                    return value;
                },

                needsValidation: function() {
                    var val = this.getValue();
                    return !!val;
                },

                validate: function() {
                    var value = this.getValue();
                    if (typeof value === 'object' && value.hasOwnProperty('id')) {
                        return !!value.id;
                    } else {
                        return value !== '' && typeof value !== 'undefined';
                    }
                }
            };

        return new Default($el, defaults, options, 'husky-auto-complete', typeInterface);
    };
});

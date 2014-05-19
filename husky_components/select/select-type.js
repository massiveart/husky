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
                label: 'name'
            },

            typeInterface = {
                setValue: function(value) {
                    this.$el.data('selection', value).trigger('husky.select.'+$el.instanceName+'.data.changed');
                },

                getValue: function() {
                    return this.$el.data('selection');
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'husky-select', typeInterface);
    };
});

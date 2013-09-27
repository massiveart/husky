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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, options) {
        var defaults = {
                min: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min'), {
                validate: function() {
                    var val = this.$el.val();
                    return Number(val) >= this.data.min;
                }
            });

        result.initialize();
        return result;
    };

});

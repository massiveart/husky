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
                max: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max'), {
                validate: function() {
                    var val = this.$el.val();
                    return Number(val) <= this.data.max;
                }
            });

        result.initialize();
        return result;
    };

});

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
                maxLength: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max-length'), {
                validate: function() {
                    var val = this.$el.val();
                    return val.length <= this.data.maxLength;
                }
            });

        result.initialize();
        return result;
    };

});

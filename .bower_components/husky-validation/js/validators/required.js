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
        var defaults = { },

            result = $.extend(new Default($el, form, defaults, options, 'required'), {
                validate: function(value) {
                    if (!!this.data.required) {
                        var val = value || this.$el.val(), i;
                        // for checkboxes and select multiples.
                        // check there is at least one required value
                        if ('object' === typeof val) {
                            for (i in val) {
                                if (this.validate(val[i])) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        // notNull && notBlank
                        return val.length > 0 && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
                    }
                    return true;
                }
            });

        result.initialize();
        return result;
    };

});

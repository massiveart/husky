/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define(function() {

    'use strict';

    return function($el, form, defaults, options, name) {

        return {
            name: name,

            initialize: function() {
                this.$el = $el;
                this.data = $.extend(defaults, this.$el.data(), options);
                this.updateData();

                if (!!this.initializeSub) {
                    this.initializeSub();
                }
            },

            updateConstraint: function(options) {
                $.extend(this.data, options);
                this.updateData();
            },

            updateData: function() {
                $.each(this.data, function(key, value) {
                    this.$el.data(key, value);
                }.bind(this));
            }
        };

    };

});

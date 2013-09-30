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

    return function($el, defaults, options, name, typeInterface) {

        var that = {
                initialize: function() {
                    this.$el = $el;
                    this.options = $.extend({}, defaults, options);

                    if (!!this.initializeSub) {
                        this.initializeSub();
                    }
                }
            },
            defaultInterface = {
                name: name,

                needsValidation: function() {
                    return true;
                },

                updateConstraint: function(options) {
                    $.extend(this.options, options);
                },

                // mapper functionality set value into input
                setValue: function(value) {
                    this.$el.val(this.getViewData.call(this, value));
                },

                // mapper functionality get value from input
                getValue: function() {
                    return this.getModelData.call(this, this.$el.val());
                },

                // internationalization of view data: default none
                getViewData: function(value) {
                    return value;
                },

                // internationalization of model data: default none
                getModelData: function(value) {
                    return value;
                }
            },
            result = $.extend({}, defaultInterface, typeInterface);

        that.initialize.call(result);

        return result;
    };

});

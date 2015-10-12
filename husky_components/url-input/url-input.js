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
    'services/husky/url-validator'
], function(Default, urlValidator) {

    'use strict';

    return function($el, options) {
        var defaults = {
                schemes: urlValidator.getDefaultSchemes()
            },

            constants = {
                dataKey: 'url-data',
                dataChangedEvent: 'data-changed'
            },

            typeInterface = {
                setValue: function(data) {
                    var match = urlValidator.match(data, this.options.schemes);

                    if (!!match) {
                        this.$el.data(
                            constants.dataKey,
                            match
                        );
                        this.$el.trigger(constants.dataChangedEvent)
                    }
                },

                getValue: function() {
                    var data = this.$el.data(constants.dataKey);

                    if (!!data && !!data.scheme && !!data.specificPart) {
                        return data.scheme + data.specificPart;
                    }

                    return null
                },

                needsValidation: function() {
                    return this.getValue() !== null;
                },

                validate: function() {
                    var url = this.getValue();

                    return urlValidator.test(url, this.options.schemes);
                }
            };

        return new Default($el, defaults, options, 'url-input', typeInterface);
    };
});

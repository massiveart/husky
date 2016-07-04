/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
define(function() {

    'use strict';

    // simplified backbone model
    var Model = {
        get: function(attr) {
            return this[attr];
        },

        set: function(attr, value) {
            !!value && (this[attr] = value);
            return this;
        }
    };

    return {

        name: 'Model',

        initialize: function(app) {
            app.sandbox.data.Model = Model;
        }

    };
});

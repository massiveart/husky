/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

/**
 * Provides the util function into a sandbox.
 */
define(['services/husky/util'], function(util) {

    'use strict';

    return {
        name: 'Util',

        initialize: function(app) {
            for (var key in util) {
                app.core.util[key] = util[key];
            }
        }
    };
});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
(function() {

    'use strict';

    require.config({
        paths: { "jquery-minicolors": 'bower_components/jquery-minicolors/jquery.minicolors' },
        shim: { backbone: { deps: ['jquery'] } }
    });

    define(['jquery-minicolors'], {
        name: 'minicolor',

        initialize: function(app) {
            app.sandbox.colorpicker = {

                init: function(selector, configs) {
                    return app.core.dom.$(selector).minicolors(configs);
                },

                value: function(selector, value) {
                    return app.core.dom.$(selector).minicolors('value', value);
                }
            };
        }
    });
})();

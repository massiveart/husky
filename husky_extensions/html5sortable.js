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
 * see https://github.com/farhadi/html5sortable for documentation
 */

(function() {

    'use strict';

    require.config({
        paths: {
            jquery: 'bower_components/jquery/jquery',
            html5sortable: 'vendor/html5sortable/html5sortable'
        },
        shim: {
            jquery: { exports: '$' },
            html5sortable: {deps: ['jquery'], exports: 'jQuery.fn.sortable'}
        }
    });


    define(['html5sortable'], function() {

        return {
            name: 'html5sortable',

            initialize: function(app) {
                app.core.dom.sortable = function(selector, options) {
                    return $(selector).sortable(options);
                };
            }
        };
    });
})();

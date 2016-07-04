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
        paths: { "uri-template": 'bower_components/massiveart-uritemplate/uritemplate' }
    });

    define(['uri-template'], function(UriTemplate) {

        return  {

            name: 'uri-template',

            initialize: function(app) {

                app.sandbox.uritemplate = {

                    parse: function(param) {
                        return UriTemplate.parse(param);
                    },

                    expand: function(template, params) {
                        return template.expand(params);
                    }

                };

            }
        };
    });
})();

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

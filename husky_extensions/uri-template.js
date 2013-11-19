(function() {

    'use strict';

    require.config({
        paths: { "uri-template": 'bower_components/uri-template/...' } // TODO
    });

    define(['uri-template'], function(URITemplate) {

        return  {

            name: 'uri-template',

            initialize: function(app) {

                app.core.uritemplate = {

                    parse: function(param) {
                        return URITemplate.parse(param);
                    },

                    expand: function(selector) {
                        return URITemplate.parse(selector);
                    }

                };

            }
        };
    });
})();

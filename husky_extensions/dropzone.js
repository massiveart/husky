(function() {

    'use strict';

    require.config({
        paths: { "dropzone": 'bower_components/dropzone/dropzone' }
    });

    define(['dropzone'], {
        name: 'dropzone',

        initialize: function(app) {
            app.sandbox.dropzone = {

                initialize: function(selector, configs) {
                    return app.core.dom.$(selector).dropzone(configs);
                }
            };
        }
    });
})();

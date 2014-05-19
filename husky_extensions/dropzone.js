(function() {

    'use strict';

    require.config({
        paths: { "dropzone": 'bower_components/dropzone/dropzone' }
    });

    define(['dropzone'], function(Dropzone) {
        return {
            name: 'dropzone',

            initialize: function(app) {
                // Disable confirmation
                Dropzone.confirm = function(question, accepted) {
                    accepted();
                },

                app.sandbox.dropzone = {
                    initialize: function(selector, configs) {
                        return app.core.dom.$(selector).dropzone(configs);
                    }
                };
            }
        };
    });
})();

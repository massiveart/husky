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

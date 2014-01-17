(function() {

    'use strict';

    if (window.TagsManager) {
        define('tagsManager', [], function() {
            return window.TagsManager;
        });
    } else {
        require.config({
            paths: { "tagsManager": 'bower_components/tagmanager/tagmanager' },
            shim: { backbone: { deps: ['jquery'] } }
        });
    }

    define(['tagsManager'], {
        name: 'tagsManager',

        initialize: function(app) {
            app.sandbox.autocompleteList = {

                init: function(selector, configs) {
                    return app.core.dom.$(selector).tagsManager(configs);
                }

            };
        }
    });
})();

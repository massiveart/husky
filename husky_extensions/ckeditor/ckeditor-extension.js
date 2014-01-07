(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'husky_extensions/ckeditor/ckeditor',
            jqueryAdapter: 'husky_extensions/ckeditor/adapters/jquery',
            ckeditorConfig: 'husky_extensions/ckeditor/custom/ckeditor_config'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });


    define(['ckeditorConfig', 'ckeditor', 'jqueryAdapter'], function(ckeditorConfig, ckeditor, jqueryAdapter) {

        return {

            name: 'ckeditor',

            initialize: function(app) {

                app.sandbox.ckeditor = {

                    // callback when editor is ready
                    init: function(selector, callback, config) {

                        var configuration = app.sandbox.util.extend(true, {}, ckeditorConfig, config);

                        if (!!callback && typeof callback === 'function') {
                            return $(selector).ckeditor(callback, configuration);
                        } else {
                            return $(selector).ckeditor(configuration);
                        }

                    }
                };
            }

        };
    });
})();

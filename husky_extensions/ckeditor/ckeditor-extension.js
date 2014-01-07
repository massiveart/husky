(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'husky_extensions/ckeditor/ckeditor',
            jqueryAdapter: 'husky_extensions/ckeditor/adapters/jquery'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });


    define(['ckeditor', 'jqueryAdapter'], {

        name: 'ckeditor',

        initialize: function(app) {

            app.sandbox.ckeditor = {

                // callback when editor is ready
                init: function(selector, callback, config) {
                    if (!!callback && typeof callback === 'function') {
                        return $(selector).ckeditor(callback, config);
                    } else {
                        return $(selector).ckeditor(config);
                    }
                }
            };
        }
    });
})();

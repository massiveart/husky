(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'ckeditor',
            jqueryAdapter: 'husky_extensions/ckeditor/adapters/jquery'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });


    define(['ckeditor'], {

        name: 'ckeditor',

        initialize: function(app) {

            app.sandbox.ckeditor = {

                ckeditor: function(selector, callback) {
                    if (!!callback && typeof callback === 'function') {
                        return $(selector).ckeditor(callback);
                    } else {
                        return $(selector).ckeditor();
                    }
                }
            };
        }
    });
})();

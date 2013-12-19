(function() {

    'use strict';

    require.config({
        paths: {
            "ckeditor": 'bower_components/ckeditor/ckeditor',
            "jqueryAdapter": 'bower_components/ckeditor/jquery'
        }
    });

    define(['ckeditor', 'jqueryAdapter'], function(CKEditor, jQueryAdapter) {

        return  {

            name: 'ckeditor',

            initialize: function(app) {

                app.sandbox.ckeditor = {

                    ckeditor: function(selector, callback) {
                        if(!!callback && typeof callback === 'function') {
                            return $(selector).ckeditor(callback);
                        } else {
                            return $(selector).ckeditor();
                        }
                    }

                };

            }
        };
    });
})();

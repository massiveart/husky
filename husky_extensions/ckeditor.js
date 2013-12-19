(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'bower_components/ckeditor/ckeditor',
            jqueryAdapter: 'bower_components/ckeditor/jquery'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });

    define(['ckeditor', 'jqueryAdapter'], function() {

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

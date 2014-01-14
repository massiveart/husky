(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'vendor/ckeditor/ckeditor',
            jqueryAdapter: 'vendor/ckeditor/adapters/jquery'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });

    define(['ckeditor', 'jqueryAdapter'], function() {

        var getConfig = function() {
            return {
                toolbar: [
                    { name: 'semantics', items: ['Format']},
                    { name: 'basicstyles', items: [ 'Superscript', 'Italic', 'Bold', 'Underline', 'Strike'] },
                    { name: 'blockstyles', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                    { name: 'list', items: [ 'BulletedList'] },
                    { name: 'code', items: [ 'Source'] }
                ],

                format_tags: 'p;h1;h2;h3;h4;h5;h6',
                height:'300px',
                width:'100%',
                defaultLanguage: 'en',
                removeButtons: '',
                removePlugins: 'elementspath,link,magicline',
                removeDialogTabs: 'image:advanced;link:advanced',
                extraPlugins: 'justify,button,listblock,panel,floatpanel,richcombo,format',
                resize_enabled: false,
                uiColor: '#ffffff',
                skin: 'husky'
            };
        };

        return {

            name: 'ckeditor',

            initialize: function(app) {

                app.sandbox.ckeditor = {

                    // callback when editor is ready
                    init: function(selector, callback, config) {

                        var configuration = app.sandbox.util.extend(true, {}, config, getConfig.call());

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

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
            return {toolbar: [
                { name: 'fontsize', items: [ 'FontSize', ''] },
                { name: 'basicstyles', items: [ 'Superscript', 'Italic', 'Bold', 'Underline', 'Strike'] },
                { name: 'blockstyles', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                { name: 'list', items: [ 'BulletedList'] },
                { name: 'code', items: [ 'Source'] }
            ],
                removeButtons: '',
                removePlugins: 'elementspath, fakeobjects,scayt,wsc,dialog, a11yhelp, magicline,link,specialchar, table, tabletools, image,about,pastefromword,pastetext,clipboard',
                removeDialogTabs: 'image:advanced;link:advanced',
                extraPlugins: 'justify',
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

                        var configuration = app.sandbox.util.extend(true, {}, getConfig.call(), config);

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

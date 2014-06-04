(function() {

    'use strict';

    require.config({
        paths: {
            "bootstrap-datepicker": 'bower_components/bootstrap-datepicker/bootstrap-datepicker',
            "datepicker-ar": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.az',
            "datepicker-az": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.bg',
            "datepicker-bg": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ar',
            "datepicker-ca": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ca',
            "datepicker-cs": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.cs',
            "datepicker-cy": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.cy',
            "datepicker-da": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.da',
            "datepicker-de": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.de',
            "datepicker-el": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.el',
            "datepicker-es": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.es',
            "datepicker-et": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.et',
            "datepicker-sq": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.sq',
            "datepicker-fa": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.fa',
            "datepicker-fi": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.fi',
            "datepicker-fr": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.fr',
            "datepicker-gl": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.gl',
            "datepicker-he": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.he',
            "datepicker-hr": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.hr',
            "datepicker-hu": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.hu',
            "datepicker-id": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.id',
            "datepicker-is": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.is',
            "datepicker-it": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.it',
            "datepicker-ja": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ja',
            "datepicker-ka": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ka',
            "datepicker-kk": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.kk',
            "datepicker-kr": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.kr',
            "datepicker-lt": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.lt',
            "datepicker-lv": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.lv',
            "datepicker-mk": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.mk',
            "datepicker-ms": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ms',
            "datepicker-nb": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.nb',
            "datepicker-nl": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.nl',
            "datepicker-nl-BE": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.nl-BE',
            "datepicker-no": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.no',
            "datepicker-pl": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.pl',
            "datepicker-pt": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.pt',
            "datepicker-pt-BR": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.pt-BR',
            "datepicker-ro": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ro',
            "datepicker-rs": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.rs',
            "datepicker-rs-latin": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.rs-latin',
            "datepicker-ru": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ru',
            "datepicker-sk": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.sk',
            "datepicker-sl": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.sl',
            "datepicker-sv": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.sv',
            "datepicker-sw": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.sw',
            "datepicker-th": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.th',
            "datepicker-tr": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.tr',
            "datepicker-ua": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ua',
            "datepicker-vi": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.vi',
            "datepicker-zh-CN": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.zh-CN',
            "datepicker-zh-TW": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.zh-TW'
        },
        shim: { backbone: { deps: ['jquery'] } }
    });

    var loadLocales = function() {
        require([
            'datepicker-ar', 'datepicker-az', 'datepicker-bg', 'datepicker-ca', 'datepicker-cs', 'datepicker-cy',
            'datepicker-da', 'datepicker-de', 'datepicker-el', 'datepicker-es', 'datepicker-et', 'datepicker-fa',
            'datepicker-fi', 'datepicker-fr', 'datepicker-gl', 'datepicker-he', 'datepicker-hr', 'datepicker-hu',
            'datepicker-id', 'datepicker-is', 'datepicker-it', 'datepicker-ja', 'datepicker-ka', 'datepicker-kk',
            'datepicker-kr', 'datepicker-lt', 'datepicker-lv', 'datepicker-mk', 'datepicker-ms', 'datepicker-nb',
            'datepicker-nl', 'datepicker-nl-BE', 'datepicker-no', 'datepicker-pl', 'datepicker-pt', 'datepicker-pt-BR',
            'datepicker-ro', 'datepicker-rs', 'datepicker-rs-latin', 'datepicker-ru', 'datepicker-sk', 'datepicker-sl',
            'datepicker-sq', 'datepicker-sv', 'datepicker-sw', 'datepicker-th', 'datepicker-tr', 'datepicker-ua',
            'datepicker-vi', 'datepicker-zh-CN', 'datepicker-zh-TW']);
    };

    define(['bootstrap-datepicker'], {
        name: 'bootstrap-datepicker',

        initialize: function(app) {
            loadLocales();

            app.sandbox.datepicker = {

                init: function(selector, configs) {
                    var settings = {
                        format: app.sandbox.globalize.getDatePattern(),
                        language: app.sandbox.globalize.getLocale(),
                        autoclose: true
                    };
                    settings = app.sandbox.util.extend(true, {}, settings, configs)
                    return app.core.dom.$(selector).datepicker(settings);
                },

                setValue: function(selector, value) {
                    return app.core.dom.$(selector).datepicker('update', value);
                }
            };
        }
    });
})();

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
(function() {

    'use strict';

    require.config({
        paths: {
            "bootstrap-datepicker": 'bower_components/bootstrap-datepicker/bootstrap-datepicker',
            "datepicker-az": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.az',
            "datepicker-bg": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.bg',
            "datepicker-ar": 'bower_components/bootstrap-datepicker/locales/bootstrap-datepicker.ar',
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
        shim: {
            "datepicker-az": {deps: ['bootstrap-datepicker']},
            "datepicker-bg": {deps: ['bootstrap-datepicker']},
            "datepicker-ar": {deps: ['bootstrap-datepicker']},
            "datepicker-ca": {deps: ['bootstrap-datepicker']},
            "datepicker-cs": {deps: ['bootstrap-datepicker']},
            "datepicker-cy": {deps: ['bootstrap-datepicker']},
            "datepicker-da": {deps: ['bootstrap-datepicker']},
            "datepicker-de": {deps: ['bootstrap-datepicker']},
            "datepicker-el": {deps: ['bootstrap-datepicker']},
            "datepicker-es": {deps: ['bootstrap-datepicker']},
            "datepicker-et": {deps: ['bootstrap-datepicker']},
            "datepicker-sq": {deps: ['bootstrap-datepicker']},
            "datepicker-fa": {deps: ['bootstrap-datepicker']},
            "datepicker-fi": {deps: ['bootstrap-datepicker']},
            "datepicker-fr": {deps: ['bootstrap-datepicker']},
            "datepicker-gl": {deps: ['bootstrap-datepicker']},
            "datepicker-he": {deps: ['bootstrap-datepicker']},
            "datepicker-hr": {deps: ['bootstrap-datepicker']},
            "datepicker-hu": {deps: ['bootstrap-datepicker']},
            "datepicker-id": {deps: ['bootstrap-datepicker']},
            "datepicker-is": {deps: ['bootstrap-datepicker']},
            "datepicker-it": {deps: ['bootstrap-datepicker']},
            "datepicker-ja": {deps: ['bootstrap-datepicker']},
            "datepicker-ka": {deps: ['bootstrap-datepicker']},
            "datepicker-kk": {deps: ['bootstrap-datepicker']},
            "datepicker-kr": {deps: ['bootstrap-datepicker']},
            "datepicker-lt": {deps: ['bootstrap-datepicker']},
            "datepicker-lv": {deps: ['bootstrap-datepicker']},
            "datepicker-mk": {deps: ['bootstrap-datepicker']},
            "datepicker-ms": {deps: ['bootstrap-datepicker']},
            "datepicker-nb": {deps: ['bootstrap-datepicker']},
            "datepicker-nl": {deps: ['bootstrap-datepicker']},
            "datepicker-nl-BE": {deps: ['bootstrap-datepicker']},
            "datepicker-no": {deps: ['bootstrap-datepicker']},
            "datepicker-pl": {deps: ['bootstrap-datepicker']},
            "datepicker-pt": {deps: ['bootstrap-datepicker']},
            "datepicker-pt-BR": {deps: ['bootstrap-datepicker']},
            "datepicker-ro": {deps: ['bootstrap-datepicker']},
            "datepicker-rs": {deps: ['bootstrap-datepicker']},
            "datepicker-rs-latin": {deps: ['bootstrap-datepicker']},
            "datepicker-ru": {deps: ['bootstrap-datepicker']},
            "datepicker-sk": {deps: ['bootstrap-datepicker']},
            "datepicker-sl": {deps: ['bootstrap-datepicker']},
            "datepicker-sv": {deps: ['bootstrap-datepicker']},
            "datepicker-sw": {deps: ['bootstrap-datepicker']},
            "datepicker-th": {deps: ['bootstrap-datepicker']},
            "datepicker-tr": {deps: ['bootstrap-datepicker']},
            "datepicker-ua": {deps: ['bootstrap-datepicker']},
            "datepicker-vi": {deps: ['bootstrap-datepicker']},
            "datepicker-zh-CN": {deps: ['bootstrap-datepicker']},
            "datepicker-zh-TW": {deps: ['bootstrap-datepicker']}
        }
    });

    define(['bootstrap-datepicker',
        'datepicker-ar', 'datepicker-az', 'datepicker-bg', 'datepicker-ca', 'datepicker-cs', 'datepicker-cy',
        'datepicker-da', 'datepicker-de', 'datepicker-el', 'datepicker-es', 'datepicker-et', 'datepicker-fa',
        'datepicker-fi', 'datepicker-fr', 'datepicker-gl', 'datepicker-he', 'datepicker-hr', 'datepicker-hu',
        'datepicker-id', 'datepicker-is', 'datepicker-it', 'datepicker-ja', 'datepicker-ka', 'datepicker-kk',
        'datepicker-kr', 'datepicker-lt', 'datepicker-lv', 'datepicker-mk', 'datepicker-ms', 'datepicker-nb',
        'datepicker-nl', 'datepicker-nl-BE', 'datepicker-no', 'datepicker-pl', 'datepicker-pt', 'datepicker-pt-BR',
        'datepicker-ro', 'datepicker-rs', 'datepicker-rs-latin', 'datepicker-ru', 'datepicker-sk', 'datepicker-sl',
        'datepicker-sq', 'datepicker-sv', 'datepicker-sw', 'datepicker-th', 'datepicker-tr', 'datepicker-ua',
        'datepicker-vi', 'datepicker-zh-CN', 'datepicker-zh-TW'], {

        name: 'bootstrap-datepicker',

        initialize: function(app) {

            app.sandbox.datepicker = {

                init: function(selector, configs) {
                    var settings = {
                        format: app.sandbox.globalize.getDatePattern().toLowerCase(),
                        language: app.sandbox.globalize.getLocale(),
                        autoclose: true
                    };
                    settings = app.sandbox.util.extend(true, {}, settings, configs);
                    return app.core.dom.$(selector).datepicker(settings);
                },

                setValue: function(selector, value) {
                    return app.core.dom.$(selector).datepicker('update', value);
                },

                getUTCDate: function(selector) {
                    return app.core.dom.$(selector).datepicker('getUTCDate');
                },

                getDate: function(selector) {
                    return app.core.dom.$(selector).datepicker('getDate');
                },

                setUTCDate: function(selector, date) {
                    return app.core.dom.$(selector).datepicker('setUTCDate', date);
                },

                setDate: function(selector, date) {
                    return app.core.dom.$(selector).datepicker('setDate', date);
                }
            };
        }
    });
})();

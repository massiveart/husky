/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/ckeditor
 */


/**
 * @class CKEditor
 * @constructor
 *
 */
define([], function() {

    'use strict';

    var defaults = {
            initializedCallback: null,
            height: 200,
            defaultLanguage: 'de'
        },


    getConfig = function() {
        var config = this.sandbox.util.extend(false, {}, this.options);

        delete config.initializedCallback;
        delete config.baseUrl;
        delete config.el;
        delete config.name;
        delete config.ref;
        delete config._ref;
        delete config.require;
        delete config.element;

        return config;
    };

    return {

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            var config = getConfig.call(this);
            this.$ckeditor = this.sandbox.ckeditor.init(this.$el, this.options.initializedCallback, config);
        }

    };

});

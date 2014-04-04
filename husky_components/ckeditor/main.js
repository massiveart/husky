/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/column-navigation
 */


/**
 * @class CKEditor
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {Function} [options.initialzedCallback] Callback when initialization is finished
 *
 */
define([], function() {

    'use strict';

    var defaults = {
            initializedCallback: null,
            instanceName: null
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.ckeditor.',

        /**
         * @event husky.ckeditor.changed
         * @description the component has loaded everything successfully and will be rendered
         */
            CHANGED = function() {
            return eventNamespace + 'changed';
        },

        /**
         * @event husky.ckeditor.focusout
         * @description triggered when focus of editor is lost
         */
            FOCUSOUT = function() {
            return eventNamespace + 'focusout';
        },

        /**
         * Removes the not needed elements from the config object for the ckeditor
         * @returns {Object} configuration object for ckeditor
         */
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


        if (this.options.instanceName !== null) {
            eventNamespace += this.options.instanceName + '.';
        }

        var config = getConfig.call(this);
        this.editor = this.sandbox.ckeditor.init(this.$el, this.options.initializedCallback, config);

        this.editor.on('change', function() {
            this.sandbox.emit(CHANGED.call(this), this.editor.getData(), this.$el);
        }.bind(this));

        this.editor.on('instanceReady', function() {
            // bind class to editor
            this.sandbox.dom.addClass(this.sandbox.dom.find('.cke', this.sandbox.dom.parent(this.$el)), 'form-element');
        }.bind(this));

        this.editor.on('blur', function() {
            this.sandbox.emit(FOCUSOUT.call(this), this.editor.getData(), this.$el);
        }.bind(this));
    }

};

})
;

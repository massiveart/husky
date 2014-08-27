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
            instanceName: null,
            godMode: false,
            tableEnabled: true,
            linksEnabled: true
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
            return eventNamespace + (this.options.instanceName !== null ? this.options.instanceName + '.' : '') + 'changed';
        },

        /**
         * @event husky.ckeditor.focusout
         * @description triggered when focus of editor is lost
         */
            FOCUSOUT = function() {
            return eventNamespace + (this.options.instanceName !== null ? this.options.instanceName + '.' : '') + 'focusout';
        },

        /**
         * Removes the not needed elements from the config object for the ckeditor
         * @returns {Object} configuration object for ckeditor
         */
            getConfig = function() {
            var config = this.sandbox.util.extend(false, {}, this.options);

            config.toolbar = [
                { name: 'semantics', items: ['Format']},
                { name: 'basicstyles', items: [ 'Superscript', 'Italic', 'Bold', 'Underline', 'Strike'] },
                { name: 'blockstyles', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                { name: 'list', items: [ 'BulletedList'] }
            ];

            if (this.options.linksEnabled === true) {
                config.toolbar.push({ name: 'links', items: [ 'Link', 'Unlink' ] });
                config.linkShowTargetTab = false;
            }
            if (this.options.tableEnabled === true) {
                config.toolbar.push({ name: 'insert', items: [ 'Table' ] });
            }

            config.toolbar.push({ name: 'code', items: [ 'Source'] });

            delete config.initializedCallback;
            delete config.baseUrl;
            delete config.el;
            delete config.property;
            delete config.name;
            delete config.ref;
            delete config._ref;
            delete config.require;
            delete config.element;
            delete config.godMode;
            delete config.linksEnabled;
            delete config.tableEnabled;

            // allow img tags to have any class (*) and any attribute [*]
            config.extraAllowedContent = 'img(*)[src,width,height,title,alt]; a(*)[href,target,type,rel,name,title]';
            // enable all content
            if (!!this.options.godMode) {
                config.allowedContent = true;
            }

            return config;
        };

return {

    initialize: function() {
        this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

        var config = getConfig.call(this);
        this.editor = this.sandbox.ckeditor.init(this.$el, this.options.initializedCallback, config);
        this.data = this.editor.getData();
        this.$overlay = null;

        this.bindChangeEvents();

        this.editor.on('instanceReady', function() {
            // bind class to editor
            this.sandbox.dom.addClass(this.sandbox.dom.find('.cke', this.sandbox.dom.parent(this.$el)), 'form-element');
        }.bind(this));

        this.editor.on('blur', function() {
            this.sandbox.emit(FOCUSOUT.call(this), this.editor.getData(), this.$el);
        }.bind(this));
    },

    /**
     * Binds Events to emit a custom changed event
     */
    bindChangeEvents: function() {
        this.editor.on('change', function() {
            this.emitChangedEvent();
        }.bind(this));

        // check if the content of the editor has changed if the mode is switched (html/wisiwig)
        this.editor.on('mode', function() {
            if (this.data !== this.editor.getData()) {
                this.emitChangedEvent();
            }
        }.bind(this));
    },

    /**
     * Emits the custom changed event
     */
    emitChangedEvent: function() {
        this.data = this.editor.getData();
        this.sandbox.emit(CHANGED.call(this), this.data, this.$el);
    }
};

})
;

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/dropzone
 */

/**
 * @class Dropzone
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.titleKey] The title to display if no items are dropped (can be a translation key)
 * @params {String} [options.descriptionKey] The description to display if no items are dropped (can be a translation key)
 * @params {String} [options.descriptionIcon] The icon to display if no items are dropped
 * @params {String} [options.cancelLoadingIcon] the icon which gets displayed while a file item gets uploaded
 * @params {String} [options.method] method to use for uploading 'PUT' or 'POST'
 * @params {String} [options.url] url to upload the files to
 * @params {String} [options.paramName] the name of the parameter which will contain the file(s). Note that if uploadMultiple is set to true the parameter Name gets extended with '[]'
 * @params {Object} [options.headers] additional headers to pass with each request
 * @params {Boolean} [options.uploadMultiple] if true a request can upload multiple files
 * @params {Function} [options.successCallback] callback which gets called if a file got successfully uploaded. First parameter is the file, the second the response
 * @params {Function} [options.beforeSendingCallback] callback which gets called before a file gets uploaded. First parameter is the file.
 * @params {Function} [options.removeFileCallback] callback which gets called after a file got removed. First parameter is the file.
 * @params {Object} [options.pluginOptions] Options to pass to the dropzone-plugin to completely override all options set by husky. Use with care.
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            titleKey: 'sulu.upload.dropzone-title',
            descriptionKey: 'sulu.upload.dropzone-desc',
            descriptionIcon: 'cloud-upload',
            cancelLoadingIcon: 'repeat',
            method: 'POST',
            url: '/',
            paramName: 'file',
            headers: {},
            uploadMultiple: false,
            successCallback: null,
            beforeSendingCallback: null,
            removeFileCallback: null,
            pluginOptions: {}
        },

        constants = {
            contianerClass: 'husky-dropzone',
            descriptionClass: 'description',
            uploadedItemContainerClass: 'upload-items',
            uploadItemClass: 'item',
            droppedClass: 'dropped'
        },

        /** templates for component */
        templates = {
            basic: [
                '<div class="'+ constants.descriptionClass +'">',
                    '<div class="icon-<%= icon %> icon"></div>',
                    '<span class="title"><%= title %></span>',
                    '<span><%= description %></span>',
                '</div>',
                '<div class="'+ constants.uploadedItemContainerClass +'"></div>'
            ].join(''),
            uploadItem: [
                '<div class="'+ constants.uploadItemClass +'">' +
                    '<div class="loading-content">',
                        '<div class="icon-<%= cancelIcon %> icon" data-dz-remove></div>',
                        '<div class="file-size" data-dz-size></div>',
                        '<div class="progress">',
                            '<div class="bar" data-dz-uploadprogress></div>',
                        '</div>',
                    '</div>',
                    '<div class="success-content">',
                        '<div class="image">',
                            '<img data-dz-thumbnail />',
                        '</div>',
                        '<div class="icon-ok tick"></div>',
                    '</div>',
                '</div>'
            ].join('')
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.dropzone.',

        /**
         * raised after initialization process
         * @event husky.dropzone.<instance-name>.initialize
         */
            INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised before sending a file
         * @event husky.dropzone.<instance-name>.uploading
         * @param {Object} the file
         */
            UPLOADING = function() {
            return createEventName.call(this, 'uploading');
        },

        /**
         * raised after file got successfully uploaded
         * @event husky.dropzone.<instance-name>.success
         * @param {Object} the file
         * @param {Object} the response
         */
            SUCCESS = function() {
            return createEventName.call(this, 'success');
        },

        /**
         * raised after file got removed from the zone
         * @event husky.dropzone.<instance-name>.file-remove
         * @param {Object} the file
         */
            FILE_REMOVED = function() {
            return createEventName.call(this, 'file-removed');
        },

        /** returns normalized event names */
            createEventName = function(postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        };

    return {

        /**
         * Initialize component
         */
        initialize: function() {
            this.sandbox.logger.log('initialize', this);

            // merge defaults, type defaults and options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.dropzone = null;

            this.render();
            this.bindDomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function() {
            // delegate click on elements children to element
            this.sandbox.dom.on(this.$find('*'), 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                this.sandbox.dom.trigger(this.$el, 'click');
            }.bind(this));
        },

        /**
         * Renders the component
         */
        render: function() {
            this.sandbox.dom.addClass(this.$el, constants.contianerClass);
            this.sandbox.dom.html(this.$el, this.sandbox.util.template(templates.basic)({
                description: this.options.descriptionKey,
                title: this.options.titleKey,
                icon: this.options.descriptionIcon,
                instanceName: this.options.instanceName
            }));
            this.startDropzone();
        },

        /**
         * Starts the dropzone component
         */
        startDropzone: function() {
            var that = this,
                options = {
                    url: this.options.url,
                    method: this.options.method,
                    paramName: this.options.paramName,
                    uploadMultiple: this.options.uploadMultiple,
                    headers: this.options.headers,
                    previewTemplate: this.sandbox.util.template(templates.uploadItem)({
                        cancelIcon: this.options.cancelLoadingIcon
                    }),
                    previewsContainer: this.$find('.' + constants.uploadedItemContainerClass)[0],
                    init: function() {
                        // gets called if file gets added (drop or via the upload window)
                        this.on('addedfile', function(file) {
                            this.sandbox.dom.addClass(this.$el, constants.droppedClass);

                            // prevent the the upload window to open on click on the preview item
                            this.sandbox.dom.on(file.previewElement, 'click', function(event) {
                                this.sandbox.dom.stopPropagation(event);
                            }.bind(this));
                        }.bind(that));

                        // gets called before the file is sent
                        this.on('sending', function(file) {
                            if (typeof this.options.beforeSendingCallback === 'function') {
                                this.options.beforeSendingCallback(file);
                            } else {
                                this.sandbox.emit(UPLOADING.call(this), file);
                            }
                        }.bind(that));

                        // gets called if the file was uploaded successfully
                        this.on('success', function(file, response) {
                            if (typeof this.options.successCallback === 'function') {
                                this.options.successCallback(file, response);
                            } else {
                                this.sandbox.emit(SUCCESS.call(this), file, response);
                            }
                        }.bind(that));

                        // gets called if a file gets removed from the zone
                        this.on('removedfile', function(file) {
                            if (typeof this.options.removeFileCallback === 'function') {
                                this.options.removeFileCallback(file);
                            } else {
                                this.sandbox.emit(FILE_REMOVED.call(this), file);
                            }
                        }.bind(that));

                        // gets called if all files are removed from the zone
                        this.on('reset', function() {
                            this.sandbox.dom.removeClass(this.$el, constants.droppedClass);
                        }.bind(that));
                    }
                };

            // merge the default plugin options with with passed ones
            this.sandbox.util.extend(true, {}, options, this.options.pluginOptions);
            this.dropzone = this.sandbox.dropzone.initialize(this.$el, options);
        }
    };

});

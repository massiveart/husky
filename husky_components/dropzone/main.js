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
            url: '/'
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
                        '<div class="icon-<%= cancelIcon %> icon"></div>',
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
                    previewTemplate: this.sandbox.util.template(templates.uploadItem)({
                        cancelIcon: this.options.cancelLoadingIcon
                    }),
                    previewsContainer: this.$find('.' + constants.uploadedItemContainerClass)[0],
                    init: function() {
                        this.on('addedfile', function() {
                            this.sandbox.dom.addClass(this.$el, constants.droppedClass);
                        }.bind(that));

                        this.on('sending', function(file) {
                            this.sandbox.emit(UPLOADING.call(this), file);
                        }.bind(that));

                        this.on('success', function(file, response) {
                            this.sandbox.emit(SUCCESS.call(this), file, response);
                        }.bind(that));
                    }
                };

            this.sandbox.util.extend(true, {}, options, this.options.pluginOptions);
            this.dropzone = this.sandbox.dropzone.initialize(this.$el, options);
        }
    };

});

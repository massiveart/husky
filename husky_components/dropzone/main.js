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
 * @params {Number} [options.showOverlayOnScrollTop] number of scroll-top on which the overlay will be displayed
 * @params {Object|String} [options.scrollContainer] element to check to scroll-top on
 * @params {Boolean} [options.showOverlay] if true the dropzone will be displayed in an overlay if its not visible any more or the passed scroll-top is reached
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
            headers: {
                // to prevent a 406 error-response
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            uploadMultiple: false,
            successCallback: null,
            beforeSendingCallback: null,
            removeFileCallback: null,
            pluginOptions: {},
            fadeOutDuration: 200, //ms
            fadeOutDelay: 1500, //ms
            showOverlayOnScrollTop: 50,
            scrollContainer: 'body',
            overlayTitle: 'sulu.dropzone.overlay-title',
            showOverlay: true
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

        /**
         * raised after files got uploaded and faded out from the dropzone
         * @event husky.dropzone.<instance-name>.files-added
         * @param {Array} all newly added files
         */
            FILES_ADDED = function() {
            return createEventName.call(this, 'files-added');
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
            this.$dropzone = null;
            this.lastUploadedFile = null;
            this.overlayOpened = false;

            this.render();
            this.bindDomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function() {
            // delegate click on elements children to element
            this.sandbox.dom.on(this.sandbox.dom.find('*', this.$dropzone), 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                this.sandbox.dom.trigger(this.$dropzone, 'click');
            }.bind(this));

            if (this.options.showOverlay) {
                this.sandbox.dom.on(this.sandbox.dom.$document, 'dragenter', function() {
                    this.openOverlay();
                }.bind(this));
            }
        },

        /**
         * Opens the dropzone in an overlay
         */
        openOverlay: function() {
            // open the overlay only if it's not already opened and if the dropzone is not visible
            if (this.overlayOpened === false) {
                if (this.sandbox.dom.visible(this.$dropzone) === false ||
                    this.sandbox.dom.scrollTop(this.options.scrollContainer) > this.options.showOverlayOnScrollTop) {

                    // set height of components element to prevent the site from bumping
                    this.sandbox.dom.height(this.$el, this.sandbox.dom.outerHeight(this.$el));

                    var $container = this.sandbox.dom.createElement('<div/>');
                    this.sandbox.dom.append(this.$el, $container);
                    this.sandbox.start([{
                        name: 'overlay@husky',
                        options: {
                            el: $container,
                            openOnStart: true,
                            removeOnClose: true,
                            data: this.$dropzone,
                            title: this.options.overlayTitle,
                            skin: 'dropzone',
                            closeCallback: function() {
                                this.sandbox.dom.append(this.$el, this.$dropzone);
                                this.sandbox.dom.height(this.$el, '');
                                this.overlayOpened = false;
                            }.bind(this)
                        }
                    }]);
                    this.overlayOpened = true;
                }
            }
        },

        /**
         * Renders the component
         */
        render: function() {
            this.$dropzone = this.sandbox.dom.createElement('<div class="'+ constants.contianerClass +'"/>');
            this.sandbox.dom.html(this.$dropzone, this.sandbox.util.template(templates.basic)({
                description: this.sandbox.translate(this.options.descriptionKey),
                title: this.sandbox.translate(this.options.titleKey),
                icon: this.options.descriptionIcon,
                instanceName: this.options.instanceName
            }));
            this.sandbox.dom.append(this.$el, this.$dropzone);
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
                    previewsContainer: this.sandbox.dom.find('.' + constants.uploadedItemContainerClass, this.$dropzone)[0],
                    init: function() {
                        // store dropzone context
                        that.dropzone = this;

                        // gets called if file gets added (drop or via the upload window)
                        this.on('addedfile', function(file) {
                            this.sandbox.dom.addClass(this.$dropzone, constants.droppedClass);

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
                            if (this.lastUploadedFile !== file) {
                                file.response = response;
                                this.lastUploadedFile = file;
                                if (typeof this.options.successCallback === 'function') {
                                    this.options.successCallback(file, response);
                                } else {
                                    this.sandbox.emit(SUCCESS.call(this), file, response);
                                }
                                this.removeAllFiles();
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
                            this.sandbox.dom.removeClass(this.$dropzone, constants.droppedClass);
                        }.bind(that));
                    }
                };

            // merge the default plugin options with with passed ones
            this.sandbox.util.extend(true, {}, options, this.options.pluginOptions);
            this.sandbox.dropzone.initialize(this.$dropzone, options);
        },

        /**
         * Removes all files from the dropzone
         * but only if all dropped files got uploaded
         */
        removeAllFiles: function() {
            // if all files got uploaded
            if (this.dropzone.getUploadingFiles.call(this.dropzone).length === 0) {
                this.sandbox.util.delay(
                    function() {
                        this.sandbox.dom.fadeOut(
                            this.sandbox.dom.find('.' + constants.uploadItemClass, this.$dropzone),
                            this.options.fadeOutDuration,
                            function() {
                                if (this.sandbox.dom.find('.' + constants.uploadItemClass + ':animated', this.$dropzone).length === 0) {
                                    this.afterFadeOut();
                                }
                            }.bind(this)
                        );
                    }.bind(this),
                    this.options.fadeOutDelay
                );
            }
        },

        /**
         * Function gets called after all dropped files
         * have faded out
         */
        afterFadeOut: function() {
            this.sandbox.dom.removeClass(this.$dropzone, constants.droppedClass);
            this.sandbox.emit(FILES_ADDED.call(this), this.getResponseArray(this.dropzone.files));
        },

        /**
         * Returns an array with responses for a given array of files
         * @param files {Array} array of files with response properties
         * @returns {Array} array of responses
         */
        getResponseArray: function(files) {
            var arrReturn = [], i, length;
            for (i = -1, length = files.length; ++i < length;) {
                arrReturn.push(files[i].response);
            }
            return arrReturn;
        }
    };

});

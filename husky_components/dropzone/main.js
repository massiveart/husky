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
 * @params {Number} [options.maxFiles] defines the maximum of files in the dropzone
 * @params {Function} [options.successCallback] callback which gets called if a file got successfully uploaded. First parameter is the file, the second the response
 * @params {Function} [options.beforeSendingCallback] callback which gets called before a file gets uploaded. First parameter is the file.
 * @params {Function} [options.removeFileCallback] callback which gets called after a file got removed. First parameter is the file.
 * @params {Function} [options.afterDropCallback] callback which gets called after a file got dropped. Has to return a promise. If the promise gets resolved the file gets uploaded
 * @params {Object} [options.pluginOptions] Options to pass to the dropzone-plugin to completely override all options set by husky. Use with care.
 * @params {Boolean} [options.showOverlay] if true the dropzone will be displayed in an overlay. The overlay gets opened when a file gets dragged onto the document
 * @params {String|Object} [options.overlayContainer] The selector or the dom element which will be the direct parent of the overlay.
 * @params {String} [options.skin] skin class for the dropzone. currently available: 'overlay', 'small' or '' (default)
 * @params {Boolean} [options.keepFilesAfterSuccess] True to not slide the files away after uploading them successfully
 * @params {Boolean} [options.dropzoneEnabled] Should the dropzone be enabled initially
 * @params {Boolean} [options.cancelUploadOnOverlayClose] Cancel the upload process when the user clicks on the overlay background
 * @params {Number} [options.maxFilesize] Maximum file size in mb
 * @params {String} [options.fileTooBigKey] Translation key for a file which is to big
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            titleKey: 'sulu.upload.dropzone-title',
            descriptionKey: 'sulu.upload.dropzone-desc',
            descriptionIcon: 'cloud-upload',
            cancelLoadingIcon: 'coffee',
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
            afterDropCallback: null,
            pluginOptions: {},
            maxFiles: null,
            fadeOutDuration: 200, //ms
            fadeOutDelay: 1500, //ms
            showOverlay: true,
            overlayContainer: 'body',
            keepFilesAfterSuccess: false,
            skin: '',
            dropzoneEnabled: true,
            cancelUploadOnOverlayClose: false,
            maxFilesize: 256, // mb
            fileTooBigKey: 'husky.upload.error.file-to-big' // can handle {{filesize}}, {{maxFilesize}}, {{filename}}
        },

        constants = {
            overlayClass: 'dropzone-overlay',
            contianerClass: 'husky-dropzone',
            descriptionClass: 'description',
            loaderClass: 'dropzone-loader',
            uploadedItemContainerClass: 'upload-items',
            uploadItemClass: 'item',
            droppedClass: 'dropped'
        },

        /** templates for component */
        templates = {
            basic: [
                '<div class="dropzone-container">',
                '   <div class="' + constants.descriptionClass + '">',
                        '<div class="fa-<%= icon %> icon"></div>',
                        '<span class="title"><%= title %></span>',
                        '<span class="addition"><%= description %></span>',
                '   </div>',
                '   <div class="' + constants.uploadedItemContainerClass + '"></div>',
                '</div>'
            ].join(''),
            uploadItem: [
                '<div class="' + constants.uploadItemClass + '">' +
                    '<div class="loading-content">',
                        '<div class="fa-<%= cancelIcon %> icon" data-dz-remove></div>',
                        '<div class="file-size" data-dz-size></div>',
                        '<div class="progress">',
                            '<div class="bar" data-dz-uploadprogress></div>',
                        '</div>',
                    '</div>',
                    '<div class="success-content">',
                        '<div class="image">',
                            '<img data-dz-thumbnail />',
                        '</div>',
                        '<div class="fa-check tick"></div>',
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
         * raised when an error occurs because of a to big file
         * @event husky.dropzone.<instance-name>.error
         */
        ERROR_FILE_TO_BIG = function() {
            return createEventName.call(this, 'error.file-to-big', true);
        },

        /**
         * raised when an error occurs
         * @event husky.dropzone.<instance-name>.error
         */
        ERROR = function() {
            return createEventName.call(this, 'error', true);
        },

        /**
         * listens on and opens the data-source folder-overlay
         * @event husky.dropzone.<instance-name>.open-data-source
         */
        OPEN_DATA_SOURCE = function() {
            return createEventName.call(this, 'open-data-source');
        },

        /**
         * listens on and shows dropzone popup
         * @event husky.dropzone.<instance-name>.show-popup
         */
        SHOW_POPUP = function() {
            return createEventName.call(this, 'show-popup');
        },

        /**
         * raised after files got uploaded and faded out from the dropzone
         * @event husky.dropzone.<instance-name>.files-added
         * @param {Array} all newly added files
         */
        FILES_ADDED = function() {
            return createEventName.call(this, 'files-added');
        },

        /**
         * listens on and changes the url of the dropzone
         * @event husky.dropzone.<instance-name>.change-url
         * @param {String} the new url
         */
        CHANGE_URL = function() {
            return createEventName.call(this, 'change-url');
        },

        /**
         * listens on and enable the dropzone
         * @event husky.dropzone.<instance-name>.enable
         */
        UPLOAD_ENABLE = function() {
            return createEventName.call(this, 'enable');
        },

        /**
         * listens on and disable the dropzone
         * @event husky.dropzone.<instance-name>.disable
         */
        UPLOAD_DISABLE = function() {
            return createEventName.call(this, 'disable');
        },

        /**
         * listens on and adds an image to the dropzone by a given url
         * @event husky.dropzone.<instance-name>.add-file
         * @param {String} url The url to the file to add
         */
        ADD_IMAGE = function() {
            return createEventName.call(this, 'add-image');
        },

        /** returns normalized event names */
        createEventName = function(postFix, global) {
            return [
                eventNamespace,
                ((!global && this.options.instanceName) ? this.options.instanceName + '.' : ''),
                postFix
            ].join('');
        },

        createJQueryEventName = function(event) {
            return event + '.dropzone.' + (this.options.instanceName ? this.options.instanceName : '');
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
            this.dropzoneEnabled = this.options.dropzoneEnabled;
            this.$dropzone = null;
            this.$loader = null;
            this.lastUploadedFile = null;
            this.overlayOpened = false;
            this.url = this.options.url;
            this.filesDropped = 0;

            this.bindCustomEvents();
            this.render();
            this.bindDomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Handler which gets called when the component gets destroyed.
         */
        destroy: function() {
            this.sandbox.stop(this.$loader);
            $('body').off('.dropzone' + this.options.instanceName);
            this.dropzone.destroy();
            this.$dropzone.remove();
        },

        /**
         * Binds dom related events
         */
        bindDomEvents: function() {
            this.$dropzone.find('.' + constants.descriptionClass).on('click', function(event) {
                event.stopPropagation();
            }.bind(this));

            if (this.options.showOverlay) {
                this.sandbox.dom.on(this.sandbox.dom.$document, createJQueryEventName.call(this, 'dragenter'), function() {
                    this.openOverlay();
                }.bind(this));
                this.sandbox.dom.on(this.sandbox.dom.$document, createJQueryEventName.call(this, 'drop'), function(event) {
                    if (this.dropzoneEnabled) {
                        this.addFiles(event.originalEvent.dataTransfer.files);
                    }
                }.bind(this));
                this.$dropzone.on('click', function() {
                    if (!!this.options.cancelUploadOnOverlayClose) {
                        this.sandbox.dom.removeClass(this.$dropzone, constants.droppedClass);
                        this.dropzone.removeAllFiles();
                    }
                    this.closeOverlay();
                }.bind(this));
            }
            this.sandbox.dom.on(this.sandbox.dom.$document,
                createJQueryEventName.call(this, 'dragover') + ' ' + createJQueryEventName.call(this, 'drop'),
                function(event) {
                    this.sandbox.dom.preventDefault(event);
                }.bind(this));

            $('body').on('keydown.dropzone' + this.options.instanceName, function(event) {
                // close overlay when esc pressed
                if (event.keyCode === 27) {
                    this.closeOverlay();
                }
            }.bind(this));
        },

        /**
         * Binds custom-related events
         */
        bindCustomEvents: function() {
            // opens the data-source folder-overlay
            this.sandbox.on(OPEN_DATA_SOURCE.call(this), function() {
                this.$dropzone.find('.' + constants.descriptionClass).trigger('click');
            }.bind(this));

            // change the url
            this.sandbox.on(CHANGE_URL.call(this), function(url) {
                this.url = url;
            }.bind(this));

            this.sandbox.on(UPLOAD_DISABLE.call(this), function() {
                this.dropzoneEnabled = false;
                this.dropzone.disable();
            }.bind(this));

            this.sandbox.on(UPLOAD_ENABLE.call(this), function() {
                this.dropzoneEnabled = true;
                this.dropzone.enable();
            }.bind(this));

            if (this.options.showOverlay) {
                this.sandbox.on(SHOW_POPUP.call(this), function() {
                    this.openOverlay();
                }.bind(this));
            }

            this.sandbox.on(ADD_IMAGE.call(this), this.addImage.bind(this));
        },

        /**
         * Adds an image to the the dropzone by a given url.
         *
         * @param {String} url The url to first load the image from and than upload it via the dropzone
         * @param {string} mimeType The mime type of the loaded image
         * @param {string} fileName The name under which the file should be saved
         */
        addImage: function(url, mimeType, fileName) {
            this.sandbox.util.loadImageAsBlob(url, mimeType).then(function(imageBlob) {
                if (!!fileName) {
                    imageBlob.name = fileName;
                }
                this.dropzone.addFile(imageBlob, mimeType);
            }.bind(this));
        },

        /**
         * Opens the dropzone in an overlay
         */
        openOverlay: function() {
            // open the overlay only if it's not already opened
            if (this.overlayOpened === false && !!this.dropzoneEnabled) {
                this.$dropzone.show();
                this.overlayOpened = true;
            }
        },

        /**
         * Closes the dropzone overlay
         */
        closeOverlay: function() {
            if (this.overlayOpened === true) {
                this.$dropzone.hide();
                this.overlayOpened = false;
            }
        },

        /**
         * Renders the component
         */
        render: function() {
            this.$dropzone = this.sandbox.dom.createElement('<div class="' + constants.contianerClass + '"/>');
            this.sandbox.dom.html(this.$dropzone, this.sandbox.util.template(templates.basic)({
                description: this.sandbox.translate(this.options.descriptionKey),
                title: this.sandbox.translate(this.options.titleKey),
                icon: this.options.descriptionIcon,
                instanceName: this.options.instanceName
            }));
            this.$dropzone.addClass(this.options.skin);

            if (!!this.options.showOverlay) {
                this.$dropzone.addClass(constants.overlayClass);
                this.$dropzone.hide();
            }

            if (!this.options.showOverlay || !this.options.overlayContainer) {
                this.$el.append(this.$dropzone);
            } else {
                $(this.options.overlayContainer).append(this.$dropzone);
            }
            this.renderLoader();
            this.startDropzone();
        },

        /**
         * Renderes the loader which gets dipslayed when uploading images
         */
        renderLoader: function() {
            this.$loader = $('<div class="' + constants.loaderClass + '"/>');
            this.$dropzone.prepend(this.$loader);

            this.sandbox.start([
                {
                    name: 'loader@husky',
                    options: {
                        el: this.$loader,
                        size: '40px',
                        color: '#ffffff'
                    }
                }
            ]);
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
                    maxFiles: this.options.maxFiles,
                    maxFilesize: this.options.maxFilesize,
                    dictFileTooBig: this.sandbox.translate(this.options.fileTooBigKey),
                    headers: this.options.headers,
                    autoProcessQueue: !this.options.afterDropCallback,
                    previewTemplate: this.sandbox.util.template(templates.uploadItem)({
                        cancelIcon: this.options.cancelLoadingIcon
                    }),
                    clickable: this.$dropzone.find('.' + constants.descriptionClass).get(0),
                    previewsContainer: this.sandbox.dom.find('.' + constants.uploadedItemContainerClass, this.$dropzone)[0],
                    init: function() {
                        // store dropzone context
                        that.dropzone = this;

                        this.on('drop', function(event) {
                            this.sandbox.dom.stopPropagation(event);
                            this.filesDropped = event.dataTransfer.files.length;
                        }.bind(that));

                        // gets called for each added file (drop or via the upload window)
                        this.on('addedfile', function(file) {
                            that.sandbox.dom.addClass(that.$dropzone, constants.droppedClass);

                            // call the after-drop callback on the last file
                            if (typeof that.options.afterDropCallback === 'function') {
                                if (this.files.length === that.filesDropped || that.filesDropped === 0) { // if filesDropped is 0 the file(s) werent dropped but added via the popup window
                                    that.options.afterDropCallback(file).then(function() {
                                        that.sandbox.util.foreach(this.files, function(file) {
                                            that.sandbox.util.delay(this.processFile.bind(this, file), 0);
                                        }.bind(this));
                                    }.bind(this));
                                }
                            }

                            // prevent the the upload window to open on click on the preview item
                            that.sandbox.dom.on(file.previewElement, 'click', function(event) {
                                this.sandbox.dom.stopPropagation(event);
                            }.bind(that));
                        });

                        // gets called before each file is sent
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
                                this.removeAllFiles(this.options.keepFilesAfterSuccess);
                            }
                        }.bind(that));

                        // gets called if a file gets removed from the zone
                        this.on('removedfile', function(file) {
                            if (typeof this.options.removeFileCallback === 'function') {
                                this.options.removeFileCallback(file);
                            }
                        }.bind(that));

                        // gets called if all files are removed from the zone
                        this.on('reset', function() {
                            if (this.options.keepFilesAfterSuccess === false) {
                                this.sandbox.dom.removeClass(this.$dropzone, constants.droppedClass);
                            }
                        }.bind(that));

                        // enables the to change the url dynamically
                        this.on('processing', function() {
                            this.options.url = that.url;
                        });

                        // enables external error handling
                        this.on('error', function(file, message) {
                            this.removeFile(file);

                            if (file.size / 1024 > that.options.maxFilesize || (file.xhr && file.xhr.status === 413)) {
                                that.sandbox.emit(
                                    ERROR_FILE_TO_BIG.call(this),
                                    that.getMessage.call(that, that.options.fileTooBigKey, file),
                                    file
                                );
                            } else {
                                that.sandbox.emit(ERROR.call(this), message, file);
                            }
                        });
                    }
                };

            // merge the default plugin options with with passed ones
            options = this.sandbox.util.extend(true, {}, options, this.options.pluginOptions);
            this.sandbox.dropzone.initialize(this.$dropzone, options);
        },

        /**
         * Prepares message with placeholders.
         * @param {String} message
         * @param {{size, name}} file
         * @returns {String}
         */
        getMessage: function(message, file) {
            return this.sandbox.translate(message).replace('{{filesize}}', Math.round((file.size / 1048576) * 100) / 100)
                .replace('{{maxFilesize}}', this.options.maxFilesize)
                .replace('{{filename}}', this.sandbox.util.cropMiddle(file.name, 20));
        },

        /**
         * Adds an array of files to the dropzone to upload them
         * @param files {array} an array of files
         */
        addFiles: function(files) {
            this.sandbox.util.each(files, function(index, file) {
                this.dropzone.addFile(file);
            }.bind(this));
        },

        /**
         * Removes all files from the dropzone
         * but only if all dropped files got uploaded
         * @param keepDom {Boolean} true to keep the dom like it is
         */
        removeAllFiles: function(keepDom) {
            // if all files got uploaded
            if (this.dropzone.getUploadingFiles.call(this.dropzone).length === 0) {
                if (keepDom === true) {
                    this.afterFadeOut(true);
                } else {
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
            }
        },

        /**
         * Function gets called after all dropped files
         * have faded out
         * @param keepDom {Boolean} true to keep the dom like it is
         */
        afterFadeOut: function(keepDom) {
            this.closeOverlay();
            this.sandbox.emit(FILES_ADDED.call(this), this.getResponseArray(this.dropzone.files));
            this.filesDropped = 0;
            if (keepDom === true) {
                this.dropzone.files = [];
            } else {
                this.sandbox.dom.removeClass(this.$dropzone, constants.droppedClass);
                this.dropzone.removeAllFiles();
            }
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
        },

        remove: function() {
            this.dropzone.disable();
            this.dropzone.destroy();

            this.sandbox.dom.off(this.sandbox.dom.$document, createJQueryEventName.call(this, 'dragenter'));
            this.sandbox.dom.off(this.sandbox.dom.$document, createJQueryEventName.call(this, 'drop'));
            this.sandbox.dom.off(this.sandbox.dom.$document, createJQueryEventName.call(this, 'dragover'));
        }
    };

});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/label
 */

/**
 * @class Label
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.instanceName] name of the instance
 * @param {String} [options.type] type of the lable (WARNING, ERROR or SUCCESS)
 * @param {String|Object} [options.html] html-string or DOM-object to insert into the label
 * @param {String} [options.title] Title of the label (if html is null)
 * @param {String} [options.description] Description of the lable (if html is null)
 * @param {Boolean} [options.hasClose] if true close button gets appended to the label
 * @param {Boolean} [options.fadeOut] if true label fades out automatically
 * @param {Number} [options.fadeOutDelay] time in ms after which the fade-out starts
 * @param {Number} [options.fadeDuration] duration of the fade-out in ms
 * @param {Function} [options.closeCallback] callback to execute if the close-button is clicked
 * @param {String} [options.insertMethod] insert method to use for inserting the label (append or prepend)
 */
define(function() {

    'use strict';

    var defaults = {
        instanceName: 'undefined',
        type: 'WARNING',
        html: null,
        title: null,
        description: null,
        hasClose: true,
        fadeOut: true,
        fadeOutDelay: 0,
        fadeDuration: 500,
        closeCallback: null,
        insertMethod: 'append'
    },

    insertMethods = {
        APPEND: 'append',
        PREPEND: 'prepend'
    },

    constants = {
        textClass: 'text',
        closeClass: 'close',
        closeIconClass: 'fa-times-circle'
    },

    /**
     * default values for types
     */
    typesDefaults = {
        ERROR: {
            title: 'Error',
            labelClass: 'husky-label-error',
            fadeOutDelay: 10000
        },
        WARNING: {
            fadeOutDelay: 5000,
            title: 'Warning',
            labelClass: 'husky-label-warning'
        },
        SUCCESS: {
            hasClose: false,
            fadeOutDelay: 2000,
            title: 'Success',
            labelClass: 'husky-label-success'
        }
    },

    /**
     * generates template template
     */
    template = {
        basic: function(options) {
            return [
                '<div class="' + constants.textClass + '">',
                '<strong>' + options.title + '</strong>',
                '<span>' + options.description + '</span>',
                '</div>'
            ].join('');
        },
        closeButton: function() {
            return [
                '<div class="' + constants.closeClass + '">',
                '<span class="' + constants.closeIconClass + '"></span>',
                '</div>'
            ].join('');
        }
    },

    eventNamespace = 'husky.label.',

    /**
     * raised after initialization process
     * @event husky.label.[INSTANCE_NAME.]initialized
     */
    INITIALIZED = function() {
        return createEventName.call(this, 'initialized');
    },

    /** returns normalized event names */
    createEventName = function(postFix) {
        return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
    };

    return {

        /**
         * Initialize the component
         */
        initialize: function() {

            //merge defaults with defaults of type and options
            this.options = this.sandbox.util.extend(true, {}, defaults, typesDefaults[this.options.type], this.options);

            this.label = {
                $el: null,
                $content: null,
                $close: null
            };

            this.render();
            this.bindEvents();
            this.startEffects();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Binds the events for the component
         */
        bindEvents: function() {
            this.sandbox.dom.on(this.label.$close, 'click', function() {
                this.fadeOut();
                if (typeof this.options.closeCallback === 'function') {
                    this.options.closeCallback();
                }
            }.bind(this));
        },

        /**
         * Starts the fade-out effect
         */
        startEffects: function() {
            if (this.options.fadeOut === true) {
                _.delay(function() {
                    this.fadeOut();
                }.bind(this), this.options.fadeOutDelay);
            }
        },

        /**
         * Fades the label out
         */
        fadeOut: function() {
            this.sandbox.dom.fadeOut(this.label.$el, this.options.fadeDuration, function() {
                this.sandbox.dom.css(this.label.$el, {
                    'visibility': 'hidden',
                    'display': 'block'
                });
                this.sandbox.dom.slideUp(this.label.$el, 300, this.close.bind(this));
            }.bind(this));
        },

        /**
         * Renders the component
         */
        render: function() {
            this.renderElement();
            this.renderContent();
            this.renderClose();

            this.insertLabel();
        },

        /**
         * Renders the main element
         */
        renderElement: function() {
            this.label.$el = this.sandbox.dom.createElement('<div class="'+ this.options.labelClass +'"/>')
        },

        /**
         * Renders the content of the component
         */
        renderContent: function() {
            if (this.options.html !== null) {
                this.label.$content = this.sandbox.dom.createElement(this.options.html);
            } else {
                this.label.$content = this.sandbox.dom.createElement(template.basic(this.options));
            }

            //append content to main element
            this.sandbox.dom.append(this.label.$el, this.label.$content);
        },

        /**
         * Renders the close button
         */
        renderClose: function() {
            if (this.options.hasClose === true) {
                this.label.$close = this.sandbox.dom.createElement(template.closeButton());

                //append close to main element
                this.sandbox.dom.append(this.label.$el, this.label.$close);
            }
        },

        /**
         * Inserts the label into the DOM
         */
        insertLabel: function() {
            if (this.options.insertMethod === insertMethods.APPEND) {
                this.sandbox.dom.append(this.$el, this.label.$el);
            } else if (this.options.insertMethod === insertMethods.PREPEND) {
                this.sandbox.dom.prepend(this.$el, this.label.$el);
            } else {
                this.sandbox.logger.log('No insert method found for', this.options.insertMethod);
            }
        },

        /**
         * Handles closing the component
         */
        close: function() {
            this.sandbox.stop();
        }
    };

});

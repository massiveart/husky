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
 * @param {Number} [options.counter] Counter to display in the label
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
        counter: 1,
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
        counterClass: 'counter',
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
            fadeOutDelay: 2000,
            title: 'Success',
            labelClass: 'husky-label-success'
        }
    },

    /**
     * generates template template
     */
    templates = {
        basic: ['<div class="' + constants.textClass + '">',
                '   <strong><%= title %></strong>',
                '   <span><%= description %></span>',
                '   <div class="' + constants.counterClass + '"><span><%= counter %></span></div>',
                '</div>'].join(''),
        closeButton: ['<div class="' + constants.closeClass + '">',
                      '<span class="' + constants.closeIconClass + '"></span>',
                      '</div>'].join('')
    },

    eventNamespace = 'husky.label.',

    /**
     * raised after initialization process
     * @event husky.label.[INSTANCE_NAME].initialized
     */
    INITIALIZED = function() {
        return createEventName.call(this, 'initialized');
    },

    /**
     * raised before destroy process
     * @event husky.label.[INSTANCE_NAME].destroyed
     */
    DESTROYED = function() {
        return createEventName.call(this, 'destroyed');
    },

    /**
     * listens on and refreshes the fade out delay
     * @event husky.label.[INSTANCE_NAME].refresh
     * @param {String|Number} counter The counter number to display
     */
    REFRESH = function() {
        return createEventName.call(this, 'refresh');
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
            this.fadeOutTimer = null;
            this.label = {
                $el: null,
                $content: null,
                $close: null
            };

            this.bindCustomEvents();
            this.render();
            this.bindDomEvents();
            this.startEffects();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Destroy the component (aura hook)
         */
        destroy: function() {
            this.sandbox.emit(DESTROYED.call(this));
        },

        /**
         * Binds the events for the component
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(this.label.$close, 'click', function() {
                this.fadeOut();
                if (typeof this.options.closeCallback === 'function') {
                    this.options.closeCallback();
                }
            }.bind(this));
        },

        /**
         * Bind custom aura events
         */
        bindCustomEvents: function() {
            this.sandbox.on(REFRESH.call(this), this.refresh.bind(this));
        },

        /**
         * Refreshes the fade out increases and rerenders the counter
         */
        refresh: function() {
            this.options.counter += 1;
            this.abortEffects();
            this.label.$el.find('.' + constants.counterClass + ' span').html(this.options.counter);
            this.updateCounterVisibility();
            this.startEffects();
        },

        /**
         * Starts the fade-out effect
         */
        startEffects: function() {
            if (this.options.fadeOut === true) {
                this.fadeOutTimer = _.delay(function() {
                    this.fadeOut();
                }.bind(this), this.options.fadeOutDelay);
            }
        },

        /**
         * Cancles the fade-out effect
         */
        abortEffects: function() {
            this.label.$el.stop();
            this.label.$el.removeAttr('style');
            clearTimeout(this.fadeOutTimer);
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

            this.updateCounterVisibility();
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
                this.label.$content = this.sandbox.dom.createElement(this.sandbox.util.template(templates.basic, {
                    title: this.options.title,
                    description: this.options.description,
                    counter: this.options.counter
                }));
            }

            //append content to main element
            this.sandbox.dom.append(this.label.$el, this.label.$content);
        },

        /**
         * Hides or shows the counter-object
         */
        updateCounterVisibility: function() {
            if (this.options.counter > 1) {
                this.sandbox.dom.show(this.label.$el.find('.' + constants.counterClass));
            } else {
                this.sandbox.dom.hide(this.label.$el.find('.' + constants.counterClass));
            }
        },

        /**
         * Renders the close button
         */
        renderClose: function() {
            if (this.options.hasClose === true) {
                this.label.$close = this.sandbox.dom.createElement(templates.closeButton);

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

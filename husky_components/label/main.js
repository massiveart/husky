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
 * @param {String} [options.effectType] either 'slide' or 'fade'
 * @param {Boolean} [options.autoVanish] if true label vanishes automatically
 * @param {Number} [options.vanishDelay] time in ms after which the vanish effect starts
 * @param {Number} [options.vanishDuration] duration of the vanish effect in ms
 * @param {Number} [options.showDuration] duration of the show effect in ms
 * @param {Function} [options.closeCallback] callback to execute if the close-button is clicked
 * @param {String} [options.insertMethod] insert method to use for inserting the label (append or prepend)
 * @param {String} [options.additionalLabelClasses] Additional classes which will be appended to the label
 * @param {Array} [buttons] An array of buttons to add to the label
 * @param {String|Number} [buttons[].id] The id of the button
 * @param {String} [buttons[].title] The title to show in the button
 * @param {String} [buttons[].skin] The skin of the button e.g 'critical'
 * @param {Function} [buttons[].onClick] The callback to execute on click
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
        effectType: 'slide',
        autoVanish: true,
        vanishDelay: 0,
        vanishDuration: 250,
        showDuration: 250,
        closeCallback: null,
        insertMethod: 'append',
        additionalLabelClasses: 'big',
        buttons: []
    },

    insertMethods = {
        APPEND: 'append',
        PREPEND: 'prepend'
    },

    constants = {
        textClass: 'text',
        closeClass: 'close',
        counterClass: 'counter',
        closeIconClass: 'fa-times-circle',
        buttonsClass: 'buttons',
        buttonClass: 'button',
        loaderColor: '#666',
        isLoading: 'is-loading',
        loaderClass: 'loader'
    },

    /**
     * default values for types
     */
    typesDefaults = {
        ERROR: {
            title: 'Error',
            labelClass: 'husky-label-error',
            vanishDelay: 10000
        },
        WARNING: {
            vanishDelay: 5000,
            title: 'Warning',
            labelClass: 'husky-label-warning'
        },
        SUCCESS: {
            vanishDelay: 5000,
            title: 'Success',
            labelClass: 'husky-label-success'
        },
        SUCCESS_ICON: {
            labelClass: 'husky-label-success-icon',
            effectType: 'fade',
            hasClose: false,
            vanishDelay: 2000,
            showDuration: 100
        }
    },

    /**
     * generates template template
     */
    templates = {
        basic: [
                '<div class="' + constants.closeClass + '">',
                '   <% if (!!hasClose) { %><span class="' + constants.closeIconClass + '"></span><% } %>',
                '</div>',
                '<div class="' + constants.textClass + '">',
                '   <% if (!!title) { %><strong><%= title %></strong><% } %>',
                '   <span><%= description %></span>',
                '   <div class="' + constants.counterClass + '"><span><%= counter %></span></div>',
                '</div>'].join(''),
        buttons: '<div class="' + constants.buttonsClass + '"></div>',
        button: '<div class="' + constants.buttonClass + '"><%= title %></div>'
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
     * listens on and refreshes the vanish-out delay
     * @event husky.label.[INSTANCE_NAME].refresh
     * @param {String|Number} counter The counter number to display
     */
    REFRESH = function() {
        return createEventName.call(this, 'refresh');
    },

    /**
     * listens on and vanishes the label
     * @event husky.label.[INSTANCE_NAME].vanish
     */
    VANISH = function() {
        return createEventName.call(this, 'vanish');
    },

    /**
     * listens on and sets the label into loading state
     * @event husky.label.[INSTANCE_NAME].loading
     */
    LOADING = function() {
        return createEventName.call(this, 'loading');
    },

    /**
     * listens on and resets the state of the label (not loading)
     * @event husky.label.[INSTANCE_NAME].reset
     */
    RESET = function() {
        return createEventName.call(this, 'reset');
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
            this.vanishTimer = null;
            this.label = {
                $el: null,
                $content: null,
                $close: null,
                $buttons: null
            };
            this.buttons = {};

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
                this.vanish();
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
            this.sandbox.on(LOADING.call(this), this.setLoadingState.bind(this));
            this.sandbox.on(RESET.call(this), this.resetState.bind(this));
            this.sandbox.on(VANISH.call(this), this.vanish.bind(this));
        },

        /**
         * Refreshes the vanish and rerenders the counter
         */
        refresh: function() {
            this.options.counter += 1;
            this.abortEffects();
            this.label.$el.find('.' + constants.counterClass + ' span').html(this.options.counter);
            this.updateCounterVisibility();
            this.startEffects();
        },

        /**
         * Sets the label into loading state.
         */
        setLoadingState: function() {
            var $loader = $('<div/>');
            $loader.addClass(constants.loaderClass);
            this.label.$el.append($loader);
            this.label.$el.addClass(constants.isLoading);

            this.sandbox.start([{
                name: 'loader@husky',
                options: {
                    el: $loader,
                    size: '20px',
                    color: constants.loaderColor
                }
            }]);
        },

        /**
         * Resets the state of the label (not loading)
         */
        resetState: function() {
            this.sandbox.stop(this.label.$el.find('*'));
            this.label.$el.removeClass(constants.isLoading);
        },

        /**
         * Starts the vanish effect
         */
        startEffects: function() {
            if (this.options.autoVanish === true) {
                this.vanishTimer = _.delay(function() {
                    this.vanish();
                }.bind(this), this.options.vanishDelay);
            }
        },

        /**
         * Cancels the vanish effect
         */
        abortEffects: function() {
            this.label.$el.stop();
            this.label.$el.removeAttr('style');
            clearTimeout(this.vanishTimer);
        },

        /**
         * Makes the label disapear
         */
        vanish: function() {
            if (this.options.effectType === 'slide') {
                this.label.$el.slideUp({
                    duration: this.options.vanishDuration,
                    done: this.close.bind(this)
                });
            } else if (this.options.effectType === 'fade') {
                this.label.$el.fadeOut({
                    duration: this.options.vanishDuration,
                    done: this.close.bind(this)
                });
            }
        },

        /**
         * Makes the label appear
         */
        show: function() {
            if (this.options.effectType === 'slide') {
                this.label.$el.slideDown({
                    duration: this.options.showDuration
                });
            } else if (this.options.effectType === 'fade') {
                this.label.$el.fadeIn({
                    duration: this.options.showDuration
                });
            }
        },

        /**
         * Renders the component
         */
        render: function() {
            this.renderElement();
            this.renderContent();
            this.renderButtons();

            this.updateCounterVisibility();
            this.insertLabel();
            this.show();
        },

        /**
         * Renders the main element
         */
        renderElement: function() {
            this.label.$el = this.sandbox.dom.createElement(
                '<div class="' + this.options.labelClass
                    + (!!this.options.additionalLabelClasses ? ' ' + this.options.additionalLabelClasses : '')
                    + '"/>'
            );
            this.label.$el.hide();
        },

        /**
         * Renders the content of the component
         */
        renderContent: function() {
            if (this.options.html !== null) {
                this.label.$content = this.sandbox.dom.createElement(this.options.html);
            } else {
                this.label.$content = this.sandbox.dom.createElement(this.sandbox.util.template(templates.basic, {
                    title: this.sandbox.translate(this.options.title),
                    description: this.sandbox.translate(this.options.description),
                    counter: this.options.counter,
                    hasClose: this.options.hasClose
                }));
            }

            this.label.$close = this.label.$content.find('.' + constants.closeIconClass);

            //append content to main element
            this.sandbox.dom.append(this.label.$el, this.label.$content);
        },

        /**
         * Renders the buttons of the label
         */
        renderButtons: function() {
            if (this.options.buttons.length > 0) {
                this.label.$buttons = $(templates.buttons);
                this.label.$el.append(this.label.$buttons);
                this.sandbox.util.foreach(this.options.buttons, this.renderButton.bind(this));
            }
        },

        /**
         * Renders a single button.
         * Precondition: label.$buttons has to be rendered.
         *
         * @param {Object} button The button data from which the element should be rendered
         */
        renderButton: function(button) {
            this.buttons[button.id] = button;

            this.buttons[button.id].$el = $(_.template(templates.button, {
                title: button.title
            }));
            if (!!button.skin) {
                this.buttons[button.id].$el.addClass(button.skin);
            }
            this.label.$buttons.append(this.buttons[button.id].$el);
            if (!!button.onClick) {
                this.buttons[button.id].$el.on('click', function() {
                    this.buttons[button.id].onClick();
                }.bind(this));
            }
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

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/smart-content
 */

/**
 * @class Overlay
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.trigger] List of events on which the overlay should be opened
 * @params {String} [options.container] slector or DOM object in which the overlay gets inserted
 * @params {String} [options.title] the title of the overlay
 * @params {String} [options.closeIcon] icon class for the close button
 * @params {String} [options.okIcon] icon class for the ok button
 * @params {Function} [options.closeCallback] callback which gets executed after the overlay gets closed
 * @params {Function} [options.okCallback] callback which gets executed after the overlay gets submited
 * @params {String|Object} [options.data] HTML or DOM-object which acts as the overlay-content
 * @params {String} [options.instanceName] instance name of the component
 * @params {Boolean} [options.draggable] if true overlay is draggable
 */
define([], function() {

    'use strict';

    var defaults = {
        trigger: 'click',
        container: 'body',
        title: '',
        closeIcon: 'remove2',
        okIcon: 'half-ok save-button btn btn-highlight btn-large',
        closeCallback: null,
        okCallback: null,
        data: '',
        instanceName: 'undefined',
        draggable: true
    },

    constants = {
        closeSelector: '.close-button',
        okSelector: '.ok-button',
        contentSelector: '.overlay-content',
        headerSelector: '.overlay-header',
        draggableClass: 'draggable'
    },

    /** templates for component */
    templates = {
        overlaySkeleton: [
            '<div class="husky-overlay-container smart-content-overlay">',
                '<div class="overlay-header">',
                '<span class="title"><%= title %></span>',
                '<a class="icon-<%= closeIcon %> close-button" href="#"></a>',
                '</div>',
                '<div class="overlay-content"></div>',
                '<div class="overlay-footer">',
                    '<a class="icon-<%= okIcon %> ok-button" href="#"></a>',
                '</div>',
            '</div>'
        ].join('')
    },

    /**
     * namespace for events
     * @type {string}
     */
     eventNamespace = 'husky.overlay.',

    /**
     * raised after initialization process
     * @event husky.overlay.<instance-name>.initialize
     */
    INITIALIZED = function() {
        return createEventName.call(this, 'initialized');
    },

    /**
     * raised after overlay is opened
     * @event husky.overlay.<instance-name>.opened
     */
     OPENED = function() {
        return createEventName.call(this, 'opened');
     },

    /**
     * raised after overlay is closed
     * @event husky.overlay.<instance-name>.opened
     */
     CLOSED = function() {
        return createEventName.call(this, 'closed');
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

            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.setVariables();
            this.bindTriggerEvent();
        },

        /**
         * Binds the event for the overlay trigger
         */
        bindTriggerEvent: function() {
            this.sandbox.dom.on(this.$el, this.options.trigger, function(event) {
                this.sandbox.dom.preventDefault(event);
                this.triggerHandler();
            }.bind(this));
        },

        /**
         * Sets the default properties
         */
        setVariables: function() {
            this.overlay = {
                opened: false,
                collapsed: false,
                normalHeight: null,
                $el: null,
                $close: null,
                $ok: null,
                $header: null,
                $content: null
            };
            this.dragged = false;
        },

        /**
         * Event handler for the overlay-trigger event
         */
        triggerHandler: function() {
            this.openOverlay();
        },

        /**
         * Opens the overlay. If Overlay doesn't exist it first initializes it
         */
        openOverlay: function() {
            //only open if closed
            if (this.overlay.opened === false) {
                //if overlay-element doesn't exist initialize it
                if (this.overlay.$el === null) {
                    this.initSkeleton();
                    this.setContent();
                    this.bindOverlayEvents();
                    this.sandbox.emit(INITIALIZED.call(this));
                }

                this.insertOverlay();
                this.overlay.opened = true;
            }
        },

        /**
         * Removes the overlay-element from the DOM
         */
        closeOverlay: function() {
            this.sandbox.dom.detach(this.overlay.$el);
            this.overlay.opened = false;
            this.dragged = false;
            this.collapsed = false;

            this.sandbox.dom.css(this.overlay.$content, {'height': 'auto'});

            this.sandbox.emit(CLOSED.call(this));
        },

        /**
         * Inserts the overlay-element into the DOM
         */
        insertOverlay: function() {
            this.sandbox.dom.append(this.sandbox.dom.$(this.options.container), this.overlay.$el);

            //ensures that the overlay box fits the window form the beginning
            this.overlay.normalHeight = this.sandbox.dom.height(this.overlay.$el);
            this.resizeHandler();

            this.setCoordinates();

            this.sandbox.emit(OPENED.call(this));
        },

        /**
         * Creates the overlay-element with a skeleton-template
         */
        initSkeleton: function() {
            this.overlay.$el = this.sandbox.dom.createElement(
                _.template(templates.overlaySkeleton)({
                    title: this.options.title,
                    okIcon: this.options.okIcon,
                    closeIcon: this.options.closeIcon
                }));
            this.overlay.$close = this.sandbox.dom.find(constants.closeSelector, this.overlay.$el);
            this.overlay.$ok = this.sandbox.dom.find(constants.okSelector, this.overlay.$el);
            this.overlay.$content = this.sandbox.dom.find(constants.contentSelector, this.overlay.$el);
            this.overlay.$header = this.sandbox.dom.find(constants.headerSelector, this.overlay.$el);

            if (this.options.draggable === true) {
                this.sandbox.dom.addClass(this.overlay.$el, constants.draggableClass);
            }
        },

        setContent: function() {
            this.sandbox.dom.html(this.overlay.$content, this.options.data);
        },

        /**
         * Binds overlay events
         */
        bindOverlayEvents: function() {
            //set current overlay in front of all other overlays
            this.sandbox.dom.on(this.overlay.$el, 'mousedown', function() {
                this.sandbox.dom.css(this.sandbox.dom.$('.husky-overlay-container'), {'z-index': 'auto'});
                this.sandbox.dom.css(this.overlay.$el, {'z-index': 10000});
            }.bind(this));

            this.sandbox.dom.on(this.overlay.$close, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.closeOverlay();
                this.executeCallback(this.options.closeCallback);
            }.bind(this));

            this.sandbox.dom.on(this.overlay.$ok, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.executeCallback(this.options.okCallback);
                this.closeOverlay();
            }.bind(this));

            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', function() {
                if (this.dragged === false && this.overlay.opened === true) {
                    this.resizeHandler();
                }
            }.bind(this));

            if (this.options.draggable === true) {
                this.sandbox.dom.on(this.overlay.$header, 'mousedown', function(e) {
                    var origin = {
                        y: e.clientY - (this.sandbox.dom.offset(this.overlay.$header).top - this.sandbox.dom.getScrollTop(this.sandbox.dom.$window)),
                        x: e.clientX - (this.sandbox.dom.offset(this.overlay.$header).left - this.sandbox.dom.scrollLeft(this.sandbox.dom.$window))
                    };

                   //bind the mousemove event if mouse is down on header
                   this.sandbox.dom.on(this.overlay.$header, 'mousemove', function(event) {
                        this.draggableHandler(event, origin);
                   }.bind(this));
                }.bind(this));

                this.sandbox.dom.on(this.overlay.$header, 'mouseup', function() {
                    this.sandbox.dom.off(this.overlay.$header, 'mousemove');
                }.bind(this));
            }
        },

        /**
         * Handles the mousemove event for making the overlay draggable
         * @param event {object} the event-object of the mousemove event
         * @param origin {object} object with x and y properties which hold the starting position of the cursor
         */
        draggableHandler: function(event, origin) {
            this.updateCoordinates((event.clientY - origin.y), (event.clientX - origin.x));
            this.dragged = true;

            if (this.overlay.collapsed === true) {
                this.sandbox.dom.css(this.overlay.$content, {'height': 'auto'});
                this.overlay.collapsed = false;
            }
        },

        /**
         * Handles the shrinking and enlarging of the overlay
         * if the window gets smaller
         */
        resizeHandler: function() {
            this.setCoordinates();

            //window is getting smaller - make overlay smaller
            if (this.sandbox.dom.height(this.sandbox.dom.$window) < this.sandbox.dom.outerHeight(this.overlay.$el)) {
                this.sandbox.dom.height(this.overlay.$content,
                    (this.sandbox.dom.height(this.sandbox.dom.$window) - this.sandbox.dom.height(this.overlay.$el) + this.sandbox.dom.height(this.overlay.$content))
                );
                this.sandbox.dom.css(this.overlay.$content, {'overflow': 'scroll'});
                this.overlay.collapsed = true;

                //window is getting bigger - make the overlay bigger
            } else if (this.sandbox.dom.height(this.sandbox.dom.$window) > this.sandbox.dom.outerHeight(this.overlay.$el) &&
                this.overlay.collapsed === true) {

                //if overlay reached its beginning height - stop
                if (this.sandbox.dom.height(this.overlay.$el) >= this.overlay.normalHeight) {
                    this.sandbox.dom.height(this.overlay.$content, 'auto');
                    this.sandbox.dom.css(this.overlay.$content, {'overflow': 'visible'});
                    this.overlay.collapsed = false;

                    // else enlarge further
                } else {
                    this.sandbox.dom.height(this.overlay.$content,
                        (this.sandbox.dom.height(this.sandbox.dom.$window) - this.sandbox.dom.height(this.overlay.$el) + this.sandbox.dom.height(this.overlay.$content))
                    );
                }
            }
        },

        /**
         * Positions the overlay in the middle of the screen
         */
        setCoordinates: function() {
            this.updateCoordinates((this.sandbox.dom.$window.height() - this.overlay.$el.outerHeight())/2,
                                   (this.sandbox.dom.$window.width() - this.overlay.$el.outerWidth())/2);
        },

        /**
         * Updates the coordinates of the overlay
         * @param top {Integer} new top of overlay
         * @param left {Integer} new left of overlay
         */
        updateCoordinates: function(top, left) {
            this.sandbox.dom.css(this.overlay.$el, {'top': top + 'px'});
            this.sandbox.dom.css(this.overlay.$el, {'left': left + 'px'});
        },

        /**
         * Executes a passed callback
         * @param callback {Function} callback to execute
         */
        executeCallback: function(callback) {
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

});

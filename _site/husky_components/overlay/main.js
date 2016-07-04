/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/overlay
 */

/**
 * @class Overlay
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {String} [options.trigger] List of events on which the overlay should be opened
 * @params {String} [options.triggerEl] Element that triggers the overlay
 * @params {String} [options.instanceName] instance name of the component
 * @params {Boolean} [options.draggable] if true overlay is draggable
 * @params {Boolean} [options.openOnStart] if true overlay is opened after initialization
 * @params {Boolean} [options.removeOnClose] if overlay component gets removed on close
 * @params {Boolean} [options.backdrop] if true backdrop will be shown
 * @params {String} [options.skin] set an overlay skin to manipulate overlay's appearance. Possible skins: '', 'wide' or 'medium'
 * @params {Boolean} [options.backdropClose] if true overlay closes with click on backdrop
 * @params {String} [options.backdropColor] Color of the backdrop
 * @params {Number} [options.backdropAlpha] Alpha-value of the backdrop
 * @params {String} [options.type] The type of the overlay ('normal', 'error' or 'warning')
 * @params {Array} [options.buttonsDefaultAlign] the align of the buttons in the footer ('center', 'left' or 'right'). Can be overriden by each button individually
 * @params {Array} [options.supportKeyInput] if true pressing enter will submit the overlay and esc will close it
 * @params {Array} [options.propagateEvents] If false click-events will be stoped at the components-element
 * @params {Array} [options.verticalSpacing] defines the minimum spacing in pixel to the bottom and the top
 * @params {Null|Number} [options.left] to fix the left position of the overlay. (px)
 * @params {Null|Number} [options.top] to fix the top position of the overlay. (px)
 *
 * @params {Array} [options.slides] array of slide objects, will be rendered in a row and can slided with events
 * @params {String} [options.slides[].title] the title of the overlay
 * @params {String} [options.slides[].subTitle] the sub-title of the overlay
 * @params {String|Boolean} [options.slides[].closeIcon] icon class for the close button. If false no close icon will be displayed
 * @params {Function} [options.slides[].closeCallback] @deprecated Use 'cancelCallback' instead
 * @params {Function} [options.slides[].cancelCallback] callback which gets executed after the overlay gets canceled
 * @params {Function} [options.slides[].okCallback] callback which gets executed after the overlay gets submited
 * @params {String|Object} [options.slides[].data] HTML or DOM-object which acts as the overlay-content
 * @params {String} [options.slides[].message] String to render as content. Used by warnings and errors
 * @params {Boolean} [options.slides[].okInactive] If true all ok-buttons start deactivated
 * @params {String} [options.slides[].okDefaultText] The default text for ok buttons
 * @params {String} [options.slides[].cancelDefaultText] The default text for cancel buttons
 * @params {String} [options.slides[].type] The type of the overlay ('normal', 'error' or 'warning')
 *
 * @params {Object} [options.slides[].languageChanger] If set language-changer will be displayed in the header
 * @params {Array} [options.slides[].languageChanger.locales] array of locale strings for the dropdown
 * @params {String} [options.slides[].languageChanger.preSelected] locale which is selected at the beginning
 *
 * @params {Array} [options.slides[].tabs] array of tabs-data to use instead of options.data and options.message
 * @params {String} [options.slides[].tabs.title] the title of the tab
 * @params {String|Object} [options.slides[].tabs.data] HTML or DOM-Object to display when tab is active
 *
 * @params {Array} [options.slides[].buttons] an array of buttons to add to the footer
 * @params {String} [options.slides[].buttons.type] type of the button ('ok', 'cancel')
 * @params {String} [options.slides[].buttons.icon] icon of the button
 * @params {String} [options.slides[].buttons.text] text of the button. If text and icon are not set the defaultText-options come into place
 * @params {Boolean} [options.slides[].buttons.inactive] If true button starts inactive
 */
define([], function() {

    'use strict';

    var defaults = {
            trigger: 'click',
            triggerEl: null,
            verticalSpacing: 100, //px
            instanceName: 'undefined',
            draggable: true,
            openOnStart: false,
            removeOnClose: true,
            backdrop: true,
            backdropClose: true,
            backdropColor: '#000000',
            skin: '',
            supportKeyInput: true,
            propagateEvents: true,
            type: 'normal',
            backdropAlpha: 0.5,
            cssClass: '',
            slides: [],
            top: null,
            left: null
        },

        slideDefaults = {
            index: -1,
            title: '',
            subTitle: null,
            closeIcon: 'times',
            message: '',
            closeCallback: null,
            cancelCallback: null,
            okCallback: null,
            type: 'normal',
            data: '',
            tabs: null,
            okInactive: false,
            buttonsDefaultAlign: 'center',
            cancelDefaultText: 'Cancel',
            okDefaultText: 'Ok',
            languageChanger: null,
            cssClass: '',
            smallHeader: false
        },

        internalSlideDefaults = {
            $close: null,
            $el: null,
            $footer: null,
            $header: null,
            $content: null,
            $languageChanger: null,
            $tabs: null, //tabs component container
            tabs: null //contains tabs related data
        },

        constants = {
            closeSelector: '.close-button',
            footerSelector: '.overlay-footer',
            contentSelector: '.overlay-content',
            headerSelector: '.overlay-header',
            slidesSelector: '.slides',
            draggableClass: 'draggable',
            backdropClass: 'husky-overlay-backdrop',
            overlayOkSelector: '.overlay-ok',
            overlayCancelSelector: '.overlay-cancel',
            tabsClass: 'tabs',
            languageChangerClass: 'language-changer',
            smallHeaderClass: 'small-header'
        },

        types = {
            normal: {
                buttons: [
                    {
                        type: 'ok',
                        icon: 'check',
                        classes: 'tick',
                        inactive: false
                    }
                ]
            },
            warning: {
                cssClass: 'warning',
                backdropClose: false,
                removeOnClose: true,
                openOnStart: true,
                instanceName: 'warning',
                closeIcon: false,
                buttons: [
                    {
                        type: 'ok',
                        inactive: false,
                        align: 'right'
                    },
                    {
                        type: 'cancel',
                        inactive: false,
                        align: 'left'
                    }
                ]
            },
            error: {
                cssClass: 'error',
                backdropClose: false,
                cancelDefaultText: 'Ok',
                removeOnClose: true,
                openOnStart: true,
                instanceName: 'error',
                closeIcon: false,
                buttons: [
                    {
                        type: 'cancel',
                        inactive: false
                    }
                ]
            }
        },

        buttonTypes = {
            OK: 'ok',
            CANCEL: 'cancel'
        },

        /** templates for component */
        templates = {
            overlaySkeleton: [
                '<div class="husky-overlay-container <%= overflowClass %> <%= skin %> <%= cssClass %> smart-content-overlay">',
                '   <div class="slides"></div>',
                '</div>'
            ].join(''),
            slideSkeleton: [
                '<div class="slide slide-<%= index %> <%= cssClass %>">',
                '   <div class="overlay-header<% if(subTitle) { %> with-sub-title<% } %>">',
                '       <span class="title"><%= title %></span>',
                '       <% if(subTitle) { %><div class="sub-title"><%= subTitle %></div><% } %>',
                '       <% if (!!closeIcon) { %><a class="fa-<%= closeIcon %> close-button" href="#"></a><% } %>',
                '   </div>',
                '   <div class="overlay-content"></div>',
                '   <div class="overlay-footer">',
                '   </div>',
                '</div>'
            ].join(''),
            okButton: [
                '<div class="btn action overlay-ok<%= classes %>">',
                '<% if (!!icon) { %>',
                '<span class="fa-<%= icon %>"></span>',
                '<% } %>',
                '<span class="text"><%= text %></span>',
                '</div>'
            ].join(''),
            cancelButton: [
                '<div class="btn gray black-text overlay-cancel<%= classes %>">',
                '   <% if (!!icon) { %>',
                '   <span class="fa-<%= icon %>"></span>',
                '   <% } %>',
                '   <span class="text"><%= text %></span>',
                '</div>'
            ].join(''),
            backdrop: [
                '<div class="husky-overlay-backdrop"></div>'
            ].join(''),
            message: [
                '<div class="message"><%= message %></div>'
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
         * @event husky.overlay.<instance-name>.closed
         */
        CLOSED = function() {
            return createEventName.call(this, 'closed');
        },

        /**
         * raised after overlay is closing
         * @event husky.overlay.<instance-name>.closing
         */
        CLOSING = function() {
            return createEventName.call(this, 'closing');
        },

        /**
         * used to activate all ok buttons
         * @event husky.overlay.<instance-name>.okbutton.activate
         */
        OKBUTTON_ACTIVATE = function() {
            return createEventName.call(this, 'okbutton.activate');
        },

        /**
         * used to deactivate all ok buttons
         * @event husky.overlay.<instance-name>.okbutton.deactivate
         */
        OKBUTTON_DEACTIVATE = function() {
            return createEventName.call(this, 'okbutton.deactivate');
        },

        /**
         * removes the component
         * @event husky.overlay.<instance-name>.remove
         */
        REMOVE = function() {
            return createEventName.call(this, 'remove');
        },

        /**
         * opens the overlay
         * @event husky.overlay.<instance-name>.open
         */
        OPEN = function() {
            return createEventName.call(this, 'open');
        },

        /**
         * closes the overlay
         * @event husky.overlay.<instance-name>.close
         */
        CLOSE = function() {
            return createEventName.call(this, 'close');
        },

        /**
         * calls the resize handler of the overlay to set the position, height etc.
         * @event husky.overlay.<instance-name>.set-position
         */
        SET_POSITION = function() {
            return createEventName.call(this, 'set-position');
        },

        /**
         * emited after the language changer is changed
         * @event husky.overlay.<instance-name>.language-changed
         * @param {String} selected language
         * @param {Object} currently active tab
         */
        LANGUAGE_CHANGED = function() {
            return createEventName.call(this, 'language-changed');
        },

        /**
         * slide left
         * @event husky.overlay.<instance-name>.slide-left
         */
        SLIDE_LEFT = function() {
            return createEventName.call(this, 'slide-left');
        },

        /**
         * slide right
         * @event husky.overlay.<instance-name>.slide-right
         */
        SLIDE_RIGHT = function() {
            return createEventName.call(this, 'slide-right');
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

            var type = this.options.type || defaults.type;
            // merge defaults, type defaults and options
            this.options = this.sandbox.util.extend(true, {}, defaults, types[type], this.options);

            // make component element invisible (overlay and backdrop are fixed)
            this.sandbox.dom.width(this.$el, 0);
            this.sandbox.dom.height(this.$el, 0);

            this.setVariables();
            this.initSlideOptions();
            this.bindEvents();

            if (this.options.openOnStart) {
                this.openOverlay();
            }
        },

        /**
         * Initiates slide options
         *  - default slide - options interface
         *  - for each slide default values
         */
        initSlideOptions: function() {
            var key, type;
            if (this.options.slides.length === 0) {
                // no slide given: extract it from options
                this.slides[0] = this.sandbox.util.extend({}, slideDefaults);
                this.slides[0].index = 0;
                for (key in slideDefaults) {
                    // check options for slide property
                    if (this.options.hasOwnProperty(key)) {
                        this.slides[0][key] = this.options[key];
                    }
                }

                type = types[this.slides[0].type];
                this.slides[0] = this.sandbox.util.extend({}, type, this.slides[0]);
            } else {
                // extend each slide with type and defaults
                this.sandbox.util.foreach(this.options.slides, function(value, i) {
                    this.slides[i] = this.sandbox.util.extend({}, slideDefaults, value);

                    type = types[this.slides[i].type];
                    this.slides[i] = this.sandbox.util.extend({}, type, this.slides[i]);
                    if (this.slides[i].index === -1) {
                        this.slides[i].index = i;
                    }
                }.bind(this));
            }
        },

        /**
         * Binds general events
         */
        bindEvents: function() {
            if (!!this.$trigger) {
                this.sandbox.dom.on(this.$trigger, this.options.trigger + '.overlay.' + this.options.instanceName, function(event) {
                    this.sandbox.dom.preventDefault(event);
                    this.triggerHandler();
                }.bind(this));
            }

            this.sandbox.on(REMOVE.call(this), this.removeComponent.bind(this));
            this.sandbox.on(OKBUTTON_ACTIVATE.call(this), this.activateOkButtons.bind(this));
            this.sandbox.on(OKBUTTON_DEACTIVATE.call(this), this.deactivateOkButtons.bind(this));
            this.sandbox.on(OPEN.call(this), this.triggerHandler.bind(this));
            this.sandbox.on(CLOSE.call(this), this.closeHandler.bind(this));

            this.sandbox.on(SET_POSITION.call(this), function() {
                this.resetResizeVariables();
                this.resizeHandler();
            }.bind(this));

            // emit language-changed-event when language dropdown gets changed
            this.sandbox.on('husky.select.' + this.options.instanceName + '.selected.item', function(localeIndex) {
                this.sandbox.emit(LANGUAGE_CHANGED.call(this),
                    this.options.languageChanger.locales[localeIndex], //selected locale
                    this.activeTab
                );
            }.bind(this));
        },

        /**
         * Activates all ok buttons
         */
        activateOkButtons: function() {
            var $okButtons = this.sandbox.dom.find(constants.overlayOkSelector, this.overlay.$footer),
                i, length;
            for (i = -1, length = $okButtons.length; ++i < length;) {
                this.sandbox.dom.removeClass($okButtons[i], 'inactive gray');
            }
        },

        /**
         * Deactivates all ok buttons
         */
        deactivateOkButtons: function() {
            var $okButtons = this.sandbox.dom.find(constants.overlayOkSelector, this.overlay.$footer),
                i, length;
            for (i = -1, length = $okButtons.length; ++i < length;) {
                this.sandbox.dom.addClass($okButtons[i], 'inactive gray');
            }
        },

        /**
         * Removes the component
         */
        removeComponent: function() {
            this.sandbox.stop();
        },

        /**
         * Sets the default properties
         */
        setVariables: function() {
            this.$trigger = null;
            if (!!this.options.triggerEl) {
                this.$trigger = this.sandbox.dom.$(this.options.triggerEl);
            }

            this.overlay = {
                opened: false,
                collapsed: false,
                normalHeight: null,
                $el: null,
                $slides: null,
                slides: []
            };
            this.$backdrop = null;
            this.dragged = false;
            this.activeTab = null;
            this.slides = [];
            this.activeSlide = 0;
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
                this.overlay.opened = true;
                //init backrop element
                if (this.$backdrop === null && this.options.backdrop === true) {
                    this.initBackdrop();
                }
                //if overlay-element doesn't exist initialize it
                if (this.overlay.$el === null) {
                    this.initSkeleton();
                    this.bindOverlayEvents();
                    this.bindCustomEvents();

                    if (this.options.okInactive === true) {
                        this.deactivateOkButtons();
                    }

                    this.sandbox.emit(INITIALIZED.call(this));

                    this.insertOverlay(false);

                    this.overlay.$content = this.sandbox.dom.find(constants.contentSelector, this.overlay.$el);

                    this.insertOverlay(true);
                    this.setSlidesHeight();
                } else {
                    this.insertOverlay(true);
                }
            }
        },

        /**
         * Sets the height of all slides equal
         */
        setSlidesHeight: function() {
            if (this.slides.length > 1) {
                var maxHeight = -1;
                // set width to n-width
                this.overlay.width = this.sandbox.dom.outerWidth(this.sandbox.dom.find('.slide', this.overlay.$slides));
                this.sandbox.dom.css(this.overlay.$slides, 'width', (this.slides.length * this.overlay.width) + 'px');

                $(this.overlay.$content).each(function() {
                    maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
                });

                this.sandbox.dom.css(this.overlay.$content, 'height', this.sandbox.dom.height(this.sandbox.dom.get(this.overlay.$content, 0)) + 'px');
            }
        },

        /**
         * bind custom events
         */
        bindCustomEvents: function() {
            this.sandbox.on(SLIDE_LEFT.call(this), this.slideLeft.bind(this));
            this.sandbox.on(SLIDE_RIGHT.call(this), this.slideRight.bind(this));
        },

        /**
         * slide left
         */
        slideLeft: function() {
            this.activeSlide--;
            if (this.activeSlide < 0) {
                this.activeSlide = this.slides.length - 1;
            }
            this.slideTo(this.activeSlide);
        },

        /**
         * slide right
         */
        slideRight: function() {
            this.activeSlide++;
            if (this.activeSlide >= this.slides.length) {
                this.activeSlide = 0;
            }
            this.slideTo(this.activeSlide);
        },

        /**
         * slide to given number
         */
        slideTo: function(slide) {
            this.sandbox.dom.css(this.overlay.$slides, 'left', '-' + slide * this.overlay.width + 'px');
        },

        /**
         * Initializes the Backdrop
         */
        initBackdrop: function() {
            this.$backdrop = this.sandbox.dom.createElement(templates.backdrop);
            this.sandbox.dom.css(this.$backdrop, {
                'background-color': this.options.backdropColor
            });
            this.sandbox.dom.fadeTo(this.$backdrop, 0, this.options.backdropAlpha);
        },

        /**
         * Removes the overlay-element from the DOM
         */
        closeOverlay: function() {
            this.sandbox.emit(CLOSING.call(this));

            this.overlay.opened = false;
            this.dragged = false;
            this.collapsed = false;
            this.overlay.$content.css('height', '');

            this.sandbox.emit(CLOSED.call(this));

            this.sandbox.dom.off('body', 'keydown.' + this.options.instanceName);

            if (!this.options.removeOnClose) {
                this.sandbox.dom.detach(this.overlay.$el);

                if (this.options.backdrop === true) {
                    this.sandbox.dom.detach(this.$backdrop);
                }
            } else {
                this.removeComponent();
            }
        },

        /**
         * Inserts the overlay-element into the DOM
         */
        insertOverlay: function(emitEvent) {
            this.sandbox.dom.append(this.$el, this.overlay.$el);

            // ensures that the overlay box fits the window form the beginning
            this.resetResizeVariables();
            this.resizeHandler();

            this.setCoordinates();

            if (this.options.backdrop === true) {
                this.sandbox.dom.append(this.$el, this.$backdrop);
            }

            if (!!emitEvent) {
                this.sandbox.emit(OPENED.call(this));
            }

            // listen on key-inputs
            if (this.options.supportKeyInput === true) {
                this.sandbox.dom.off('body', 'keydown.' + this.options.instanceName);
                this.sandbox.dom.on('body', 'keydown.' + this.options.instanceName, this.keyHandler.bind(this));
            }
        },

        /**
         * Creates the overlay-element with a skeleton-template
         */
        initSkeleton: function() {
            this.overlay.$el = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.overlaySkeleton,
                    {
                        skin: this.options.skin,
                        cssClass: this.options.cssClass || '',
                        overflowClass: (this.slides.length > 1) ? 'overflow-hidden' : ''
                    }
                )
            );

            this.overlay.$slides = this.sandbox.dom.find(constants.slidesSelector, this.overlay.$el);

            var slide, $el;
            for (slide in this.slides) {
                if (this.slides.hasOwnProperty(slide)) {
                    $el = this.initSlideSkeleton(slide);
                    this.initButtons(slide);
                    this.setContent(slide);
                    this.sandbox.dom.append(this.overlay.$slides, $el);
                }
            }
        },

        initSlideSkeleton: function(slide) {
            this.overlay.slides[slide] = this.sandbox.util.extend({}, internalSlideDefaults);

            this.overlay.slides[slide].$el = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.slideSkeleton, {
                    title: this.sandbox.util.cropMiddle(this.slides[slide].title, 38),
                    subTitle: !!this.slides[slide].subTitle ? this.slides[slide].subTitle : null,
                    closeIcon: this.slides[slide].closeIcon,
                    index: this.slides[slide].index,
                    cssClass: this.slides[slide].cssClass
                })
            );
            this.overlay.slides[slide].$close = this.sandbox.dom.find(constants.closeSelector, this.overlay.slides[slide].$el);
            this.overlay.slides[slide].$footer = this.sandbox.dom.find(constants.footerSelector, this.overlay.slides[slide].$el);
            this.overlay.slides[slide].$content = this.sandbox.dom.find(constants.contentSelector, this.overlay.slides[slide].$el);
            this.overlay.slides[slide].$header = this.sandbox.dom.find(constants.headerSelector, this.overlay.slides[slide].$el);

            // render a language changer into the header if configured
            if (this.slides[slide].languageChanger !== null) {
                this.renderLanguageChanger(slide);
            }

            // add draggable class if overlay is draggable
            if (this.options.draggable === true) {
                this.sandbox.dom.addClass(this.overlay.slides[slide].$el, constants.draggableClass);
            }

            // add small-header class if configured
            if (this.slides[slide].smallHeader === true) {
                this.sandbox.dom.addClass(this.overlay.slides[slide].$header, constants.smallHeaderClass);
            }

            // add classes for various styling
            this.sandbox.dom.addClass(this.overlay.slides[slide].$footer, this.options.buttonsDefaultAlign);
            this.sandbox.dom.addClass(this.overlay.slides[slide].$el, this.options.cssClass);

            return this.overlay.slides[slide].$el;
        },

        /**
         * Renders a language changer and places it within the header
         */
        renderLanguageChanger: function(slide) {
            var $element = this.sandbox.dom.createElement('<div/>');

            this.overlay.slides[slide].$languageChanger = this.sandbox.dom.createElement(
                '<div class="' + constants.languageChangerClass + '"/>'
            );
            this.sandbox.dom.append(this.overlay.slides[slide].$header, this.overlay.slides[slide].$languageChanger);
            this.sandbox.dom.append(this.overlay.slides[slide].$languageChanger, $element);

            this.sandbox.start([
                {
                    name: 'select@husky',
                    options: {
                        el: $element,
                        data: this.slides[slide].languageChanger.locales,
                        preSelectedElements: [this.slides[slide].languageChanger.preSelected],
                        skin: 'white',
                        instanceName: this.options.instanceName
                    }
                }
            ]);
        },

        /**
         * Renders all buttons and appends them to the footer
         */
        initButtons: function(slide) {
            var i, length, $button, button, template, classes, text, inactive;
            for (i = -1, length = this.slides[slide].buttons.length; ++i < length;) {
                button = this.slides[slide].buttons[i];
                if (button.type === buttonTypes.OK) {
                    template = templates.okButton;
                    text = this.slides[slide].okDefaultText;
                    inactive = this.slides[slide].okInactive;
                } else if (button.type === buttonTypes.CANCEL) {
                    template = templates.cancelButton;
                    text = this.slides[slide].cancelDefaultText;
                }

                classes = (!!button.classes) ? ' ' + button.classes : '';

                if (!!button.text) {
                    text = button.text;
                } else if (!!button.icon) {
                    text = '';
                }

                if (inactive !== true) {
                    inactive = button.inactive;
                }

                $button = this.sandbox.dom.createElement(this.sandbox.util.template(template, {
                    icon: button.icon,
                    text: text,
                    classes: (inactive === true) ? classes + ' inactive gray' : classes
                }));

                // add individual button align (if configured)
                if (!!button.align) {
                    this.sandbox.dom.addClass($button, button.align);
                }

                this.sandbox.dom.append(this.overlay.slides[slide].$footer, $button);
            }
        },

        /**
         * Sets the content of the overlay. If the data option is set set it as raw html.
         * If the message option is set render a template with the message
         */
        setContent: function(slide) {
            if (!!this.slides[slide].data) {
                this.sandbox.dom.html(this.overlay.slides[slide].$content, this.slides[slide].data);
            } else if (!!this.slides[slide].message) {
                this.sandbox.dom.html(this.overlay.slides[slide].$content, this.sandbox.util.template(templates.message, {
                    message: this.slides[slide].message
                }));

            } else if (this.slides[slide].tabs !== null) {
                this.renderTabs(slide);
            } else {
                this.sandbox.logger.log('Error: either options.data, options.message or options.tabs has to be set', this);
            }
        },

        /**
         * Renders the tab-contents of of the overlay
         * and initializes the tab component
         */
        renderTabs: function(slide) {
            this.overlay.slides[slide].tabs = [];
            this.overlay.slides[slide].$tabs = this.sandbox.dom.createElement('<div class="' + constants.tabsClass + '"/>');
            this.sandbox.dom.append(this.overlay.slides[slide].$header, this.overlay.slides[slide].$tabs);

            for (var i = -1, length = this.slides[slide].tabs.length; ++i < length;) {
                this.overlay.slides[slide].tabs.push({
                    id: i,
                    name: this.slides[slide].tabs[i].title,
                    $el: this.sandbox.dom.createElement(this.slides[slide].tabs[i].data)
                });
                this.sandbox.dom.hide(this.overlay.slides[slide].tabs[i].$el);
                this.sandbox.dom.append(this.overlay.slides[slide].$content, this.overlay.slides[slide].tabs[i].$el);
            }
            // show first tab element at the beginning and start tab-bar
            this.showTab(this.overlay.slides[slide].tabs[0], slide);
            this.startTabsComponent(slide);
        },

        /**
         * Starts the tabs-component
         */
        startTabsComponent: function(slide) {
            var $element = this.sandbox.dom.createElement('<div/>');
            this.sandbox.dom.html(this.overlay.slides[slide].$tabs, $element);

            this.sandbox.start([
                {
                    name: 'tabs@husky',
                    options: {
                        el: $element,
                        data: this.overlay.slides[slide].tabs,
                        instanceName: 'overlay' + this.options.instanceName,
                        skin: 'overlay'
                    }
                }
            ]);
        },

        /**
         * Support for key down events
         * @param event
         */
        keyHandler: function(event) {
            // esc
            if (event.keyCode === 27) {
                this.closeHandler();
            } else if (event.keyCode === 13) {
                // when enter is pressed in textarea overlay should not be closed
                if (event.target.tagName === 'TEXTAREA') {
                    return;
                }
                this.okHandler();
            }
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

            //stop propagation
            if (this.options.propagateEvents === false) {
                this.sandbox.dom.on(this.overlay.$el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                }.bind(this));
                if (this.options.backdrop === true) {
                    this.sandbox.dom.on(this.$backdrop, 'click', function(event) {
                        this.sandbox.dom.stopPropagation(event);
                    }.bind(this));
                }
            }

            // close handler for close icon
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.closeHandler.bind(this), constants.closeSelector);

            // close handler for cancel buttons
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.closeHandler.bind(this), constants.overlayCancelSelector);

            // binds the events for ok-buttons
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.okHandler.bind(this), constants.overlayOkSelector);

            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', function() {
                if (this.dragged === false && this.overlay.opened === true) {
                    this.resizeHandler();
                }
            }.bind(this));

            if (this.options.backdrop === true && this.options.backdropClose === true) {
                this.sandbox.dom.on(this.$backdrop, 'click', this.closeHandler.bind(this));
            }

            if (this.options.draggable === true) {
                this.sandbox.util.foreach(this.overlay.slides, function(slide) {
                    this.sandbox.dom.on(slide.$header, 'mousedown', function(e) {
                        var origin = {
                            y: e.clientY - (this.sandbox.dom.offset(this.overlay.slides[this.activeSlide].$header).top - this.sandbox.dom.scrollTop(this.sandbox.dom.$window)),
                            x: e.clientX - (this.sandbox.dom.offset(this.overlay.slides[this.activeSlide].$header).left - this.sandbox.dom.scrollLeft(this.sandbox.dom.$window))
                        };

                        //bind the mousemove event if mouse is down on header
                        this.sandbox.dom.on(this.sandbox.dom.$document, 'mousemove.overlay' + this.options.instanceName, function(event) {
                            this.draggableHandler(event, origin);
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
                this.sandbox.dom.on(this.sandbox.dom.$document, 'mouseup', function() {
                    this.sandbox.dom.off(this.sandbox.dom.$document, 'mousemove.overlay' + this.options.instanceName);
                }.bind(this));
            }

            this.bindOverlayCustomEvents();
        },

        /**
         * Binds custom events used by the overlay
         */
        bindOverlayCustomEvents: function() {
            if (this.overlay.tabs !== null) {
                this.sandbox.on('husky.tabs.overlay' + this.options.instanceName + '.item.select', this.showTab.bind(this));
            }
        },

        /**
         * Handles the click on an overlay tab
         */
        showTab: function(tab, slide) {
            slide = slide || this.activeSlide;
            this.activeTab = tab;
            this.hideAllTabsElements(slide);
            this.sandbox.dom.show(tab.$el);
            if (this.dragged === false) {
                this.resetResizeVariables();
                this.resizeHandler();
            }
        },

        /**
         * Hides all tab elements
         */
        hideAllTabsElements: function(slide) {
            for (var i = -1, length = this.overlay.slides[slide].tabs.length; ++i < length;) {
                this.sandbox.dom.hide(this.overlay.slides[slide].tabs[i].$el);
            }
        },

        /**
         * Handles the click on ok-buttons
         * @param event
         */
        okHandler: function(event) {
            // do nothing, if button is inactive
            if (!!event && this.sandbox.dom.hasClass(event.currentTarget, 'inactive')) {
                return;
            }
            !!event && this.sandbox.dom.preventDefault(event);

            if (this.executeCallback(
                    this.slides[this.activeSlide].okCallback,
                    this.sandbox.dom.find(constants.contentSelector, this.overlay.$el)
                ) !== false) {
                this.closeOverlay();
            }
        },

        /**
         * Handles the click on cancel-buttons and close-icon
         * @param event
         */
        closeHandler: function(event) {
            var cancelCallback = this.slides[this.activeSlide].closeCallback ||
                this.slides[this.activeSlide].cancelCallback;

            if (!!event) {
                this.sandbox.dom.preventDefault(event);
                this.sandbox.dom.stopPropagation(event);
            }
            if (this.executeCallback(
                    cancelCallback,
                    this.sandbox.dom.find(constants.contentSelector, this.overlay.$el)
                ) !== false) {
                this.closeOverlay();
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
                this.overlay.collapsed = false;
            }
        },

        /**
         * Sets all properties and variables responsible for the correct resize experience back
         * to their initial state or re-initializes them
         */
        resetResizeVariables: function() {
            this.overlay.collapsed = false;
            // FIXME shrink does not work without that but it doesnt scroll to to each time:
            // this.sandbox.dom.height(this.overlay.$content, '');
            this.overlay.normalHeight = this.sandbox.dom.height(this.overlay.$el);
            this.setSlidesHeight();
        },

        /**
         * Handles the shrinking and enlarging of the overlay
         * if the window gets smaller
         */
        resizeHandler: function() {
            //window is getting smaller - make overlay smaller
            if (this.sandbox.dom.height(this.sandbox.dom.$window) < this.sandbox.dom.outerHeight(this.overlay.$el) + this.options.verticalSpacing * 2) {
                this.sandbox.dom.height(this.overlay.$content,
                    (this.sandbox.dom.height(this.sandbox.dom.$window) - this.sandbox.dom.height(this.overlay.$el) + this.sandbox.dom.height(this.overlay.$content) - this.options.verticalSpacing * 2)
                );
                this.overlay.collapsed = true;

                //window is getting bigger - make the overlay bigger
            } else if (this.sandbox.dom.height(this.sandbox.dom.$window) > this.sandbox.dom.outerHeight(this.overlay.$el) + this.options.verticalSpacing * 2 &&
                this.overlay.collapsed === true) {

                //if overlay reached its beginning height - stop
                if (this.sandbox.dom.height(this.overlay.$el) >= this.overlay.normalHeight) {
                    this.overlay.collapsed = false;

                    // else enlarge further
                } else {
                    this.sandbox.dom.height(this.overlay.$content,
                        (this.sandbox.dom.height(this.sandbox.dom.$window) - this.sandbox.dom.height(this.overlay.$el) + this.sandbox.dom.height(this.overlay.$content) - this.options.verticalSpacing * 2)
                    );
                }
            }

            // update position
            this.setCoordinates();
        },

        /**
         * Positions the overlay in the middle of the screen
         */
        setCoordinates: function() {
            var top, left;
            if (!!this.options.top) {
                top = this.options.top;
            } else {
                top = (this.sandbox.dom.$window.height() - this.overlay.$el.outerHeight()) / 2;
            }
            if (!!this.options.left) {
                left = this.options.left;
            } else {
                left = (this.sandbox.dom.$window.width() - this.overlay.$el.outerWidth()) / 2;
            }
            this.updateCoordinates(top, left);
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
         * @param data {Object} dom content element
         */
        executeCallback: function(callback, data) {
            if (typeof callback === 'function') {
                return callback(data);
            }
        }
    };

});

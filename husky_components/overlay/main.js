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
 * @params {Boolean} [options.openOnStart] if true overlay is opened after initialization
 * @params {Boolean} [options.removeOnClose] if overlay component gets removed on close
 * @params {String} [options.skin] set an overlay skin to manipulate overlay's appearance. Possible skins: '', 'wide', 'responsive-width'
 * @params {Boolean} [options.backdropClose] if true overlay closes with click on backdrop
 * @params {Boolean} [options.contentSpacing] Defines if there should be a spacing between overlay borders and content
 * @params {String} [options.type] The type of the overlay ('normal' or 'warning')
 * @params {Array} [options.buttonsDefaultAlign] the align of the buttons in the footer ('center', 'left' or 'right'). Can be overriden by each button individually
 * @params {Array} [options.supportKeyInput] if true pressing enter will submit the overlay and esc will close it
 * @params {Null|Number} [options.left] to fix the left position of the overlay. (px)
 * @params {Null|Number} [options.top] to fix the top position of the overlay. (px)
 * @params {Array} [options.propagateEvents] If false click-events will be stoped at the components-element
 *
 * @params {Array} [options.slides] array of slide objects, will be rendered in a row and can slided with events
 * @params {String} [options.slides[].title] the title of the overlay
 * @params {String} [options.slides[].subTitle] the sub-title of the overlay
 * @params {Function} [options.slides[].closeCallback] @deprecated Use 'cancelCallback' instead
 * @params {Function} [options.slides[].cancelCallback] callback which gets executed after the overlay gets canceled
 * @params {Function} [options.slides[].okCallback] callback which gets executed after the overlay gets submitted
 * @params {Boolean} [options.slides[].displayHeader] Boolean variable which determines wether or not the header gets rendered
 * @params {String|Object} [options.slides[].data] HTML or DOM-object which acts as the overlay-content
 * @params {String} [options.slides[].message] String to render as content. Used by warnings and errors
 * @params {String} [options.slides[].panelContent] The content to render in the panel container in the sub-header
 * @params {Boolean} [options.slides[].okInactive] If true all ok-buttons start deactivated
 * @params {String} [options.slides[].okDefaultText] The default text for ok buttons
 * @params {String} [options.slides[].cancelDefaultText] The default text for cancel buttons
 * @params {String} [options.slides[].type] The type of the overlay ('normal', 'error' or 'warning')
 * @params {Number} [options.startingSlide] The index of the slide to start with
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
            instanceName: 'undefined',
            openOnStart: false,
            removeOnClose: true,
            backdropClose: true,
            skin: '',
            supportKeyInput: true,
            contentSpacing: true,
            propagateEvents: true,
            type: 'normal',
            cssClass: '',
            slides: [],
            startingSlide: null,
            top: null,
            left: null
        },

        slideDefaults = {
            index: -1,
            title: '',
            subTitle: null,
            displayHeader: true,
            message: '',
            closeCallback: null,
            cancelCallback: null,
            okCallback: null,
            type: 'normal',
            data: '',
            panelContent: '',
            tabs: null,
            okInactive: false,
            buttonsDefaultAlign: 'center',
            cancelDefaultText: 'public.cancel',
            okDefaultText: 'public.ok',
            languageChanger: null,
            cssClass: ''
        },

        internalSlideDefaults = {
            $el: null,
            $footer: null,
            $header: null,
            $content: null,
            $languageChanger: null,
            $subheader: null,
            tabs: null //contains tabs related data
        },

        constants = {
            closeSelector: '.close-button',
            footerSelector: '.overlay-footer',
            contentSelector: '.overlay-content',
            headerSelector: '.overlay-header',
            slidesSelector: '.slides',
            overlayOkSelector: '.overlay-ok',
            overlayCancelSelector: '.overlay-cancel',
            overlayOtherButtonsSelector: '.overlay-button',
            panelClass: 'panel'
        },

        types = {
            normal: {
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
            alert: {
                cssClass: 'alert',
                removeOnClose: true,
                openOnStart: true,
                contentSpacing: false,
                instanceName: 'alert',
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
            }
        },

        buttonTypes = {
            OK: 'ok',
            CANCEL: 'cancel'
        },

        /** templates for component */
        templates = {
            overlaySkeleton: [
                '<div class="husky-overlay-container <%= overflowClass %> <%= skin %> <%= cssClass %>">',
                '   <div class="slides"></div>',
                '</div>'
            ].join(''),
            slideSkeleton: [
                '<div class="slide slide-<%= index %> <%= cssClass %>">',
                '   <% if(displayHeader) { %>',
                '      <div class="overlay-header<% if(subTitle) { %> with-sub-title<% } %>">',
                '           <span class="title"><%= title %></span>',
                '           <% if(subTitle) { %><div class="sub-title"><%= subTitle %></div><% } %>',
                '       </div>',
                '   <% } %>',
                '   <div class="overlay-content <%= spacingClass %>"></div>',
                '   <div class="overlay-footer">',
                '   </div>',
                '</div>'
            ].join(''),
            okButton: [
                '<div class="btn action overlay-ok<%= classes %>">',
                '   <% if (!!icon) { %>',
                '   <span class="fa-<%= icon %>"></span>',
                '   <% } %>',
                '   <span class="text"><%= text %></span>',
                '</div>',
                '<div class="loader" style="display: none;"></div>'
            ].join(''),
            cancelButton: [
                '<div class="btn gray black-text overlay-cancel<%= classes %>">',
                '   <% if (!!icon) { %>',
                '   <span class="fa-<%= icon %>"></span>',
                '   <% } %>',
                '   <span class="text"><%= text %></span>',
                '</div>'
            ].join(''),
            button: [
                '<div class="btn overlay-button <%= classes %>" data-button-number="<%=buttonNumber%>">',
                '   <% if (!!icon) { %>',
                '   <span class="fa-<%= icon %>"></span>',
                '   <% } %>',
                '   <span class="text"><%= text %></span>',
                '</div>'
            ].join(''),
            wrapper: [
                '<div class="husky-overlay-wrapper">',
                '   <div class="husky-overlay-scroll-wrapper"></div>',
                '   <div class="husky-overlay-backdrop"></div>',
                '</div>'
            ].join(''),
            subheader: [
                '<div class="overlay-subheader">',
                '   <div class="overlay-tabs"></div>',
                '</div>'
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
         * show loader instead of save button
         * @event husky.overlay.<instance-name>.show-loader
         */
        SHOW_LOADER = function() {
            return createEventName.call(this, 'show-loader');
        },

        /**
         * hide loader and show of save button
         * @event husky.overlay.<instance-name>.hide-loader
         */
        HIDE_LOADER = function() {
            return createEventName.call(this, 'hide-loader');
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

        /**
         * slide to
         * @param {Number} slide number
         * @event husky.overlay.<instance-name>.slide-to
         */
        SLIDE_TO = function() {
            return createEventName.call(this, 'slide-to');
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

            // emit language-changed-event when language dropdown gets changed
            this.sandbox.on('husky.select.' + this.options.instanceName + '.selected.item', function(localeIndex) {
                this.sandbox.emit(LANGUAGE_CHANGED.call(this),
                    this.slides[this.activeSlide].languageChanger.locales[localeIndex], //selected locale
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
            this.$wrapper = null;
            this.$backdrop = null;
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
                if (this.$wrapper == null) {
                    this.initWrapper();
                }
                if (this.overlay.$el === null) {
                    this.initSkeleton();
                    this.bindOverlayEvents();
                    this.bindCustomEvents();

                    if (this.options.okInactive === true) {
                        this.deactivateOkButtons();
                    }

                    this.sandbox.emit(INITIALIZED.call(this));

                    this.overlay.$content = this.sandbox.dom.find(constants.contentSelector, this.overlay.$el);

                    this.insertOverlay(true);

                    if (!!this.options.startingSlide) {
                        this.slideTo(this.options.startingSlide, false);
                    }

                    this.sandbox.start([{name: 'loader@husky', options: {el: this.$el.find('.loader'), size: '30px'}}]);
                } else {
                    this.insertOverlay(true);
                }
            }
        },

        /**
         * bind custom events
         */
        bindCustomEvents: function() {
            this.sandbox.on(SLIDE_LEFT.call(this), this.slideLeft.bind(this));
            this.sandbox.on(SLIDE_RIGHT.call(this), this.slideRight.bind(this));
            this.sandbox.on(SLIDE_TO.call(this), this.slideEvent.bind(this));
            this.sandbox.on(SHOW_LOADER.call(this), this.showLoader.bind(this));
            this.sandbox.on(HIDE_LOADER.call(this), this.hideLoader.bind(this));
        },

        showLoader: function() {
            this.$el.find('.btn').hide();
            this.$el.find('.loader').show();
        },

        hideLoader: function() {
            this.$el.find('.btn').show();
            this.$el.find('.loader').hide();
        },

        /**
         * slide left
         */
        slideLeft: function() {
            var slide = this.activeSlide - 1;
            if (slide < 0) {
                slide = this.slides.length - 1;
            }

            this.slideTo(slide, true);
        },

        /**
         * slide right
         */
        slideRight: function() {
            var slide = this.activeSlide + 1;
            if (slide >= this.slides.length) {
                slide = 0;
            }

            this.slideTo(slide, true);
        },

        /**
         * slide to given slide number
         *
         * @param {Number} slide
         */
        slideEvent: function(slide) {
            if (slide < 0 || slide >= this.slides.length) {
                this.sandbox.logger.error('Slide index out bounds');

                return;
            }

            this.slideTo(slide, true);
        },

        /**
         * slide to given number
         */
        slideTo: function(slide, animated) {
            this.activeSlide = slide;

            var width = this.sandbox.dom.outerWidth(this.sandbox.dom.find('.slide', this.overlay.$slides));
            animated = (typeof animated === 'undefined') ? true : animated;

            if (!animated) {
                this.overlay.$slides.addClass('no-animation');
            }
            this.overlay.$slides.css('left', '-' + slide * width + 'px');
            if (!animated) {
                // The following line makes sure the browsers apply the change in `left` before the class gets removed
                // http://stackoverflow.com/questions/11131875/what-is-the-cleanest-way-to-disable-css-transition-effects-temporarily
                this.overlay.$slides[0].offsetHeight;
                this.overlay.$slides.removeClass('no-animation');
            }
        },

        /**
         * Initializes the wrapper
         */
        initWrapper: function() {
            this.$wrapper = this.sandbox.dom.createElement(templates.wrapper);
            this.$backdrop = this.$wrapper.find('.husky-overlay-backdrop');
            this.$wrapper.hide();
        },

        /**
         * Removes the overlay-element from the DOM
         */
        closeOverlay: function() {
            this.sandbox.emit(CLOSING.call(this));

            this.overlay.opened = false;

            this.sandbox.emit(CLOSED.call(this));

            this.sandbox.dom.off('body', 'keydown.' + this.options.instanceName);
            this.$wrapper.hide();
            if (!this.options.removeOnClose) {
                this.sandbox.dom.detach(this.overlay.$el);
            } else {
                this.removeComponent();
            }
        },

        /**
         * Inserts the overlay-element into the DOM
         */
        insertOverlay: function(emitEvent) {
            this.$wrapper.find('.husky-overlay-scroll-wrapper').append(this.overlay.$el);
            this.sandbox.dom.append(this.$el, this.$wrapper);
            this.$wrapper.show();

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
                        skin: (!!this.options.skin) ? this.options.skin : '',
                        cssClass: (!!this.options.cssClass) ? this.options.cssClass : '',
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
                    // render a language changer into the header if configured
                    if (!!this.slides[slide].languageChanger) {
                        this.renderLanguageChanger(slide);
                    }
                    this.sandbox.dom.append(this.overlay.$slides, $el);
                }
            }
        },

        initSlideSkeleton: function(slide) {
            this.overlay.slides[slide] = this.sandbox.util.extend({}, internalSlideDefaults);

            this.overlay.slides[slide].$el = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.slideSkeleton, {
                    title: this.sandbox.util.cropMiddle(this.slides[slide].title, 58),
                    subTitle: !!this.slides[slide].subTitle ? this.slides[slide].subTitle : null,
                    index: this.slides[slide].index,
                    cssClass: this.slides[slide].cssClass,
                    displayHeader: this.slides[slide].displayHeader,
                    spacingClass: (!!this.options.contentSpacing) ? 'content-spacing' : ''
                })
            );
            this.overlay.slides[slide].$footer = this.sandbox.dom.find(constants.footerSelector, this.overlay.slides[slide].$el);
            this.overlay.slides[slide].$content = this.sandbox.dom.find(constants.contentSelector, this.overlay.slides[slide].$el);
            this.overlay.slides[slide].$header = this.sandbox.dom.find(constants.headerSelector, this.overlay.slides[slide].$el);

            if (!!this.slides[slide].languageChanger || !!this.slides[slide].tabs || !!this.slides[slide].panelContent) {
                this.overlay.slides[slide].$subheader = $(templates.subheader);
                this.overlay.slides[slide].$header.after(this.overlay.slides[slide].$subheader)
            }

            if (!!this.slides[slide].languageChanger || !!this.slides[slide].panelContent) {
                this.overlay.slides[slide].$panel =  $('<div class="' + constants.panelClass + '"/>');
                this.overlay.slides[slide].$subheader.append(this.overlay.slides[slide].$panel);
            }

            if (!!this.slides[slide].panelContent) {
                this.overlay.slides[slide].$panel.append('<div class="panel-content"/>');
                this.overlay.slides[slide].$panel.find('.panel-content').append(this.slides[slide].panelContent);
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
            var $element = this.sandbox.dom.createElement('<div class="language-changer"/>');
            this.overlay.slides[slide].$panel.append($element);

            this.sandbox.start([
                {
                    name: 'select@husky',
                    options: {
                        el: $element,
                        data: this.slides[slide].languageChanger.locales,
                        preSelectedElements: [this.slides[slide].languageChanger.preSelected],
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
                } else {
                    template = templates.button;
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
                    text: this.sandbox.translate(text),
                    buttonNumber: i,
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
                this.sandbox.dom.append(this.overlay.slides[slide].$content, this.slides[slide].data);
            } else if (!!this.slides[slide].message) {
                this.sandbox.dom.append(this.overlay.slides[slide].$content, this.sandbox.util.template(templates.message, {
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
            this.sandbox.start([
                {
                    name: 'tabs@husky',
                    options: {
                        el: this.overlay.slides[slide].$subheader.find('.overlay-tabs'),
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
            if (this.options.propagateEvents === false) {
                this.sandbox.dom.on(this.overlay.$el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                }.bind(this));
                this.sandbox.dom.on(this.$wrapper, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                }.bind(this));
            }

            // close handler for cancel buttons
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.closeHandler.bind(this), constants.overlayCancelSelector);

            // binds the events for ok-buttons
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.okHandler.bind(this), constants.overlayOkSelector);

            // binds the events for other buttons
            this.sandbox.dom.on(this.overlay.$el, 'click',
                this.buttonHandler.bind(this), constants.overlayOtherButtonsSelector);

            if (this.options.backdropClose === true) {
                this.$backdrop.on('click', this.closeHandler.bind(this));
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
            if (!!event) {
                this.sandbox.dom.preventDefault(event);
                this.sandbox.dom.stopPropagation(event);
            }

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
         * Handles the click on a button
         * @param event
         */
        buttonHandler: function(event) {
            if (!event || this.sandbox.dom.hasClass(event.currentTarget, 'inactive')) {
                return;
            }

            var buttonNumber = this.sandbox.dom.data(event.currentTarget, 'buttonNumber'),
                button = this.slides[this.activeSlide].buttons[buttonNumber];

            this.sandbox.dom.preventDefault(event);
            this.sandbox.dom.stopPropagation(event);

            this.executeCallback(
                button.callback,
                this.sandbox.dom.find(constants.contentSelector, this.overlay.$el)
            );
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

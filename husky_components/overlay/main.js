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
 * @params {String} [options.title] the title of the overlay
 * @params {String|Boolean} [options.closeIcon] icon class for the close button. If false no close icon will be displayed
 * @params {Function} [options.closeCallback] callback which gets executed after the overlay gets closed
 * @params {Function} [options.okCallback] callback which gets executed after the overlay gets submited
 * @params {String|Object} [options.data] HTML or DOM-object which acts as the overlay-content
 * @params {String} [options.message] String to render as content. Used by warnings and erros
 * @params {String} [options.instanceName] instance name of the component
 * @params {Boolean} [options.draggable] if true overlay is draggable
 * @params {Boolean} [options.openOnStart] if true overlay is opened after initialization
 * @params {Boolean} [options.removeOnClose] if overlay component gets removed on close
 * @params {Boolean} [options.backdrop] if true backdrop will be shown
 * @params {String} [options.skin] set an overlay skin to manipulate overlay's appearance. Possible skins: '' or 'wide'
 * @params {Boolean} [options.backdropClose] if true overlay closes with click on backdrop
 * @params {String} [options.backdropColor] Color of the backdrop
 * @params {Number} [options.backdropAlpha] Alpha-value of the backdrop
 * @params {Boolean} [options.okInactive] If true all ok-buttons start deactivated
 * @params {String} [options.okDefaultText] The default text for ok buttons
 * @params {String} [options.cancelDefaultText] The default text for cancel buttons
 * @params {String} [options.type] The type of the overlay ('normal', 'error' or 'warning')
 * @params {Array} [options.buttonsDefaultAlign] the align of the buttons in the footer ('center', 'left' or 'right'). Can be overriden by each button individually
 *
 * @params {Object} [options.languageChanger] If set language-changer will be displayed in the header
 * @params {Array} [options.languageChanger.locales] array of locale strings for the dropdown
 * @params {String} [options.languageChanger.preSelected] locale which is selected at the beginning
 *
 * @params {Array} [options.tabs] array of tabs-data to use instead of options.data and options.message
 * @params {String} [options.tabs.title] the title of the tab
 * @params {String|Object} [options.tabs.data] HTML or DOM-Object to display when tab is active
 *
 * @params {Array} [options.buttons] an array of buttons to add to the footer
 * @params {String} [options.buttons.type] type of the button ('ok', 'cancel')
 * @params {String} [options.buttons.icon] icon of the button
 * @params {String} [options.buttons.text] text of the button. If text and icon are not set the defaultText-options come into place
 * @params {Boolean} [options.buttons.inactive] If true button starts inactive
 */
define([], function() {

    'use strict';

    var defaults = {
            trigger: 'click',
            triggerEl: null,
            instanceName: 'undefined',
            draggable: true,
            openOnStart: false,
            removeOnClose: false,
            backdrop: true,
            backdropClose: true,
            backdropColor: '#000000',
            skin: '',
            backdropAlpha: 0.5,
            type: 'normal',
            cssClass: '',
            slides: []
        },

        slideDefaults = {
            index: -1,
            title: '',
            closeIcon: 'remove2',
            closeCallback: null,
            okCallback: null,
            data: '',
            tabs: null,
            okInactive: false,
            buttons: [],
            buttonsDefaultAlign: 'center',
            cancelDefaultText: 'Cancel',
            okDefaultText: 'Ok',
            languageChanger: null
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
            draggableClass: 'draggable',
            backdropClass: 'husky-overlay-backdrop',
            overlayOkSelector: '.overlay-ok',
            overlayCancelSelector: '.overlay-cancel',
            tabsClass: 'tabs',
            languageChangerClass: 'language-changer'
        },

        types = {
            normal: {
                buttons: [
                    {
                        type: 'ok',
                        icon: 'half-ok',
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
                '<div class="husky-overlay-container<%= skin %> smart-content-overlay">',
                '   <div class="slides"></div>',
                '</div>'
            ].join(''),
            slideSkeleton: [
                '<div class="slide-<%= index %>">',
                '   <div class="overlay-header">',
                '       <span class="title"><%= title %></span>',
                '       <% if (!!closeIcon) { %><a class="icon-<%= closeIcon %> close-button" href="#"></a><% } %>',
                '   </div>',
                '   <div class="overlay-content"></div>',
                '   <div class="overlay-footer">',
                '   </div>',
                '</div>',
            ].join(''),
            okButton: [
                '<div class="btn action overlay-ok<%= classes %>">',
                    '<% if (!!icon) { %>',
                    '<span class="icon-<%= icon %>"></span>',
                    '<% } %>',
                    '<span class="text"><%= text %></span>',
                '</div>'
            ].join(''),
            cancelButton: [
                '<div class="btn gray black-text overlay-cancel<%= classes %>">',
                    '<% if (!!icon) { %>',
                    '<span class="icon-<%= icon %>"></span>',
                    '<% } %>',
                    '<span class="text"><%= text %></span>',
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
         * emited after the language changer is changed
         * @event husky.overlay.<instance-name>.language-changed
         * @param {String} selected language
         * @param {Object} currently active tab
         */
            LANGUAGE_CHANGED = function() {
            return createEventName.call(this, 'language-changed');
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

            var type = (!!this.options.type) ? this.options.type : defaults.type;
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
            if (this.options.slides.length === 0) {
                this.slides[0] = this.sandbox.util.extend({}, slideDefaults);
                this.slides[0].id = 0;
                for (var key in slideDefaults) {
                    // check options for slide property
                    if (this.options.hasOwnProperty(key)) {
                        this.slides[0][key] = this.options[key];
                        delete this.options[key];
                    }
                }
            } else {
                this.sandbox.util.foreach(this.options.slides, function(value, i) {
                    this.slides[i] = this.sandbox.util.extend({}, value, slideDefaults);

                    if (this.slides[i].id === -1) {
                        this.slides[i].id = i;
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

            // emit language-changed-event when language dropdown gets changed
            this.sandbox.on('husky.select.'+ this.options.instanceName +'.selected.item', function(localeIndex) {
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
            this.sandbox.dom.off(this.overlay.$el);
            this.sandbox.dom.off(this.$backdrop);
            this.sandbox.dom.off(this.$trigger, this.options.trigger + '.overlay.' + this.options.instanceName);
            this.sandbox.dom.remove(this.$backdrop);
            this.sandbox.dom.remove(this.overlay.$el);

            // todo fix bug: sometimes overlay-sandbox has own sandbox or parent-sandboxes as child which
            // couses an endless loop. The bug can be reproduced by starting the component
            // in a clickhandler with openOnStart-option true
            //this.sandbox.stop();

            this.sandbox.stopListening();
            this.sandbox.dom.remove(this.$el);
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

                    if (this.options.okInactive === true) {
                        this.deactivateOkButtons();
                    }

                    this.sandbox.emit(INITIALIZED.call(this));
                }

                this.insertOverlay();
            }
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
            this.sandbox.dom.detach(this.overlay.$el);
            if (this.options.backdrop === true) {
                this.sandbox.dom.detach(this.$backdrop);
            }
            this.overlay.opened = false;
            this.dragged = false;
            this.collapsed = false;

            this.sandbox.dom.css(this.overlay.$content, {'height': 'auto'});

            this.sandbox.emit(CLOSED.call(this));

            if (this.options.removeOnClose === true) {
                this.removeComponent();
            }
        },

        /**
         * Inserts the overlay-element into the DOM
         */
        insertOverlay: function() {
            this.sandbox.dom.append(this.$el, this.overlay.$el);

            //ensures that the overlay box fits the window form the beginning
            this.overlay.normalHeight = this.sandbox.dom.height(this.overlay.$el);
            this.resizeHandler();

            this.setCoordinates();

            if (this.options.backdrop === true) {
                this.sandbox.dom.append(this.$el, this.$backdrop);
            }

            this.sandbox.emit(OPENED.call(this));
        },

        /**
         * Creates the overlay-element with a skeleton-template
         */
        initSkeleton: function() {
            this.overlay.$el = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.overlaySkeleton,
                    {
                        skin: this.options.skin
                    }
                )
            );

            var slide, $el;
            for (slide in this.slides) {
                $el = this.initSlideSkeleton(slide);
                this.initButtons(slide);
                this.setContent(slide);
                this.sandbox.dom.append(this.overlay.$el, $el);
            }
        },

        initSlideSkeleton: function(slide) {
            this.overlay.slides[slide] = this.sandbox.util.extend({}, internalSlideDefaults);

            this.overlay.slides[slide].$el = this.sandbox.dom.createElement(
                this.sandbox.util.template(templates.slideSkeleton, this.slides[slide]
                )
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
            if (this.slides[slide].draggable === true) {
                this.sandbox.dom.addClass(this.overlay.$el, constants.draggableClass);
            }

            // add classes for various styling
            this.sandbox.dom.addClass(this.overlay.$footer, this.options.buttonsDefaultAlign);
            this.sandbox.dom.addClass(this.overlay.$el, this.options.cssClass);

            return this.overlay.slides[slide].$el;
        },

        /**
         * Renders a language changer and places it within the header
         */
        renderLanguageChanger: function(slide) {
            var $element = this.sandbox.dom.createElement('<div/>');

            this.overlay.$languageChanger = this.sandbox.dom.createElement(
                '<div class="'+ constants.languageChangerClass +'"/>'
            );
            this.sandbox.dom.append(this.overlay.$header, this.overlay.$languageChanger);
            this.sandbox.dom.append(this.overlay.$languageChanger, $element);

            this.sandbox.start([{
                name: 'select@husky',
                options: {
                    el: $element,
                    data: this.slides[slide].languageChanger.locales,
                    preSelectedElements: [this.slides[slide].languageChanger.preSelected],
                    skin: 'white',
                    instanceName: this.options.instanceName
                }
            }]);
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
                    text = this.options.okDefaultText;
                    inactive = this.options.okInactive;
                } else if (button.type === buttonTypes.CANCEL) {
                    template = templates.cancelButton;
                    text = this.options.cancelDefaultText;
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
                this.sandbox.dom.html(this.overlay.slides[slide].$content, this.sandbox.util.template(templates.message)({
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
            this.overlay.slides[slide].$tabs = this.sandbox.dom.createElement('<div class="'+ constants.tabsClass +'"/>');
            this.sandbox.dom.append(this.overlay.slides[slide].$header, this.overlay.slides[slide].$tabs);

            for (var i = -1, length = this.slides[slide].tabs.length; ++i < length;) {
                this.overlay.slides[slide].tabs.push({
                    title: this.slides[slide].tabs[i].title,
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

            this.sandbox.start([{
                name: 'tabs@husky',
                options: {
                    el: $element,
                    data: {items: this.overlay.slides[slide].tabs},
                    instanceName: 'overlay' + this.options.instanceName,
                    skin: 'overlay'
                }
            }]);
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

            // close handler for close icon
            if (!!this.options.closeIcon) {
                this.sandbox.dom.on(this.overlay.$close, 'click',
                    this.closeHandler.bind(this));
            }

            // close handler for cancel buttons
            this.sandbox.dom.on(this.overlay.$footer, 'click',
                this.closeHandler.bind(this), constants.overlayCancelSelector);

            // binds the events for ok-buttons
            this.sandbox.dom.on(this.overlay.$footer, 'click',
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
                this.sandbox.dom.on(this.overlay.$header, 'mousedown', function(e) {
                    var origin = {
                        y: e.clientY - (this.sandbox.dom.offset(this.overlay.$header).top - this.sandbox.dom.scrollTop(this.sandbox.dom.$window)),
                        x: e.clientX - (this.sandbox.dom.offset(this.overlay.$header).left - this.sandbox.dom.scrollLeft(this.sandbox.dom.$window))
                    };

                    //bind the mousemove event if mouse is down on header
                    this.sandbox.dom.on(this.sandbox.dom.$document, 'mousemove.overlay' + this.options.instanceName, function(event) {
                        this.draggableHandler(event, origin);
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
                this.sandbox.on('husky.tabs.overlay'+ this.options.instanceName +'.item.select', this.showTab.bind(this));
            }
        },

        /**
         * Handles the click on an overlay tab
         * @param tab {object} tab object with $el property
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
            if (this.sandbox.dom.hasClass(event.currentTarget, 'inactive')) {
                return;
            }
            this.sandbox.dom.preventDefault(event);
            if (this.executeCallback(this.options.okCallback) !== false) {
                this.closeOverlay();
            }
        },

        /**
         * Handles the click on cancel-buttons and close-icon
         * @param event
         */
        closeHandler: function(event) {
            this.sandbox.dom.preventDefault(event);
            if (this.executeCallback(this.options.closeCallback) !== false) {
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
            this.updateCoordinates((this.sandbox.dom.$window.height() - this.overlay.$el.outerHeight()) / 2,
                (this.sandbox.dom.$window.width() - this.overlay.$el.outerWidth()) / 2);
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
                return callback();
            }
        }
    };

});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/auto-complete
 */

/**
 * @class TopToolbar
 * @constructor
 *
 * @param {Object} [options] Configuration object
 */

define([], function () {

    'use strict';

    /**
     * Default values for options
     */
    var defaults = {
            data: [],
            iconClassPrefix: 'icon-',
            iconExtraClass: 'icon',
            loadingClass: 'loading',
            disabledClass: 'disabled',
            animationClass: 'highlight-animation',
            highlightClass: 'highlight',
            buttonExtraClass: 'button',
            iconTitleClass: 'title'
        },

        constants = {
            containerClass: 'husky-top-toolbar',
            leftContainerClass: 'top-toolbar-left',
            middleContainerClass: 'top-toolbar-middle',
            rightContainerClass: 'top-toolbar-right',
            rightListClass: 'right-list',
            leftListClass: 'left-list',
            dropdownClass: 'top-toolbar-dropdown-menu',
            dropdownExpandedClass: 'is-expanded',
            dropdownTogglerClass: 'dropdown-toggle'
        },

        templates = {
            skeleton: [
                '<div class="',constants.containerClass,'">',
                    '<div class="',constants.leftContainerClass,'">',
                        '<ul class="',constants.leftListClass,'"></ul>',
                        '<ul class="',constants.rightListClass,'"></ul>',
                    '</div>',
                    '<div class="',constants.middleContainerClass,'">',
                        '<ul class="',constants.leftListClass,'"></ul>',
                        '<ul class="',constants.rightListClass,'"></ul>',
                    '</div>',
                    '<div class="',constants.rightContainerClass,'">',
                        '<ul class="',constants.leftListClass,'"></ul>',
                        '<ul class="',constants.rightListClass,'"></ul>',
                    '</div>',
                '</div>'
            ].join('')
        },

        eventNamespace = 'husky.top-toolbar.',

        /**
         * raised after initialization
         * @event husky.top-toolbar.initialized
         */
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * Components listens on and changes matched button state
         * @event husky.top-toolbar.<button-id>.disable
         * @param buttonId {Integer|String} id of a button
         */
        DISABLE = function(buttonId) {
            return createEventName.call(this, buttonId+'.disable');
        },

        /**
         * Components listens on and changes matched button state
         * @event husky.top-toolbar.<button-id>.enable
         * @param buttonId {Integer|String} id of a button
         */
        ENABLE = function(buttonId) {
            return createEventName.call(this, buttonId+'.enable');
        },

        /**
         * Components listens on and changes matched button state
         * @event husky.top-toolbar.<button-id>.enable
         * @param buttonId {Integer|String} id of a button
         */
        LOADING = function(buttonId) {
            return createEventName.call(this, buttonId+'.loading');
        },

        /** returns normalized event names */
        createEventName = function(postFix) {
            return eventNamespace + postFix;
        };

    return {

        initialize: function () {
            this.sandbox.logger.log('initialize', this);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.setProperties();

            this.render();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        setProperties: function() {
            this.containers = {
                left: {
                    $el: null,
                    $leftList: null,
                    $rightList: null
                },
                middle: {
                    $el: null,
                    $leftList: null,
                    $rightList: null
                },
                right: {
                    $el: null,
                    $leftList: null,
                    $rightList: null
                }
            };
            this.buttons = null;

            this.buttonStates = {
                enabled: 'enabled',
                disabled: 'disabled',
                loading: 'loading'
            }
        },

        render: function() {
            this.renderSkeleton();
            this.renderButtons();
            this.appendButtons();
        },

        renderSkeleton: function() {
            this.sandbox.dom.html(this.$el, templates.skeleton);
            this.initContainers();

            //set the middle container width the remaining width of the container
            // (container.width - left.width - right.width)
            this.sandbox.dom.css(this.sandbox.dom.find('.' + constants.middleContainerClass, this.$el), {
                width: (this.sandbox.dom.outerWidth(this.$el) - this.sandbox.dom.outerWidth(this.containers.left.$el) - this.sandbox.dom.outerWidth(this.containers.right.$el)) + 'px'
            });
        },

        initContainers: function() {
            this.containers.left.$el = this.sandbox.dom.find('.'+constants.leftContainerClass, this.$el);
            this.containers.left.$leftList = this.sandbox.dom.find('.'+constants.leftListClass, this.containers.left.$el);
            this.containers.left.$rightList = this.sandbox.dom.find('.'+constants.rightListClass, this.containers.left.$el);

            this.containers.middle.$el = this.sandbox.dom.find('.'+constants.middleContainerClass, this.$el);
            this.containers.middle.$leftList = this.sandbox.dom.find('.'+constants.leftListClass, this.containers.middle.$el);
            this.containers.middle.$rightList = this.sandbox.dom.find('.'+constants.rightListClass, this.containers.middle.$el);

            this.containers.right.$el = this.sandbox.dom.find('.'+constants.rightContainerClass, this.$el);
            this.containers.right.$leftList = this.sandbox.dom.find('.'+constants.leftListClass, this.containers.right.$el);
            this.containers.right.$rightList = this.sandbox.dom.find('.'+constants.rightListClass, this.containers.right.$el);
        },

        renderButtons: function() {
            this.initButtons();

            var i = -1, length = this.buttons.length, button = null, ddClass = '', html;
            for (i = -1, length = this.buttons.length; ++i < length;) {
                button = this.sandbox.dom.createElement('<li data-id="'+ this.buttons[i].id +'"/>');
                ddClass = (typeof this.buttons[i].items === 'undefined') ? '' : constants.dropdownTogglerClass;
                this.sandbox.dom.addClass(button, this.buttons[i].customClass);
                this.sandbox.dom.addClass(button, this.options.buttonExtraClass);
                if (this.buttons[i].highlight === true) {
                    this.sandbox.dom.addClass(button, this.options.highlightClass);
                }

                html = '<a class="'+ ddClass +'" href="#">';
                if (typeof this.buttons[i].icon !== 'undefined') {
                    html += '<span class="'+ this.options.iconClassPrefix + this.buttons[i].icon +' '+ this.options.iconExtraClass +'"></span>';
                }
                if (typeof this.buttons[i].title !== 'undefined') {
                    html += '<span class="'+ this.options.iconTitleClass +'">'+ this.buttons[i].title +'</span>';
                }
                html += '</a>';
                this.sandbox.dom.html(button, html);

                this.sandbox.dom.append(button, this.renderDropdown(this.buttons[i]));
                this.buttons[i].$el = button;
                this.buttons[i].executeCallback = true;
                this.buttons[i].loading = false;
                this.bindButtonEvents(this.buttons[i]);
            }
        },

        bindButtonEvents: function(button) {
            if(typeof button.items !== 'undefined') {
                this.sandbox.dom.on(button.$el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                    this.sandbox.dom.preventDefault(event);
                    if (button.executeCallback === true) {
                        this.toggleDropdown(button);
                    }
                }.bind(this));
            }

            if (typeof button.callback !== 'undefined') {
                this.sandbox.dom.on(button.$el, 'click', function(event) {
                    this.sandbox.dom.preventDefault(event);
                    if (button.executeCallback === true) {
                        this.executeCallback(button.callback);
                    }
                }.bind(this));
            }

            this.sandbox.on(DISABLE.call(this, button.id), function(highlight) {
                this.changeButtonState(button, this.buttonStates.disabled, highlight);
            }.bind(this));

            this.sandbox.on(ENABLE.call(this, button.id), function(highlight) {
                this.changeButtonState(button, this.buttonStates.enabled, highlight);
            }.bind(this));

            this.sandbox.on(LOADING.call(this, button.id), function(highlight) {
                this.changeButtonState(button, this.buttonStates.loading, highlight);
            }.bind(this));

            // remove class after effect has finished
            this.sandbox.dom.on(button.$el, 'animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
                this.sandbox.dom.removeClass(button.$el, this.options.animationClass);
            }.bind(this));
        },

        changeButtonState: function(button, state, highlight) {
            if (highlight === true) {
                this.sandbox.dom.addClass(button.$el, this.options.animationClass);
            }

            if (state === this.buttonStates.enabled) {
                this.resetButtonLoading(button);
                this.enableButton(button);
            } else if (state === this.buttonStates.disabled) {
                this.resetButtonLoading(button);
                this.disableButton(button);
            } else if (state === this.buttonStates.loading) {
                this.setButtonLoading(button);
            }
        },

        resetButtonLoading: function(button) {
            this.sandbox.dom.remove(this.sandbox.dom.find('.' + this.options.loadingClass, button.$el));
            this.sandbox.dom.show(this.sandbox.dom.children(button.$el, 'a'));
            button.loading = false;
        },

        disableButton: function(button) {
            if (typeof button.disabledIcon !== 'undefined') {
                this.removeIcon(button);
                this.setIcon(button, button.disabledIcon);
            }
            this.sandbox.dom.addClass(button.$el, this.options.disabledClass);
            button.executeCallback = false;
        },

        enableButton: function(button) {
            this.sandbox.dom.removeClass(button.$el, this.options.disabledClass);
            this.removeIcon(button);
            this.setIcon(button, button.icon);
            button.executeCallback = true;
        },

        setButtonLoading: function(button) {
            if (button.loading === false) {
                var $loadingCont = this.sandbox.dom.createElement('<span class="'+ this.options.loadingClass +'"></span>');
                this.sandbox.dom.hide(this.sandbox.dom.children(button.$el, 'a'));
                this.sandbox.dom.append(button.$el, $loadingCont);
                button.executeCallback = false;
                button.loading = true;

                this.sandbox.start([{
                    name: 'loader@husky',
                    options: {
                        el: $loadingCont,
                        size: '20px',
                        color: 'white'
                    }
                }]);
            }
        },

        toggleDropdown: function(button) {
            if (this.sandbox.dom.hasClass(button.$el, constants.dropdownExpandedClass) === true) {
                this.closeDropdown(button);
            } else {
                this.openDropdown(button);
                this.sandbox.dom.one(this.sandbox.dom.$window, 'click', this.closeDropdown.bind(this, button));
            }
        },

        openDropdown: function(button) {
            this.sandbox.dom.addClass(button.$el, constants.dropdownExpandedClass);
        },

        closeDropdown: function(button) {
            this.sandbox.dom.removeClass(button.$el, constants.dropdownExpandedClass);
        },

        renderDropdown: function(button) {
            if (typeof button.items !== 'undefined') {
                if (!!button.items.length) {
                    var dropdown = this.sandbox.dom.createElement('<ul class="'+ constants.dropdownClass +'"/>'),
                        i = -1, length = button.items.length, item = null;
                    for (;++i < length;) {
                        item = this.sandbox.dom.createElement('<li/>');
                        this.sandbox.dom.html(item, ['<a href="#">',button.items[i].title,'</a>'].join(''));
                        this.bindDropdownItemEvents(item, button, i);
                        this.sandbox.dom.append(dropdown, item);
                    }
                    return dropdown;
                }
            }
            return '';
        },

        bindDropdownItemEvents: function($el, button, itemIndex) {
            if(typeof button.items[itemIndex].callback !== 'undefined') {
                this.sandbox.dom.on($el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                    this.sandbox.dom.preventDefault(event);
                    this.refreshTitle(button, itemIndex);
                    this.refreshIcon(button, itemIndex);
                    this.executeCallback(button.items[itemIndex].callback);
                    this.closeDropdown(button);
                }.bind(this));
            }
        },

        refreshTitle: function(button, itemIndex) {
            if (button.dynamicDDTitle === true) {
                this.sandbox.dom.html(this.sandbox.dom.find('.'+this.options.iconTitleClass, button.$el), button.items[itemIndex].title);
            }
        },

        refreshIcon: function(button, itemIndex) {
            if (button.dynamicDDIcon === true) {
                this.removeIcon(button);
                this.setIcon(button, button.items[itemIndex].selectedIcon);
            }
        },

        removeIcon: function(button) {
            var iconContainer = this.sandbox.dom.find('.' + this.options.iconExtraClass, button.$el),
                iconClass = this.sandbox.dom.attr(iconContainer, 'class').match(this.options.iconClassPrefix+'[\\w|-]+')[0];
            this.sandbox.dom.removeClass(iconContainer, iconClass);
        },

        setIcon: function(button, icon) {
            this.sandbox.dom.prependClass( this.sandbox.dom.find('.' + this.options.iconExtraClass, button.$el), this.options.iconClassPrefix + icon);
        },

        initButtons: function() {
            this.buttons = this.options.data;
        },

        appendButtons: function() {
            var i = -1, length = this.buttons.length, container = null;
            for (; ++i < length;) {
                switch (this.buttons[i].container) {
                    case 'left':
                        container = this.containers.left;
                        break;
                    case 'middle':
                        container = this.containers.middle;
                        break;
                    case 'right':
                        container = this.containers.right;
                        break;
                    default:
                        this.sandbox.logger.log('ERROR: invalid container on button', this.buttons[i]);
                }
                if (this.buttons[i].align === 'left') {
                    this.sandbox.dom.append(container.$leftList, this.buttons[i].$el);
                } else {
                    this.sandbox.dom.append(container.$rightList, this.buttons[i].$el);
                }
            }
        },

        executeCallback: function(callback) {
            if(typeof callback === 'function') {
                callback();
            } else {
                this.sandbox.logger.log('ERROR: Callback is not a function');
            }
        }
    };
});

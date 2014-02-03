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
 *
 * @param {Array} [options.data] Array with data for the component
 * @param {Integer|String} [options.data*.id] unique identifier for the button
 * @param {String} [options.data*.icon] icon for the button
 * @param {String} [options.data*.disabledIcon] icon for the button if it's disabled
 * @param {String} [options.data*.container] container in which the button gets inserted (left, middle, right)
 * @param {String} [options.data*.align] which side the button is aligned in its container (left, right)
 * @param {String} [options.data*.title] title of the button
 * @param {String} [options.data*.customClass] class that gets added to the button
 * @param {Boolean} [options.data*.disabled] if true button starts in disabled-state
 * @param {Function} [options.data*.callback] callback which gets executed if the button is clicked on
 * @param {Boolean} [options.data*.highlight] if true the higlight-class gets added to the button
 * @param {Boolean} [options.data*.dynamicTitle] if true the button title always matches the selected dropdown-item
 * @param {Boolean} [options.data*.dynamicIcon] if true the button icon always matches the selected dropdown-icon
 * @param {Boolean} [options.data*.closeComponent] if true component closes if button is clicked on
 * @param {Array} [options.data*.items] array with dropdown-options for the button
 * @param {String} [options.data*.items*.title] title of the item
 * @param {Function} [options.data*.items*.callback] callback which gets executed if the item is clicked on
 * @param {selectedIcon} [options.data*.items*.title] icon to which the button-icon gets changed if the item is selected (data*.dynamicIcon must be true)
 * @param {Boolean} [options.data*.disabled] if true button starts in disabled-state
 *
 * @param {String} [options.iconClassPrefix] string that gets prepended to the button.icon string
 * @param {String} [options.iconExtraClass] class that gets added to the icon element
 * @param {String} [options.loadingClass] class that gets added to the loading container
 * @param {String} [options.disabledClass] class that gets added to the button if it's disabled
 * @param {String} [options.animationClass] class which handles a transition effect
 * @param {String} [options.highlightClass] class that gets added if button.highlight is true
 * @param {String} [options.buttonExtraClass] class that gets added to each button
 * @param {String} [options.iconTitleClass] class that gets added to the title container
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

        /**
         * Initalize
         */
        initialize: function () {
            this.sandbox.logger.log('initialize', this);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.setProperties();

            this.render();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Sets the default values for the object's properties
         */
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
            };
        },

        /**
         * Renders the component
         */
        render: function() {
            this.renderSkeleton();
            this.renderButtons();
            this.appendButtons();
        },

        /**
         * Renders the skeleton (main structure) of the component
         */
        renderSkeleton: function() {
            this.sandbox.dom.html(this.$el, templates.skeleton);
            this.initContainers();

            // set the middle container width the remaining width of the container
            // (container.width - left.width - right.width)
            this.sandbox.dom.css(this.sandbox.dom.find('.' + constants.middleContainerClass, this.$el), {
                width: (this.sandbox.dom.outerWidth(this.$el) - this.sandbox.dom.outerWidth(this.containers.left.$el) - this.sandbox.dom.outerWidth(this.containers.right.$el)) + 'px'
            });
        },

        /**
         * Binds the toolbar button-containers to object properties
         */
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

        /**
         * Renders the buttons (creats the button-DOM-object, but not yet displays it)
         */
        renderButtons: function() {
            this.initButtons();

            var i = -1, length = this.buttons.length, button = null, ddClass = '', html;
            for (; ++i < length;) {
                button = this.sandbox.dom.createElement('<li data-id="'+ this.buttons[i].id +'"/>');

                //if dropdown items exist add dropdown class
                ddClass = (typeof this.buttons[i].items === 'undefined') ? '' : constants.dropdownTogglerClass;

                this.sandbox.dom.addClass(button, this.buttons[i].customClass);
                this.sandbox.dom.addClass(button, this.options.buttonExtraClass);

                //set the highlight class
                if (this.buttons[i].highlight === true) {
                    this.sandbox.dom.addClass(button, this.options.highlightClass);
                }

                //construct the dom object
                html = '<a class="'+ ddClass +'" href="#">';
                if (typeof this.buttons[i].icon !== 'undefined') {
                    html += '<span class="'+ this.options.iconClassPrefix + this.buttons[i].icon +' '+ this.options.iconExtraClass +'"></span>';
                }
                if (typeof this.buttons[i].title !== 'undefined') {
                    html += '<span class="'+ this.options.iconTitleClass +'">'+ this.buttons[i].title +'</span>';
                }
                html += '</a>';
                this.sandbox.dom.html(button, html);

                //render dropdown-menu
                this.sandbox.dom.append(button, this.renderDropdown(this.buttons[i]));

                //set the button properties and bind the events
                this.buttons[i].$el = button;
                this.buttons[i].executeCallback = true;
                this.buttons[i].loading = false;
                this.buttons[i].previousItem = null;
                this.buttons[i].currentItem = null;

                //disable button if configured
                if (typeof this.buttons[i].disabled !== 'undefined') {
                    if (this.buttons[i].disabled === true) {
                        this.disableButton(this.buttons[i]);
                    }
                }

                this.bindButtonEvents(this.buttons[i]);
            }
        },

        /**
         * Binds events concerning buttons
         * @param button {object} the button to bind events on
         */
        bindButtonEvents: function(button) {

            //enable dropdown toggling
            if(typeof button.items !== 'undefined') {
                this.sandbox.dom.on(button.$el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                    this.sandbox.dom.preventDefault(event);
                    if (button.executeCallback === true) {
                        this.toggleDropdown(button);
                    }
                }.bind(this));
            }

            //enable callback execution
            if (typeof button.callback !== 'undefined') {
                this.sandbox.dom.on(button.$el, 'click', function(event) {
                    this.sandbox.dom.preventDefault(event);
                    if (button.executeCallback === true) {
                        this.executeCallback(button.callback);
                    }
                    if (typeof button.closeComponent !== 'undefined') {
                        if (button.closeComponent === true) {
                            this.closeComponent();
                        }
                    }
                }.bind(this));
            }

            //listen if the button state needs to be changed
            this.sandbox.on(DISABLE.call(this, button.id), function(highlight, setBack) {
                this.changeButtonState(button, this.buttonStates.disabled, highlight, setBack);
            }.bind(this));
            this.sandbox.on(ENABLE.call(this, button.id), function(highlight, setBack) {
                this.changeButtonState(button, this.buttonStates.enabled, highlight, setBack);
            }.bind(this));
            this.sandbox.on(LOADING.call(this, button.id), function(highlight, setBack) {
                this.changeButtonState(button, this.buttonStates.loading, highlight, setBack);
            }.bind(this));

            // remove class after effect has finished
            this.sandbox.dom.on(button.$el, 'animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
                this.sandbox.dom.removeClass(button.$el, this.options.animationClass);
            }.bind(this));
        },

        /**
         * Closes the component
         */
        closeComponent: function() {
            this.sandbox.dom.remove(this.$el);
        },

        /**
         * Changes the state of the button
         * @param button {object} the button which state needs to be changed
         * @param state {String} (enabled, disabled, loading) state to change to
         * @param highlight {Boolean} if true the button will play an animation
         * @param setBack {Boolean} if true the last state will be reseted
         */
        changeButtonState: function(button, state, highlight, setBack) {
            if (highlight === true) {
                this.sandbox.dom.addClass(button.$el, this.options.animationClass);
            }
            if (setBack === true) {
                this.setBackButton(button);
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

        /**
         * Resets the loading state
         * @param button {object} button context
         */
        resetButtonLoading: function(button) {
            this.sandbox.dom.remove(this.sandbox.dom.find('.' + this.options.loadingClass, button.$el));
            this.sandbox.dom.show(this.sandbox.dom.children(button.$el, 'a'));
            button.loading = false;
        },

        /**
         * Disables the button
         * @param button {object} button context
         */
        disableButton: function(button) {
            if (typeof button.disabledIcon !== 'undefined') {
                this.removeIcon(button);
                this.setIcon(button, button.disabledIcon);
            }
            this.sandbox.dom.addClass(button.$el, this.options.disabledClass);
            button.executeCallback = false;
        },

        /**
         * Enables the button
         * @param button {object} button context
         */
        enableButton: function(button) {
            this.sandbox.dom.removeClass(button.$el, this.options.disabledClass);
            if (button.previousItem === null) {
                this.removeIcon(button);
                this.setIcon(button, button.icon);
                this.setTitle(button, button.title);
                button.currentItem = null;
            }
            button.executeCallback = true;
        },

        /**
         * Sets the loading state for a button
         * @param button {object} button context
         */
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

        /**
         * toggles the dropdown-menu of a button
         * @param button {object} button context
         */
        toggleDropdown: function(button) {
            if (this.sandbox.dom.hasClass(button.$el, constants.dropdownExpandedClass) === true) {
                this.closeDropdown(button);
            } else {
                this.openDropdown(button);
                this.sandbox.dom.one(this.sandbox.dom.$window, 'click', this.closeDropdown.bind(this, button));
            }
        },

        /**
         * opens the dropdown-menu of a button
         * @param button {object} button context
         */
        openDropdown: function(button) {
            this.sandbox.dom.addClass(button.$el, constants.dropdownExpandedClass);
        },

        /**
         * closes the dropdown-menu of a button
         * @param button {object} button context
         */
        closeDropdown: function(button) {
            this.sandbox.dom.removeClass(button.$el, constants.dropdownExpandedClass);
        },

        /**
         * renders a dropdown-menu for a button
         * @param button {object} button to render the dropdown for
         * @returns {Object|String} DOM-object or empty string
         */
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

        /**
         * Binds events concerning the dropdown-menu items
         * @param $el {object} DOM-object to bind events on
         * @param button {object} button context
         * @param itemIndex {Integer} index of the concerning item in button.items
         */
        bindDropdownItemEvents: function($el, button, itemIndex) {
            if(typeof button.items[itemIndex].callback !== 'undefined') {
                this.sandbox.dom.on($el, 'click', function(event) {
                    this.sandbox.dom.stopPropagation(event);
                    this.sandbox.dom.preventDefault(event);
                    button.previousItem = button.currentItem;
                    button.currentItem = itemIndex;
                    this.refreshTitle(button, itemIndex);
                    this.refreshIcon(button, itemIndex);
                    this.executeCallback(button.items[itemIndex].callback);
                    this.closeDropdown(button);
                }.bind(this));
            }
        },

        /**
         * Sets the title and the icon of a button one step back
         */
        setBackButton: function(button) {
            if (button.previousItem !== null) {
                this.refreshIcon(button, button.previousItem, true);
                this.refreshTitle(button, button.previousItem, true);
            }
        },

        /**
         * Changes the button title to a title of a dropdown-item
         * @param button {object} button context
         * @param itemIndex {Integer} index of the concerning item in button.items
         */
        refreshTitle: function(button, itemIndex, force) {
            if (button.dynamicTitle === true || force === true) {
                this.setTitle(button, button.items[itemIndex].title);
            }
        },

        setTitle: function(button, title) {
            if (!!this.sandbox.dom.find('.'+this.options.iconTitleClass, button.$el).length) {
                this.sandbox.dom.html(this.sandbox.dom.find('.'+this.options.iconTitleClass, button.$el), title);
            }
        },

        /**
         * Changes the button icon to an icon of a dropdown-item
         * @param button {object} button context
         * @param itemIndex {Integer} index of the concerning item in button.items
         */
        refreshIcon: function(button, itemIndex, force) {
            if (button.dynamicIcon === true || force === true) {
                this.removeIcon(button);
                this.setIcon(button, button.items[itemIndex].selectedIcon);
            }
        },

        /**
         * Removes the icon class of a button
         * @param button {object} button context
         */
        removeIcon: function(button) {
            if (typeof button.icon !== 'undefined') {
                var iconContainer = this.sandbox.dom.find('.' + this.options.iconExtraClass, button.$el),
                    iconClass = this.sandbox.dom.attr(iconContainer, 'class').match(this.options.iconClassPrefix+'[\\w|-]+')[0];
                this.sandbox.dom.removeClass(iconContainer, iconClass);
                return iconClass;
            }
        },

        /**
         * Sets an icon class on a button
         * @param button {object} button context
         * @param icon {String} icon-class suffix
         */
        setIcon: function(button, icon) {
            this.sandbox.dom.prependClass( this.sandbox.dom.find('.' + this.options.iconExtraClass, button.$el), this.options.iconClassPrefix + icon);
        },

        /**
         * Initializes the buttons
         */
        initButtons: function() {
            this.buttons = this.options.data;
        },

        /**
         * Appends the buttons to their specified containers
         */
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

        /**
         * Executes a callback
         * @param callback {Function} callback to execute
         */
        executeCallback: function(callback) {
            if(typeof callback === 'function') {
                callback();
            } else {
                this.sandbox.logger.log('ERROR: Callback is not a function');
            }
        }
    };
});

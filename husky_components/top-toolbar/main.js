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
            data: []
        },

        constants = {
            containerClass: 'husky-top-toolbar',
            leftContainerClass: 'top-toolbar-left',
            middleContainerClass: 'top-toolbar-middle',
            rightContainerClass: 'top-toolbar-right',
            rightListClass: 'right-list',
            leftListClass: 'left-list',
            iconClassPrefix: 'icon-',
            iconExtraClass: 'icon',
            iconTitleClass: 'title',
            dropdownClass: 'top-toolbar-dropdown-menu'
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
                width: (this.sandbox.dom.width(this.$el) - this.sandbox.dom.width(this.containers.left.$el) - this.sandbox.dom.width(this.containers.right.$el)) + 'px'
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

            var i = -1, length = this.buttons.length, button = null;
            for (i = -1, length = this.buttons.length; ++i < length;) {
                button = this.sandbox.dom.createElement('<li data-id="'+ this.buttons[i].id +'"/>');
                this.sandbox.dom.addClass(button, this.buttons[i].customClass);
                this.sandbox.dom.html(button, ['<a href="#">',
                                                '<span class="',constants.iconExtraClass,' ',constants.iconClassPrefix + this.buttons[i].icon,'"></span>',
                                                '<span class="',constants.iconTitleClass,'">',this.buttons[i].title,'</span>',
                                          '</a>'].join(''));
                this.sandbox.dom.append(button, this.renderDropdown(this.buttons[i]));
                this.buttons[i].$el = button;
            }
        },

        renderDropdown: function(button) {
            if (!!button.items.length) {
                var dropdown = this.sandbox.dom.createElement('<ul class="'+ constants.dropdownClass +'"/>'),
                    i = -1, length = button.items.length, item = null;
                for (;++i < length;) {
                    item = this.sandbox.dom.createElement('<li/>');
                    this.sandbox.dom.html(item, ['<a href="#">',button.items[i].title,'</a>'].join(''));
                    this.sandbox.dom.append(dropdown, item);
                }
                return dropdown;
            }
            return '';
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
        }
    };
});

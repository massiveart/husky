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

        },

        constants = {
            containerClass: 'husky-top-toolbar',
            leftContainerClass: 'top-toolbar-left',
            middleContainerClass: 'top-toolbar-middle',
            rightContainerClass: 'top-toolbar-right',
            rightListClass: 'right-list',
            leftListClass: 'left-list'
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
        },

        render: function() {
            this.renderSkeleton();
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
        }
    };
});

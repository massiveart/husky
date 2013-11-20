define(function() {

    'use strict';

    return {

        initialize: function() {
            this.bindDOMEvents();
            this.sandbox.logger.log('Initialized Navigation');
        },




        /**
         * Interaction
         */

        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.toggleItems.bind(this),'.js-navigation-item');
            this.sandbox.dom.on(this.$el, 'click', this.selectSubItem.bind(this),'.js-navigation-sub-item');
        },

        /**
         * Toggles menu element with submenu
         * Raises navigation.toggle
         * @param event
         */
        toggleItems: function(event) {

            event.preventDefault();

            var $items = this.sandbox.dom.parents(event.currentTarget, '.js-navigation-items')[0];

            if (this.sandbox.dom.hasClass($items, 'is-expanded')) {
                this.sandbox.dom.removeClass($items, 'is-expanded');
            } else {
                this.sandbox.dom.addClass($items, 'is-expanded');
            }
        },

        /**
         * Selects menu element without submenu
         * Raises navigation.select
         * @param event
         */
        selectSubItem: function(event) {

            event.preventDefault();

            var $subItem = this.sandbox.dom.createElement(event.currentTarget),
                $items = this.sandbox.dom.parents(event.currentTarget, '.js-navigation-items');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el),'is-selected');
            this.sandbox.dom.addClass($subItem, 'is-selected');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-active', this.$el),'is-active');
            this.sandbox.dom.addClass($items, 'is-active');

        }
    };

});

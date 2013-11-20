define(function() {

    'use strict';

    return {

        initialize: function() {



            this.bindDOMEvents();
            this.sandbox.logger.log('Initialized Navigation');
        },

        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.toggleItems.bind(this),'.js-navigation-item');
            this.sandbox.dom.on(this.$el, 'click', this.selectSubItem.bind(this),'.js-navigation-sub-item');
        },

        toggleItems: function(event) {

            event.preventDefault();

            var $items = this.sandbox.dom.parents(event.currentTarget, '.navigation-items');

            if (this.sandbox.dom.hasClass($items, 'is-expanded')) {
                this.sandbox.dom.removeClass($items, 'is-expanded');
                return;
            }
            this.sandbox.dom.addClass($items, 'is-expanded');
        },

        selectSubItem: function(event) {

            event.preventDefault();

            var $subItem = this.sandbox.dom.createElement(event.currentTarget),
                $items = this.sandbox.dom.parents(event.currentTarget, '.navigation-items');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected'),'is-selected');
            this.sandbox.dom.addClass($subItem, 'is-selected');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-active'),'is-active');
            this.sandbox.dom.addClass($items, 'is-active');
        }
    };

});

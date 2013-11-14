define(function() {

    'use strict';

    return {

        initialize: function() {
            this.sandbox.logger.log('Initialized Navigation');

            this.bindDOMEvents();
        },

        bindDOMEvents: function() {
            this.$el.on('click', '.js-navigation-item', this.toggleItems.bind(this));
            this.$el.on('click', '.js-navigation-sub-item', this.selectSubItem.bind(this));
        },

        toggleItems: function(event) {

            event.preventDefault();

            var $items = $(event.currentTarget).parents('.navigation-items');

            if ($items.hasClass('is-expanded')) {
                $items.removeClass('is-expanded');
                return;
            }
            $items.addClass('is-expanded');
        },

        selectSubItem: function(event) {

            event.preventDefault();

            var $subItem = $(event.currentTarget),
                $items = $(event.currentTarget).parents('.navigation-items');

            this.$el.find('.is-selected').removeClass('is-selected');
            $subItem.addClass('is-selected');

            this.$el.find('.is-active').removeClass('is-active');
            $items.addClass('is-active');
        }
    };

});

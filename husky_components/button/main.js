define(['jquery'], function($) {

    var sandbox,
        defaults = {
        };

    return {

        view: true,

        initialize: function() {

            sandbox = this.sandbox;

            sandbox.logger.log('initialize', this);
            sandbox.logger.log(arguments);

            // FIXME jquery extension
            this.options = $.extend({}, defaults, this.options);

            // init html elements
            this.$headerbar = $('<div/>', {
                class: 'headerbar headerbar-fixed-top'
            });
            this.$left = $('<div/>', {
                class: 'headerbar-left'
            });
            this.$right = $('<div/>', {
                class: 'headerbar-right'
            });
            this.$mid = $('<div/>', {
                class: 'headerbar-mid'
            });
            this.$midLeft = $('<div/>', {
                class: 'left'
            });
            this.$midRight = $('<div/>', {
                class: 'right'
            });

            this.render();
        }
    }
});

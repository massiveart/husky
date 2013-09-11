define(['jquery'], function($) {

    var sandbox,
        defaults = {
            margin: 45  // add 45px to navWidth
        };

    return {

        view: true,

        initialize: function() {

            sandbox = this.sandbox;

            sandbox.logger.log('initialize', this);
            sandbox.logger.log(arguments);

            // FIXME
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
        },

        render: function() {
            this.$el.append(this.$headerbar);
            this.$headerbar.append(this.$left);

            this.$mid.append(this.$midLeft);
            this.$mid.append(this.$midRight);
            this.$headerbar.append(this.$mid);
            this.$headerbar.append(this.$right);

            this.$left.html('<p>Left</p>');
            this.$right.html('<p>Right</p>');
            this.$midLeft.html('<p>MidLeft</p>');
            this.$midRight.html('<p>MidRight</p>');

            this.bindDomEvents();
            this.bindCustomEvents();
        },

        bindDomEvents: function() {

        },

        bindCustomEvents: function() {
            // move buttons
            sandbox.on('navigation:item:content:show', function(item) {
                this.moveButtons(item.data.navWidth);
            }.bind(this));
            sandbox.on('husky:headerbar:move-buttons', this.moveButtons.bind(this));
        },

        // move buttons with navigation width
        moveButtons: function(navWidth) {
            var headerbarLeft = parseInt(this.$headerbar.css('margin-left')),
                marginLeft = navWidth + this.options.margin - headerbarLeft,
                width = parseInt(this.$mid.css('width'));

            this.$mid.css('margin-left', marginLeft);
            this.$right.css('margin-left', width + marginLeft);
        }
    };
});

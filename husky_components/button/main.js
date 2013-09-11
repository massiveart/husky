define(['jquery'], function($) {

    var sandbox,
        defaults = {
            buttonType: 'icon',
            instanceName: 'undefined',
            text: 'undefined',
            iconType: 'caution'
        };

    return {

        view: true,

        initialize: function() {

            sandbox = this.sandbox;

            sandbox.logger.log('initialize', this);
            sandbox.logger.log(arguments);

            // FIXME jquery extension
            this.options = $.extend({}, defaults, this.options);

            this.render();
        },

        render: function() {
            this.$el.addClass('pointer');
            if (this.options.buttonType === 'icon') {
                // FIXME jquery extension
                this.html(this.template.icon(this.options.iconType, this.options.text));
            }
        },

        template: {
            icon: function(icon, text) {
                return '<div class="loading-content"><span class="icon-' + icon + ' pull-left block"></span><span class="m-left-5 bold pull-left m-top-2 block">' + text + '</span></div>';
            }
        }
    }
});

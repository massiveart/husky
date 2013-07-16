(function($, window, document, undefined) {
    'use strict';

    Husky.Ui.Navigation = function(element, options) {
        this.name = 'Husky.Ui.Navigation';

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;
        this.$element = $(element);
    };

    $.extend(Husky.Ui.Navigation.prototype, Husky.Events, {
        render: function() {
            this.$element.html(this.$list);
        }
    });

    $.fn.huskyNavigation = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyNavigation.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(this.name)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(this.name, new Husky.Ui.Navigation(this, options));

        return this;
    };

    $.fn.huskyNavigation.defaults = {};

})(Husky.$, this, this.document);
/*****************************************************************************
 *
 *  DropDown
 *  [Short description]
 *
 *  Sections
 *      - initialization
 *      - DOM events
 *      - custom events
 *      - default values
 *
 *
 *****************************************************************************/

(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.DropDown';

    Husky.Ui.DropDown = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-drop-down"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.DropDown.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        init: function() {
            Husky.DEBUG && console.log(this.name, 'init');

            // ------------------------------------------------------------
            // initialization
            // ------------------------------------------------------------

            // bind dom elements
            this.bindDOMEvents();
        },

        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.$element.off();

            // ------------------------------------------------------------
            // DOM events
            // ------------------------------------------------------------

        }


        // ------------------------------------------------------------
        // custom events
        // ------------------------------------------------------------


    });

    $.fn.huskyDropDown = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyDropDown.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.DropDown(this, options));

        return this;
    };

    // ------------------------------------------------------------
    // default values
    // ------------------------------------------------------------
    $.fn.huskyDropDown.defaults = {
        url: '',    // url for lazy loading
        data: []    // data array

    };

})(Husky.$, this, this.document);

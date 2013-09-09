/*****************************************************************************
 *
 *  [Name of the Module]
 *  [Short description]
 *  
 *  Code snippets to replace in template
 *      - "[MyElement]"
 *      - "[CSS Classes]"
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

    var moduleName = 'Husky.Ui.[MyElement]';

    Husky.Ui.[MyElement] = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="[CSS Classes]"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.[MyElement].prototype, Husky.Events, {
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

        },


        // ------------------------------------------------------------
        // custom events
        // ------------------------------------------------------------

        
    });

    $.fn.husky[MyElement] = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.husky[MyElement].defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.[MyElement](this, options));

        return this;
    };

    $.fn.husky[MyElement].defaults = {
        url: '',

        // ------------------------------------------------------------
        // default values
        // ------------------------------------------------------------
    };

})(Husky.$, this, this.document);

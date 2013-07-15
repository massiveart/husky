(function($, window, document, undefined) {
    'use strict';

    Husky.util.ajax = function(options) {
        options = $.extend({
            // default settings
        }, options);

        return $.ajax(options);
    };

})(window.jQuery, window, document);
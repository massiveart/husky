(function($, window, document, undefined) {
    'use strict';

    Husky.Util.ajax = function(options) {
        options = $.extend({
            // default settings
            type: 'GET'
        }, options);

        return $.ajax(options);
    };

})(Husky.$, this, this.document);
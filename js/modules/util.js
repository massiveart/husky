(function($, window, document, undefined) {
    'use strict';

    Husky.Util = {
    	ajax: function(options) {
	        options = $.extend({
	            // default settings
	            type: 'GET'
	        }, options);

	        return $.ajax(options);
	    },

	    // Array functions
	    compare: function(a, b) {
	    	if (typeOf(a) === 'array' && typeOf(b) === 'array') {
	    		return JSON.stringify(a) === JSON.stringify(b);		
	    	}
	    }
    };

})(Husky.$, this, this.document);
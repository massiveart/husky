(function() {

	'use strict';

	if (window.Typeahead) {
		define('typeahead', [], function() {
			return window.Typeahead;
		});
	} else {
		require.config({
			paths: { "typeahead": 'bower_components/typeahead.js/typeahead' },
			shim: { backbone: { deps: ['jquery'] } }
		});
	}

	define(['typeahead'], {
		name: 'typeahead',

		initialize: function(app) {
			app.sandbox.autocomplete = {

				init: function(selector, configs) {
					app.core.dom.$(selector).typeahead(configs);
				}

			};
		}
	});
})();

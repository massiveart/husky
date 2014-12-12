(function() {

    'use strict';

    if (window.Typeahead) {
        define('typeahead', [], function() {
            return window.Typeahead;
        });
    } else {
        require.config({
            paths: { "typeahead": 'bower_components/typeahead.js/typeahead.bundle' },
            shim: { backbone: { deps: ['jquery'] } }
        });
    }

    define(['typeahead'], {
        name: 'typeahead',

        initialize: function(app) {
            app.sandbox.autocomplete = {

                init: function(selector, configs) {
                    var engine = this.createEngine(configs);
                    
                    engine.initialize();

                    return app.core.dom.$(selector).typeahead({
                        highlight: true
                    }, {
                        templates: configs.templates,
                        displayKey: configs.displayKey,
                        source: engine.ttAdapter()
                    });
                },

                createEngine: function(configs) {
                    configs = app.sandbox.util.extend(true, {
                        datumTokenizer: function(d) {
                            return Bloodhound.tokenizers.whitespace(d[configs.displayKey]);
                        },
                        queryTokenizer: Bloodhound.tokenizers.whitespace
                    }, configs);

                    return new Bloodhound(configs);
                },

                setValue: function(selector, value) {
                    return app.core.dom.$(selector).typeahead('val', value);
                }
            };
        }
    });
})();

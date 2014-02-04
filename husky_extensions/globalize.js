(function() {

    'use strict';

    require.config({
        paths: {
            'globalize_lib': 'bower_components/globalize/lib/globalize',
            'cultures': 'bower_components/globalize/lib/cultures'
        }
    });

    define(['globalize_lib'], function() {
        return  {
            name: 'husky-validation',

            initialize: function(app) {
                app.sandbox.globalize = {
                    addCultureInfo: function(cultureName, messages) {
                        Globalize.addCultureInfo(cultureName, {
                            messages: messages
                        });
                    },

                    culture: function(cultureName) {
                        var setLanguage = function() {
                            Globalize.culture(cultureName);
                        };

                        if (cultureName !== 'en') {
                            require(['cultures/globalize.culture.' + cultureName], setLanguage.bind(this));
                        } else {
                            setLanguage();
                        }
                    }
                };

                app.sandbox.translate = function(key) {
                    if (!app.config.culture || !app.config.culture.name) {
                        return key;
                    }
                    var translation = Globalize.localize(key, app.config.culture.name);
                    return !!translation ? translation : key;
                };

                /**
                 * function calls this.sandbox.translate for an array of keys and returns an array of translations
                 * @param array
                 * @returns {Array}
                 */
                app.sandbox.translateArray = function(array) {
                    var translations = [];
                    app.sandbox.util.foreach(array, function(key) {
                        translations.push(app.sandbox.translate(key));
                    }.bind(this));
                    return translations;
                };

                app.setLanguage = function(cultureName, messages) {
                    var setLanguage = function() {
                        Globalize.culture(cultureName);
                        app.sandbox.globalize.addCultureInfo(cultureName, messages);
                    };
                    if (cultureName !== 'en') {
                        require(['cultures/globalize.culture.' + cultureName], setLanguage.bind(this));
                    } else {
                        setLanguage();
                    }
                };
            },

            afterAppStart: function(app) {
                if (!!app.config.culture && !!app.config.culture) {
                    if (!app.config.culture.messages) {
                        app.config.culture.messages = { };
                    }
                    app.setLanguage(app.config.culture.name, app.config.culture.messages);
                }
            }
        };
    });
})();

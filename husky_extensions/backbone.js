(function() {

    if (window.Backbone) {
        define('backbone', [], function() {
            return window.Backbone;
        });
    } else {
        require.config({
            paths: { backbone: 'bower_components/backbone/backbone' },
            shim: { backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] } }
        });
    }

    define(['backbone'], {
        name: 'Backbone',

        initialize: function(app) {
            var core = app.core,
                sandbox = app.sandbox,
                components = app.components;

            core.mvc = require('backbone');

            sandbox.mvc = {};
            sandbox.mvc.View = function(view) {
                return core.mvc.View.extend(view);
            };
            sandbox.mvc.Model = function(model) {
                return core.mvc.Model.extend(model);
            };
            sandbox.mvc.Collection = function(collection) {
                return core.mvc.Collection.extend(collection);
            };

            components.addType('View', sandbox.mvc.View);
        },

        afterAppStart: function(app) {
            app.sandbox.util._.delay(function() {
                if (!app.core.mvc.History.started) {
                    app.core.mvc.history.start();
                }
            }, 500);
        }
    });
})();

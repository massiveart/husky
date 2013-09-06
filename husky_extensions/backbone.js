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
                _ = app.sandbox.util._;

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

            var views = {};

            // Injecting a Backbone view in the Component just before initialization.
            // This View's class will be built and cached this first time the component is included.
            app.components.before('initialize', function(options) {

                if (!this) {
                    throw new Error("Missing context!");
                }

                // check component needs a view
                if (!!this.view) {

                    var View = views[options.ref];

                    if (!View) {
                        var ext = _.pick(this, 'model', 'collection', 'id', 'attributes', 'className', 'tagName', 'events');
                        views[options.ref] = View = sandbox.mvc.View(ext);
                    }
                    this.view = new View({ el: this.$el });
                    this.view.sandbox = this.sandbox;
                }
            });

            app.components.before('remove', function() {

                if (!this) {
                    throw new Error("Missing context!");
                }

                this.view && this.view.stopListening();
            });
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

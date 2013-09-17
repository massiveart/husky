(function() {
    require.config({
        paths: { "validation": 'bower_components/husky-validation/dist/validation' }
    });

    define(['validation'], function(Validation) {
        return  {
            name: 'husky-validation',

            initialize: function(app) {
                app.sandbox.validation = {

                    create: function(selector, options) {
                        return new Validation($(selector), options);
                    },

                    getObject: function(selector) {
                        if (typeof selector === 'string') {
                            return $(selector).data('validation');
                        } else if (typeof selector === 'object') {
                            return selector;
                        } else {
                            throw 'Not supported';
                        }
                    },

                    validate: function(selector, force) {
                        if (!force) force = false;

                        return  app.sandbox.validation.getObject(selector).validate(force);
                    },

                    isValid: function(selector) {
                        return app.sandbox.validation.getObject(selector).isValid();
                    },

                    addConstraint: function(selector, elementSelector, constraintName, options) {
                        app.sandbox.validation.getObject(selector).addConstraint(elementSelector, constraintName, options);
                    },

                    updateConstraint: function(selector, elementSelector, constraintName, options) {
                        app.sandbox.validation.getObject(selector).updateConstraint(elementSelector, constraintName, options);
                    },

                    deleteConstraint: function(selector, elementSelector, constraintName) {
                        app.sandbox.validation.getObject(selector).deleteConstraint(elementSelector, constraintName);
                    },

                    element: {
                        getObject: function(elementSelector) {
                            return $(elementSelector).data('element');
                        },

                        addConstraint: function(elementSelector, constraintName, options) {
                            app.sandbox.validation.element.getObject(elementSelector).addConstraint(constraintName, options);
                        },

                        updateConstraint: function(elementSelector, constraintName, options) {
                            app.sandbox.validation.element.getObject(elementSelector).updateConstraint(constraintName, options);
                        },

                        deleteConstraint: function(elementSelector, constraintName) {
                            app.sandbox.validation.element.getObject(elementSelector).deleteConstraint(constraintName, options);
                        }
                    }

                }
            }
        }
    });
})();

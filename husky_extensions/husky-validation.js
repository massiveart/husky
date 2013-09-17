(function() {
    require.config({
        paths: { "husky-validation": 'bower_components/husky-validation/dist/validation' }
    });

    define(['husky-validation'], function(Validation) {
        return  {
            name: 'husky-validation',

            initialize: function(app) {
                app.core.validate = {

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

                        return  app.core.validate.getObject(selector).validate(force);
                    },

                    isValid: function(selector) {
                        return app.core.validate.getObject(selector).isValid();
                    },

                    addConstraint: function(selector, elementSelector, constraintName, options) {
                        app.core.validate.getObject(selector).addConstraint(elementSelector, constraintName, options);
                    },

                    updateConstraint: function(selector, elementSelector, constraintName, options) {
                        app.core.validate.getObject(selector).updateConstraint(elementSelector, constraintName, options);
                    },

                    deleteConstraint: function(selector, elementSelector, constraintName) {
                        app.core.validate.getObject(selector).deleteConstraint(elementSelector, constraintName);
                    },

                    element: {
                        getObject: function(elementSelector) {
                            return $(elementSelector).data('element');
                        },

                        addConstraint: function(elementSelector, constraintName, options) {
                            app.core.validate.element.getObject(elementSelector).addConstraint(constraintName, options);
                        },

                        updateConstraint: function(elementSelector, constraintName, options) {
                            app.core.validate.element.getObject(elementSelector).updateConstraint(constraintName, options);
                        },

                        deleteConstraint: function(elementSelector, constraintName) {
                            app.core.validate.element.getObject(elementSelector).deleteConstraint(constraintName, options);
                        }
                    }

                }
            }
        }
    });
})();

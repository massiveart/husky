define(function() {

    // simplified backbone model
    var Model = {
        get: function(attr) {
            return this[attr];
        },

        set: function(attr, value) {
            !!value && (this[attr] = value);
            return this;
        }
    };

    return {

        name: 'Model',

        initialize: function(app) {
            app.sandbox.data.Model = Model;
        }

    }
});

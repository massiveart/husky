define([], {

    name: 'Util',

    initialize: function(app) {

        // for comparing arrays
        app.core.util.compare = function(a, b) {
            if (this.typeOf(a) === 'array' && this.typeOf(b) === 'array') {
                return JSON.stringify(a) === JSON.stringify(b);
            }
        },

        // Crockfords better typeof
        app.core.util.typeOf = function(value) {
            var s = typeof value;
            if (s === 'object') {
                if (value) {
                    if (value instanceof Array) {
                        s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }
            return s;
        }

    }
});

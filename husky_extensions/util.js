define(function() {
    Util = {

        // for array functions
        compare: function(a, b) {

            if (this.typeOf(a) === 'array' && this.typeOf(b) === 'array') {
                return JSON.stringify(a) === JSON.stringify(b);
            }
        },

        typeOf: function(value) {
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

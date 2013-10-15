define(function() {

    'use strict';

    return {
        name: 'Util',

        initialize: function(app) {

            // for comparing arrays
            app.core.util.compare = function(a, b) {
                if (this.typeOf(a) === 'array' && this.typeOf(b) === 'array') {
                    return JSON.stringify(a) === JSON.stringify(b);
                }
            };

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
            };

            // cool guy loop implementation of foreach: http://jsperf.com/loops3/2
            app.core.util.foreach = function(array, callbackValue) {
                for (var i = -1, length = array.length; ++i < length;) {
                    callbackValue( array[i]);
                }
            };

            app.core.util.load = function(url) {
                var deferred = new app.sandbox.data.deferred();

                app.logger.log('load', url);

                app.sandbox.util.ajax({
                    url: url,
                    success: function(data) {
                        app.logger.log('data loaded', data);
                        deferred.resolve(data);
                    }.bind(this)
                });

                app.sandbox.emit('husky.util.load.data');

                return deferred.promise();
            };

        }
    };
});

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

            /**
             * cool guy loop implementation of foreach: http://jsperf.com/loops3/2
             * returns -> callback(value, index)
             */
            app.core.util.foreach = function(array, callbackValue) {
                if (array.length && array.length > 0) {
                    for (var i = -1, length = array.length; ++i < length;) {
                        callbackValue(array[i], i);
                    }
                } else {
                    app.sandbox.logger.log('error at util.foreach: no array given');
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
                    }.bind(this),

                    error: function(error) {
                        deferred.reject(error);
                    }
                });

                app.sandbox.emit('husky.util.load.data');

                return deferred.promise();
            };

            app.core.util.contains = function(list, value) {
                return _.contains(list, value);
            };

            app.core.util.uniqueId = function(prefix) {
                return _.uniqueId(prefix);
            };

			app.core.util.template = _.template;
        }
    };
});

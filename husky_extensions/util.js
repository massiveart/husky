define(function() {

    'use strict';

    return {
        name: 'Util',

        initialize: function(app) {

            // for comparing arrays
            app.core.util.compare = function(a, b) {
                if (typeof a === 'object' && typeof b === 'object') {
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
                }
            };

            app.core.util.load = function(url, data) {
                var deferred = new app.sandbox.data.deferred();

                app.logger.log('load', url);

                app.sandbox.util.ajax({
                    url: url,
                    data: data || null,

                    success: function(data, textStatus) {
                        app.logger.log('data loaded', data, textStatus);
                        deferred.resolve(data, textStatus);
                    }.bind(this),

                    error: function(jqXHR, textStatus, error) {
                        deferred.reject(textStatus, error);
                    }
                });

                app.sandbox.emit('husky.util.load.data');

                return deferred.promise();
            };

            app.core.util.save = function(url, type, data) {
                var deferred = new app.sandbox.data.deferred();

                app.logger.log('save', url);

                app.sandbox.util.ajax({

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    url: url,
                    type: type,
                    data: JSON.stringify(data),

                    success: function(data, textStatus) {
                        app.logger.log('data saved', data, textStatus);
                        deferred.resolve(data, textStatus);
                    }.bind(this),

                    error: function(jqXHR, textStatus, error) {
                        deferred.reject(jqXHR, textStatus, error);
                    }
                });

                app.sandbox.emit('husky.util.save.data');

                return deferred.promise();
            };

            app.core.util.cropMiddle = function(text, maxLength, delimiter) {
                var substrLength;

                // return text if it doesn't need to be cropped
                if (!text || text.length <= maxLength) {
                    return text;
                }

                // default delimiter
                if (!delimiter) {
                    delimiter = '...';
                }

                substrLength = Math.floor((maxLength - delimiter.length)/2);
                return text.slice(0, substrLength) + delimiter + text.slice(-substrLength);
            },

            app.core.util.contains = function(list, value) {
                return _.contains(list, value);
            };

            app.core.util.uniqueId = function(prefix) {
                return _.uniqueId(prefix);
            };

            app.core.util.delay = function(delay, callback) {
                return _.delay(delay, callback);
            };

			app.core.util.template = _.template;
        }
    };
});

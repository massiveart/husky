/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
define(function() {

    'use strict';

    return {
        name: 'Util',

        initialize: function(app) {
            /**
             * Replace rules for escape html function
             * @type {{}}
             */
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            };

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

            app.core.util.isEqual = _.isEqual;

            app.core.util.isEmpty = _.isEmpty;

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

            app.core.util.load = function(url, data, dataType) {
                var deferred = new app.sandbox.data.deferred(),
                    settings = {
                        url: url,
                        data: data || null,
                        dataType: 'json',

                        success: function(data, textStatus) {
                            deferred.resolve(data, textStatus);
                        }.bind(this),

                        error: function(jqXHR, textStatus, error) {
                            deferred.reject(textStatus, error);
                        }
                    };

                if (typeof(dataType) !== 'undefined') {
                    settings.dataType = dataType;
                }

                app.sandbox.util.ajax(settings);

                app.sandbox.emit('husky.util.load.data');

                return deferred.promise();
            };

            app.core.util.save = function(url, type, data) {
                var deferred = new app.sandbox.data.deferred();

                app.sandbox.util.ajax({

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    url: url,
                    type: type,
                    data: JSON.stringify(data),

                    success: function(data, textStatus) {
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

                app.core.util.cropFront = function(text, maxLength, delimiter) {
                    if (!text || text.length <= maxLength) {
                        return text;
                    }

                    delimiter = delimiter || '...';

                    return delimiter + text.slice(-(maxLength - delimiter.length));
                },

                app.core.util.cropTail = function(text, maxLength, delimiter) {
                    if (!text || text.length <= maxLength) {
                        return text;
                    }

                    delimiter = delimiter || '...';

                    return text.slice(0, (maxLength - delimiter.length)) + delimiter;
                },

                app.core.util.contains = function(list, value) {
                    return _.contains(list, value);
                };

            app.core.util.isAlphaNumeric = function(str) {
                var code, i, len;

                for (i = 0, len = str.length; i < len; i++) {
                    code = str.charCodeAt(i);
                    if (!(code > 47 && code < 58) && // numeric (0-9)
                        !(code > 64 && code < 91) && // upper alpha (A-Z)
                        !(code > 96 && code < 123)) { // lower alpha (a-z)
                      return false;
                    }
                }
                return true;
            };

            app.core.util.uniqueId = function(prefix) {
                return _.uniqueId(prefix);
            };

            app.core.util.delay = function(delay, callback) {
                return _.delay(delay, callback);
            };

            app.core.util.union = function() {
                return _.union.apply(this, arguments);
            };

            app.core.util.deepCopy = function(object) {
                var parent = {};

                if ($.isArray(object)) {
                    parent = [];
                }
                return $.extend(true, parent, object);
            };

			app.core.util.template = _.template;

            /**
             * Escapes special html character
             * @param string
             * @returns {string}
             */
            app.core.util.escapeHtml = function(string) {
                return String(string).replace(/[&<>"'\/]/g, function(s) {
                    return entityMap[s];
                });
            };
        }
    };
});

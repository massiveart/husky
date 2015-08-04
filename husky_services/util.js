/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function() {

    'use strict';

    var instance = null,

        /**
         * Replace rules for escape html function
         * @type {{}}
         */
        entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

    function Util() {
    }

    // for comparing arrays
    Util.prototype.compare = function(a, b) {
        if (typeof a === 'object' && typeof b === 'object') {
            return JSON.stringify(a) === JSON.stringify(b);
        }
    };

    // Crockfords better typeof
    Util.prototype.typeOf = function(value) {
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

    Util.prototype.isEqual = _.isEqual;

    Util.prototype.isEmpty = _.isEmpty;

    /**
     * cool guy loop implementation of foreach: http://jsperf.com/loops3/2
     * returns -> callback(value, index)
     */
    Util.prototype.foreach = function(array, callbackValue) {
        if (array.length && array.length > 0) {
            for (var i = -1, length = array.length; ++i < length;) {
                callbackValue(array[i], i);
            }
        }
    };

    Util.prototype.load = function(url, data, dataType) {
        var deferred = new $.Deferred(),
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

        this.ajax(settings);

        return deferred.promise();
    };

    Util.prototype.save = function(url, type, data) {
        var deferred = $.Deferred();

        this.ajax({

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

        return deferred.promise();
    };

    Util.prototype.cropMiddle = function(text, maxLength, delimiter) {
        var substrLength;

        // return text if it doesn't need to be cropped
        if (!text || text.length <= maxLength) {
            return text;
        }

        // default delimiter
        if (!delimiter) {
            delimiter = '...';
        }

        substrLength = Math.floor((maxLength - delimiter.length) / 2);
        return text.slice(0, substrLength) + delimiter + text.slice(-substrLength);
    },

        Util.prototype.cropFront = function(text, maxLength, delimiter) {
            if (!text || text.length <= maxLength) {
                return text;
            }

            delimiter = delimiter || '...';

            return delimiter + text.slice(-(maxLength - delimiter.length));
        },

        Util.prototype.cropTail = function(text, maxLength, delimiter) {
            if (!text || text.length <= maxLength) {
                return text;
            }

            delimiter = delimiter || '...';

            return text.slice(0, (maxLength - delimiter.length)) + delimiter;
        },

        Util.prototype.contains = function(list, value) {
            return _.contains(list, value);
        };

    Util.prototype.isAlphaNumeric = function(str) {
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

    Util.prototype.uniqueId = function(prefix) {
        return _.uniqueId(prefix);
    };

    Util.prototype.delay = function(delay, callback) {
        return _.delay(delay, callback);
    };

    Util.prototype.union = function() {
        return _.union.apply(this, arguments);
    };

    Util.prototype.each = $.each;

    Util.prototype.ajax = $.ajax;

    Util.prototype.ajaxError = function(callback) {
        $(document).ajaxError(callback);
    };

    Util.prototype.when = function(deferreds) {
        return $.when(deferreds);
    };

    Util.prototype.deepCopy = function(object) {
        var parent = {};

        if ($.isArray(object)) {
            parent = [];
        }
        return $.extend(true, parent, object);
    };

    /**
     * Returns a parameter value from a given url
     * Found at http://stackoverflow.com/a/901144
     * Has limitations e.g. for parameters like a[asf]=value
     * @param name {string} name of the parameter to search for
     * @param url {string}
     * @returns {string}
     */
    Util.prototype.getParameterByName = function(name, url) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(url);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    Util.prototype.template = _.template;

    /**
     * Escapes special html character
     * @param string
     * @returns {string}
     */
    Util.prototype.escapeHtml = function(string) {
        return String(string).replace(/[&<>"'\/]/g, function(s) {
            return entityMap[s];
        });
    };

    Util.getInstance = function() {
        if (instance == null) {
            instance = new Util();
        }
        return instance;
    };

    return Util.getInstance();
});

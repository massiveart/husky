/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

require.config({
    paths: {
        'sprintf': 'bower_components/sprintf/sprintf'
    }
});

define(['sprintf'], function(sprintf) {

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
        if (!text || text.length <= maxLength || !text.slice) {
            return text;
        }

        // default delimiter
        if (!delimiter) {
            delimiter = '...';
        }

        substrLength = Math.floor((maxLength - delimiter.length) / 2);

        return text.slice(0, substrLength) + delimiter + text.slice(-substrLength);
    };

    Util.prototype.cropFront = function(text, maxLength, delimiter) {
        if (!text || text.length <= maxLength || !text.slice) {
            return text;
        }

        delimiter = delimiter || '...';

        return delimiter + text.slice(-(maxLength - delimiter.length));
    };

    Util.prototype.cropTail = function(text, maxLength, delimiter) {
        if (!text || text.length <= maxLength || !text.slice) {
            return text;
        }

        delimiter = delimiter || '...';

        return text.slice(0, (maxLength - delimiter.length)) + delimiter;
    };

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

    Util.prototype.when = function() {
        return $.when.apply(null, arguments);
    };

    Util.prototype.deepCopy = function(object) {
        var parent = {};

        if ($.isArray(object)) {
            parent = [];
        }

        return $.extend(true, parent, object);
    };

    /**
     * Takes a two dimensional array and returns a given column as a one-dimensional array
     * @param data {Array}
     * @param propertyName {String}
     * @returns {Array}
     */
    Util.prototype.arrayGetColumn = function(data, propertyName) {
        if (Util.prototype.typeOf(data) === 'array' &&
            data.length > 0 &&
            Util.prototype.typeOf(data[0]) === 'object') {
            var values = [];
            Util.prototype.foreach(data, function(el) {
                values.push(el[propertyName]);
            }.bind(this));
            return values;
        } else {
            return data;
        }
    };

    /**
     * Removes elements from one array from another array and returns the result
     * @param array {Array} The array to remove from
     * @param remove {Array} containing the elements which sould be removed
     * @returns {Array}
     */
    Util.prototype.removeFromArray = function(array, remove) {
        return $.grep(array, function(value) {
            return remove.indexOf(value) == -1;
        });
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

    Util.prototype.extend = $.extend;

    Util.prototype.Deferred = $.Deferred;

    Util.prototype.arrayMap = _.map;

    Util.prototype.object = _.object;

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

    /**
     * Makes the first letter uppercase
     * @param string
     * @returns {string}
     */
    Util.prototype.capitalizeFirstLetter = function(string) {
        if (!string.slice) {
            return string;
        }

        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * Returns human readable byte string.
     *
     * @param {int} bytes
     * @returns {String}
     */
    Util.prototype.formatBytes = function(bytes){
        if (bytes === 0) {
            return '0 Byte';
        }
        var k = 1000,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    /**
     * Returns a percentage (0 to 1) on how similar two strings are
     * http://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
     *
     * @param x {String} the first string
     * @param y the {String} second string
     * @returns {number} the percentage on how similar two strings are
     */
    Util.prototype.compareStrings = function(x, y) {
        var simpleCompare = function(a, b) {
            var lengthA = a.length;
            var lengthB = b.length;
            if (lengthA === 0 && lengthB === 0) {
                return 1;
            }
            var equivalency = 0;
            var minLength = (a.length > b.length) ? b.length : a.length;
            var maxLength = (a.length < b.length) ? b.length : a.length;

            for (var i = 0; i < minLength; i++) {
                if (a[i] == b[i]) {
                    equivalency++;
                }
            }

            return equivalency / maxLength;
        };

        // maximum of similarity from front to back and from back to front
        return Math.max(simpleCompare(x,y), simpleCompare(x.split('').reverse().join(''), y.split('').reverse().join('')));
    },

    /**
     * Return a formatted string.
     *
     * @param {String} format
     * @param {String...} arguments
     *
     * @return {String}
     */
    Util.prototype.sprintf = sprintf.sprintf;

    Util.getInstance = function() {
        if (instance == null) {
            instance = new Util();
        }

        return instance;
    };

    return Util.getInstance();
});

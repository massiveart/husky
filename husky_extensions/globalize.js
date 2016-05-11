/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
(function() {

    'use strict';

    require.config({
        paths: {
            'globalize_lib': 'bower_components/globalize/lib/globalize',
            'cultures': 'bower_components/globalize/lib/cultures'
        }
    });

    define(['globalize_lib'], function() {
        var normalizeCultureName = function(cultureName) {
            cultureName = cultureName.replace('_', '-');

            if (cultureName.indexOf('-') > -1) {
                cultureName =
                    cultureName.substring(0, cultureName.indexOf('-')) +
                    cultureName.substring(cultureName.indexOf('-'), cultureName.length).toUpperCase();
            }

            return cultureName;
        };

        return  {
            name: 'husky-validation',

            initialize: function(app) {
                app.sandbox.globalize = {
                    addCultureInfo: function(cultureName, messages) {
                        Globalize.addCultureInfo(cultureName, {
                            messages: messages
                        });
                    },

                    getLocale: function() {
                        return Globalize.culture().name;
                    },
                    getDatePattern: function() {
                        return Globalize.culture().calendar.patterns.d;
                    },
                    getTimePatter: function() {
                        return Globalize.culture().calendar.patterns.t;
                    },
                    setCurrency: function(symbol) {
                        Globalize.culture().numberFormat.currency.symbol = symbol;
                    }
                };

                app.sandbox.translate = function(key) {
                    var translation;
                    if (!app.config.culture || !Globalize.culture().name) {
                        return key;
                    }

                    try {
                        translation = Globalize.localize(key, Globalize.culture().name);
                    } catch (e) {
                        app.logger.warn('Globalize threw an error when translating key "' + key + '", failling back to key. Error: ' + e);
                        return key;
                    }

                    return (!!translation || translation === '') ? translation : key;
                };

                app.sandbox.date = {
                    /**
                     * returns formatted date string
                     * @param {string|Date} date
                     * @param {Boolean} returnDateAndTime
                     * @returns {string}
                     */
                    format: function(date, returnDateAndTime) {
                        var returnDate, returnTime;
                        if(typeof date === 'string'){
                            date = this.parse(date);
                        }

                        returnDate = Globalize.format(date, Globalize.culture().calendar.patterns.d);
                        if (returnDateAndTime === true) {
                            returnTime = Globalize.format(date, Globalize.culture().calendar.patterns.t);
                        }

                        return ( (!!returnDate) ? returnDate : '' ) +
                               ( (!!returnDate && !!returnTime) ? ' ': '' ) +
                               ( (!!returnTime) ? returnTime : '' );
                    },

                    /**
                     * parse ISO8601 string : string -> Date
                     * Parse an ISO-8601 date, including possible timezone,
                     * into a Javascript Date object.
                     * (inspired by: http://stackoverflow.com/questions/439630/how-do-you-create-a-javascript-date-object-with-a-set-timezone-without-using-a-s)
                     *
                     * Test strings: parseISO8601String(x).toISOString()
                     * "2013-01-31T12:34"              -> "2013-01-31T12:34:00.000Z"
                     * "2013-01-31T12:34:56"           -> "2013-01-31T12:34:56.000Z"
                     * "2013-01-31T12:34:56.78"        -> "2013-01-31T12:34:56.780Z"
                     * "2013-01-31T12:34:56.78+0100"   -> "2013-01-31T11:34:56.780Z"
                     * "2013-01-31T12:34:56.78+0530"   -> "2013-01-31T07:04:56.780Z"
                     * "2013-01-31T12:34:56.78-0330"   -> "2013-01-31T16:04:56.780Z"
                     * "2013-01-31T12:34:56-0330"      -> "2013-01-31T16:04:56.000Z"
                     * "2013-01-31T12:34:56Z"          -> "2013-01-31T12:34:56.000Z"
                     *
                     * @param {string} dateString
                     * @returns {Date}
                     */
                    parse: function(dateString) {
                        var timebitsRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/,
                            timebits = timebitsRegex.exec(dateString),
                            resultDate, utcdate, offsetMinutes;

                        if (timebits) {
                            utcdate = Date.UTC(parseInt(timebits[1]),
                                parseInt(timebits[2]) - 1, // months are zero-offset (!)
                                parseInt(timebits[3]),
                                parseInt(timebits[4]), parseInt(timebits[5]), // hh:mm
                                (timebits[6] && parseInt(timebits[6]) || 0),  // optional seconds
                                (timebits[7] && parseFloat(timebits[7]) * 1000) || 0); // optional fraction
                            // utcdate is milliseconds since the epoch
                            if (timebits[9] && timebits[10]) {
                                offsetMinutes = parseInt(timebits[9]) * 60 + parseInt(timebits[10]);
                                utcdate += (timebits[8] === '+' ? -1 : +1) * offsetMinutes * 60000;
                            }
                            resultDate = new Date(utcdate);
                        } else {
                            resultDate = null;
                        }
                        return resultDate;
                    }
                };

                /**
                 * function calls this.sandbox.translate for an array of keys and returns an array of translations
                 * @param array
                 * @returns {Array}
                 */
                app.sandbox.translateArray = function(array) {
                    var translations = [];
                    app.sandbox.util.foreach(array, function(key) {
                        translations.push(app.sandbox.translate(key));
                    }.bind(this));
                    return translations;
                };

                /**
                 * formats a number; calls Globalize.format (see globalize documentation for any details)
                 *  https://github.com/jquery/globalize/tree/v0.1.1#numbers
                 * @param number
                 * @param types Possible types: n (number), d (decimal-digits), p (percentage), c (currency)
                 */
                app.sandbox.numberFormat = function(number, types) {
                    return Globalize.format(number, types);
                };

                /**
                 * Parses a float value according to the given culture
                 * @param value
                 * @param radix default 10
                 * @param culture current culture if no culture given
                 * @returns {*}
                 */
                app.sandbox.parseFloat = function(value, radix, culture) {
                    return Globalize.parseFloat(value, radix, culture);
                };

                /**
                 * Set culture with given name and messages
                 *
                 * @param cultureName
                 * @param messages
                 * @param defaultMessages will be used as fallback messages
                 */
                app.setLanguage = function(cultureName, messages, defaultMessages) {
                    cultureName = normalizeCultureName(cultureName);

                    Globalize.culture(cultureName);

                    app.sandbox.globalize.addCultureInfo(cultureName, messages);
                    app.sandbox.globalize.addCultureInfo('default', defaultMessages);
                };
            },

            afterAppStart: function(app) {
                if (!!app.config.culture && !!app.config.culture) {
                    if (!app.config.culture.messages) {
                        app.config.culture.messages = {};
                    }

                    app.setLanguage(
                        app.config.culture.name,
                        app.config.culture.messages,
                        app.config.culture.defaultMessages
                    );
                }

                app.sandbox.globalize.setCurrency('');
            }
        };
    });
})();

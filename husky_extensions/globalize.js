(function() {

    'use strict';

    require.config({
        paths: {
            'globalize_lib': 'bower_components/globalize/lib/globalize',
            'cultures': 'bower_components/globalize/lib/cultures'
        }
    });

    define(['globalize_lib'], function() {
        return  {
            name: 'husky-validation',

            initialize: function(app) {
                app.sandbox.globalize = {
                    addCultureInfo: function(cultureName, messages) {
                        Globalize.addCultureInfo(cultureName, {
                            messages: messages
                        });
                    },

                    culture: function(cultureName) {
                        var setLanguage = function() {
                            Globalize.culture(cultureName);
                        };

                        if (cultureName !== 'en') {
                            require(['cultures/globalize.culture.' + cultureName], setLanguage.bind(this));
                        } else {
                            setLanguage();
                        }
                    }
                };

                app.sandbox.translate = function(key) {
                    if (!app.config.culture || !app.config.culture.name) {
                        return key;
                    }
                    var translation = Globalize.localize(key, app.config.culture.name);
                    return !!translation ? translation : key;
                };

                app.sandbox.date = {
                    /**
                     * returns formatted date string
                     * @param {string|Date} date
                     * @returns {string}
                     */
                    format: function(date) {
                        var returnDate, returnTime;
                        if(typeof date === 'string'){
                            date = this.parse(date);
                        }

                        returnDate = Globalize.format(date, Globalize.culture().calendar.patterns.d);
                        returnTime = Globalize.format(date, Globalize.culture().calendar.patterns.t);

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

                app.setLanguage = function(cultureName, messages) {
                    var setLanguage = function() {
                        Globalize.culture(cultureName);
                        app.sandbox.globalize.addCultureInfo(cultureName, messages);
                    };
                    if (cultureName !== 'en') {
                        require(['cultures/globalize.culture.' + cultureName], setLanguage.bind(this));
                    } else {
                        setLanguage();
                    }
                };
            },

            afterAppStart: function(app) {
                if (!!app.config.culture && !!app.config.culture) {
                    if (!app.config.culture.messages) {
                        app.config.culture.messages = { };
                    }
                    app.setLanguage(app.config.culture.name, app.config.culture.messages);
                }
            }
        };
    });
})();

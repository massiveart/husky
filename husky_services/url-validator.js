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

    var constants = {
            regex: "(?:\\S+(?::\\S*)?@)?(?:(?!10(?:\\.\\d{1,3}){3})(?!127(?:\\.\\d{1,3}){3})(?!169\\.254(?:\\.\\d{1,3}){2})(?!192\\.168(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00A1-\\uFFFF0-9]+-?)*[a-z\\u00A1-\\uFFFF0-9]+)(?:\\.(?:[a-z\\u00A1-\\uFFFF0-9]+-?)*[a-z\\u00A1-\\uFFFF0-9]+)*(?:\\.(?:[a-z\\u00A1-\\uFFFF]{2,})))(?::\\d{2,5})?(?:\/[^\\s]*)?",
            regexOptions: 'im',
            defaultProtocols: ['http://', 'https://', 'ftp://', 'ftps://'],
            specificPartKey: 4,
            schemeKey: 1,
            urlKey: 0
        },

        getRegexp = function(schemes) {
            var schemeNames = _.map(schemes, function(scheme) {
                    return scheme.replace('://', '');
                }),
                hasSameScheme = schemes.indexOf('//') > -1,
                schemeRegex = [
                    (hasSameScheme ? '((' : '('),
                    schemeNames.join('|'),
                    (hasSameScheme ? '):)?' : '):'),
                    '\\/{2}'
                ].join(''),
                regexParts = [];

            regexParts.push('^(');
            if (schemes.length > 0) {
                regexParts.push(schemeRegex);
                regexParts.push(')(');
            }
            regexParts.push(constants.regex);
            regexParts.push(')$');

            return new RegExp(regexParts.join(''), constants.regexOptions);
        };

    function Validator() {
    }

    /**
     * Returns default schemes.
     *
     * @returns {Array}
     */
    Validator.prototype.getDefaultSchemes = function() {
        return constants.defaultProtocols;
    };

    /**
     * Tests given URL against internal regex.
     *
     * @param {String} url
     * @param {Array} schemes if NULL default schemes will be used
     *
     * @returns {Boolean}
     */
    Validator.prototype.test = function(url, schemes) {
        if (!schemes) {
            schemes = this.getDefaultSchemes();
        }

        return getRegexp(schemes).test(url);
    };

    /**
     * Returns parts of URL.
     *
     * @param {String} url
     * @param {Array} schemes if NULL default schemes will be used
     *
     * @returns {{url, scheme, specificPart}}
     */
    Validator.prototype.match = function(url, schemes) {
        if (!schemes) {
            schemes = this.getDefaultSchemes();
        }

        var match = url.match(getRegexp(schemes));

        if (!match) {
            return match;
        }

        return {
            scheme: match[constants.schemeKey],
            specificPart: match[constants.specificPartKey]
        };
    };

    return new Validator();
});

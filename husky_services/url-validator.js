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
            regex: "([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*",
            defaultProtocols: ['http://', 'https://', 'ftp://', 'ftps://'],
            specificPartKey: 2,
            schemeKey: 1,
            urlKey: 0
        },

        getRegexp = function(schemes) {
            return new RegExp('^(' + schemes.join('|') + ')(' + constants.regex + ')$');
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
            url: match[constants.urlKey],
            scheme: match[constants.schemeKey],
            specificPart: match[constants.specificPartKey]
        };
    };

    return new Validator();
});

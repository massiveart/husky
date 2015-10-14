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
            regex: "(([0-9a-z_-]+\\.)+(aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mn|mo|mp|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|nom|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ra|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|arpa|lo)(:[0-9]+)?((\\/([~0-9a-zA-Z\\#\\+\\%@\\.\\/_:-]+))?(\\?[0-9a-zA-Z\\+\\%@\\/&\\[\\];=_:-]+)?)?)",
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
                ].join('');

            return new RegExp(
                [
                    '^(',
                    schemeRegex,
                    ')(',
                    constants.regex,
                    ')$'
                ].join(''),
                constants.regexOptions
            );
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

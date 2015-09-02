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

    var instance = null;

    function Translator() {}

    Translator.getInstance = function() {
        if (instance == null) {
            instance = new Translator();
        }
        return instance;
    };

    Translator.prototype.translate = window.Husky.translate;

    return Translator.getInstance();
});

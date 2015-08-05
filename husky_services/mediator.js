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

    function Mediator() {}

    Mediator.getInstance = function() {
        if (instance == null) {
            instance = new Mediator();
        }
        return instance;
    };

    Mediator.prototype.on = window.Husky.on;

    Mediator.prototype.once = window.Husky.once;

    Mediator.prototype.off = window.Husky.off;

    Mediator.prototype.emit = window.Husky.emit;

    return Mediator.getInstance();
});

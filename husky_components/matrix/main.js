/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART Webservices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function(){
    'use strict';

    var sandbox;

    return {
        initialize: function() {
            sandbox = this.sandbox;

            this.$element = sandbox.dom.createElement('<div class="husky-matrix"/>');
            sandbox.dom.append(this.$el, this.$element);
        }
    };
});
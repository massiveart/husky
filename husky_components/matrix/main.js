/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART Webservices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function() {
    'use strict';

    var sandbox;

    return {
        initialize: function() {
            sandbox = this.sandbox;

            this.$element = sandbox.dom.createElement('<div class="husky-matrix"/>');

            this.prepare();

            sandbox.dom.append(this.$el, this.$element);
        },

        prepare: function() {
            this.$element.append(this.prepareTable());
        },

        prepareTable: function() {
            var $table;

            $table = sandbox.dom.createElement('<table class="table"/>');

            this.options.captions.vertical.forEach(function(caption) {
                var $tr = sandbox.dom.createElement('<tr/>');
                var $td = sandbox.dom.createElement('<td/>');
                sandbox.dom.html($td, caption);
                sandbox.dom.append($tr, $td);
                sandbox.dom.append($table, $tr);
            });

            return $table;
        }
    };
});
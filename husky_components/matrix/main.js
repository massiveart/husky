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
            sandbox.dom.append($table, this.prepareTableHead());

            if (!!this.options.captions.vertical) {
                sandbox.dom.append($table, this.prepareTableBody());
            }


            return $table;
        },

        prepareTableHead: function() {
            var $thead = sandbox.dom.createElement('<thead/>'),
                $tr = sandbox.dom.createElement('<tr/>'),
                $th = sandbox.dom.createElement('<th/>');

            sandbox.dom.html($th, this.options.captions.type);

            sandbox.dom.append($tr, $th);
            sandbox.dom.append($thead, $tr);

            return $thead;
        },

        prepareTableBody: function() {
            var $tbody = sandbox.dom.createElement('<tbody/>');

            // insert vertical headlines as first element
            this.options.captions.vertical.forEach(function(caption) {
                var $tr = sandbox.dom.createElement('<tr/>'),
                    $td = sandbox.dom.createElement('<td/>');
                sandbox.dom.html($td, caption);
                sandbox.dom.append($tr, $td);
                sandbox.dom.append($tbody, $tr);
            });

            return $tbody;
        }
    };
});
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
                $thType = sandbox.dom.createElement('<th/>');

            sandbox.dom.html($thType, this.options.captions.type);

            sandbox.dom.append($tr, $thType);

            if (typeof(this.options.captions.horizontal) === 'string') {
                var $th = sandbox.dom.createElement('<th/>', {colspan: this.options.values.length});
                sandbox.dom.html($th, this.options.captions.horizontal);
                sandbox.dom.append($tr, $th);
            } else {
                this.options.captions.horizontal.forEach(function(caption) {
                    var $th = sandbox.dom.createElement('<th/>');
                    sandbox.dom.html($th, caption);
                    sandbox.dom.append($tr, $th);
                });
            }

            // add empty th for all link
            sandbox.dom.append($tr, sandbox.dom.createElement('<th/>'));

            sandbox.dom.append($thead, $tr);

            return $thead;
        },

        prepareTableBody: function() {
            var $tbody = sandbox.dom.createElement('<tbody/>');

            this.options.captions.vertical.forEach(function(caption) {
                // insert vertical headlines as first element
                var $tr = sandbox.dom.createElement('<tr/>'),
                    $tdHead = sandbox.dom.createElement('<td/>'),
                    $tdAll = sandbox.dom.createElement('<td/>');
                sandbox.dom.html($tdHead, caption);
                sandbox.dom.append($tr, $tdHead);

                // insert values of matrix
                this.options.values.forEach(function(value) {
                    var $tdValue = sandbox.dom.createElement('<td/>');
                    sandbox.dom.html($tdValue, value);
                    sandbox.dom.append($tr, $tdValue);
                });

                //add all link
                sandbox.dom.html($tdAll, 'All');
                sandbox.dom.append($tr, $tdAll);

                sandbox.dom.append($tbody, $tr);
            }.bind(this));

            return $tbody;
        }
    };
});
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

    var sandbox,
        activeClass = 'is-active';

    return {
        initialize: function() {
            sandbox = this.sandbox;

            this.$element = sandbox.dom.createElement('<div class="husky-matrix"/>');

            this.prepare();

            sandbox.dom.append(this.$el, this.$element);

            this.bindDOMEvents();
        },

        bindDOMEvents: function() {
            sandbox.dom.on(this.$element, 'click', 'tbody > tr span[class^="icon-"]', this.toggleIcon.bind(this));
            sandbox.dom.on(this.$element, 'click', 'tbody > tr > td:last-child', this.setRowActive.bind(this));
        },

        toggleIcon: function(event) {
            var $target = event.currentTarget;
            sandbox.dom.toggleClass($target, activeClass);

            // TODO emit events for communication with the outside
        },

        setRowActive: function(event) {
            var $tr = sandbox.dom.parent(event.currentTarget),
                $elements = sandbox.dom.find('span[class^="icon-"]', $tr);
            sandbox.dom.addClass($elements, activeClass);
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
                // insert a header for all values, if the horizontal caption is a string
                var $th = sandbox.dom.createElement('<th/>', {colspan: this.options.values.length});
                sandbox.dom.html($th, this.options.captions.horizontal);
                sandbox.dom.append($tr, $th);
            } else {
                // insert the corresponding headers, if the horizontal caption is an array
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
                    var $tdValue = sandbox.dom.createElement('<td/>'),
                        $span = sandbox.dom.createElement('<span class="icon-' + value + '"/>');
                    sandbox.dom.append($tdValue, $span);
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
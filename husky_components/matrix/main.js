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
            this.bindCustomEvents();
        },

        bindDOMEvents: function() {
            sandbox.dom.on(this.$element, 'click', this.toggleIcon.bind(this), 'tbody > tr > td:has(span[class^="icon-"])');
            sandbox.dom.on(this.$element, 'click', this.setRowActive.bind(this), 'tbody > tr > td:last-child');
        },

        bindCustomEvents: function() {
            sandbox.on('husky.matrix.set-all', this.setAllActive.bind(this));
            sandbox.on('husky.matrix.unset-all', this.unsetAllActive.bind(this));
        },

        toggleIcon: function(event) {
            var $target = event.currentTarget;
            $target = sandbox.dom.find('span[class^="icon-"]', $target);
            sandbox.dom.toggleClass($target, activeClass);

            // emit events for communication with the outside
            sandbox.emit('husky.matrix.changed', {
                section: sandbox.dom.data($target, 'section'),
                value: sandbox.dom.data($target, 'value'),
                activated: sandbox.dom.hasClass($target, activeClass)
            });
        },

        setRowActive: function(event) {
            var $tr = sandbox.dom.parent(event.currentTarget),
                $targets = sandbox.dom.find('span[class^="icon-"]', $tr);
            sandbox.dom.addClass($targets, activeClass);

            // emit events for communication with the outside
            sandbox.emit('husky.matrix.changed', {
                section: sandbox.dom.data($targets, 'section'),
                value: this.options.values.horizontal,
                activated: true
            });
        },

        setAllActive: function() {
            var $targets = sandbox.dom.find('span[class^="icon-"]', this.$element),
                $trs = sandbox.dom.find('tbody > tr', this.$element);
            sandbox.dom.addClass($targets, activeClass);

            // emit events for communication with the outsite
            sandbox.dom.each($trs, function(key, $tr) {
                sandbox.emit('husky.matrix.changed', {
                    section: sandbox.dom.data(sandbox.dom.find('td.section', $tr), 'section'),
                    value: this.options.values.horizontal,
                    activated: true
                });
            }.bind(this));
        },

        unsetAllActive: function() {
            var $targets = sandbox.dom.find('span[class^="icon-"]', this.$element),
                $trs = sandbox.dom.find('tbody > tr', this.$element);
            sandbox.dom.removeClass($targets, activeClass);

            // emit events for communication with the outsite
            sandbox.dom.each($trs, function(key, $tr) {
                sandbox.emit('husky.matrix.changed', {
                    section: sandbox.dom.data(sandbox.dom.find('td.section', $tr), 'section'),
                    value: this.options.values.horizontal,
                    activated: false
                });
            }.bind(this));
        },

        prepare: function() {
            this.$element.append(this.prepareTable());
        },

        prepareTable: function() {
            var $table;

            $table = sandbox.dom.createElement('<table class="table matrix"/>');
            sandbox.dom.append($table, this.prepareTableHead());

            if (!!this.options.captions.vertical) {
                sandbox.dom.append($table, this.prepareTableBody());
            }

            return $table;
        },

        prepareTableHead: function() {
            var $thead = sandbox.dom.createElement('<thead/>'),
                $tr = sandbox.dom.createElement('<tr/>'),
                $thSection = sandbox.dom.createElement('<th class="section"/>'),
                $thGeneral, $th;

            if (!!this.options.captions.general) {
                $thGeneral = sandbox.dom.createElement('<th class="general"/>');
                sandbox.dom.html($thGeneral, this.options.captions.general);
                sandbox.dom.append($tr, $thGeneral);
            }

            sandbox.dom.html($thSection, this.options.captions.type);

            sandbox.dom.append($tr, $thSection);

            if (typeof(this.options.captions.horizontal) === 'string') {
                // insert a header for all values, if the horizontal caption is a string
                $th = sandbox.dom.createElement('<th/>', {colspan: this.options.values.horizontal.length});
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
            var $tbody = sandbox.dom.createElement('<tbody/>'),
                i, $tr, $tdHead, $tdAll,
                j, $tdValue, $span, title;

            for (i = 0; i < this.options.captions.vertical.length; i++) {
                $tr = sandbox.dom.createElement('<tr/>');
                $tdHead = sandbox.dom.createElement('<td class="section"/>');
                $tdAll = sandbox.dom.createElement('<td class="all"/>');

                // insert empty line, if there is a general caption
                if (!!this.options.captions.general) {
                    sandbox.dom.append($tr, sandbox.dom.createElement('<td/>'));
                }

                // insert vertical headlines as first element
                sandbox.dom.html($tdHead, this.options.captions.vertical[i]);
                sandbox.dom.data($tdHead, 'section', this.options.values.vertical[i]);
                sandbox.dom.append($tr, $tdHead);

                // insert values of matrix
                for (j = 0; j < this.options.values.horizontal.length; j++) {
                    $tdValue = sandbox.dom.createElement('<td class="value"/>');

                    if (this.options.values.titles) {
                        title = 'title="'+this.options.values.titles[j]+'"';
                    } else {
                        title='';
                    }
                    $span = sandbox.dom.createElement(
                        '<span '+title+' class="icon-' + this.options.values.horizontal[j] + ' pointer"/>'
                    );
                    sandbox.dom.data($span, 'value', this.options.values.horizontal[j]);
                    sandbox.dom.data($span, 'section', this.options.values.vertical[i]);

                    // set activated if set in delivered data
                    if (!!this.options.data[i][j]) {
                        sandbox.dom.addClass($span, activeClass);
                    }

                    sandbox.dom.append($tdValue, $span);
                    sandbox.dom.append($tr, $tdValue);
                }

                //add all link
                sandbox.dom.html($tdAll, '<span class="pointer">'+this.options.captions.all+'</span>');
                sandbox.dom.append($tr, $tdAll);

                sandbox.dom.append($tbody, $tr);
            }

            return $tbody;
        }
    };
});

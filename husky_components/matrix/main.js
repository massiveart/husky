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

    var activeClass = 'is-active',
        selectButtonSelector = 'td:last-child > span:last-child';

    return {
        initialize: function() {
            this.$element = this.sandbox.dom.createElement('<div class="husky-matrix"/>');

            this.prepare();

            this.sandbox.dom.append(this.$el, this.$element);

            this.bindDOMEvents();
            this.bindCustomEvents();
        },

        bindDOMEvents: function() {
            this.sandbox.dom.on(
                this.$element,
                'click',
                this.toggleIcon.bind(this),
                'tbody > tr > td.value > span[class^="fa-"]'
            );
            this.sandbox.dom.on(this.$element, 'click', this.toggleRow.bind(this), selectButtonSelector);
        },

        bindCustomEvents: function() {
            this.sandbox.on('husky.matrix.set-all', this.setAllActive.bind(this));
            this.sandbox.on('husky.matrix.unset-all', this.unsetAllActive.bind(this));
        },

        toggleIcon: function(event) {
            var $target = event.currentTarget,
                $td = this.sandbox.dom.parent($target),
                $tr = this.sandbox.dom.parent($td),
                $allTargets = this.sandbox.dom.find('span[class^="fa-"]', $td),
                $activeTargets,
                $link = this.sandbox.dom.find(selectButtonSelector, $tr);

            this.sandbox.dom.toggleClass($target, activeClass);

            $activeTargets = this.sandbox.dom.find('span[class^="fa-"].' + activeClass, $td);
            if ($activeTargets.length == 0) {
                this.sandbox.dom.html($link, this.options.captions.all);
            } else {
                this.sandbox.dom.html($link, this.options.captions.none);
            }

            // emit events for communication with the outside
            this.sandbox.emit('husky.matrix.changed', {
                section: this.sandbox.dom.data($target, 'section'),
                value: this.sandbox.dom.data($target, 'value'),
                activated: this.sandbox.dom.hasClass($target, activeClass)
            });
        },

        toggleRow: function(event) {
            var $tr = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget)),
                $targets = this.sandbox.dom.find('span[class^="fa-"]', $tr),
                $activeTargets = this.sandbox.dom.find('span[class^="fa-"].' + activeClass, $tr),
                $link = this.sandbox.dom.find(selectButtonSelector, $tr), activated;

            if ($activeTargets.length == 0) {
                this.sandbox.dom.addClass($targets, activeClass);
                this.sandbox.dom.html($link, this.options.captions.none);
                activated = true;
            } else {
                this.sandbox.dom.removeClass($targets, activeClass);
                this.sandbox.dom.html($link, this.options.captions.all);
                activated = false;
            }

            // emit events for communication with the outside
            this.sandbox.emit('husky.matrix.changed', {
                section: this.sandbox.dom.data($targets, 'section'),
                value: this.options.values.horizontal[$tr.data('row-count')],
                activated: activated
            });
        },

        setAllActive: function() {
            var $targets = this.sandbox.dom.find('span[class^="fa-"]', this.$element),
                $trs = this.sandbox.dom.find('tbody > tr', this.$element);
            this.sandbox.dom.addClass($targets, activeClass);

            // emit events for communication with the outside
            this.sandbox.dom.each($trs, function(key, tr) {
                var $link = this.sandbox.dom.find(selectButtonSelector, tr);
                this.sandbox.dom.html($link, this.options.captions.none);
                this.sandbox.emit('husky.matrix.changed', {
                    section: this.sandbox.dom.data(this.sandbox.dom.find('td.section', tr), 'section'),
                    value: this.options.values.horizontal[$(tr).data('row-count')],
                    activated: true
                });
            }.bind(this));
        },

        unsetAllActive: function() {
            var $targets = this.sandbox.dom.find('span[class^="fa-"]', this.$element),
                $trs = this.sandbox.dom.find('tbody > tr', this.$element);
            this.sandbox.dom.removeClass($targets, activeClass);

            // emit events for communication with the outsite
            this.sandbox.dom.each($trs, function(key, tr) {
                var $link = this.sandbox.dom.find(selectButtonSelector, tr);
                this.sandbox.dom.html($link, this.options.captions.all);
                this.sandbox.emit('husky.matrix.changed', {
                    section: this.sandbox.dom.data(this.sandbox.dom.find('td.section', tr), 'section'),
                    value: this.options.values.horizontal[$(tr).data('row-count')],
                    activated: false
                });
            }.bind(this));
        },

        prepare: function() {
            this.$element.append(this.prepareTable());
        },

        prepareTable: function() {
            var $table;

            $table = this.sandbox.dom.createElement('<table class="table matrix"/>');
            this.sandbox.dom.append($table, this.prepareTableHead());

            if (!!this.options.captions.vertical) {
                this.sandbox.dom.append($table, this.prepareTableBody());
            }

            return $table;
        },

        prepareTableHead: function() {
            var $thead = this.sandbox.dom.createElement('<thead/>'),
                $tr = this.sandbox.dom.createElement('<tr/>'),
                $thSection = this.sandbox.dom.createElement('<th class="section"/>'),
                $thGeneral, $th;

            if (!!this.options.captions.general) {
                $thGeneral = this.sandbox.dom.createElement('<th class="general"/>');
                this.sandbox.dom.html($thGeneral, this.options.captions.general);
                this.sandbox.dom.append($tr, $thGeneral);
            }

            this.sandbox.dom.html($thSection, this.options.captions.type);

            this.sandbox.dom.append($tr, $thSection);

            if (typeof(this.options.captions.horizontal) === 'string') {
                // insert a header for all values, if the horizontal caption is a string
                $th = this.sandbox.dom.createElement('<th/>');
                this.sandbox.dom.html($th, this.options.captions.horizontal);
                this.sandbox.dom.append($tr, $th);
            } else {
                // insert the corresponding headers, if the horizontal caption is an array
                this.options.captions.horizontal.forEach(function(caption) {
                    var $th = this.sandbox.dom.createElement('<th/>');
                    this.sandbox.dom.html($th, caption);
                    this.sandbox.dom.append($tr, $th);
                }.bind(this));
            }

            this.sandbox.dom.append($thead, $tr);

            return $thead;
        },

        prepareTableBody: function() {
            var $tbody = this.sandbox.dom.createElement('<tbody/>'),
                rowCount;

            for (rowCount = 0; rowCount < this.options.captions.vertical.length; rowCount++) {
                this.prepareTableRow($tbody, rowCount);
            }

            return $tbody;
        },

        prepareTableRow: function($tbody, rowCount) {
            var $tr = this.sandbox.dom.createElement('<tr/>'),
                $tdHead = this.sandbox.dom.createElement('<td class="section"/>'),
                $tdValue = this.sandbox.dom.createElement('<td class="value"></td>'),
                someActive;

            $tr.data('row-count', rowCount);

            // insert empty line, if there is a general caption
            if (!!this.options.captions.general) {
                this.sandbox.dom.append($tr, this.sandbox.dom.createElement('<td/>'));
            }

            // insert vertical headlines as first element
            this.sandbox.dom.html($tdHead, this.options.captions.vertical[rowCount]);
            this.sandbox.dom.data($tdHead, 'section', this.options.values.vertical[rowCount]);
            this.sandbox.dom.append($tr, $tdHead);

            // flag for checking if every flag is false
            // insert values of matrix
            someActive = this.prepareTableColumn(
                $tdValue,
                this.options.values.horizontal[rowCount],
                this.options.values.vertical[rowCount],
                this.options.data[rowCount]
            );

            this.sandbox.dom.append($tr, $tdValue);

            //add all link
                $tdValue.append(
                    [   '<span class="all pointer">',
                        (!!someActive) ? this.options.captions.none : this.options.captions.all,
                        '</span>'
                    ].join('')
                );
            this.sandbox.dom.append($tr, $tdValue);

            this.sandbox.dom.append($tbody, $tr);
        },

        prepareTableColumn: function($tdValue, columnData, section, value) {
            var someActive = false,
                title,
                $span,
                i;

            for (i = 0; i < columnData.length; i++) {
                if (columnData[i].title) {
                    title = 'title="' + this.sandbox.translate(columnData[i].title) + '"';
                } else {
                    title = '';
                }
                $span = this.sandbox.dom.createElement(
                    '<span ' + title +
                    ' class="fa-' + columnData[i].icon + ' matrix-icon pointer"/>'
                );
                this.sandbox.dom.data($span, 'value', columnData[i].value);
                this.sandbox.dom.data($span, 'section', section);

                // set activated if set in delivered data
                if (!!value && !!value[i]) {
                    this.sandbox.dom.addClass($span, activeClass);
                    someActive = true;
                }

                this.sandbox.dom.append($tdValue, $span);
            }

            return someActive;
        }
    };
});

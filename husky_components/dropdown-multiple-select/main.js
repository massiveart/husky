/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: dropdown multiple select
 * Options:
 *      data: [],  array of data [string, object]
 *      valueName: name of property which should be used
 *      instanceName: instance name of this component
 *      defaultLabel: default label which gets displayed
 *      checkedAllLabel: Label if all checked
 *      singleSelect: allows only one element to be selected
 *      noDeselect: disables the possibility to deselect items
 *
 * Provided Events:
 * husky.dropdown.multiple.select.<<instanceName>>.selected.item   - triggered when item selected
 * husky.dropdown.multiple.select.<<instanceName>>.deselected.item   - triggered when item deselected

 *
 * Use Events
 * husky.dropdown.multiple.select.<<instanceName>>.toggle     - toggles (show/hide) dropdown menu
 * husky.dropdown.multiple.select.<<instanceName>>.show       - show dropdown menu
 * husky.dropdown.multiple.select.<<instanceName>>.hide       - hide dropdown menu
 * husky.dropdown.multiple.select.<<instanceName>>.initialize - initialize component
 */

define([], function() {

    'use strict';

    var defaults = {
        data: [],                         // data array
        valueName: 'name',                // name of text property
        instanceName: 'undefined',        // instance name
        defaultLabel: 'Please choose',    // default label which gets displayed
        checkedAllLabel: 'All Languages', // Label if all checked
        preSelectedElements: [],          // Elements selected by default
        singleSelect: false,              // Allows only one element to be selected
        noDeselect: false,                // Disables the possibility to deselect items
        disabled: false,                  //if true button is disabled
        disabledClass: 'disabled'         //class to add to the button
    };


    return {

        initialize: function() {

            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.selectedElements = [];
            this.selectedElementsValues = [];
            this.dropdownVisible = false;

            this.labelId = 'husky-dropdown-multiple-select-' + this.options.instanceName + '-label';
            this.listId = 'husky-dropdown-multiple-select-' + this.options.instanceName + '-list';
            this.dropdownContainerId = 'husky-dropdown-multiple-select-' + this.options.instanceName + '-menu';

            this.render();
            this.sandbox.emit(this.getEventName('initialize'));
        },

        render: function() {

            var $originalElement = this.sandbox.dom.$(this.options.el),
                button = this.sandbox.dom.createElement(this.template.basicStructure.call(this, this.options.defaultLabel));
            this.sandbox.dom.append($originalElement, button);

            this.$list = this.sandbox.dom.$('#' + this.listId);
            this.$dropdownContainer = this.sandbox.dom.$('#' + this.dropdownContainerId);
            this.prepareData();

            // bind dom elements
            this.bindDOMEvents();
            this.bindCustomEvents();

            if (this.options.disabled === true) {
                this.disable();
            }
        },

        //sets the button in enabled state
        enable: function() {
            this.sandbox.dom.removeClass(this.sandbox.dom.children(this.$el, '.husky-dropdown-multiple-select'), this.options.disabledClass);
            this.bindDOMEvents();
        },


        //sets the button i
        disable: function() {
            this.sandbox.dom.addClass(this.sandbox.dom.children(this.$el, '.husky-dropdown-multiple-select'), this.options.disabledClass);
            this.hideDropDown();
            this.sandbox.dom.off(this.$el);
        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                this.generateDropDown(this.options.data);
            } else {
                this.sandbox.logger.log('error: data not set');
            }
            // TODO load data from url
        },

        // generate dropDown with given items
        generateDropDown: function(items) {

            if (items.length > 0) {

                if (typeof(items[0]) === 'string') {
                    this.sandbox.util.each(items, function(index, value) {
                        if (this.options.preSelectedElements.indexOf(value) >= 0) {
                            this.sandbox.dom.append(this.$list, this.template.menuElement.call(this, value, this.options.valueName, 'checked'));
                            this.selectedElements.push(value);
                            this.selectedElementsValues.push(value);
                        } else {
                            this.sandbox.dom.append(this.$list, this.template.menuElement.call(this, value, this.options.valueName, ''));
                        }
                    }.bind(this));
                } else if (typeof(items[0]) === 'object') {
                    this.sandbox.util.each(items, function(index, value) {
                        if (this.options.preSelectedElements.indexOf(value.id) >= 0) {
                            this.sandbox.dom.append(this.$list, this.template.menuElement.call(this, value, this.options.valueName, 'checked'));
                            this.selectedElements.push((value.id).toString());
                            this.selectedElementsValues.push(value[this.options.valueName]);
                        } else {
                            this.sandbox.dom.append(this.$list, this.template.menuElement.call(this, value, this.options.valueName, ''));
                        }
                    }.bind(this));
                }
                this.changeLabel();

            } else {
                this.$dropDownList.append('<li>No data received</li>');
            }
        },

        // bind dom elements
        bindDOMEvents: function() {

            // toggle drop-down
            this.sandbox.dom.on(this.$el, 'click', function(event) {
                this.toggleDropDown();
            }.bind(this), '.dropdown-label');

            // click on single item
            this.sandbox.dom.on('#' + this.listId, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                this.clickItem(event);
            }.bind(this), 'li');

        },

        bindCustomEvents: function() {
            this.sandbox.on(this.getEventName('toggle'), this.toggleDropDown.bind(this));
            this.sandbox.on(this.getEventName('show'), this.showDropDown.bind(this));
            this.sandbox.on(this.getEventName('hide'), this.hideDropDown.bind(this));
            this.sandbox.on(this.getEventName('disable'), this.disable.bind(this));
            this.sandbox.on(this.getEventName('enable'), this.enable.bind(this));

            this.sandbox.on(this.getEventName('getChecked'), this.getChecked.bind(this));
        },

        //unchecks all checked elements
        uncheckAll: function(clickedElementKey) {
            var elements = this.sandbox.dom.children('#' + this.listId),
                i = -1,
                length = elements.length,
                key, index, $checkbox;

            for (; ++i < length;) {
                key = this.sandbox.dom.attr(elements[i], 'data-id');
                $checkbox = this.sandbox.dom.find('input[type=checkbox]', elements[i])[0];
                index = this.selectedElements.indexOf(key);

                if (index >= 0) {
                    if (clickedElementKey !== key || this.options.noDeselect === false) {
                        this.sandbox.dom.removeClass($checkbox, 'is-selected');
                        this.sandbox.dom.prop($checkbox, 'checked', false);
                        this.selectedElements.splice(index, 1);
                        this.selectedElementsValues.splice(index, 1);
                        this.sandbox.emit(this.getEventName('deselected.item'), key);
                    }
                }
            }
        },

        // trigger event with clicked item
        clickItem: function(event) {

            var key = this.sandbox.dom.attr(event.currentTarget, 'data-id'),
                value = this.sandbox.dom.text(this.sandbox.dom.find('.item-value', event.currentTarget)),
                $checkbox = this.sandbox.dom.find('input[type=checkbox]', event.currentTarget)[0],
                index = this.selectedElements.indexOf(key);

            if (this.options.singleSelect === true) {
                this.uncheckAll(key);
            }

            if (index >= 0) {
                if (this.options.noDeselect === false) {
                    this.sandbox.dom.removeClass($checkbox, 'is-selected');
                    this.sandbox.dom.prop($checkbox, 'checked', false);
                    this.selectedElements.splice(index, 1);
                    this.selectedElementsValues.splice(index, 1);
                    this.sandbox.emit(this.getEventName('deselected.item'), key);
                }

            } else {

                this.sandbox.dom.addClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', true);
                this.selectedElements.push(key);
                this.selectedElementsValues.push(value);
                this.sandbox.emit(this.getEventName('selected.item'), key);
            }

            this.changeLabel();

            if (this.options.singleSelect === true) {
                this.hideDropDown();
            }

        },

        getEventName: function(suffix) {
            return 'husky.dropdown.multiple.select.' + this.options.instanceName + '.' + suffix;
        },

        changeLabel: function() {

            if (this.selectedElements.length === this.options.data.length && this.options.singleSelect !== true) {
                this.sandbox.dom.text('#' + this.labelId, this.options.checkedAllLabel);
            } else if (this.selectedElements.length === 0) {
                this.sandbox.dom.text('#' + this.labelId, this.options.defaultLabel);
            } else {

                var text = "";
                this.sandbox.util.each(this.selectedElementsValues, function(index, value) {
                    text += ' ' + value + ',';
                });
                this.sandbox.dom.text('#' + this.labelId, text.substring(1, text.length - 1));
            }
        },

        // toggle dropDown visible
        toggleDropDown: function() {
            this.sandbox.logger.log('toggle dropdown ' + this.options.instanceName);

            if (this.dropdownVisible === true) {
                this.hideDropDown();
            } else {
                this.showDropDown();
            }
        },

        // make dropDown visible
        showDropDown: function() {
            this.sandbox.logger.log('show dropdown ' + this.options.instanceName);
            this.sandbox.dom.removeClass(this.$dropdownContainer, 'hidden');
            this.sandbox.dom.on(this.sandbox.dom.window, 'click.dropdown.' + this.options.instanceName, this.hideDropDown.bind(this));
            this.dropdownVisible = true;
        },

        // hide dropDown
        hideDropDown: function(event) {
            if (!!event) {
                if (!!this.sandbox.dom.find(event.target, this.$el).length) {
                    return false;
                } else {
                    this.sandbox.dom.off(this.sandbox.dom.window, 'click.dropdown.' + this.options.instanceName);
                }
            }
            this.sandbox.logger.log('hide dropdown ' + this.options.instanceName);
            this.sandbox.dom.addClass(this.$dropdownContainer, 'hidden');
            this.dropdownVisible = false;
        },

        // return checked values
        getChecked: function(callback) {
            if (typeof callback === 'function') {
                callback(this.selectedElements);
            } else {
                throw 'error: callback is not a function';
            }
        },


        template: {

            basicStructure: function(defaultLabel) {
                return [
                    '<div class="husky-dropdown-multiple-select">',
                    '    <div class="dropdown-label pointer">',
                    '       <div class="checkbox">',
                    '           <span id="', this.labelId, '">', defaultLabel, '</span>',
                    '       </div>',
                    '       <span class="dropdown-toggle inline-block"></span>',
                    '   </div>',
                    '   <div class="grid-row dropdown-list dropdown-align-right hidden" id="', this.dropdownContainerId, '">',
                    '       <ul id="', this.listId, '"></ul>',
                    '   </div>',
                    '</div>'
                ].join('');
            },
            menuElement: function(value, property, checked) {
                var hiddenClass = '';
                if (this.options.singleSelect === true) {
                    hiddenClass = ' hidden';
                }

                if (typeof value === 'string') {

                    return [
                        '<li data-id="', value, '">',
                        '    <div>',
                        '        <div class="check' + hiddenClass + '">',
                        '            <input type="checkbox" class="form-element custom-checkbox"', checked, '/>',
                        '            <span class="custom-checkbox-icon"></span>',
                        '        </div>',
                        '        <div class="item-value">', value, '</div>',
                        '    </div>',
                        '</li>'
                    ].join('');

                } else {

                    return [
                        '<li data-id="', value.id, '">',
                        '    <div>',
                        '        <div class="check' + hiddenClass + '">',
                        '            <input type="checkbox" class="form-element custom-checkbox"', checked, '/>',
                        '            <span class="custom-checkbox-icon"></span>',
                        '        </div>',
                        '        <div class="item-value">', value[property], '</div>',
                        '    </div>',
                        '</li>'
                    ].join('');
                }

            }

        }

    };

});

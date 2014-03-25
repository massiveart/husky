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
 *      multipleSelect: allows multiple elements to be selected
 *      selectCallback: callbackfunction, when element is selected
 *      deselectCallback: callback function when element is deselected
 *      preselectedElements: allows preselection of fields by defining the id attributes or strings
 *      deselectField: allows deselection in case of single select; will be set if value is a string
 *
 *
 * Provided Events:
 * husky.select.<<instanceName>>.selected.item   - triggered when item selected
 * husky.select.<<instanceName>>.deselected.item   - triggered when item deselected

 *
 * Use Events
 * husky.select.<<instanceName>>.toggle     - toggles (show/hide) dropdown menu
 * husky.select.<<instanceName>>.show       - show dropdown menu
 * husky.select.<<instanceName>>.hide       - hide dropdown menu
 * husky.select.<<instanceName>>.initialize - initialize component
 */


/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/toolbar
 */

/**
 * @class Select
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.checkedAllLabel] Label to display if all items of select are checked
 * @param {Array}  [options.data] array of data [string, object]
 * @param {Array}  [options.defaultLabel] default label which gets displayed
 * @param {Function} [options.deselectCallback] callbackfunction, when element is deselected
 * @param {String|Boolean} [options.deselectField]  allows deselection in case of single select; will be set if value is a string
 * @param {String} [options.instanceName] instance name of this component
 * @param {Boolean} [options.multipleSelect] allows multiple elements to be selected
 * @param {Array} [options.preSelectedElements] allows preselection of fields by defining the id attributes or strings
 * @param {Function} [options.selectCallback] callbackfunction, when element is selected
 * @param {String} [options.valueName] name of property which should be used
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
            multipleSelect: false,              // Allows multiple elements to be selected
            deselectField: false,              // field for deselection is added to dropdown if value is a string
            disabled: false,                  //if true button is disabled
            selectCallback: null,
            deselectCallback: null
        },

        constants = {
            labelClass: 'husky-select-label',
            listClass: 'husky-select-list',
            dropdownContainerClass: 'husky-select-dropdown-container',
            deselectFieldKey: '',
            disabledClass: 'disabled'
        };


    return {

        initialize: function() {

            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.selection = [];

            this.selectedElements = [];
            this.selectedElementsValues = [];
            this.dropdownVisible = false;

            this.render();
            this.sandbox.emit(this.getEventName('initialize'));
        },

        render: function() {

            var $originalElement = this.sandbox.dom.$(this.options.el),
                button = this.sandbox.dom.createElement(this.template.basicStructure.call(this, this.options.defaultLabel));
            this.sandbox.dom.append($originalElement, button);

            this.$list = this.$find('.' + constants.listClass);
            this.$dropdownContainer = this.$find('.' + constants.dropdownContainerClass);
            this.$label = this.$find('.' + constants.labelClass);
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
            this.sandbox.dom.removeClass(this.sandbox.dom.children(this.$el, '.husky-select-container'), constants.disabledClass);
            this.bindDOMEvents();
        },


        //sets the button i
        disable: function() {
            this.sandbox.dom.addClass(this.sandbox.dom.children(this.$el, '.husky-select-container'), constants.disabledClass);
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

        addDropdownElement: function(id, value, disabled) {
            var $item;
            if (this.options.preSelectedElements.indexOf(id) >= 0) {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(this, id, value, 'checked'));
                this.selectedElements.push((id).toString());
                this.selectedElementsValues.push(value);
                this.triggerSelect(id);
            } else {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(this, id, value, ''));
            }

            if (!!disabled && disabled === true) {
                this.sandbox.dom.addClass($item, 'disabled');
            }

            this.sandbox.dom.append(this.$list, $item);
        },

        // generate dropDown with given items
        generateDropDown: function(items) {
            if (typeof this.options.deselectField === 'string' && this.options.deselectField !== 'false') {
                this.addDropdownElement(constants.deselectFieldKey, this.sandbox.translate(this.options.deselectField));
            }
            if (items.length > 0) {
                if (typeof(items[0]) === 'string') {
                    this.sandbox.util.each(items, function(index, value) {
                        this.addDropdownElement(index, value);
                    }.bind(this));
                } else if (typeof(items[0]) === 'object') {
                    this.sandbox.util.each(items, function(index, value) {
                        this.addDropdownElement(value.id, value[this.options.valueName], !!value.disabled && value.disabled);
                    }.bind(this));
                }
                this.changeLabel();

            }
//            else {
//                this.$dropDownList.append('<li>No data received</li>');
//            }
        },

        // bind dom elements
        bindDOMEvents: function() {

            // toggle drop-down
            this.sandbox.dom.on(this.$el, 'click', this.toggleDropDown.bind(this), '.dropdown-label');

            // click on single item
            this.sandbox.dom.on(this.$list, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                if (this.sandbox.dom.hasClass(event.currentTarget, 'disabled') === false) {
                    this.clickItem(event);
                } else {
                    this.sandbox.dom.preventDefault(event);
                    return false;
                }
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

        updateSelectionAttribute: function() {
            this.sandbox.dom.attr(this.$el, 'data-selection', this.selectedElements);
            this.sandbox.dom.attr(this.$el, 'data-selection-values', this.selectedElementsValues);
        },

        //unchecks all checked elements
        uncheckAll: function(clickedElementKey) {
            var elements = this.sandbox.dom.children(this.$list),
                i = -1,
                length = elements.length,
                key, index, $checkbox;

            for (; ++i < length;) {
                key = this.sandbox.dom.attr(elements[i], 'data-id');
                $checkbox = this.sandbox.dom.find('input[type=checkbox]', elements[i])[0];
                index = this.selectedElements.indexOf(key);

                if (index >= 0) {
                    if (clickedElementKey !== key) {
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

            var key, value, $checkbox, index;

            key = this.sandbox.dom.attr(event.currentTarget, 'data-id');
            index = this.selectedElements.indexOf(key);

            // if single select then uncheck all results
            if (this.options.multipleSelect === false) {
                // if new element was selected
                if (key === constants.deselectFieldKey) {
                    index = 0;
                    this.uncheckAll(key);
                } else if (index === -1) {
                    this.uncheckAll(key);
                } else {
                    this.hideDropDown();
                    return;
                }
            }

            value = this.sandbox.dom.text(this.sandbox.dom.find('.item-value', event.currentTarget));
            $checkbox = this.sandbox.dom.find('input[type=checkbox]', event.currentTarget)[0];

            // deselect
            if (index >= 0) {
                this.sandbox.dom.removeClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', false);
                this.selectedElements.splice(index, 1);
                this.selectedElementsValues.splice(index, 1);

                // callback if defined
                // callback, if defined
                if (!!this.options.deselectCallback) {
                    this.options.deselectCallback.call(this, key !== constants.deselectFieldKey ? key : null);
                } else {
                    this.sandbox.emit(this.getEventName('deselected.item'), key);
                }


            // select element
            } else {
                this.sandbox.dom.addClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', true);
                this.selectedElements.push(key);
                this.selectedElementsValues.push(value);

                this.triggerSelect(key);

            }

            // update data attribute
            this.updateSelectionAttribute();

            // change label
            this.changeLabel();

            // hide if single select
            if (this.options.multipleSelect === false) {
                this.hideDropDown();
            }

        },

        triggerSelect : function(key) {
            // callback, if defined
            if (!!this.options.selectCallback) {
                this.options.selectCallback.call(this, key);
            } else {
                this.sandbox.emit(this.getEventName('selected.item'), key);
            }
        },

        getEventName: function(suffix) {
            return 'husky.select.' + this.options.instanceName + '.' + suffix;
        },

        changeLabel: function() {

            if (this.selectedElements.length === this.options.data.length && this.options.multipleSelect === true) {
                this.sandbox.dom.text(this.$label, this.options.checkedAllLabel);
            } else if (this.selectedElements.length === 0) {
                this.sandbox.dom.text(this.$label, this.options.defaultLabel);
            } else {

                var text = "";
                this.sandbox.util.each(this.selectedElementsValues, function(index, value) {
                    text += ' ' + value + ',';
                });
                this.sandbox.dom.text(this.$label, text.substring(1, text.length - 1));
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
                    '<div class="husky-select-container">',
                    '    <div class="dropdown-label pointer">',
                    '       <div class="checkbox">',
                    '           <span class="' + constants.labelClass + '">', defaultLabel, '</span>',
                    '       </div>',
                    '       <span class="dropdown-toggle inline-block"></span>',
                    '   </div>',
                    '   <div class="grid-row dropdown-list dropdown-align-right hidden ' + constants.dropdownContainerClass + '">',
                    '       <ul class="' + constants.listClass + '"></ul>',
                    '   </div>',
                    '</div>'
                ].join('');
            },
            menuElement: function(index, value, checked) {
                var hiddenClass = '';
                if (this.options.multipleSelect === false) {
                    hiddenClass = ' hidden';
                }
                return [
                    '<li data-id="', index, '">',
                    '    <div>',
                    '        <div class="check' + hiddenClass + '">',
                    '            <input type="checkbox" class="form-element custom-checkbox"', checked, '/>',
                    '            <span class="custom-checkbox-icon"></span>',
                    '        </div>',
                    '        <div class="item-value">', value, '</div>',
                    '    </div>',
                    '</li>'
                ].join('');

            }

        }

    };

});

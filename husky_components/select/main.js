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
 * @param {String|Boolean} [options.deselectField=false]  allows deselection in case of single select; will be set if value is a string
 * @param {Boolean} [options.disabled=false]  disables the select field if set to true
 * @param {String} [options.instanceName] instance name of this component
 * @param {Boolean} [options.multipleSelect=false] allows multiple elements to be selected
 * @param {Array} [options.preSelectedElements] allows preselection of fields by defining the id attributes or strings
 * @param {Function} [options.selectCallback] callbackfunction, when element is selected
 * @param {String} [options.valueName] name of property which should be used
 * @param {String} [options.style] "normal", "small" or "big" for different appearance
 * @param {Boolean} [options.emitValues] If true the value is emited with events instead of the id
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
            multipleSelect: false,            // Allows multiple elements to be selected
            deselectField: false,             // field for deselection is added to dropdown if value is a string
            disabled: false,                  //if true button is disabled
            selectCallback: null,
            deselectCallback: null,
            style: 'normal',
            emitValues: false,
        },

        constants = {
            labelClass: 'husky-select-label',
            listClass: 'husky-select-list',
            dropdownContainerClass: 'husky-select-dropdown-container',
            deselectFieldKey: 'deselectindex',
            deselectFieldDefaultValue: '',
            disabledClass: 'disabled',
            dropdownTopClass: 'top'
        },

        /**
         * triggered when component is completely initialized
         * @event husky.select[.INSTANCE_NAME].initialized
         */
            EVENT_INITIALIZED = function() {
            return getEventName.call(this, 'initialize');
        },

        /**
         * triggered when item has been deselected
         * @event husky.select[.INSTANCE_NAME].deselected.item
         * @param {String} key of deselected item
         */
            EVENT_DESELECTED_ITEM = function() {
            return getEventName.call(this, 'deselected.item');
        },
        /**
         * triggered when item has been selected
         * @event husky.select[.INSTANCE_NAME].selected.item
         * @param {String} key of selected item
         */
            EVENT_SELECTED_ITEM = function() {
            return getEventName.call(this, 'selected.item');
        },

        /**
         * triggered when item has been preselected
         * @event husky.select[.INSTANCE_NAME].preselected.item
         * @param {String} key of selected item
         */
            EVENT_PRESELECTED_ITEM = function() {
            return getEventName.call(this, 'preselected.item');
        },

        /**
         * used for enabling select
         * @event husky.select[.INSTANCE_NAME].enable
         */
            EVENT_ENABLE = function() {
            return getEventName.call(this, 'enable');
        },
        /**
         * used for disabling select
         * @event husky.select[.INSTANCE_NAME].disable
         */
            EVENT_DISABLE = function() {
            return getEventName.call(this, 'disable');
        },
        /**
         * used for toggling enabled/disabled dropdown menu
         * @event husky.select[.INSTANCE_NAME].toggle
         */
            EVENT_TOGGLE = function() {
            return getEventName.call(this, 'toggle');
        },
        /**
         * used to show dropdown selection
         * @event husky.select[.INSTANCE_NAME].show
         */
            EVENT_SHOW = function() {
            return getEventName.call(this, 'show');
        },
        /**
         * used for hiding dropdown selection
         * @event husky.select[.INSTANCE_NAME].hide
         */
            EVENT_HIDE = function() {
            return getEventName.call(this, 'hide');
        },
        /**
         * used for receiving all checked elements
         * @event husky.select[.INSTANCE_NAME].get-checked
         */
            EVENT_GET_CHECKED = function() {
            return getEventName.call(this, 'get-checked');
        },


        getEventName = function(suffix) {
            return 'husky.select.' + this.options.instanceName + '.' + suffix;
        };

    return {


        initialize: function() {

            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            // if deselectfield is set to true, set it to default value
            if (!!this.options.deselectField && this.options.deselectField.toString() === 'true') {
                this.options.deselectField = constants.deselectFieldDefaultValue;
            }

            this.selection = [];

            this.selectedElements = [];
            this.selectedElementsValues = [];
            this.dropdownVisible = false;

            this.render();
            this.sandbox.emit(EVENT_INITIALIZED.call(this));
        },

        render: function() {

            var $originalElement = this.sandbox.dom.$(this.options.el),
                button = this.sandbox.dom.createElement(this.template.basicStructure.call(this, this.options.defaultLabel));
            this.sandbox.dom.append($originalElement, button);

            if (this.options.style === 'small') {
                this.sandbox.dom.addClass(button, 'small');
            } else if (this.options.style === 'big') {
                this.sandbox.dom.addClass(button, 'big');
            }

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
            var $item,
                idString = (!!id || id === 0) ? id.toString() : 'null';
            if (this.options.preSelectedElements.indexOf(id) >= 0 || this.options.preSelectedElements.indexOf(value) >= 0) {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(this, idString, value, 'checked'));
                this.selectedElements.push(idString);
                this.selectedElementsValues.push(value);
                if (this.options.emitValues === true) {
                    this.triggerPreSelect(idString);
                } else {
                    this.triggerPreSelect(value);
                }
            } else {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(this, idString, value, ''));
            }

            if (!!disabled && disabled === true) {
                this.sandbox.dom.addClass($item, 'disabled');
            }

            this.sandbox.dom.append(this.$list, $item);
        },

        addDivider: function(){
            var $item = this.sandbox.dom.$('<hr class="divider"/>');
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
                        if(value.divider === true) {
                            this.addDivider();
                        } else {
                            this.addDropdownElement(value.id, value[this.options.valueName], !!value.disabled && value.disabled);
                        }
                    }.bind(this));
                }
                this.changeLabel();
                this.updateSelectionAttribute();
            }
        },

        // bind dom elements
        bindDOMEvents: function() {

            // toggle drop-down
            this.sandbox.dom.on(this.$el, 'click', this.toggleDropDown.bind(this), '.dropdown-label');

            // click on single item
            this.sandbox.dom.on(this.$el, 'click', function(event) {
                this.sandbox.dom.stopPropagation(event);
                if (this.sandbox.dom.hasClass(event.currentTarget, 'disabled') === false) {
                    this.clickItem(event);
                    return true;
                } else {
                    this.sandbox.dom.preventDefault(event);
                    return false;
                }
            }.bind(this), '.husky-select-dropdown-container li');

        },

        bindCustomEvents: function() {
            this.sandbox.on(EVENT_TOGGLE.call(this), this.toggleDropDown.bind(this));
            this.sandbox.on(EVENT_SHOW.call(this), this.showDropDown.bind(this));
            this.sandbox.on(EVENT_HIDE.call(this), this.hideDropDown.bind(this));
            this.sandbox.on(EVENT_DISABLE.call(this), this.disable.bind(this));
            this.sandbox.on(EVENT_ENABLE.call(this), this.enable.bind(this));

            this.sandbox.on(EVENT_GET_CHECKED.call(this), this.getChecked.bind(this));
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
                        this.sandbox.emit(EVENT_DESELECTED_ITEM.call(this), key);
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
                // if deselect was selected
                if (key === constants.deselectFieldKey) {
                    index = 0;
                    this.uncheckAll(key);
                    // if new element was selected
                } else if (index === -1) {
                    this.uncheckAll(key);
                    // same element was selected
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

                // select
            } else {
                this.sandbox.dom.addClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', true);
                this.selectedElements.push(key);
                this.selectedElementsValues.push(value);
            }

            // update data attribute
            this.updateSelectionAttribute();

            // change label
            this.changeLabel();

            // hide if single select
            if (this.options.multipleSelect === false) {
                this.hideDropDown();
            }

            if (this.options.emitValues === true) {
                key = value;
            }

            if (index >= 0) {
                this.triggerDeselect(key);
            } else {
                this.triggerSelect(key);
            }
        },

        // triggers select callback or emits event
        triggerSelect: function(key) {
            // callback, if defined
            if (!!this.options.selectCallback) {
                this.options.selectCallback.call(this, key);
            } else {
                this.sandbox.emit(EVENT_SELECTED_ITEM.call(this), key);
            }
        },

        // triggers select callback or emits event
        triggerPreSelect: function(key) {
            // callback, if defined
            if (!!this.options.selectCallback) {
                this.options.selectCallback.call(this, key);
            } else {
                this.sandbox.emit(EVENT_PRESELECTED_ITEM.call(this), key);
            }
        },

        // triggers deselect callback or emits event
        triggerDeselect: function(key) {
            // callback if defined
            if (!!this.options.deselectCallback) {
                this.options.deselectCallback.call(this, key !== constants.deselectFieldKey ? key : null);
            } else {
                this.sandbox.emit(EVENT_DESELECTED_ITEM.call(this), key);
            }
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


            this.sandbox.dom.removeClass(this.$dropdownContainer, constants.dropdownTopClass);
            var ddHeight = this.sandbox.dom.height(this.$dropdownContainer),
                ddTop = this.sandbox.dom.offset(this.$dropdownContainer).top,
                windowHeight = this.sandbox.dom.height(this.sandbox.dom.window),
                scrollTop = this.sandbox.dom.scrollTop(this.sandbox.dom.window),
                hasTopClass = this.sandbox.dom.hasClass(this.$dropdownContainer, constants.dropdownTopClass);

            // check if dropdown container overlaps bottom of browser
            if (ddHeight + ddTop > windowHeight + scrollTop) {
                this.sandbox.dom.addClass(this.$dropdownContainer, constants.dropdownTopClass);
            }
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
            return true;
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
                    '   <div class="grid-row dropdown-list dropdown-shadow hidden ' + constants.dropdownContainerClass + '">',
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
                    '           <div class="custom-checkbox no-spacing">',
                    '               <input type="checkbox" class="form-element"', checked, '/>',
                    '               <span class="icon"></span>',
                    '           </div>',
                    '        </div>',
                    '        <div class="item-value">', value, '</div>',
                    '    </div>',
                    '</li>'
                ].join('');
            }
        }
    };
});

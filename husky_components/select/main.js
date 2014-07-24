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
 * @param {String} [options.style] "normal", "small", "big", "action" for different appearance
 * @param {String} [options.skin] style class to set to the elements component (e.g 'white')
 * @param {Boolean} [options.emitValues] If true the value is emited with events instead of the id
 * @param {Boolean} [options.fixedLabel] If true the label never gets changed
 * @param {String} [options.icon] icon to set into the label
 * @param {Function} [options.noItemsCallback] callback function which gets executed at click on label if no dropdown-items exist
 * @param {Boolean} [options.repeatSelect] If true dropdown item can be selected n-times in succession
 * @param {Boolean} [options.editable] If true the menu items are editable
 * @param {Object} [options.translations] translation keys for 'addItem' and 'editEntries'
 * @param {String} [options.direction] 'bottom', 'top', or 'auto' pop up direction of the drop down.
 */

define([], function() {

    'use strict';

    var translations = {
        addItem: 'select.add-item',
        editEntries: 'select.edit-entries'
    },

        defaults = {
            data: [],                         // data array
            valueName: 'name',                // name of text property
            instanceName: 'undefined',        // instance name
            defaultLabel: 'Please choose',    // default label which gets displayed
            checkedAllLabel: 'All Languages', // Label if all checked
            preSelectedElements: [],          // Elements selected by default
            multipleSelect: false,            // Allows multiple elements to be selected
            deselectField: false,             // field for deselection is added to dropdown if value is a string
            disabled: false,                  // if true button is disabled
            selectCallback: null,
            deselectCallback: null,
            style: 'normal',
            skin: '',
            emitValues: false,
            fixedLabel: false,
            icon: null,
            noItemsCallback: null,
            repeatSelect: false,
            editable: false,
            direction: 'auto',
            translations: translations
        },

        constants = {
            labelClass: 'husky-select-label',
            listClass: 'husky-select-list',
            dropdownContainerClass: 'husky-select-dropdown-container',
            deselectFieldKey: 'deselectindex',
            deselectFieldDefaultValue: '',
            disabledClass: 'disabled',
            dropdownTopClass: 'top',
            templateRemoveSelector: '.remove-row',
            templateAddSelector: '#addRow',
            editableFieldKey: 'editableindex',
            typeRowSelector: '.type-row',
            contentInnerSelector: '.content-inner'
        },

        templates = {
            row: function() {
                return[
                    '<div class="grid-row type-row" data-id="">',
                    '   <div class="grid-col-8 pull-left"><input class="form-element" type="text" value=""/></div>',
                    '   <div class="grid-col-2 pull-right"><div class="remove-row btn gray-dark fit only-icon pull-right"><div class="fa-minus-circle"></div></div></div>',
                    '</div>'].join('');
            },
            addOverlayRow: function(valueField, item) {
                return [
                    '<div class="grid-row type-row" data-id="', item.id ,'">',
                    '    <div class="grid-col-8 pull-left"><input class="form-element" type="text" value="', item[valueField],'"/></div>',
                    '    <div class="grid-col-2 pull-right"><div class="remove-row btn gray-dark fit only-icon pull-right"><div class="fa-minus-circle"></div></div></div>',
                    '</div>',
                ].join('')
            },
            addOverlaySkeleton: function() {
                return [
                    '<div class="content-inner">',
                    '   <% _.each(data, function(item) { %>',
                    '        <%= rowTemplate(valueName, item) %>',
                    '   <% }); %>',
                    '</div>',
                    '<div class="grid-row">',
                    '   <div id="addRow" class="addButton">',
                            this.sandbox.translate(defaults.translations.addItem),
                    '   </div>',
                    '</div>'
                ].join('');
            }
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
         * used for making the menu items editable
         * @event husky.select[.INSTANCE_NAME].edit
         */
            EVENT_EDIT = function() {
            return getEventName.call(this, 'edit');
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
        /**
         * update the elements of the dropdown list
         * @event husky.select[.INSTANCE_NAME].update
         */
            EVENT_UPDATE = function() {
            return getEventName.call(this, 'update');
        },
        /**
         * update the elements of the dropdown list
         * @event data-changed
         */
            EVENT_DATA_CHANGED = function() {
            return 'data-changed';
        },
        /**
         * Saved event
         * @event husky.select.[instanceName].saved
         */
            EVENT_SAVED = function() {
            return getEventName.call(this, 'saved');
        },

        /**
         * Deleted event
         * @event husky.select.[instanceName].deleted
         */
            EVENT_DELETED = function() {
            return getEventName.call(this, 'deleted');
        },

        /**
         * Revert event
         * @event husky.select.[instanceName].revert
         */
            EVENT_REVERT = function() {
            return getEventName.call(this, 'revert');
        },

        getEventName = function(suffix) {
            return 'husky.select.' + this.options.instanceName + '.' + suffix;
        };

    return {

        initialize: function() {
            var selectedIds;

            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            // Used as a fallback to revert to the last committed data
            this.mergedData = this.options.data.slice(0);

            // if deselectfield is set to true, set it to default value
            if (!!this.options.deselectField && this.options.deselectField.toString() === 'true') {
                this.options.deselectField = constants.deselectFieldDefaultValue;
            }

            this.selection = [];
            this.selectedElements = [];
            this.selectedElementsValues = [];
            this.dropdownVisible = false;

            // when preselected elements is not set via options look in data-attribute
            if(!this.options.preSelectedElements || this.options.preSelectedElements.length === 0) {
                selectedIds = this.sandbox.dom.data(this.$el, 'selection');

                if (typeof selectedIds === 'string') {
                    this.options.preSelectedElements = selectedIds.split(',');
                } else if (Array.isArray(selectedIds)) {
                    this.options.preSelectedElements = selectedIds.map(String);
                } else if (typeof selectedIds === 'number') {
                    this.options.preSelectedElements.push(selectedIds.toString());
                }
            }

            this.render();
            this.sandbox.emit(EVENT_INITIALIZED.call(this));
        },

        render: function() {

            var $originalElement = this.sandbox.dom.$(this.options.el),
                button = this.sandbox.dom.createElement(
                    this.template.basicStructure.call(this, this.options.defaultLabel, this.options.icon)
                );
            this.sandbox.dom.append($originalElement, button);

            if (this.options.style === 'small') {
                this.sandbox.dom.addClass(button, 'small');
            } else if (this.options.style === 'big') {
                this.sandbox.dom.addClass(button, 'big');
            } else if (this.options.style === 'action') {
                this.sandbox.dom.addClass(button, 'action');
            }

            // add skin style
            this.sandbox.dom.addClass(button, this.options.skin);

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

            this.addEditEntry();

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

        // If 'editable' flag is set in the options an 'Edit' menu entry is
        // added to the list.
        addEditEntry: function() {
            if (this.options.editable === true) {
                this.addDivider();
                this.addDropdownElement(constants.editableFieldKey,
                        this.sandbox.translate(translations.editEntries),
                        false,
                        null,
                        null,
                        false
                        );
            }
        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                if (this.options.preSelectedElements.length > 0) {
                    this.options.preSelectedElements.map(function(el, index, arr) {
                        if (!!arr[index] || arr[index] === 0) {
                            arr[index] = el.toString();
                        }
                    });
                }
                this.generateDropDown(this.options.data);
            } else {
                this.sandbox.logger.log('error: data not set');
            }
        },

        /**
         * Adds a dropdown element to the dropdown list
         * @param id
         * @param value
         * @param disabled
         * @param callback
         * @param updateLabel
         */
        addDropdownElement: function(id, value, disabled, callback, updateLabel, checkboxVisible) {
            checkboxVisible = typeof checkboxVisible !== 'undefined' ? checkboxVisible : true;
            var $item,
                idString = (id != null) ? id.toString() : this.sandbox.util.uniqueId();

            if (this.options.preSelectedElements.indexOf(idString) >= 0 ||
                    this.options.preSelectedElements.indexOf(value) >= 0) {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(
                            this,
                            idString,
                            value,
                            'checked',
                            updateLabel,
                            true));

                this.selectedElements.push(idString);
                this.selectedElementsValues.push(value);
                if (this.options.emitValues === true) {
                    this.triggerPreSelect(idString);
                } else {
                    this.triggerPreSelect(value);
                }
            } else {
                $item = this.sandbox.dom.createElement(this.template.menuElement.call(
                            this,
                            idString,
                            value,
                            '',
                            updateLabel,
                            checkboxVisible)
                        );
            }

            // store callback if callback is set
            if (typeof callback === 'function') {
                this.sandbox.dom.data($item, 'selectCallback', callback);
            }

            if (!!disabled && disabled === true) {
                this.sandbox.dom.addClass($item, 'disabled');
            }

            this.sandbox.dom.append(this.$list, $item);
        },

        /**
         * Adds a divider element to the dropdown list
         */
        addDivider: function() {
            var $item = this.sandbox.dom.$('<hr class="divider"/>');
            this.sandbox.dom.append(this.$list, $item);
        },

        /**
         * Generates the dropdown list with the given items
         * @param items
         */
        generateDropDown: function(items) {
            if (typeof this.options.deselectField === 'string' && this.options.deselectField !== 'false') {
                this.addDropdownElement(constants.deselectFieldKey, this.sandbox.translate(this.options.deselectField));
            }
            if (items.length > 0) {
                if (typeof(items[0]) === 'string') {
                    this.sandbox.util.each(items, function(index, value) {
                        this.addDropdownElement(index, this.sandbox.translate(value));
                    }.bind(this));
                } else if (typeof(items[0]) === 'object') {
                    this.sandbox.util.each(items, function(index, value) {
                        if (value.divider === true) {
                            this.addDivider();
                        } else {
                            this.addDropdownElement(value.id, this.sandbox.translate(value[this.options.valueName]), !!value.disabled, value.callback, this.sandbox.translate(value.updateLabel));
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
            this.sandbox.dom.on(this.$el, 'click', this.labelClickHandler.bind(this), '.dropdown-label');

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

            this.sandbox.dom.on(this.$el, EVENT_DATA_CHANGED.call(this), this.dataChanged.bind(this));

        },

        bindCustomEvents: function() {
            this.sandbox.on(EVENT_TOGGLE.call(this), this.toggleDropDown.bind(this));
            this.sandbox.on(EVENT_SHOW.call(this), this.showDropDown.bind(this));
            this.sandbox.on(EVENT_HIDE.call(this), this.hideDropDown.bind(this));
            this.sandbox.on(EVENT_DISABLE.call(this), this.disable.bind(this));
            this.sandbox.on(EVENT_ENABLE.call(this), this.enable.bind(this));
            this.sandbox.on(EVENT_GET_CHECKED.call(this), this.getChecked.bind(this));
            this.sandbox.on(EVENT_UPDATE.call(this), this.updateDropdown.bind(this));
            this.sandbox.on(EVENT_REVERT.call(this), this.revert.bind(this));
        },

        /**
         * Should be triggered when data attributes have changed
         */
        dataChanged: function() {
            var selectedIds = this.sandbox.dom.data(this.$el, 'selection'),
                selectedValues = this.sandbox.dom.data(this.$el, 'selectionValues'),
                id, $checkbox;

            this.selectedElements = [];
            this.selectedElementsValues = [];

            if (typeof selectedIds === 'string') {
                this.selectedElements = selectedIds.split(',');
            } else if (Array.isArray(selectedIds)) {
                this.selectedElements = selectedIds.map(String);
            } else if (typeof selectedIds === 'number') {
                this.selectedElements.push(selectedIds.toString());
            }

            if(typeof selectedValues === 'string') {
                this.selectedElementsValues = selectedValues.split(',');
            } else if(!!Array.isArray(selectedValues)){
                this.selectedElementsValues = selectedValues;
            }

            this.sandbox.util.foreach(this.$list, function($el) {
                id = this.sandbox.dom.data($el, 'id') || '';
                $checkbox = this.sandbox.dom.find('input[type=checkbox]', $el);
                if (this.selectedElements.indexOf(id) > -1) {
                    this.sandbox.dom.addClass($checkbox, 'is-selected');
                    this.sandbox.dom.prop($checkbox, 'checked', true);
                } else {
                    this.sandbox.dom.removeClass($checkbox, 'is-selected');
                    this.sandbox.dom.prop($checkbox, 'checked', false);
                }

            }.bind(this));

            this.changeLabel();
            this.updateSelectionAttribute();

        },

        /**
         * Reverts the dropdown list
         */
        revert: function() {
            this.updateDropdown(
                    this.mergedData,
                    this.options.preSelectedElements,
                    false
                    );
        },

        /**
         * Updates the dropdown list
         * @param data
         * @param preselected array of ids
         * @param merge - merge given data with dom
         */
        updateDropdown: function(data, preselected, merge) {
            if (!!merge) {
                data = this.mergeDomAndRequestData(
                        data, this.parseDataFromDom(this.domData, true));
                this.mergedData = data.slice(0);
            }
            this.options.preSelectedElements = preselected.map(String);
            this.selectedElements = [];
            this.selectedElementsValues = [];
            this.sandbox.dom.empty(this.$list);

            this.options.data = data;

            if (!!data && data.length > 0) {
                this.generateDropDown(data);
            } else {
                this.sandbox.logger.warn('error invalid data for update!');
            }
            this.addEditEntry();
        },

        updateSelectionAttribute: function() {
            this.sandbox.dom.data(this.$el, 'selection', this.selectedElements);
            this.sandbox.dom.data(this.$el, 'selectionValues', this.selectedElementsValues);
        },

        //unchecks all checked elements
        uncheckAll: function(clickedElementKey) {
            var elements = this.sandbox.dom.children(this.$list),
                i = -1,
                length = elements.length,
                key, index, $checkbox;

            for (; ++i < length;) {
                key = this.sandbox.dom.data(elements[i], 'id');

                if (key === undefined) {
                    key = '';
                }

                $checkbox = this.sandbox.dom.find('input[type=checkbox]', elements[i])[0];
                index = this.selectedElements.indexOf(key.toString());

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

        /**
         * Opens the overlay for edditing.
         */
        openEditDialog: function() {
            this.elementsToRemove = [];
            this.$elementsToRemove = [];

            var $element = this.sandbox.dom.createElement('<div/>'),
                $content = this.renderOverlayContent();
            this.sandbox.dom.append('body', $element);

            this.bindOverlayContentEvents($content);
            this.sandbox.start([{ name: 'overlay@husky',
                options: {
                    el: $element,
                    openOnStart:true,
                    removeOnClose:true,
                    instanceName: 'husky-select',
                    title: this.sandbox.translate('public.edit-entries'),
                    closeCallback: function() {
                        this.onCloseWithCancel()
                    }.bind(this),
                    okCallback: function(data) {
                        this.onCloseWithOk(data);
                    }.bind(this),
                    data: $content
                }
            }]);
        },

        /**
         * Callback for close of overlay with ok button
         */
        onCloseWithOk: function(domData) {
            this.domData = domData;
            this.removeDeletedItems();
            if (!!domData) {
                this.saveNewEditedItemsAndClose(domData, 'PATCH');
            }
        },

        saveNewEditedItemsAndClose: function(domData, method) {
            var data = this.parseDataFromDom(domData),
                changedData = this.getChangedData(data);

            if (changedData.length > 0) {
                var mergeData = this.mergeDomAndRequestData(changedData,
                    this.parseDataFromDom(domData, true));
                this.options.data = mergeData.slice(0);
                this.updateDropdown(mergeData, this.options.preSelectedElements);
                this.sandbox.emit(EVENT_SAVED.call(this), changedData);
            }
        },

        /**
         * Merges data
         * @param updatedData
         * @param parsedDomData
         */
        mergeDomAndRequestData: function(updatedData, parsedDomData) {
            this.sandbox.util.foreach(parsedDomData, function(parsedEl) {
                this.sandbox.util.foreach(updatedData, function(updatedEl) {
                    if (parsedEl.id === updatedEl.id && parsedEl.id !== '') {
                        parsedEl[this.options.valueName] = updatedEl[this.options.valueName];
                    } else if (parsedEl[this.options.valueName] === updatedEl[this.options.valueName]) {
                        parsedEl.id = updatedEl.id;
                    }
                }.bind(this));
            }.bind(this));

            return parsedDomData;
        },

        /**
         * Bind overlay specific events
         * @param $element
         */
        bindOverlayContentEvents: function($element) {
            this.sandbox.dom.on($element,
                    'click',
                    this.markElementForRemoval.bind(this),
                    constants.templateRemoveSelector);
            this.sandbox.dom.on($element,
                    'click',
                    this.addElement.bind(this),
                    constants.templateAddSelector);
        },

        /**
         * Adds new item to the list or removes existing
         * @param id of element to remove
         * @param $row dom row of elment to remove
         */
        updateRemoveList: function(id, $row) {
            if (this.elementsToRemove.indexOf(id) === -1) {
                if (id != null) {
                    this.elementsToRemove.push(id);
                }
                this.$elementsToRemove.push($row);
            } else {
                if (id != null) {
                    this.elementsToRemove.splice(this.elementsToRemove.indexOf(id), 1);
                }
                this.$elementsToRemove.splice(this.elementsToRemove.indexOf($row), 1);
            }
        },

        /**
         * delete elements
         * @param id
         */
        deleteItem: function(id) {
            // Remove items
            var origData = this.options.data.slice(0);
            this.sandbox.util.each(origData, function(index, $el) {
                if (id === $el.id) {
                    var i = this.options.data.indexOf($el);
                    this.options.data.splice(i, 1);
                }
            }.bind(this));
            this.updateDropdown(
                    this.options.data,
                    []
                    );
        },

        /**
         * Deletes removed items
         */
        removeDeletedItems: function() {
            // remove dom elements - important for the getChangedData method
            if (!!this.$elementsToRemove && this.$elementsToRemove.length > 0) {
                this.sandbox.util.each(this.$elementsToRemove, function(index, $el) {
                    this.sandbox.dom.remove($el);
                }.bind(this));
            }

            // remove items from db
            if (!!this.elementsToRemove && this.elementsToRemove.length > 0) {
                this.sandbox.util.each(this.elementsToRemove, function(index, el) {
                    this.deleteItem(el);
                }.bind(this));
                this.sandbox.emit(EVENT_DELETED.call(this), this.elementsToRemove);
                this.elementsToRemove = [];
                this.$elementsToRemove = [];
            }
        },

        /**
         * Extracts data from dom structure
         * @param domData
         * @param excludeDeleted
         */
        parseDataFromDom: function(domData, excludeDeleted) {
            var $rows = this.sandbox.dom.find(constants.typeRowSelector, domData),
                data = [],
                id, value, deleted, obj;

            this.sandbox.dom.each($rows, function(index, $el) {

                deleted = this.sandbox.dom.hasClass($el, 'faded');

                if (!!excludeDeleted) {
                    if (!deleted) {
                        id = this.sandbox.dom.data($el, 'id');
                        value = this.sandbox.dom.val(this.sandbox.dom.find('input', $el));
                        if (value !== '') {
                            obj = {id: id};
                            obj[this.options.valueName] = value;
                            data.push(obj);
                        }
                    }
                } else {
                    id = this.sandbox.dom.data($el, 'id');
                    value = this.sandbox.dom.val(this.sandbox.dom.find('input', $el));
                    if (value !== '') {
                        obj = {id: id};
                        obj[this.options.valueName] = value;
                        data.push(obj);
                    }
                }

            }.bind(this));

            return data;
        },

        /**
         * Compares original and new data
         */
        getChangedData: function(newData) {
            var changedData = [];
            this.sandbox.util.each(newData, function(idx, el) {
                if (el.id === '') {
                    changedData.push(el);
                } else {
                    this.sandbox.util.each(this.options.data, function(idx, origEl) {
                        if (el.id === origEl.id &&
                            el[this.options.valueName] !== origEl[this.options.valueName] &&
                            el[this.options.valueName] !== '') {
                            changedData.push(el);
                        }
                    }.bind(this));
                }
            }.bind(this));

            return changedData;
        },

        /**
         * Callback for close of overlay with cancel button
         */
        onCloseWithCancel: function() {
            this.elementsToRemove = [];
            this.$elementsToRemove = [];
        },

        /**
         * Render content for the overlay
         */
        renderOverlayContent: function() {
            var data = [];

            return this.sandbox.dom.createElement(this.sandbox.util.template(
                    templates.addOverlaySkeleton.call(this),
                    {
                        data: this.options.data,
                        rowTemplate: templates.addOverlayRow,
                        valueName: this.options.valueName
                    }));
        },
        /**
         * Adds an element
         */
        addElement: function(event) {
            var $row = this.sandbox.dom.createElement(
                        templates.addOverlayRow.call(
                            this,
                            this.options.valueName, {}
                    ));
            this.sandbox.dom.append(
                    this.sandbox.dom.find(
                        constants.contentInnerSelector),
                    $row);
        },

        /**
         * Marks an element for removal
         */
        markElementForRemoval: function(event) {
            var $row = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget)),
                id = this.sandbox.dom.data($row, 'id');

            if (id != null) {
                this.updateRemoveList(id, $row);
            }

            this.toggleStateOfRow($row);
        },

        /**
         * Marks a row as removed
         * @param $row
         */
        toggleStateOfRow: function($row) {
            this.sandbox.dom.toggleClass($row, 'faded');
        },

        // trigger event with clicked item
        clickItem: function(event) {

            var key, value, $checkbox, index, callback, updateLabel;

            key = this.sandbox.dom.data(event.currentTarget, 'id').toString();
            callback = this.sandbox.dom.data(event.currentTarget, 'selectCallback');
            index = this.selectedElements.indexOf(key);
            updateLabel = this.sandbox.dom.attr(event.currentTarget, 'data-update-label');

            // Edit button was pressed
            if (key == constants.editableFieldKey) {
                this.hideDropDown();
                this.openEditDialog();
                return;
            }

            if (updateLabel !== 'false') {

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
                    } else if (this.options.repeatSelect !== true) {
                        this.hideDropDown();
                        return;
                    }
                }

            }

            value = this.sandbox.dom.text(this.sandbox.dom.find('.item-value', event.currentTarget));
            $checkbox = this.sandbox.dom.find('input[type=checkbox]', event.currentTarget)[0];

            if (!!updateLabel && updateLabel !== 'false') {
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
                    this.selectedElements.push(key.toString());
                    this.selectedElementsValues.push(value);
                }

                // update data attribute
                this.updateSelectionAttribute();

                // change label
                this.changeLabel();
            }

            // hide if single select
            if (this.options.multipleSelect === false) {
                this.hideDropDown();
            }

            if (this.options.emitValues === true) {
                key = value;
            }

            // execute callback if configured
            if (typeof callback === 'function') {
                callback();
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
            if (this.options.fixedLabel !== true) {
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
            }
        },

        /**
         * Handles the click on the dropdown label
         */
        labelClickHandler: function() {
            // if dropdown is not empty
            if (!this.sandbox.dom.is(this.$find('.' + constants.listClass), ':empty')) {
                this.toggleDropDown();
            } else {
                // else execute a no-items-callback if it exists
                if (typeof this.options.noItemsCallback === 'function') {
                    this.options.noItemsCallback();
                }
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
                scrollTop = this.sandbox.dom.scrollTop(this.sandbox.dom.window);
            if (this.options.direction === 'top') {
                this.sandbox.dom.addClass(this.$dropdownContainer, constants.dropdownTopClass);
            } else if (this.options.direction !== 'bottom') {
                // check if dropdown container overlaps bottom of browser
                if (ddHeight + ddTop > windowHeight + scrollTop) {
                    this.sandbox.dom.addClass(this.$dropdownContainer, constants.dropdownTopClass);
                }
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
            basicStructure: function(defaultLabel, icon) {
                var iconSpan = '', dropdownToggle = '';
                if (!!icon) {
                    iconSpan = '<span class="fa-' + icon + ' icon"></span>';
                }
                if (!!this.options.data &&
                        !!this.options.data.length ||
                        this.options.editable) {
                    dropdownToggle = '<span class="fa-caret-down toggle-icon"></span>';
                }
                return [
                    '<div class="husky-select-container">',
                    '    <div class="dropdown-label pointer">',
                    '       <div class="checkbox">',
                    iconSpan,
                    '           <span class="' + constants.labelClass + '">', defaultLabel, '</span>',
                    '       </div>',
                    dropdownToggle,
                    '   </div>',
                    '   <div class="grid-row dropdown-list dropdown-shadow hidden ' + constants.dropdownContainerClass + '">',
                    '       <ul class="' + constants.listClass + '"></ul>',
                    '   </div>',
                    '</div>'
                ].join('');
            },
            menuElement: function(index, value, checked, updateLabel, checkboxVisible) {
                var hiddenClass = '',
                    update = 'true';

                if (this.options.multipleSelect === false || !checkboxVisible) {
                    hiddenClass = ' hidden';
                }

                if (updateLabel !== undefined && updateLabel === false) {
                    update = 'false';
                }

                return [
                    '<li data-id="', index, '" data-update-label="', update, '">',
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

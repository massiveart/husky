/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: dropdown
 * Options:
 *
 *
 * Provided Events:
 * husky.dropdown.<<instanceName>>.item.click   - triggered when item clicked
 * husky.dropdown.<<instanceName>>.data.load    - triggered when data loaded
 *
 * Use Events
 * husky.dropdown.<<instanceName>>.toggle       - toggles (show/hide) dropdown menu
 * husky.dropdown.<<instanceName>>.show       - show dropdown menu
 * husky.dropdown.<<instanceName>>.hide       - hide dropdown menu
 */

define([], function() {

    'use strict';

    var moduleName = 'Husky.Ui.DropDown',
        defaults = {
            url: '',     // url for lazy loading
            data: [],    // data array
            trigger: '',  // trigger for click event
            triggerOutside: false, // if true, trigger is searched in whole dom, otherwise just in this.$el
            shadow: true,  // if box-shadow should be shown
            toggleClassOn: null, // container to set is-active class
            valueName: 'name', // name of text property
            setParentDropDown: false, // set class dropdown for parent dom object
            excludeItems: [], // items to filter,
            instanceName: 'undefined',  // instance name
            alignment: 'left',  // alignment of the arrow and the box
            verticalAlignment: 'bottom', // alignment of the box
            translateLabels: true   // translate labels withe globalize
        };


    return {
        initialize: function() {
            this.name = moduleName;

            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.$element = this.sandbox.dom.createElement('<div/>', {
                'class': 'husky-drop-down'
            });

            this.sandbox.dom.append(this.options.el, this.$element);

            this.render();
            this.sandbox.emit('husky.dropdown.' + this.options.instanceName + '.initialized');
        },

        render: function() {

            var dropdownClasses = ['dropdown-menu'];

            if (this.options.shadow === true) {
                dropdownClasses.push('dropdown-shadow');
            }


            this.$dropDown = this.sandbox.dom.createElement('<div/>', {
                'class': dropdownClasses.join(' ')
            });
            this.$dropDownList = this.sandbox.dom.createElement('<ul/>');

            this.sandbox.dom.append(this.$element, this.$dropDown);
            this.sandbox.dom.append(this.$dropDown, this.$dropDownList);
            this.hideDropDown();

            if (this.options.setParentDropDown) {
                // add class dropdown to parent
                this.sandbox.dom.addClass(this.sandbox.dom.parent(this.$element), 'dropdown');
            }

            // check alginment
            if (this.options.alignment === 'right') {
                this.sandbox.dom.addClass(this.$dropDown, 'dropdown-align-right');
            }

            // check vertical alginment
            if (this.options.verticalAlignment === 'top') {
                this.sandbox.dom.addClass(this.$dropDown, 'dropdown-align-top');
            }

            // bind dom elements
            this.bindDOMEvents();

            this.bindCustomEvents();

            // load data
            this.prepareData();
        },

        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.sandbox.dom.off(this.$element);

            // ------------------------------------------------------------
            // DOM events
            // ------------------------------------------------------------

            // init drop-down
            if (this.options.trigger !== '') {
                if (this.options.triggerOutside) {
                    this.sandbox.dom.on(this.options.trigger, 'click', this.triggerClick.bind(this));
                } else {
                    this.sandbox.dom.on(this.options.el, 'click', this.triggerClick.bind(this), this.options.trigger);
                }
            } else {
                this.sandbox.dom.on(this.options.el, 'click', this.triggerClick.bind(this));
            }

            // on click on list item
            this.sandbox.dom.on(this.$dropDownList, 'click', function(event) {
                event.stopPropagation();
                if (!this.sandbox.dom.hasClass(event.currentTarget, 'disabled')) {
                    this.clickItem(this.sandbox.dom.data(event.currentTarget, 'id'));
                }
            }.bind(this), 'li:not(".divider")');
        },

        bindCustomEvents: function() {
            this.sandbox.on(this.getEvent('toggle'), this.triggerClick.bind(this));
            this.sandbox.on(this.getEvent('show'), this.showDropDown.bind(this));
            this.sandbox.on(this.getEvent('hide'), this.hideDropDown.bind(this));
            this.sandbox.on(this.getEvent('item.enable'), this.itemEnable.bind(this));
            this.sandbox.on(this.getEvent('item.disable'), this.itemDisable.bind(this));
            this.sandbox.on(this.getEvent('item.toggle'), this.itemToggle.bind(this));
        },

        getEvent: function(append) {
            return 'husky.dropdown.' + this.options.instanceName + '.' + append;
        },

        itemToggle: function(id, enable) {
            if (enable === true) {
                this.itemEnable(id);
            } else {
                this.itemDisable(id);
            }
        },

        itemEnable: function(id) {
            this.sandbox.dom.removeClass(this.$find('li[data-id="'+ id +'"]'), 'disabled');
        },

        itemDisable: function(id) {
            this.sandbox.dom.addClass(this.$find('li[data-id="'+ id +'"]'), 'disabled');
        },

        // trigger event with clicked item
        clickItem: function(id) {
            this.sandbox.util.foreach(this.options.data, function(item) {
                if (typeof item.id !== 'undefined' && item.id.toString() === id.toString()) {
                    this.sandbox.logger.log(this.name, 'item.click: ' + id, 'success');

                    if (!!item.callback && typeof item.callback === 'function') {
                        item.callback.call(this);
                    } else if (!!this.options.clickCallback && typeof this.options.clickCallback === 'function') {
                        this.options.clickCallback(item, this.$el);
                    } else {
                        this.sandbox.emit(this.getEvent('item.click'), item, this.$el);
                    }

                    return false;
                }
            }.bind(this));
            this.hideDropDown();
        },

        // trigger click event handler toggles the dropDown
        triggerClick: function(event) {
            event.stopPropagation();
            this.toggleDropDown();
        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                this.generateDropDown(this.options.data);
            } else {
                this.loadData();
            }
        },
        // load data with ajax
        loadData: function() {
            var url = this.getUrl();
            this.sandbox.logger.log(this.name, 'load: ' + url);

            this.sandbox.util.ajax({
                url: url,
                success: function(response) {
                    this.sandbox.logger.log(this.name, 'load', 'success');

                    if (response.total > 0 && response.items.length === response.total) {
                        this.options.data = response.items;
                    } else {
                        this.options.data = [];
                    }
                    this.generateDropDown(this.options.data);
                }.bind(this),
                error: function() {
                    this.sandbox.logger.log(this.name, 'load', 'error');

                    this.options.data = [];
                    this.generateDropDown(this.options.data);
                }.bind(this)
            });

            // FIXME event will be bound later
            setTimeout(function() {
                this.sandbox.emit(this.getEvent('data.load'));
            }.bind(this), 200);
        },

        // generate dropDown with given items
        generateDropDown: function(items) {
            this.clearDropDown();
            if (items.length > 0) {
                items.forEach(function(item) {
                    if (item.divider !== true) {
                        if (this.isVisible(item)) {
                            var label = item[this.options.valueName];
                            if (this.options.translateLabels) {
                                label = this.sandbox.translate(label);
                            }
                            this.sandbox.dom.append(this.$dropDownList, '<li data-id="' + item.id + '">' + label + '</li>');
                        }
                    } else {
                        this.sandbox.dom.append(this.$dropDownList, '<li class="divider"/>');
                    }
                }.bind(this));
            } else {
                this.sandbox.dom.append(this.$dropDownList, '<li>No data received</li>');
            }
        },

        // is item visible (filter)
        isVisible: function(item) {
            var result = true;
            this.options.excludeItems.forEach(function(testItem) {
                if (item.id === testItem.id) {
                    result = false;
                }
            }.bind(this));
            return result;
        },

        // clear childs of list
        clearDropDown: function() {
            // FIXME make it easier
            this.sandbox.dom.remove(this.sandbox.dom.children(this.sandbox.dom.children(this.$dropDown, 'ul'), 'li'));
        },

        // toggle dropDown visible
        toggleDropDown: function() {
            this.sandbox.logger.log(this.name, 'toggle dropdown');
            if (this.sandbox.dom.is(this.$dropDown, ':visible')) {
                this.hideDropDown();
            } else {
                this.showDropDown();
            }
        },

        // make dropDown visible
        showDropDown: function() {
            this.sandbox.logger.log(this.name, 'show dropdown');
            this.sandbox.dom.removeClass(this.$dropDown, 'top');
            // on click on trigger outside check
            this.sandbox.dom.one(this.sandbox.dom.window, 'click', this.hideDropDown.bind(this));
            this.sandbox.dom.show(this.$dropDown);
            this.sandbox.emit('husky.dropdown.' + this.options.instanceName + '.showing');
            if (!!this.options.toggleClassOn) {
                this.sandbox.dom.addClass(this.options.toggleClassOn, 'is-active');
            }
            // add up class if dropdown would pass the screen borders
            if ((this.sandbox.dom.offset(this.$dropDown).top - this.sandbox.dom.scrollTop(this.sandbox.dom.window) +
                this.sandbox.dom.outerHeight(this.$dropDown)) > this.sandbox.dom.height(this.sandbox.dom.window)) {
                this.sandbox.dom.addClass(this.$dropDown, 'top');
            }
        },

        // hide dropDown
        hideDropDown: function() {
            this.sandbox.logger.log(this.name, 'hide dropdown');
            // remove global click event
            this.sandbox.dom.off(this.sandbox.dom.window, 'click', this.hideDropDown.bind(this));
            this.sandbox.dom.hide(this.$dropDown);
            if (!!this.options.toggleClassOn) {
                this.sandbox.dom.removeClass(this.options.toggleClassOn, 'is-active');
            }
        },

        // get url for pattern
        getUrl: function() {
            return this.options.url;
        }

    };

});

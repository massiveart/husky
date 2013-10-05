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

define(['jquery'], function($) {

    'use strict';

    var sandbox,
        moduleName = 'Husky.Ui.DropDown',
        defaults = {
            url: '',     // url for lazy loading
            data: [],    // data array
            trigger: '',  // trigger for click event
            valueName: 'name', // name of text property
            setParentDropDown: false, // set class dropdown for parent dom object
            excludeItems: [], // items to filter,
            instanceName: 'undefined',  // instance name
            alignment: 'left',  // alignment of the arrow and the box
            translateLabels: true   // translate labels withe globalize
        };


    return {
        initialize: function() {
            sandbox = this.sandbox;

            this.name = moduleName;

            this.options = this.sandbox.util.extend({}, defaults, this.options);

//            // return if this plugin has a module instance
//            if (!!this.$element.data(moduleName)) {
//                return this;
//            }
//
//            // store the module instance into the jQuery data property
//           this. $element.data(moduleName, new Husky.Ui.DropDown(this, options));


            this.$element = $('<div class="husky-drop-down"/>');

            $(this.options.el).append(this.$element);

            this.init();
        },

        init: function() {
            sandbox.logger.log('initialize', this);


            // ------------------------------------------------------------
            // initialization
            // ------------------------------------------------------------
            this.$dropDown = $('<div class="dropdown-menu" />');
            this.$dropDownList = $('<ul/>');
            this.$element.append(this.$dropDown);
            this.$dropDown.append(this.$dropDownList);
            this.hideDropDown();

            if (this.options.setParentDropDown) {
                // add class dropdown to parent
                this.$element.parent().addClass('dropdown');
            }

            // check alginment
            if (this.options.alignment === 'right') {
                this.$dropDown.addClass('dropdown-align-right');
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
            this.$element.off();

            // ------------------------------------------------------------
            // DOM events
            // ------------------------------------------------------------

            // init drop-down

            if (this.options.trigger !== '') {
                $(this.options.el).on('click', this.options.trigger, this.triggerClick.bind(this));
            } else {
                $(this.options.el).on('click', this.triggerClick.bind(this));
            }

            // mouse control
            this.$dropDownList.on('click', 'li', function(event) {
                var $element = $(event.currentTarget),
                    id = $element.data('id');
                this.clickItem(id);
            }.bind(this));


        },

        bindCustomEvents: function() {
            this.sandbox.on(this.getEvent('toggle'), this.triggerClick.bind(this));
            this.sandbox.on(this.getEvent('show'), this.showDropDown.bind(this));
            this.sandbox.on(this.getEvent('hide'), this.hideDropDown.bind(this));
        },

        getEvent: function(append) {
            return 'husky.dropdown.' + this.options.instanceName + '.' + append;
        },

        // trigger event with clicked item
        clickItem: function(id) {
            this.options.data.forEach(function(item) {
                if (item.id === id) {
                    sandbox.logger.log(this.name, 'item.click: ' + id, 'success');
                    sandbox.emit(this.getEvent('item.click'), item, this.$el);
                    return false;
                }
            }.bind(this));
            this.hideDropDown();
        },

        // trigger click event handler toggles the dropDown
        triggerClick: function() {
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

            sandbox.util.ajax({
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

            // FIXME event will be binded later
            setTimeout(function() {
                this.sandbox.emit(this.getEvent('data.load'));
            }.bind(this), 200);
        },

        // generate dropDown with given items
        generateDropDown: function(items) {
            this.clearDropDown();
            if (items.length > 0) {
                items.forEach(function(item) {
                    if (this.isVisible(item)) {
                        var label = item[this.options.valueName];
                        if (this.options.translateLabels) {
                            label = this.sandbox.translate(label);
                        }
                        this.$dropDownList.append('<li data-id="' + item.id + '">' + label + '</li>');
                    }
                }.bind(this));
            } else {
                this.$dropDownList.append('<li>No data received</li>');
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
            this.$dropDown.children('ul').children('li').remove();
        },

        // toggle dropDown visible
        toggleDropDown: function() {
            this.sandbox.logger.log(this.name, 'toggle dropdown');
            this.$dropDown.toggle();
        },

        // make dropDown visible
        showDropDown: function() {
            this.sandbox.logger.log(this.name, 'show dropdown');
            this.$dropDown.show();
        },

        // hide dropDown
        hideDropDown: function() {
            this.sandbox.logger.log(this.name, 'hide dropdown');
            this.$dropDown.hide();
        },

        // get url for pattern
        getUrl: function() {
            return this.options.url;
        }

    };

});

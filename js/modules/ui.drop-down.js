/*****************************************************************************
 *
 *  DropDown
 *  [Short description]
 *
 *  Sections
 *      - initialization
 *      - DOM events
 *      - custom events
 *      - default values
 *
 *
 *****************************************************************************/

(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.DropDown';

    Husky.Ui.DropDown = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-drop-down"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.DropDown.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        // get url for pattern
        getUrl: function() {
            return this.options.url;
        },

        init: function() {
            Husky.DEBUG && console.log(this.name, 'init');

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

            // bind dom elements
            this.bindDOMEvents();

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
            if (this.options.trigger != '') {
                this.$originalElement.on('click', this.options.trigger, this.triggerClick.bind(this));
            } else {
                this.$originalElement.on('click', this.triggerClick.bind(this));
            }

            // mouse control
            this.$dropDownList.on('click', 'li', function(event) {
                var $element = $(event.currentTarget);
                var id = $element.data('id');
                this.clickItem(id);
            }.bind(this));

        },

        // trigger event with clicked item
        clickItem: function(id) {
            this.options.data.forEach(function(item) {
                if (item.id == id) {
                    Husky.DEBUG && console.log(this.name, 'click-item: ' + id, 'success');
                    this.trigger('drop-down:click-item', item);

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
            Husky.DEBUG && console.log(this.name, 'load: ' + url);

            Husky.Util.ajax({
                url: url,
                success: function(response) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    if (response.total > 0 && response.items.length == response.total) {
                        this.options.data = response.items;
                    } else {
                        this.options.data = [];
                    }
                    this.generateDropDown(this.options.data);
                }.bind(this),
                error: function() {
                    Husky.DEBUG && console.log(this.name, 'load', 'error');

                    this.options.data = [];
                    this.generateDropDown(this.options.data);
                }.bind(this)
            });

            // FIXME event will be binded later
            setTimeout(function() {
                this.trigger('drop-down:loadData', null);
            }.bind(this), 200);
        },

        // generate dropDown with given items
        generateDropDown: function(items) {
            this.clearDropDown();
            if (items.length > 0) {
                items.forEach(function(item) {
                    if (this.isVisible(item)) {
                        this.$dropDownList.append('<li data-id="' + item.id + '">' + item[this.options.valueName] + '</li>');
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
                if (item.id == testItem.id) result = false;
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
            Husky.DEBUG && console.log(this.name, 'toggle dropdown');
            this.$dropDown.toggle();
        },

        // make dropDown visible
        showDropDown: function() {
            Husky.DEBUG && console.log(this.name, 'show dropdown');
            this.$dropDown.show();
        },

        // hide dropDown
        hideDropDown: function() {
            Husky.DEBUG && console.log(this.name, 'hide dropdown');
            this.$dropDown.hide();
        }

    });

    $.fn.huskyDropDown = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyDropDown.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.DropDown(this, options));

        return this;
    };

    // ------------------------------------------------------------
    // default values
    // ------------------------------------------------------------
    $.fn.huskyDropDown.defaults = {
        url: '',     // url for lazy loading
        data: [],    // data array
        trigger: '',  // trigger for click event
        valueName: 'name', // name of text property
        setParentDropDown: false, // set class dropdown for parent dom object
        excludeItems: [] // items to filter
    };

})(Husky.$, this, this.document);

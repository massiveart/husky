(function($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.AutoComplete';

    Husky.Ui.AutoComplete = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-auto-complete dropdown"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.AutoComplete.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        // get url for pattern
        getUrl: function(pattern) {
            var delimiter = '?';
            if (this.options.url.indexOf('?') != -1) delimiter = '&';

            return this.options.url + delimiter + 'search=' + pattern;
        },

        getValueID: function() {
            if (this.options.value != null) {
                return this.options.value.id;
            } else {
                return null;
            }
        },

        getValueName: function() {
            if (this.options.value != null) {
                return this.options.value[this.options.valueName];
            } else {
                return '';
            }
        },

        init: function() {
            Husky.DEBUG && console.log(this.name, 'init');

            // init form-element and dropdown menu
            this.$valueField = $('<input type="text" autofill="false" class="name-value form-element" data-id="' + this.getValueID() +
                '" value="' + this.getValueName() + '"/>');
            this.$dropDown = $('<div class="dropdown-menu" />');
            this.$dropDownList = $('<ul/>');
            this.$element.append(this.$valueField);
            this.$element.append(this.$dropDown);
            this.$dropDown.append(this.$dropDownList);
            this.hideDropDown();

            // bind dom elements
            this.bindDOMEvents();

            if (this.options.value != null) {
                this.successField();
            }
        },

        // bind dom elements
        bindDOMEvents: function() {
            // turn off all events
            this.$element.off();

            // input value changed
            this.$valueField.on('input', this.inputChanged.bind(this));

            // mouse control
            this.$dropDownList.on('click', 'li', function(event) {
                var $element = $(event.currentTarget);
                var id = $element.data('id');

                var item = {id: id};
                item[this.options.valueName] = $element.text();
                this.selectItem(item);
            }.bind(this));

            // focus in
            this.$valueField.on('focusin', function() {
                this.$valueField.trigger('input');
            }.bind(this));

            // focus out
            this.$valueField.on('focusout', function() {
                // FIXME may there is a better solution ???
                setTimeout(function() {
                    this.hideDropDown()
                }.bind(this), 250);
            }.bind(this));

            // key control
            if (this.options.keyControl) {
                this.$valueField.on('keydown', function(event) {
                    // key 40 = down, key 38 = up, key 13 = enter
                    if ([40, 38, 13].indexOf(event.which) == -1) return;

                    event.preventDefault();
                    if (this.$dropDown.is(':visible')) {

                        if (event.which == 40)      this.pressKeyDown();
                        else if (event.which == 38) this.pressKeyUp();
                        else if (event.which == 13) this.pressKeyEnter();

                    } else {
                        // If dropdown not visible => search for given pattern
                        this.noStateField();
                        this.loadData(this.$valueField.val());
                    }
                }.bind(this));

                // remove hover class by mouseover
                this.$dropDownList.on('mouseover', 'li', function() {
                    this.$dropDownList.children().removeClass('hover');
                }.bind(this));
            }
        },

        // value of input changed
        inputChanged: function() {
            Husky.DEBUG && console.log(this.name, 'inputChanged');

            // value is not success
            this.noStateField();

            var val = this.$valueField.val();
            if (val.length >= this.options.minLength) {
                this.loadData(val);
            }
        },

        // load data from server
        loadData: function(pattern) {
            var url = this.getUrl(pattern);
            Husky.DEBUG && console.log(this.name, 'load: ' + url);

            Husky.Util.ajax({
                url: url,
                success: function(response) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    // if only one result this is it, if no result hideDropDown, else generateDropDown
                    if (response.total > 1) {
                        this.generateDropDown(response.items);
                    } else if (response.total == 1) {
                        this.selectItem(response.items[0]);
                    } else {
                        this.hideDropDown();
                    }
                }.bind(this),
                error: function() {
                    Husky.DEBUG && console.log(this.name, 'load', 'error');

                    this.failField();
                    this.hideDropDown();
                }.bind(this)
            });

            this.trigger('auto-complete:loadData', null);
        },

        // generate dropDown with given items
        generateDropDown: function(items) {
            this.clearDropDown();
            items.forEach(function(item) {
                if (this.isVisible(item)) {
                    this.$dropDownList.append('<li data-id="' + item.id + '">' + item[this.options.valueName] + '</li>');
                }
            }.bind(this));
            this.showDropDown();
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

        // make dropDown visible
        showDropDown: function() {
            Husky.DEBUG && console.log(this.name, 'show dropdown');
            this.$dropDown.show();
        },

        // hide dropDown
        hideDropDown: function() {
            Husky.DEBUG && console.log(this.name, 'hide dropdown');
            this.clearDropDown();
            this.$dropDown.hide();
        },

        // set class success to field
        successField: function() {
            Husky.DEBUG && console.log(this.name, 'set success');
            this.clearDropDown();
            this.$valueField.removeClass('fail');
            this.$valueField.addClass('success');
        },

        // remove class success and fail of field
        noStateField: function() {
            Husky.DEBUG && console.log(this.name, 'remove success and fail');
            this.$valueField.data('');
            this.$valueField.removeClass('success');
            this.$valueField.removeClass('fail');
        },

        // add class fail to field
        failField: function() {
            Husky.DEBUG && console.log(this.name, 'set fail');
            this.$valueField.removeClass('success');
            this.$valueField.addClass('fail');
        },

        // handle key down
        pressKeyDown: function() {
            Husky.DEBUG && console.log(this.name, 'key down');

            // get actual and next element
            var $actual = this.$dropDownList.children('.hover');
            var $next = $actual.next();
            // no element selected
            if ($next.length == 0) {
                $next = this.$dropDownList.children().first();
            }

            $actual.removeClass('hover');
            $next.addClass('hover');
        },

        // handle key up
        pressKeyUp: function() {
            Husky.DEBUG && console.log(this.name, 'key up');

            // get actual and next element
            var $actual = this.$dropDownList.children('.hover');
            var $next = $actual.prev();
            // no element selected
            if ($next.length == 0) {
                $next = this.$dropDownList.children().last();
            }

            $actual.removeClass('hover');
            $next.addClass('hover');
        },

        // handle key enter
        pressKeyEnter: function() {
            Husky.DEBUG && console.log(this.name, 'key enter');

            // if one element selected
            var $actual = this.$dropDownList.children('.hover');
            if ($actual.length == 1) {
                var item = {id: $actual.data('id')};
                item[this.options.valueName] = $actual.text();
                this.selectItem(item);
            } else {
                // if it is one of the list
                var value = this.$valueField.val();

                var childs = this.$dropDownList.children();
                var that = this;
                $(childs).each(function() {
                    if ($(this).text() == value) {
                        // found an item select it
                        var item = {id: $(this).data('id')};
                        item[that.options.valueName] = $(this).text();
                        that.selectItem(item);
                        return false;
                    }
                });
            }
        },

        // select an item
        selectItem: function(item) {
            Husky.DEBUG && console.log(this.name, 'select item: ' + item.id);
            // set id to data-id
            this.$valueField.data('id', item.id);
            // set value to value
            this.$valueField.val(item[this.options.valueName]);

            this.hideDropDown();
            this.successField();
        }
    });

    $.fn.huskyAutoComplete = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyAutoComplete.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.AutoComplete(this, options));

        return this;
    };

    $.fn.huskyAutoComplete.defaults = {
        url: '', // url to load data
        valueName: 'name', // propertyName for value
        minLength: 3, // min length for request
        keyControl: true, // control with up/down key
        value: null, // value to display at start
        excludeItems: [] // items to filter
    };

})(Husky.$, this, this.document);

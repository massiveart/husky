/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: auto-complete
 * Options:
 *  url ... url to load data
 *  valueName ... propertyName for value
 *  minLength ... min length for request
 *  keyControl ... control with up/down key
 *  value ... value to display at start
 *  excludeItems ... items to filter
 *
 * Provided Events:
 *  auto-complete.load-data ... event to append data
 */

define([], function() {

    'use strict';

    var defaults = {
            url: '',            // url to load data
            valueName: 'name',  // propertyName for value
            minLength: 3,       // min length for request
            keyControl: true,   // control with up/down key
            value: null,        // value to display at start
            excludeItems: []    // items to filter
        },
        successClass = 'husky-auto-complete-success',
        failClass = 'husky-auto-complete-error',
        loadingClass = 'husky-auto-complete-loading';

    return {
        data: [],

        getEvent: function(append) {
            return 'husky.auto-complete.' + append;
        },

        // get url for pattern
        getUrl: function(pattern) {
            var delimiter = '?';
            if (this.options.url.indexOf('?') !== -1) {
                delimiter = '&';
            }

            return this.options.url + delimiter + 'search=' + pattern;
        },

        getValueID: function() {
            if (!!this.options.value) {
                return this.options.value.id;
            } else {
                return null;
            }
        },

        getValueName: function() {
            if (!!this.options.value) {
                return this.options.value[this.options.valueName];
            } else {
                return '';
            }
        },

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();
        },

        render: function() {
            this.$el.addClass('dropdown husky-auto-complete');
            // init form-element and dropdown menu
            this.$valueField = $('<input type="text" autofill="false" class="name-value form-element husky-validate" data-id="' + this.getValueID() + '" value="' + this.getValueName() + '"/>');
            this.$dropDown = $('<div class="dropdown-menu" />');
            this.$dropDownList = $('<ul/>');
            this.$el.append(this.$valueField);
            this.$el.append(this.$dropDown);
            this.$dropDown.append(this.$dropDownList);
            this.hideDropDown();

            // bind dom elements
            this.bindDOMEvents();

            if (!!this.options.value) {
                this.successState();
            }
        },

        // bind dom elements
        bindDOMEvents: function() {
            // turn off all events
            this.$el.off();

            // input value changed
            this.$valueField.on('input', this.inputChanged.bind(this));

            // mouse control
            this.$dropDownList.on('click', 'li', function(event) {
                var $element = $(event.currentTarget),
                    id = $element.data('id'),
                    item = {id: id};

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
                    this.hideDropDown();
                }.bind(this), 250);
            }.bind(this));

            // key control
            if (this.options.keyControl) {
                this.$valueField.on('keydown', function(event) {
                    // key 40 = down, key 38 = up, key 13 = enter
                    if ([40, 38, 13].indexOf(event.which) === -1) {
                        return;
                    }

                    event.preventDefault();
                    if (this.$dropDown.is(':visible')) {

                        if (event.which === 40) {
                            this.pressKeyDown();
                        }
                        else if (event.which === 38) {
                            this.pressKeyUp();
                        }
                        else if (event.which === 13) {
                            this.pressKeyEnter();
                        }

                    } else {
                        // If dropdown not visible => search for given pattern
                        this.noState();
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
            this.sandbox.logger.log('inputChanged');

            // value is not success
            this.noState();

            var val = this.$valueField.val();
            if (val.length >= this.options.minLength) {
                this.loadData(val);
            }
        },

        // load data from server
        loadData: function(pattern) {
            var url = this.getUrl(pattern);
            this.sandbox.logger.log('load: ' + url);
            this.loadingState();

            $.ajax({
                url: url,
                success: function(response) {
                    this.sandbox.logger.log('load', 'success');

                    this.noState();

                    // if only one result this is it, if no result hideDropDown, else generateDropDown
                    this.updateData(response.items);
                    if (this.data.length > 1) {
                        this.generateDropDown(this.data);
                    } else if (this.data.length === 1) {
                        this.selectItem(this.data[0]);
                    } else {
                        this.failState();
                        this.hideDropDown();
                    }
                }.bind(this),
                error: function() {
                    this.sandbox.logger.log('load', 'error');

                    this.failState();
                    this.hideDropDown();
                }.bind(this)
            });

            this.sandbox.emit(this.getEvent('load-data'));
        },

        // update global data array
        updateData: function(newData) {
            this.data = [];
            if (!!newData && $.isArray(newData)) {
                newData.forEach(function(item) {
                    if (this.isVisible(item)) {
                        this.data.push(item);
                    }
                }.bind(this));
            }
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
                if (parseInt(item.id, 10) === parseInt(testItem.id, 10)) {
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

        // make dropDown visible
        showDropDown: function() {
            this.sandbox.logger.log('show dropdown');
            this.$dropDown.show();
        },

        // hide dropDown
        hideDropDown: function() {
            this.sandbox.logger.log('hide dropdown');
            this.clearDropDown();
            this.$dropDown.hide();
        },

        // set class success to container
        successState: function() {
            this.sandbox.logger.log('set success');
            this.clearDropDown();
            this.$el.parent().removeClass(failClass);
            this.$el.parent().removeClass(loadingClass);
            this.$el.parent().addClass(successClass);
        },

        // remove class success, fail and loading of container
        noState: function() {
            this.sandbox.logger.log('remove success and fail');
            this.$valueField.data('');
            this.$el.parent().removeClass(failClass);
            this.$el.parent().removeClass(loadingClass);
            this.$el.parent().removeClass(successClass);
        },

        // add class fail to container
        failState: function() {
            this.sandbox.logger.log('set fail');
            this.$el.parent().addClass(failClass);
            this.$el.parent().removeClass(loadingClass);
            this.$el.parent().removeClass(successClass);
        },

        // add class loading to container
        loadingState: function() {
            this.sandbox.logger.log('set loading');
            this.$el.parent().removeClass(failClass);
            this.$el.parent().addClass(loadingClass);
            this.$el.parent().removeClass(successClass);
        },

        // handle key down
        pressKeyDown: function() {
            this.sandbox.logger.log('key down');

            // get actual and next element
            var $actual = this.$dropDownList.children('.hover'),
                $next = $actual.next();

            // no element selected
            if ($next.length === 0) {
                $next = this.$dropDownList.children().first();
            }

            $actual.removeClass('hover');
            $next.addClass('hover');
        },

        // handle key up
        pressKeyUp: function() {
            this.sandbox.logger.log('key up');

            // get actual and next element
            var $actual = this.$dropDownList.children('.hover'),
                $next = $actual.prev();
            // no element selected
            if ($next.length === 0) {
                $next = this.$dropDownList.children().last();
            }

            $actual.removeClass('hover');
            $next.addClass('hover');
        },

        // handle key enter
        pressKeyEnter: function() {
            this.sandbox.logger.log('key enter');

            // if one element selected
            var $actual = this.$dropDownList.children('.hover'),
                item, value, childs, that;
            if ($actual.length === 1) {
                item = {id: $actual.data('id')};
                item[this.options.valueName] = $actual.text();
                this.selectItem(item);
            } else {
                // if it is one of the list
                value = this.$valueField.val();
                childs = this.$dropDownList.children();
                that = this;

                $(childs).each(function() {
                    if ($(this).text() === value) {
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
            this.sandbox.logger.log('select item: ' + item.id);
            // set id to data-id
            this.$valueField.data('id', item.id);
            // set value to value
            this.$valueField.val(item[this.options.valueName]);

            this.hideDropDown();
            this.successState();
        }
    };
});

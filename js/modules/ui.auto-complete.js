(function ($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.AutoComplete';

    Husky.Ui.AutoComplete = function (element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-auto-complete dropdown"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.AutoComplete.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function () {
            return $.extend({}, Husky.Events);
        })(),

        getUrl: function (pattern) {
            var delimiter = '?';
            if (this.options.url.indexOf('?') != -1) delimiter = '&';

            return this.options.url + delimiter + 'search=' + pattern;
        },

        init: function () {
            Husky.DEBUG && console.log(this.name, 'init');

            this.$valueField = $('<input type="text" class="nameValue" data-id=""/>');
            this.$dropDown = $('<div class="dropdown-menu" />');
            this.$dropDownList = $('<ul/>');
            this.$element.append(this.$valueField);
            this.$element.append(this.$dropDown);
            this.$dropDown.append(this.$dropDownList);
            this.hideDropDown();

            this.bindDOMEvents();
        },

        bindDOMEvents: function () {
            this.$element.off();

            this.$valueField.on('input', this.inputChanged.bind(this));

            this.$dropDownList.on('click', 'li', function (event) {
                var $element = $(event.currentTarget);
                var id = $element.data('id');

                var item = {id: id};
                item[this.options.valueName] = $element.text();
                this.selectItem(item);
            }.bind(this));

            // TODO keys up down
        },

        inputChanged: function (event) {
            Husky.DEBUG && console.log(this.name, 'inputChanged');

            this.notSuccessDropDown();

            var val = this.$valueField.val();
            if (val.length >= this.options.minLength) {
                this.loadData(val);
            }
        },

        loadData: function (pattern) {
            var url = this.getUrl(pattern);
            Husky.DEBUG && console.log(this.name, 'load: ' + url);

            Husky.Util.ajax({
                url: url,
                success: function (response) {
                    Husky.DEBUG && console.log(this.name, 'load', 'success');

                    if (response.total > 1) {
                        this.generateDropDown(response.items);
                    } else if (response.total == 1) {
                        this.selectItem(response.items[0]);
                    } else {
                        this.hideDropDown();
                    }
                }.bind(this),
                error: function () {
                    Husky.DEBUG && console.log(this.name, 'load', 'error');
                }.bind(this)
            });

            this.trigger('auto-complete:loadData', null);
        },

        generateDropDown: function (items) {
            // FIXME make it easier
            this.$dropDown.children('ul').children('li').remove();
            items.forEach(function (item) {
                this.$dropDownList.append('<li data-id="' + item.id + '">' + item[this.options.valueName] + '</li>');
            }.bind(this));
            this.showDropDown();
        },

        showDropDown: function () {
            this.$dropDown.show();
        },

        hideDropDown: function () {
            this.$dropDown.hide();
        },

        successDropDown: function () {
            this.$valueField.addClass('success');
        },

        notSuccessDropDown: function () {
            this.$valueField.removeClass('success');
        },

        selectItem: function (item) {
            this.$valueField.data('id', item.id);
            this.$valueField.val(item[this.options.valueName]);
            this.hideDropDown();
            this.successDropDown();
        }
    });

    $.fn.huskyAutoComplete = function (options) {
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
        url: '',
        valueName: 'name',
        minLength: 3
    };

})(Husky.$, this, this.document);
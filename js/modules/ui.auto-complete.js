(function ($, window, document, undefined) {
    'use strict';

    var moduleName = 'Husky.Ui.AutoComplete';

    Husky.Ui.AutoComplete = function (element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-auto-complete"/>');
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

            this.$idField = $('<input type="hidden" class="idValue"/>');
            this.$valueField = $('<input type="text" class="nameValue"/>');
            this.$element.append(this.$idField);
            this.$element.append(this.$valueField);

            this.bindDOMEvents();
        },

        bindDOMEvents: function () {
            this.$element.off();
            this.$valueField.on('input', this.inputChanged.bind(this));
        },

        inputChanged: function (event) {
            Husky.DEBUG && console.log(this.name, 'inputChanged');

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

                    console.log(response);
                }.bind(this),
                error: function () {
                    Husky.DEBUG && console.log(this.name, 'load', 'error');
                }.bind(this)
            });

            this.trigger('auto-complete:loadData', null);
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
        minLength: 3
    };

})(Husky.$, this, this.document);
/*****************************************************************************
 *
 *  Select
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

    var moduleName = 'Husky.Ui.Select';

    Husky.Ui.Select = function(element, options) {
        this.name = moduleName;

        Husky.DEBUG && console.log(this.name, 'create instance');

        this.options = options;

        this.configs = {};

        this.$originalElement = $(element);
        this.$element = $('<div class="husky-ui-select"/>');
        this.$originalElement.append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.Select.prototype, Husky.Events, {
        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        getUrl: function() {
            return this.options.url;
        },

        init: function() {
            Husky.DEBUG && console.log(this.name, 'init');

            // ------------------------------------------------------------
            // initialization
            // ------------------------------------------------------------
            this.$select = $('<select class="select-value form-element"/>');
            this.$element.append(this.$select);
            this.prepareData();

            // bind dom elements
            this.bindDOMEvents();
        },

        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.$element.off();

            // ------------------------------------------------------------
            // DOM events
            // ------------------------------------------------------------

        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                this.generateOptions(this.options.data);
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
                    this.generateOptions(this.options.data);
                }.bind(this),
                error: function() {
                    Husky.DEBUG && console.log(this.name, 'load', 'error');

                    this.options.data = [];
                    this.generateOptions(this.options.data);
                }.bind(this)
            });

            // FIXME event will be binded later
            setTimeout(function() {
                this.trigger('select:loadData', null);
            }.bind(this), 200);
        },

        generateOptions: function(items) {
            this.clearOptions();
            items.forEach(this.generateOption.bind(this));
        },

        generateOption: function(item) {
            var $option = $('<option value="' + item.id + '">' + item[this.options.valueName] + '</option>');
            if ((this.options.selected != null && this.options.selected.id == item.id) ||
                (this.options.selected == null && this.options.defaultItem.id == item.id)) {
                $option.attr("selected", true);
            }
            this.$select.append($option);
        },

        clearOptions: function() {
            this.$select.find('option').remove();
        }

    });

    $.fn.huskySelect = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskySelect.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.Select(this, options));

        return this;
    };

    $.fn.huskySelect.defaults = {
        url: '',
        data: [],
        valueName: 'name',
        selected: null,
        defaultItem: { id: 1 }
    };

})(Husky.$, this, this.document);

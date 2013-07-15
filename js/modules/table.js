(function($, window, document, undefined) {
    'use strict';

    Husky.ui.list = function(element, options) {
        var defaultOptions = 
        this.options = options
        this.$element = $(element);
        this.$list = null;

        this.data = null;

        if (!!this.options.url) {
            this.loadData();
        }
    };

    Husky.ui.list.prototype = {

        loadData: function(url) {
            Husky.util.ajax({
                url: url || this.options.url,
                success: function(data) {
                    this.data = $.parseJSON(data);
                    this.prepareView();
                    this.render();
                }.bind(this)
            });

            // this.data = '[{ "column_1": "cell_1", "column_2": "cell_2", "column_3": "cell_3"}, { "column_1": "cell_1", "column_2": "cell_2", "column_3": "cell_3" }]';
        },

        prepareView: function() {
            var $list = null,
                tblHead = '',
                tblBody = '',
                tblRow = '';

            if (this.options.listType === 'list') {
                $list = $('<ul/>');
                // TODO
            } else {
                $list = $('<table/>', {
                    class: (!!this.options.className && this.options.className !== 'table') ? 'table ' + this.options.className : 'table'
                });

                this.data.forEach(function(entry) {
                    tblRow = '';

                    $.each(entry, function(idx, value) {
                        tblRow += '<td>' + value + '</td>';
                    });

                    tblBody += '<tr>' + tblRow + '</tr>';                 
                });

                $list.append(tblBody);
            }

            this.$list = $list;
        },

        render: function() {
            this.$element.html(this.$list);
        }
    };

    $.fn.huskyList = function(options) {
        return this.each(function() {
            options = $.extend({}, $.fn.huskyList.defaults, typeof options == 'object' && options);
            new Husky.ui.list(this, options);
        });
    };

    $.fn.huskyList.defaults = {
        listType: 'table'
    };

})(window.jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';

    Husky.Ui.DataGrid = function(element, options) {
        this.name = 'Husky.Ui.DataGrid';

        Husky.DEBUG && console.log(this.name, "create instance");

        this.options = options;
        this.$element = $(element);
        this.$list = null;

        // sample column mapping
        this.options.columnMapping = {
            tile: { display: 'Title', width: '20%', sortable: true },
            date: { display: 'Last edit date', width: '20%', sortable: false }
        }

        this.data = null;

        if (!!this.options.url) {
            this.loadData();
        }
    };

    $.extend(Husky.Ui.DataGrid.prototype, Husky.Events, {

        loadData: function(url) {
            Husky.DEBUG && console.log(this.name, "loadData");

            Husky.Util.ajax({
                url: url || this.options.url,
                success: function(data) {
                    this.data = data;
                    this.prepareView();
                    this.render();
                }.bind(this)
            });

            // this.data = '{ page: 1, total: 200, page_siz: 20, date: [{ "column_1": "cell_1", "column_2": "cell_2", "column_3": "cell_3"}, { "column_1": "cell_1", "column_2": "cell_2", "column_3": "cell_3" }] }';
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
    });

    $.fn.huskyList = function(options) {
        options = $.extend({}, $.fn.huskyList.defaults, typeof options == 'object' && options);
        new Husky.Ui.DataGrid(this, options);

        return this;
    };

    $.fn.huskyList.defaults = {
        listType: 'table'
    };

})(Husky.$, this, this.document);
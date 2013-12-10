/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: column navigation
 * Options:
 *
 * Emits:
 *  husky.column.navigation.initialized
 *  husky.column.navigation.data.loaded
 *  husky.column.navigation.selected
 *
 * Listens:
 */

define([], function() {

    'use strict';

    var defaults = {
        wrapper: {
            height: "300px"
        },
        column: {
            width: "200px"
        },
        url: null
    };

    return {

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.columns = [];
            this.selected = [];

            this.render();
            this.load(this.options.url, 0);
            this.bindDOMEvents();

        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {

            this.$container = this.sandbox.dom.$('<div/>');
            this.sandbox.dom.addClass(this.$container, 'column-navigation');
            this.sandbox.dom.css(this.$container, 'height', this.options.wrapper.height);

            this.$element = this.sandbox.dom.$(this.options.el);
            this.sandbox.dom.append(this.$element, this.$container);

            // TODO
            // add and settings button
        },

        /**
         * Loads data from a specific url and triggers the parsing
         */
        load: function(url, columnNumber) {

            if(!!url) {

                this.sandbox.util.ajax({

                    url: url,

                    error: function(jqXHR, textStatus, errorThrown) {
                        this.sandbox.logger.log("An error occured while fetching data from: " + this.options.url);
                        this.sandbox.logger.log("errorthrown",errorThrown.message);
                    }.bind(this),

                    success: function(response) {

                        this.parseData(response, columnNumber);
                        this.sandbox.emit('husky.column.navigation.loaded');

                    }.bind(this)
                });
            } else {
                this.sandbox.logger.log("husky.column.navigation - invalid url, aborted loading of data");
            }
        },

        /**
         * Removes removes data and removes dom elements
         * @param newColumn
         */
        removeColumns: function(newColumn){

            // remove old data and remove old dom elements
            var length = this.columns.length -1,
                i;

            for(i = length; i >= newColumn; i--){
                delete this.columns[i];
                this.sandbox.dom.remove('#column-'+i);
            }

        },

        /**
         * Parses the received data and renders columns
         */
        parseData: function(data, columnNumber){
            var $column,
                $list,
                newColumn;

            this.data = {};
            this.data.links = data._links;
            this.data.embedded = data._embedded;
            this.data.title = data.title;
            this.data.id = data.id;
            this.data.hasSub = data.hasSub;

            if (columnNumber === 0){  // case 1: no elements in container

                this.columns[0] = [];
                this.columns[0][data.id] = data;
                newColumn = 1;

            } else { // case 2: columns in container replace level after clicked column and clear following levels

                newColumn = columnNumber + 1;

            }

            $column = this.sandbox.dom.$(this.template.column(newColumn , this.options.wrapper.height));
            $list = this.sandbox.dom.find('ul', $column);

            this.sandbox.util.each(this.data.embedded, function(index,value){
                this.storeDataItem(newColumn, value);
                this.sandbox.dom.append($list, this.sandbox.dom.$(this.template.item(value)));
            }.bind(this));

            this.sandbox.dom.append(this.$container, $column);

        },

        /**
         * Stores data in internal structor - seperated by column number
         * @param data
         * @param columnNumber
         */
        storeDataItem: function(columnNumber, item) {

            if (!this.columns[columnNumber]) {
                this.columns[columnNumber] = [];
            }

            this.columns[columnNumber][item.id] = item;

        },


        bindDOMEvents: function(){
            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), 'li');

        },

        /**
         * Item was selected and data will be loaded if has sub
         * @param event
         */
        itemSelected: function(event){

            // TODO
            // css

            var $target = this.sandbox.dom.$(event.currentTarget),
                id = this.sandbox.dom.data($target, 'id'),
                column = this.sandbox.dom.data(this.sandbox.dom.parent($target), 'column'),
                selectedItem = this.columns[column][id],
                length = this.selected.length - 1,
                i;

            if(!!selectedItem) {

                // remove old elements from breadcrumb
                for(i = length; i >= column; i--){
                    delete this.selected[i];
                }

                // add element to breadcrumb
                this.selected[column] = selectedItem;

                this.sandbox.logger.log('Breadcrumb: ', this.selected);
                this.sandbox.emit('husky.column.navigation.selected', selectedItem);

                if(!!selectedItem.hasSub) {
                    this.removeColumns(column +1);
                    this.load(selectedItem._links.children, column);
                }
            }
        },

        /**
         * Emits an add event
         */
        addNode: function(column){

            var parent = this.selected[column-1];
            this.sandbox.dom.emit('husky.column.navigation.add', parent);
        },

        template : {
            column : function (columnNumber, height){
                return ['<div class="column" id="column-',columnNumber,'" style="height:',height,'"><ul data-column="',columnNumber,'"></ul></div>'].join('');
            },

            item : function (data){

                var item = ['<li data-id="',data.id,'" class="pointer">'];

                // TODO
                // has status (online, offline, ghost, shadow, linked)

                // TODO
                // is editable, is selected, is ghost

                // text
                item.push('<span class="column-navigation-item-text pull-left">',data.title,'</span>');


                // icons right (subpage, edit)
                item.push('<span class="column-navigation-item-icons-right pull-right">');
//                item.push('<span class="icon-chevron-right"></span>');
                !!data.hasSub ? item.push('<span class="icon-chevron-right"></span>') : '';
                item.push('</span></li>');

                return item.join('');
            }
        }



    };
});

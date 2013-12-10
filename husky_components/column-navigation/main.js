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
 *  husky.column.navigation.data.loaded
 *  husky.column.navigation.selected[item]
 *  husky.column.navigation.add[parent]
 *
 * Listens:
 * husky.column.navigation.get-breadcrumb[callback]
 */

// TODO
// browser compatibility

define([], function() {

    'use strict';

    var defaults = {
        wrapper: {
            height: 300
        },
        column: {
            width: 250
        },
        scrollBarWidth: 15,
        url: null
    };

    return {

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.$element = this.sandbox.dom.$(this.options.el);
            this.columns = [];
            this.selected = [];

            this.render();
            this.load(this.options.url, 0);
            this.bindDOMEvents();
            this.bindCustomEvents();

        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {
            var $add, $settings, $wrapper;

            $wrapper = this.sandbox.dom.$(this.template.wrapper());
            this.sandbox.dom.append(this.$element, $wrapper);

            // navigation container
            this.$columnContainer = this.sandbox.dom.$(this.template.columnContainer(this.options.wrapper.height + this.options.scrollBarWidth));
            this.sandbox.dom.append($wrapper, this.$columnContainer);

            // options container - add and settings button
            this.$optionsContainer = this.sandbox.dom.$(this.template.optionsContainer(this.options.column.width));
            $add = this.sandbox.dom.$(this.template.options.add());
            $settings = this.sandbox.dom.$(this.template.options.settings());
            this.sandbox.dom.append(this.$optionsContainer, $add);
            this.sandbox.dom.append(this.$optionsContainer, $settings);

            this.sandbox.dom.append($wrapper, this.$optionsContainer);
        },

        /**
         * Loads data from a specific url and triggers the parsing
         */
        load: function(url, columnNumber) {

            if (!!url) {

                this.sandbox.util.ajax({

                    url: url,

                    error: function(jqXHR, textStatus, errorThrown) {
                        this.sandbox.logger.log("An error occured while fetching data from: " + this.options.url);
                        this.sandbox.logger.log("errorthrown", errorThrown.message);
                    }.bind(this),

                    success: function(response) {

                        this.parseData(response, columnNumber);
                        this.sandbox.emit('husky.column.navigation.loaded');

                    }.bind(this)
                });
            } else {
                this.sandbox.logger.log("husky.column.navigation -  url not set, aborted loading of data");
            }
        },

        /**
         * Removes removes data and removes dom elements
         * @param newColumn
         */
        removeColumns: function(newColumn) {

            var length = this.columns.length - 1,
                i;

            for (i = length; i >= newColumn; i--) {
                delete this.columns[i];
                this.sandbox.dom.remove('#column-' + i);
            }
        },

        /**
         * Parses the received data and renders columns
         */
        parseData: function(data, columnNumber) {
            var $column,
                $list,
                newColumn;

            this.data = {};
            this.data.links = data._links;
            this.data.embedded = data._embedded;
            this.data.title = data.title;
            this.data.id = data.id;
            this.data.hasSub = data.hasSub;

            if (columnNumber === 0) {  // case 1: no elements in container
                this.columns[0] = [];
                this.columns[0][data.id] = data;
                newColumn = 1;
            } else { // case 2: columns in container replace level after clicked column and clear following levels
                newColumn = columnNumber + 1;
            }

            $column = this.sandbox.dom.$(this.template.column(newColumn, this.options.wrapper.height));
            $list = this.sandbox.dom.find('ul', $column);

            this.sandbox.util.each(this.data.embedded, function(index, value) {
                this.storeDataItem(newColumn, value);
                this.sandbox.dom.append($list, this.sandbox.dom.$(this.template.item(this.options.column.width - this.options.scrollBarWidth, value)));
            }.bind(this));

            this.sandbox.dom.append(this.$columnContainer, $column);

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


        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.itemSelected.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.itemMouseEnter.bind(this), 'li');
            this.sandbox.dom.on(this.$el, 'mouseleave', this.itemMouseLeave.bind(this), 'li');

            this.sandbox.dom.on(this.$el, 'mouseenter', this.showOptions.bind(this), '.column');
            this.sandbox.dom.on(this.$el, 'click', this.addNode.bind(this), '#column-navigation-add');
            this.sandbox.dom.on(this.$el, 'click', this.toggleSettings.bind(this), '#column-navigation-settings');
            this.sandbox.dom.on(this.$el, 'click', this.editNode.bind(this), '.edit');
        },

        bindCustomEvents: function(){
            this.sandbox.on('husky.column.navigation.get-breadcrumb', this.getBreadCrumb.bind(this));
        },

        itemMouseEnter: function(event){
            var $edit = this.sandbox.dom.find('.edit', event.currentTarget);
            this.sandbox.dom.toggle($edit);
        },

        itemMouseLeave: function(event){
            var $edit = this.sandbox.dom.find('.edit', event.currentTarget);
            this.sandbox.dom.toggle($edit);
        },

        getBreadCrumb: function(callback){
            if(typeof callback === 'function') {
                callback(this.selected);
            } else {
                this.sandbox.logger.log("callback is not a function");
            }
        },

        showOptions: function(event) {
            this.lastHoveredColumn = this.sandbox.dom.data(this.sandbox.dom.$(event.currentTarget), 'column');
            this.sandbox.dom.show(this.$optionsContainer);
            this.sandbox.dom.css(this.$optionsContainer, 'margin-left', ((this.lastHoveredColumn - 1) * this.options.column.width) + 'px');
        },


        /**
         * Item was selected and data will be loaded if has sub
         * @param event
         */
        itemSelected: function(event) {

            var $target = this.sandbox.dom.$(event.currentTarget),
                id = this.sandbox.dom.data($target, 'id'),
                column = this.sandbox.dom.data(this.sandbox.dom.parent(this.sandbox.dom.parent($target)), 'column'),
                selectedItem = this.columns[column][id],
                length = this.selected.length - 1,
                i, $arrowElement;

            this.removeCurrentSelected(column);
            this.sandbox.dom.addClass($target, 'selected');
            $arrowElement = this.sandbox.dom.find('.arrow', $target);
            this.sandbox.dom.removeClass($arrowElement, 'inactive');

            if (!!selectedItem) {

                // remove old elements from breadcrumb
                for (i = length; i >= column; i--) {
                    delete this.selected[i];
                }

                // add element to breadcrumb
                this.selected[column] = selectedItem;
                this.sandbox.emit('husky.column.navigation.selected', selectedItem);

                if (!!selectedItem.hasSub) {
                    this.load(selectedItem._links.children, column);
                }

                this.removeColumns(column + 1);
            }
        },

        /**
         * Removes the selected class from old elements
         * @param column
         */
        removeCurrentSelected: function(column) {
            var items = this.sandbox.dom.find('li', '#column-'+column);
            this.sandbox.util.each(items, function(index, $el){
                this.sandbox.dom.removeClass($el, 'selected');
                var $arrowElement = this.sandbox.dom.find('.arrow', $el);
                this.sandbox.dom.addClass($arrowElement, 'inactive');
            }.bind(this));
        },

        /**
         * Emits an add event
         */
        addNode: function(){
            var parent = this.selected[this.lastHoveredColumn-1] || null;
            this.sandbox.emit('husky.column.navigation.add', parent);
        },

        /**
         * Emits an edit event
         */
        editNode: function(event){
            var $listItem = this.sandbox.dom.parent(this.sandbox.dom.parent(event.currentTarget)),
                id = this.sandbox.dom.data($listItem,'id'),
                item = this.columns[this.lastHoveredColumn][id];

            this.sandbox.dom.stopPropagation(event);
            this.sandbox.emit('husky.column.navigation.edit', item);
        },

        /**
         * Shows or hides the settings dropdown
         */
        toggleSettings: function() {
            var parent = this.selected[this.lastHoveredColumn-1] || null;
            this.sandbox.emit('husky.column.navigation.settings', parent);
        },

        /**
         * Templates for various parts
         */
        template : {

            wrapper : function() {
              return '<div class="column-navigation-wrapper"></div>';
            },

            columnContainer: function(height) {
                return ['<div class="column-navigation" style="height:',height,'px"></div>'].join('');
            },

            column : function (columnNumber, height, width){
                return ['<div data-column="',columnNumber,'" class="column" id="column-',columnNumber,'" style="height:',height,'px; width: ',width,'px"><ul></ul></div>'].join('');
            },

            item : function (width, data){

                var item = ['<li data-id="',data.id,'" class="pointer" style="width:',width,'px">'];

                // TODO
                // has status (link, type, published)

                // TODO
                // is editable

                // text
                item.push('<span class="item-text pull-left">',data.title,'</span>');


                // icons right (subpage, edit)
                item.push('<span class="column-navigation-item-icons-right pull-right">');
                item.push('<span class="icon-edit-pen edit hidden"></span>');
                !!data.hasSub ? item.push('<span class="icon-chevron-right arrow inactive"></span>') : '';
                item.push('</span></li>');

                return item.join('');
            },

            optionsContainer: function(width){
                return ['<div class="options grid-row hidden" style="width:',width,'px"></div>'].join('');
            },

            options: {
                add : function (){
                    return ['<div id="column-navigation-add" class="align-center grid-col-6 add pointer">' +
                                '<span class="icon-add"></span>' +
                            '</div>'].join('');
                },

                settings : function() {
                    return ['<div id="column-navigation-settings" class="align-center grid-col-6 settings pointer">' +
                                '<span class="icon-cogwheel"></span>' +
                             '</div>'].join('');
                }
            }
        }



    };
});

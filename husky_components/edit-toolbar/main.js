/*****************************************************************************
 *
 *  edit-toolbar
 *
 *  Options (defaults)
 *      - url: url to fetch data from
 *      - data: if no url is provided
 *      - instanceName - enables custom events (in case of multiple tabs on one page)
 *      - appearance -
 *  Provides Events
 *      -
 *  Triggers Events
 *      - husky.toolbar.<<instanceName>>.item.select - triggered when item was clicked
 *
 *
 *  data structure:
 *      - title
 *      - id (optional - will be generated otherwise)
 *      - icon (optional)
 *      - iconSize (optional: large/medium/small)
 *      - class (optional: highlight/highlight-gray)
 *      - group (optional: left/right)
 *      - type (optional: none/select) - if select, the selected item is displayed in mainitem
 *      - callback (optional) - callback function
 *      - items (optional - if dropdown):
 *          - title
 *          - icon (optional) NOICON will remove icon
 *          - callback
 *          - divider = true; takes item as divider element
 *
 *
 *****************************************************************************/

define(function() {

    'use strict';

    var defaults = {
            url: null,
            data: [],
            instanceName: '',
            appearance: null // TODO: implement small version
        },


        /** templates container */
        templates = {
            skeleton: [
                '<div class="edit-toolbar-container">',
                '   <div class="navbar">',
                '       <ul class="edit-toolbar-left" />',
                '       <ul class="edit-toolbar-right" />',
                '   </div>',
                '</div>'
            ].join(''),
            pageFunction: [
                '<div class="page-function"> ',
                '   <a href="#"><span class="icon-<%= icon %>"></span></a>',
                '</div>'
            ].join('')
        },

        /** events bound to dom */
        bindDOMEvents = function() {
            this.sandbox.dom.on(this.options.el, 'click', toggleItem.bind(this), '.dropdown-toggle');
            this.sandbox.dom.on(this.options.el, 'click', selectItem.bind(this), 'li');
        },

        /**
         * gets called when toggle item is clicked
         * opens dropdown submenu
         * @param event
         */
        toggleItem = function(event) {

            event.preventDefault();
            event.stopPropagation();

            var $list = this.sandbox.dom.parent(event.currentTarget),
                visible;

            if (this.sandbox.dom.hasClass($list, 'is-expanded')) {
                visible = true;
            }
            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-expanded', this.$el), 'is-expanded');

            if (!visible) {
                this.sandbox.dom.addClass($list, 'is-expanded');

                // TODO: check if dropdown overlaps screen: set ul to .right-aligned

                // on every click remove submenu
                this.sandbox.dom.one('body', 'click', toggleItem.bind(this));
            }
        },

        /**
         * when an element gets selected
         * gets item from items array and delegates to triggerSelectEvent function
         * @param event
         */
        selectItem = function(event) {

            event.preventDefault();

            var item = this.items[this.sandbox.dom.data(event.currentTarget, 'id')],
                $parent = this.sandbox.dom.parents(event.currentTarget, 'li').eq(0);

            // stop if item has subitems
            if (item.items && item.items.length>0) {
                return;
            }

            triggerSelectEvent.call(this, item, $parent);
        },

        /**
         * either calls items callback (if set) or triggers select event
         * @param item
         */
        triggerSelectEvent = function(item, $parent) {

            var instanceName, parentItem;

            // check if has parent and type of parent
            if (item.parentId) {
                parentItem = this.items[item.parentId];
                if (!!parentItem.type && parentItem.type === "select") {
                    changeMainListItem.call(this, $parent, item);
                }
            }

            // if callback is set call it, else trigger event
            if (item.callback) {
                item.callback();
            } else {
                instanceName = this.options.instanceName ? this.options.instanceName + '.' : '';
                this.sandbox.emit('husky.edittoolbar.' + instanceName + 'item.select', item);
            }
        },

        /**
         * changes the listitems icon and title
         * @param listelement
         * @param item
         */
        changeMainListItem = function(listelement, item) {

            // TODO: do not change size of element on change title
            // first get title
            var listItems = this.sandbox.dom.find('span',listelement);
            if (!!item.icon) {
                this.sandbox.dom.removeClass(listItems.eq(0),'');
                if (item.icon !== 'NOICON') {
                    this.sandbox.dom.addClass(listItems.eq(0), createIconClass.call(this, item));
                }
            }
            if (!!item.title) {
                this.sandbox.dom.html(listItems.eq(1), item.title);
            }
        },

        /**
         * creates icon span with icon classes
         * @param item
         * @returns {HTMLElement|*}
         */
        createIconClass = function(item) {
            var classArray,
                classString = '';

            // create icon class
            if (item.icon) {
                classArray = [];
                classArray.push('icon-'+item.icon);
                classArray.push('icon');
                if(item.iconSize) {
                    classArray.push(item.iconSize);
                }

                classString=classArray.join(' ');
            }

            return classString;
        },

        /**
         * created dropdown menu
         * @param listItem
         * @param items
         */
        createDropdownMenu = function(listItem, parent) {
            var $list = this.sandbox.dom.createElement('<ul class="toolbar-dropdown-menu" />');
            this.sandbox.dom.append(listItem, $list);
            this.sandbox.util.foreach(parent.items, function(item) {

                if (item.divider) {
                    this.sandbox.dom.append($list, '<li class="divider"></li>');
                    return;
                }

                item.parentId = parent.id;
                // check id for uniqueness
                checkItemId.call(this, item);
                this.items[item.id] = item;

                this.sandbox.dom.append($list, '<li data-id="' + item.id + '"><a href="#">' + item.title + '</a></li>');
            }.bind(this));
        },

        /**
         * function checks if id is set and unique among all items
         * otherwise a new id is generated for the element
         * @param item
         */
        checkItemId = function(item) {
            // if item has no id, generate random id
            if (!item.id || !!this.items[item.id]) {
                do {
                    item.id = createUniqueId();
                } while (!!this.items[item.id]);
            }
        },

        /**
         * function generates a unique id
         * @returns string
         */
        createUniqueId = function() {
            return 'xxxxyxxyx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

    return {

        view: true,

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            // load data and call render
            if (!!this.options.url) {
                this.sandbox.util.load(this.options.url)
                    .then(this.render.bind(this))
                    .fail(function(data) {
                        this.sandbox.logger.log('data could not be loaded:', data);
                    }.bind(this));
            } else if (!!this.options.data) {
                this.render((this.options.data));
            } else {
                this.sandbox.logger.log('no data provided for tabs!');
            }

            bindDOMEvents.call(this);
        },

        render: function(data) {

            var classArray, addTo, $left, $right,
                $listItem, $listLink,
                title;

            // first render page function
            if (this.options.pageFunction) {
                // render skeleton
                this.sandbox.dom.append(this.options.el, this.sandbox.template.parse(templates.pageFunction, {
                    icon: this.options.pageFunction.icon
                }));
            }

            // create navbar skeleton
            this.sandbox.dom.append(this.options.el, templates.skeleton);

            $left = this.sandbox.dom.find('.edit-toolbar-left', this.options.el);
            $right = this.sandbox.dom.find('.edit-toolbar-right', this.options.el);

            // create items array
            this.items = [];
            // save item groups in array
            this.itemGroup = [];


            // create all elements
            this.sandbox.util.foreach(data, function(item) {

                // check id for uniqueness
                checkItemId.call(this, item);

                // save to items array
                this.items[item.id] = item;

                // create class array
                classArray = [];
                if (!!item.class) {
                    classArray.push(item.class);
                }

                // if group is set to right, add to right list, otherwise always add to left list
                if (!!item.group && item.group === 'right') {
                    addTo = $right;
                } else {
                    addTo = $left;
                }

                $listItem = this.sandbox.dom.createElement('<li class="' + classArray.join(',') + '" data-id="' + item.id + '"/>');
                $listLink = this.sandbox.dom.createElement('<a href="#" />');
                this.sandbox.dom.append($listItem, $listLink);

                // create icon span
                this.sandbox.dom.append($listLink, '<span class="'+createIconClass.call(this, item)+'" />');

                // create title span
                title = item.title ? item.title : '';
                this.sandbox.dom.append($listLink, '<span class="title">' + title + '</span>');


                // now create subitems
                if (!!item.items) {
                    this.sandbox.dom.addClass($listLink, 'dropdown-toggle');
                    createDropdownMenu.call(this, $listItem, item);
                }

                // create button
                this.sandbox.dom.append(addTo, $listItem);

            }.bind(this));


            // initialization finished
            this.sandbox.emit('husky.edittoolbar.initialized');
        }
    };

});

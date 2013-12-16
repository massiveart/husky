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
 *      - husky.edit-toolbar.<<instanceName>>.item.disable - disable item with given id
 *      - husky.edit-toolbar.<<instanceName>>.item.enable - enable item with given id
 *
 *  Triggers Events
 *      - husky.edit-toolbar.<<instanceName>>.item.select - triggered when item was clicked
 *
 *  data structure:
 *      - title
 *      - id (optional - will be generated otherwise)
 *      - icon (optional)
 *      - disableIcon (optional): icon when item is disabled
 *      - disabled (optional): is item disabled or enabled
 *      - iconSize (optional: large/medium/small)
 *      - class (optional: highlight/highlight-gray)
 *      - group (optional: left/right)
 *      - type (optional: none/select) - if select, the selected item is displayed in mainitem
 *      - callback (optional) - callback function
 *      - items (optional - if dropdown):
 *          - title
 *          - icon (optional) false will remove icon
 *          - callback
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
                '   <a href="#" id="back-page-function"><span class="icon-<%= icon %>"></span></a>',
                '</div>'
            ].join('')
        },

        /** events bound to dom */
        bindDOMEvents = function() {
            this.sandbox.dom.on(this.options.el, 'click', toggleItem.bind(this), '.dropdown-toggle');
            this.sandbox.dom.on(this.options.el, 'click', selectItem.bind(this), 'li');
            this.sandbox.dom.on(this.options.el, 'click', backPageFunctionClick.bind(this), '#back-page-function');
        },

        // FIXME to be replaced by own component
        backPageFunctionClick = function() {
            emitEvent.call(this, 'back');
            return false;
        },

        /** events bound to sandbox */
        bindCustomEvents = function() {
            this.sandbox.on(createEventName.call(this, 'item.disable'), function(id) {
                enableItem.call(this, false, id);
            }.bind(this));
            this.sandbox.on(createEventName.call(this, 'item.enable'), function(id) {
                enableItem.call(this, true, id);
            }.bind(this));
        },

        /** set item enable or disable */
        enableItem = function(enabled, id) {
            var item = this.items[id],
                $item = this.sandbox.dom.find('*[data-id="' + id + '"]'),
                $iconItem = this.sandbox.dom.find('*[data-id="' + id + '"] .icon'),
                enabledIconClass = createIconClass.call(this, item, true),
                disabledIconClass = createIconClass.call(this, item, false);

            this.items[id].disabled = !enabled;

            if (!!enabled) {
                this.sandbox.dom.removeClass($item, 'disable');
                this.sandbox.dom.removeClass($iconItem, disabledIconClass);
                this.sandbox.dom.prependClass($iconItem, enabledIconClass);
            } else {
                this.sandbox.dom.addClass($item, 'disable');
                this.sandbox.dom.removeClass($iconItem, enabledIconClass);
                this.sandbox.dom.prependClass($iconItem, disabledIconClass);
            }
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
                id = this.sandbox.dom.data($list, 'id'),
                item = this.items[id],
                visible;

            if (!item || !item.disabled) {
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

            if (!item.disabled) {
                triggerSelectEvent.call(this, item, $parent);
            }
        },

        /**
         * either calls items callback (if set) or triggers select event
         * @param item
         * @param $parent
         */
        triggerSelectEvent = function(item, $parent) {

            var parentItem;

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
                emitEvent.call(this, 'item.select', item);
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
                if (item.icon !== false) {
                    this.sandbox.dom.addClass(listItems.eq(0), createIconSupportClass.call(this, item));
                }
            }
            if (!!item.title) {
                this.sandbox.dom.html(listItems.eq(1), item.title);
            }
        },

        /**
         * creates icon span with icon classes
         * @param item
         * @param enabled
         * @returns {HTMLElement|*}
         */
        createIconSupportClass = function(item, enabled) {
            var classArray,
                classString = '',
                icon = createIconClass.call(this, item, enabled);

            // create icon class
            if (item.icon) {
                classArray = [];
                classArray.push(icon);
                classArray.push('icon');
                if (item.iconSize) {
                    classArray.push(item.iconSize);
                }

                classString = classArray.join(' ');
            }

            return classString;
        },

        /**
         * returns valid class for item and state
         * @param item
         * @param enabled
         */
        createIconClass = function(item, enabled) {
            if (enabled === undefined) {
                enabled = true;
            }
            var icon = (!!enabled ? item.icon : !!item.disabledIcon ? item.disabledIcon : item.icon);
            return 'icon-' + icon;
        },

        /**
         * created dropdown menu
         * @param listItem
         * @param parent
         */
        createDropdownMenu = function(listItem, parent) {
            var $list = this.sandbox.dom.createElement('<ul class="toolbar-dropdown-menu" />');
            this.sandbox.dom.append(listItem, $list);
            this.sandbox.util.foreach(parent.items, function(item) {

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
            // set enabled default
            if (!item.disabled) {
                item.disabled = false;
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
        },

        /** emits event */
        emitEvent = function(postFix, data) {
            var eventName = createEventName.call(this, postFix);
            if (!!data) {
                this.sandbox.emit(eventName, data);
            } else {
                this.sandbox.emit(eventName);
            }
        },

        /** returns normalized event names */
        createEventName = function(postFix) {
            return 'husky.edit-toolbar.' + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
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
            bindCustomEvents.call(this);
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
                this.sandbox.dom.append($listLink, '<span class="'+createIconSupportClass.call(this, item)+'" />');

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
            emitEvent.call(this, 'initialized');
        }
    };

});

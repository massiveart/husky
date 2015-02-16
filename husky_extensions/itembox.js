/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

/**
 * Introduces functionality used by multiple components, which are displaying some items in a list
 */
define(function() {

    'use strict';

    var defaults = {
            instanceName: null,
            url: null,
            eventNamespace: 'husky.itembox',
            idsParameter: 'ids',
            resultKey: null,
            idKey: 'id',
            visibleItems: 6,
            dataAttribute: '',
            dataDefault: {},
            sortable: true,
            removable: true,
            hideAddButton: false,
            hidePositionElement: false,
            hideConfigButton: false,
            defaultDisplayOption: 'top',
            displayOptions: {
                leftTop: true,
                top: true,
                rightTop: true,
                left: true,
                middle: true,
                right: true,
                leftBottom: true,
                bottom: true,
                rightBottom: true
            },
            translations: {
                noContentSelected: 'listbox.nocontent-selected',
                viewAll: 'public.view-all',
                viewLess: 'public.view-less',
                of: 'public.of',
                visible: 'public.visible'
            }
        },

        constants = {
            displayOptionSelectedClass: 'selected',
            itemInvisibleClass: 'invisible-item'
        },

        /**
         * returns the normalized event names
         * @param eventName {string} The name of the concrete event without prefix
         * @returns {string} Returns the prefixed event name
         */
        createEventName = function(eventName) {
            // TODO extract to extension?
            return [
                this.options.eventNamespace,
                '.',
                (this.options.instanceName ? this.options.instanceName + '.' : ''),
                eventName
            ].join('');
        },

        templates = {
            skeleton: function() {
                return [
                    '<div class="white-box form-element" id="', this.ids.container, '">',
                    '    <div class="header">',
                    '        <span class="fa-plus-circle icon left action', !!this.options.hideAddButton ? ' hidden' : '', '" id="', this.ids.addButton, '"></span>',
                    '        <div class="position', !!this.options.hidePositionElement ? ' hidden' : '', '">',
                    '            <div class="husky-position" id="', this.ids.displayOption, '">',
                    '                <div class="top left ', (!this.options.displayOptions.leftTop ? 'inactive' : ''), '" data-position="leftTop"></div>',
                    '                <div class="top middle ', (!this.options.displayOptions.top ? 'inactive' : ''), '" data-position="top"></div>',
                    '                <div class="top right ', (!this.options.displayOptions.rightTop ? 'inactive' : ''), '" data-position="rightTop"></div>',
                    '                <div class="middle left ', (!this.options.displayOptions.left ? 'inactive' : ''), '" data-position="left"></div>',
                    '                <div class="middle middle ', (!this.options.displayOptions.middle ? 'inactive' : ''), '" data-position="middle"></div>',
                    '                <div class="middle right ', (!this.options.displayOptions.right ? 'inactive' : ''), '" data-position="right"></div>',
                    '                <div class="bottom left ', (!this.options.displayOptions.leftBottom ? 'inactive' : ''), '" data-position="leftBottom"></div>',
                    '                <div class="bottom middle ', (!this.options.displayOptions.bottom ? 'inactive' : ''), '" data-position="bottom"></div>',
                    '                <div class="bottom right ', (!this.options.displayOptions.rightBottom ? 'inactive' : ''), '" data-position="rightBottom"></div>',
                    '            </div>',
                    '        </div>',
                    '        <span class="fa-cog icon right border', !!this.options.hideConfigButton ? ' hidden' : '', '" id="', this.ids.configButton, '"></span>',
                    '    </div>',
                    '    <div class="content" id="', this.ids.content, '"></div>',
                    '    <div class="footer" id="', this.ids.footer, '"></div>',
                    '</div>'
                ].join('');
            },

            noContent: function() {
                return [
                    '<div class="no-content">',
                    '    <span class="fa-coffee icon"></span>',
                    '    <div class="text">', this.sandbox.translate(this.options.translations.noContentSelected), '</div>',
                    '</div>'
                ].join('');
            },

            footer: function(length) {
                return [
                    '<span>',
                    '    <strong id="', this.ids.footerCount, '">', (length < this.options.visibleItems) ? length : this.options.visibleItems, '</strong> ', this.sandbox.translate(this.options.translations.of), ' ',
                    '    <strong id="', this.ids.footerMaxCount, '">', length, '</strong> ', this.sandbox.translate(this.options.translations.visible),
                    '</span>'
                ].join('')
            },

            item: function(id, content) {
                return [
                    '<li data-id="', id, '">',
                    !!this.options.sortable ? '    <span class="fa-ellipsis-v icon move"></span>' : '',
                    '    <span class="num"></span>',
                    content,
                    !!this.options.removable ? '    <span class="fa-times remove"></span>' : '',
                    '</li>'
                ].join('');
            }
        },

        bindCustomEvents = function() {
            this.sandbox.on(this.DATA_CHANGED(), this.changeData.bind(this));
            this.sandbox.on(this.DATA_RETRIEVED(), this.renderContent.bind(this));
        },

        bindDomEvents = function() {
            // change display options on click on a positon square
            this.sandbox.dom.on(
                this.getId('displayOption') + ' > div:not(.inactive)',
                'click',
                this.changeDisplayOption.bind(this)
            );

            // toggle between view all and view less
            this.sandbox.dom.on(this.$el, 'click', this.toggleInvisibleItems.bind(this), this.getId('footerView'));

            // click on the add button
            this.sandbox.dom.on(this.$addButton, 'click', function() {
                this.sandbox.emit(this.ADD_BUTTON_CLICKED());
            }.bind(this));

            // click on the config button
            this.sandbox.dom.on(this.$configButton, 'click', function() {
                this.sandbox.emit(this.CONFIG_BUTTON_CLICKED());
            }.bind(this));

            // remove a row from the itembox
            this.sandbox.dom.on(this.getId('content'), 'click', this.removeItem.bind(this), 'li .remove');
        },

        initSortable = function() {
            var $sortable = this.sandbox.dom.find('.sortable', this.$el),
                sortable;

            this.sandbox.dom.sortable($sortable, 'destroy');

            sortable = this.sandbox.dom.sortable('.sortable', {
                handle: '.move',
                forcePlaceholderSize: true
            });

            this.sandbox.dom.unbind(sortable, 'unbind');

            sortable.bind('sortupdate', function() {
                var ids = this.updateOrder();

                this.sortHandler(ids);
            }.bind(this));
        },

        createItemList = function() {
            return this.sandbox.dom.createElement('<ul class="items-list sortable"/>');
        },

        itembox = {
            /**
             * raised when the data changed and the list should be reloaded
             * @event husky.itembox.data-changed
             * @return {string}
             */
            DATA_CHANGED: function() {
                return createEventName.call(this, 'data-changed');
            },

            /**
             * raised when data has returned from the ajax request
             * @event husky.itembox.data-retrieved
             * @return {string}
             */
            DATA_RETRIEVED: function() {
                return createEventName.call(this, 'data-retrieved');
            },

            /**
             * raised when the display option has changed
             * @event husky.itembox.display-position-changed
             * @return {string}
             */
            DISPLAY_OPTION_CHANGED: function() {
                return createEventName.call(this, 'display-position-changed');
            },

            /**
             * raised when the add button was clicked
             * @event husky.itembox.add-button-clicked
             * @return {string}
             */
            ADD_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'add-button-clicked');
            },

            /**
             * raised when the config button was clicked
             * @event husky.itembox.config-button-clicked
             * @return {string}
             */
            CONFIG_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'config-button-clicked');
            },

            /**
             * render the itembox
             */
            render: function() {
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

                var data = this.getData();

                this.viewAll = true;

                this.ids = {
                    container: 'listbox-' + this.options.instanceName + '-container',
                    addButton: 'listbox-' + this.options.instanceName + '-add',
                    configButton: 'listbox-' + this.options.instanceName + '-config',
                    displayOption: 'listbox-' + this.options.instanceName + '-display-option',
                    content: 'listbox-' + this.options.instanceName + '-content',
                    footer: 'listbox-' + this.options.instanceName + '-footer',
                    footerView: 'listbox-' + this.options.instanceName + '-footer-view',
                    footerCount: 'listbox-' + this.options.instanceName + '-footer-count',
                    footerMaxCount: 'listbox-' + this.options.instanceName + '-footer-max-count'
                };

                this.sandbox.dom.html(this.$el, templates.skeleton.call(this));

                this.$container = this.sandbox.dom.find(this.getId('container'), this.$el);
                this.$addButton = this.sandbox.dom.find(this.getId('addButton'), this.$el);
                this.$configButton = this.sandbox.dom.find(this.getId('configButton'), this.$el);
                this.$content = this.sandbox.dom.find(this.getId('content'), this.$el);
                this.$footer = this.sandbox.dom.find(this.getId('footer'), this.$el);
                this.$list = null;

                this.removeFooter();

                this.renderNoContent();

                if (!this.isDataEmpty(data)) {
                    this.loadContent(data);
                } else {
                    this.sandbox.dom.data(this.$el, this.options.dataAttribute, this.options.dataDefault);
                }

                this.setDisplayOption(this.options.defaultDisplayOption);

                bindCustomEvents.call(this);
                bindDomEvents.call(this);
            },

            /**
             * render the empty presentation into the content area
             */
            renderNoContent: function() {
                this.$list = null;
                this.sandbox.dom.html(this.$content, templates.noContent.call(this));
                this.removeFooter();
            },

            /**
             * Render the footer for the given data
             * @param data {object} the data for which the footer should be generated
             */
            renderFooter: function(data) {
                var length = data.length,
                    translation = (data.length <= length)
                        ? this.sandbox.translate(this.options.translations.viewAll)
                        : this.sandbox.translate(this.options.translations.viewLess);

                this.sandbox.dom.html(this.$footer, templates.footer.call(this, length));

                this.sandbox.dom.append(
                    this.sandbox.dom.find('span', this.$footer),
                    [
                        '<strong class="pointer"> (<span id="', this.ids.footerView, '">',
                        translation,
                        '</span>)</strong>'
                    ].join('')
                );

                this.sandbox.dom.append(this.$container, this.$footer);

                this.$footerView = this.sandbox.dom.find(this.getId('footerView'), this.$el);
            },

            /**
             * Removes the footer from the DOM
             */
            removeFooter: function() {
                this.sandbox.dom.remove(this.$footer);
            },

            /**
             * Returns the data currently stored in this component
             * @param deepCopy {boolean} True if deep cop should be returned, otherwise false
             * @returns {object}
             */
            getData: function() {
                return this.sandbox.util.deepCopy(this.sandbox.dom.data(this.$el, this.options.dataAttribute));
            },

            /**
             * Throws a data-changed event if the data actually has changed
             * @param data {object} The data to set
             * @param reload {boolean} True if the itembox list should be reloaded afterwards
             */
            setData: function(data, reload) {
                var oldData = this.sandbox.dom.data(this.$el, this.options.dataAttribute);
                reload = typeof(reload) === 'undefined' ? true : reload;

                if (!this.sandbox.util.isEqual(oldData, data)) {
                    this.sandbox.emit(this.DATA_CHANGED(), data, this.$el, reload);
                }
            },

            /**
             * Event handler for the changed data event, sets data to element and reloads the list if specified
             * @param data {object} The data to set
             * @param $el {object} The element to which the data should be bound
             * @param reload {boolean} True if the list should be reloaded, otherwise false
             */
            changeData: function (data, $el, reload) {
                this.sandbox.dom.data(this.$el, this.options.dataAttribute, data);

                if (!!reload) {
                    this.loadContent(data);
                }
            },

            /**
             * Loads the content based on the given data
             * @param data {object}
             */
            loadContent: function(data) {
                this.startLoader();

                // reset items visible when new content is loaded
                this.viewAll = false;

                if (!!data) {
                    this.sandbox.util.load(this.getUrl(data))
                        .then(function(data) {
                            this.sandbox.emit(this.DATA_RETRIEVED(), data._embedded[this.options.resultKey]);
                        }.bind(this))
                        .fail(function(error) {
                            this.sandbox.logger.error(error);
                        }.bind(this));
                } else {
                    this.sandbox.emit(this.DATA_RETRIEVED(), []);
                }
            },

            /**
             * Renders the data into the list
             * @param data {object} The data to render
             */
            renderContent: function(data) {
                if (data.length > 0) {
                    var length = data.length;

                    this.$list = createItemList.call(this);

                    for (var i = -1; ++i < length;) {
                        this.addItem(data[i], false);
                    }

                    this.sandbox.dom.html(this.$content, this.$list);

                    initSortable.call(this);
                    this.renderFooter(data);
                    this.updateOrder();
                    this.updateVisibility();
                } else {
                    this.renderNoContent();
                }
            },

            /**
             * Starts the loader for the content
             */
            startLoader: function() {
                this.removeFooter();

                var $loader = this.sandbox.dom.createElement('<div class="loader"/>');
                this.sandbox.dom.html(this.$content, $loader);

                this.sandbox.start([
                    {
                        name: 'loader@husky',
                        options: {
                            el: $loader,
                            size: '100px',
                            color: '#e4e4e4'
                        }
                    }
                ]);
            },

            /**
             * Set the display option
             * @param displayOption {string} The string representation of the display option
             */
            setDisplayOption: function(displayOption) {
                var $element = this.sandbox.dom.find('[data-position="' + displayOption + '"]', this.$container);

                // deselect the current positon element
                this.sandbox.dom.removeClass(
                    this.sandbox.dom.find('.' + constants.displayOptionSelectedClass, this.getId('displayOption')),
                    constants.displayOptionSelectedClass
                );

                // select clicked on
                this.sandbox.dom.addClass($element, constants.displayOptionSelectedClass);
            },

            /**
             * DOM event handler for clicking on the display option
             * @param event
             */
            changeDisplayOption: function(event) {
                // TODO move display options to own component?
                var position = this.sandbox.dom.data(event.currentTarget, 'position');

                this.setDisplayOption(position);

                this.sandbox.emit(
                    this.DISPLAY_OPTION_CHANGED(),
                    position
                );
            },

            /**
             * Updates the order of the number in the list
             * @returns {Array}
             */
            updateOrder: function() {
                var $elements = this.sandbox.dom.find('li', this.$content),
                    ids = [];

                this.sandbox.util.foreach($elements, function($element, index) {
                    var $number = this.sandbox.dom.find('.num', $element);
                    $number.html(index + 1);
                    ids.push(this.sandbox.dom.data($element, 'id'));
                }.bind(this));

                return ids;
            },

            /**
             * Adds an item to the list
             * @param item {object} The item to display in the list
             * @param reinitialize {boolean} Defines if the sorting, order and visibility list should be reinitialized
             */
            addItem: function(item, reinitialize) {
                if (typeof(reinitialize) === 'undefined') {
                    reinitialize = true;
                }

                if (!this.$list) {
                    this.$list = createItemList.call(this);
                    this.sandbox.dom.html(this.$content, this.$list);
                    this.renderFooter([]);
                }

                this.sandbox.dom.append(
                    this.$list,
                    templates.item.call(
                        this,
                        item[this.options.idKey],
                        this.getItemContent(item)
                    )
                );

                if (!!reinitialize) {
                    if (this.options.sortable) {
                        initSortable.call(this);
                    }

                    this.updateOrder();
                    this.updateVisibility();
                }
            },

            /**
             * DOM event handler for removing an item from the list
             * @param event
             */
            removeItem: function(event) {
                var $removeItem = this.sandbox.dom.parents(event.currentTarget, 'li'),
                    itemId = this.sandbox.dom.data($removeItem, 'id');

                this.sandbox.dom.remove($removeItem);
                this.removeHandler(itemId);

                this.updateOrder();
                this.updateVisibility();
            },

            /**
             * Toggles between listing all and just a limited number of items
             */
            toggleInvisibleItems: function() {
                this.viewAll = !this.viewAll;
                this.sandbox.dom.html(this.$footerView,
                    !!this.viewAll
                        ? this.sandbox.translate(this.options.translations.viewLess)
                        : this.sandbox.translate(this.options.translations.viewAll)
                );

                this.updateVisibility();
            },

            /**
             * Updates the visibility of all items based on the current state
             */
            updateVisibility: function() {
                var $items = this.sandbox.dom.find('li', this.$list),
                    length = $items.size(),
                    itemCount = 0;

                if (!length) {
                    this.renderNoContent();
                } else {
                    // mark the correct amount of items invisible
                    this.sandbox.util.foreach($items, function($item) {
                        if (itemCount < this.options.visibleItems) {
                            this.sandbox.dom.removeClass($item, constants.itemInvisibleClass);
                        } else {
                            this.sandbox.dom.addClass($item, constants.itemInvisibleClass);
                        }

                        itemCount++;
                    }.bind(this));
                }

                // correct the display property of every item and the footer values
                if (!!this.viewAll) {
                    this.sandbox.dom.show($items);
                    this.sandbox.dom.html(this.getId('footerCount'), length);
                } else {
                    if (!!this.$list) {
                        this.sandbox.dom.show(
                            this.sandbox.dom.find(':not(.' + constants.itemInvisibleClass + ')', this.$list)
                        );
                        this.sandbox.dom.hide(this.sandbox.dom.find('.' + constants.itemInvisibleClass, this.$list));
                    }

                    this.sandbox.dom.html(
                        this.getId('footerCount'),
                        (this.options.visibleItems < length) ? this.options.visibleItems : length
                    );
                }

                this.sandbox.dom.html(this.getId('footerMaxCount'), length);
            },

            /**
             * Checks if the given data is empty, can be overriden by the concrete implementation.
             * Especially useful if data is not an array.
             * @param data {object} The data to check
             */
            isDataEmpty: function(data) {
                return this.sandbox.util.isEmpty(data);
            },

            /**
             * Returns the selector for the given id
             * @param type {string} The type of the element, for which the id should be returned
             * @returns {string} The id of the element
             */
            getId: function(type) {
                return ['#', this.ids[type]].join('');
            },

            /**
             * Returns the URL for the list based on the data
             * @param data {object} The data for which the URL should be generated
             */
            getUrl: function(data) {
                throw new Error('"getUrl" not implemented');
            },

            /**
             * Returns the HTML for an item in the list
             * @param item
             */
            getItemContent: function(item) {
                throw new Error('"getItemContent" not implemented');
            },

            /**
             * This function is called when the sorting has been updated
             * @param ids {array} The new order of the ids
             */
            sortHandler: function(ids) {
                throw new Error('"sortHandler" not implemented');
            },

            /**
             * Handler, which is called when a row is removed
             * @param id {number} The id of the item to remove
             */
            removeHandler: function(id) {
                throw new Error('"removeHandler" not implemented');
            }
        };

    return {
        name: 'itembox',

        initialize: function(app) {
            app.components.addType('itembox', itembox);
        }
    }
});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/listbox
 */

define(function() {

    'use strict';

    var defaults = {
            instanceName: null,
            url: null,
            eventNamespace: 'husky.listbox',
            idsParameter: 'ids',
            resultKey: null,
            idKey: 'id',
            visibleItems: 6,
            dataAttribute: '',
            sortable: true,
            removable: true,
            hideAddButton: false,
            hidePositionElement: false,
            hideConfigButton: false,
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

        createEventName = function(eventName) {
            // TODO extract to extension?
            return this.options.eventNamespace + '.' + eventName;
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
                    '    <strong id="', this.ids.footerCount, '">', (length < this.options.visibleItems) ? length :this.options.visibleItems, '</strong> ', this.sandbox.translate(this.options.translations.of), ' ',
                    '    <strong id="', this.ids.footerMaxCount, '">', length, '</strong> ', this.sandbox.translate(this.options.translations.visible),
                    '</span>'
                ].join('')
            },

            item: function(id, number, content, visible) {
                return [
                    '<li class="', !!visible ? '' : constants.itemInvisibleClass, '" data-id="', id, '">',
                    !!this.options.sortable ? '    <span class="fa-ellipsis-v icon move"></span>' : '',
                    '    <span class="num">', number, '</span>',
                    content,
                    !!this.options.removable ? '    <span class="fa-times remove"></span>' : '',
                    '</li>'
                ].join('');
            }
        },

        bindCustomEvents = function() {
            this.sandbox.on(this.DATA_CHANGED(), this.loadContent.bind(this));
            this.sandbox.on(this.DATA_RETRIEVED(), this.renderContent.bind(this));
        },

        bindDomEvents = function() {
            // change display options on click on a positon square
            this.sandbox.dom.on(
                this.getId('displayOption') + ' > div:not(.inactive)',
                'click',
                this.changeDisplayOptions.bind(this)
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
            this.sandbox.dom.on(this.getId('content'), 'click', this.removeRow.bind(this), 'li .remove');
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
                var ids = this.updateOrder($elements);

                this.sortHandler(ids);
            }.bind(this));
        },

        itembox = {
            DATA_CHANGED: function() {
                return createEventName.call(this, 'data-changed');
            },

            DATA_RETRIEVED: function() {
                return createEventName.call(this, 'data-retrieved');
            },

            DISPLAY_OPTION_CHANGED: function() {
                return createEventName.call(this, 'display-position-changed');
            },

            ADD_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'add-button-clicked');
            },

            CONFIG_BUTTON_CLICKED: function() {
                return createEventName.call(this, 'config-button-clicked');
            },

            render: function() {
                this.options = this.sandbox.util.extend({}, defaults, this.options);
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

                this.detachFooter();

                // TODO set preselected values

                this.renderNoContent();

                bindCustomEvents.call(this);
                bindDomEvents.call(this);
            },

            renderNoContent: function() {
                this.sandbox.dom.html(this.$content, templates.noContent.call(this));
                this.detachFooter();
            },

            /**
             * renders the footer and calls a method to bind the events for itself
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

            detachFooter: function() {
                this.sandbox.dom.remove(this.$footer);
            },

            setData: function(data, reload) {
                var oldData = this.sandbox.dom.data(this.$el, this.options.dataAttribute);
                reload = typeof(reload) === 'undefined' ? true : reload;

                if (!this.sandbox.util.isEqual(oldData, data)) {
                    this.sandbox.dom.data(this.$el, this.options.dataAttribute, data);

                    if (reload) {
                        this.sandbox.emit(this.DATA_CHANGED(), data, this.$el);
                    }
                }
            },

            loadContent: function(data) {
                this.startLoader();

                // reset items visible when new content is loaded
                this.viewAll = true;

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

            renderContent: function(data) {
                if (data.length > 0) {
                    var $list = this.sandbox.dom.createElement('<ul class="items-list sortable"/>'),
                        length = data.length;

                    for (var i = -1; ++i < length;) {
                        this.sandbox.dom.append(
                            $list,
                            templates.item.call(
                                this,
                                data[i][this.options.idKey],
                                i + 1,
                                this.getItemContent(data[i]),
                                i < this.options.visibleItems
                            )
                        );
                    }

                    this.sandbox.dom.html(this.$content, $list);

                    // cache the invisible items for easy toggle later
                    this.$invisibleItems = this.sandbox.dom.find('.' + constants.itemInvisibleClass, this.$el);

                    initSortable.call(this);
                    this.renderFooter(data);
                    this.toggleInvisibleItems();
                } else {
                    this.renderNoContent();
                }
            },

            startLoader: function() {
                this.detachFooter();

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

            changeDisplayOptions: function() {
                // TODO move display options to own component?

                // deselect the current positon element
                this.sandbox.dom.removeClass(
                    this.sandbox.dom.find('.' + constants.displayOptionSelectedClass, this.getId('displayOption')),
                    constants.displayOptionSelectedClass
                );

                // select clicked on
                this.sandbox.dom.addClass(event.currentTarget, constants.displayOptionSelectedClass);

                this.sandbox.emit(
                    this.DISPLAY_OPTION_CHANGED(),
                    this.sandbox.dom.data(event.currentTarget, 'position')
                );
            },

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

            removeRow: function(event) {
                var $removeItem = this.sandbox.dom.parents(event.currentTarget, 'li'),
                    itemId = this.sandbox.dom.data($removeItem, 'id');

                this.sandbox.dom.remove($removeItem);
                this.removeItem(itemId);

                this.updateOrder();
                this.updateVisibility();
            },

            toggleInvisibleItems: function() {
                this.viewAll = !this.viewAll;
                this.sandbox.dom.html(this.$footerView,
                    !!this.viewAll
                        ? this.sandbox.translate(this.options.translations.viewLess)
                        : this.sandbox.translate(this.options.translations.viewAll)
                );

                this.updateVisibility();
            },

            updateVisibility: function() {
                var $items = this.sandbox.dom.find('li', this.$content),
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
                    this.sandbox.dom.show(this.sandbox.dom.find(':not(.' + constants.itemInvisibleClass + ')'));
                    this.sandbox.dom.hide(this.sandbox.dom.find('.' + constants.itemInvisibleClass));

                    this.sandbox.dom.html(
                        this.getId('footerCount'),
                        (this.options.visibleItems < length) ? this.options.visibleItems : length
                    );
                }

                this.sandbox.dom.html(this.getId('footerMaxCount'), length);
            },

            getId: function(type) {
                return ['#', this.ids[type]].join('');
            }
        };

    return {
        name: 'itembox',

        initialize: function(app) {
            app.components.addType('itembox', itembox);
        }
    }
});

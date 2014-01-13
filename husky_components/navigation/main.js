/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: navigation
 *
 * Description:
 *  Navigation Element
 *  also loads search component
 *
 * Options:
 *  footerTemplate - html template to define the footer
 *
 * Provides Events:
 *  husky.navigation.footer.set - set template
 *
 * Triggers Events:
 *  husky.navigation.item.select - {item}
 *  husky.navigation.item.toggle - isExpanded, {item}
 *  husky.navigation.item.settings - {item}
 *
 */

// TODO: arrow keys
// TODO: action as link for ux -> footer where it will link
// TODO: cogwheel at dashboard in the middle
// TODO: events as specified
// TODO: move functions into private space
// TODO: cleanup css-classes
// TODO: responsive collapsed navigation

define(function() {

    'use strict';

    var templates = {
            /** component skeleton */
            skeleton: [
                '<nav class="navigation">',
                '   <div class="navigation-content">',
                '       <header class="navigation-header">',
                '           <div class="navigation-header-image">',
                '               <% if (icon) { %>',
                '               <img alt="#" src="<%= icon %>"/>',
                '               <% } %>',
                '           </div>',
                '           <div class="navigation-header-title"><% if (title) { %> <%= title %><% } %></div>',
                '       </header>',
                '       <div id="navigation-search" class="navigation-search"></div>',
                '       <div id="navigation-item-container" class="navigation-item-container"></div>',
                '       <footer>',
                '       </footer>',
                '   </div>',
                '</nav>'].join(''),
            /** main navigation items (with icons)*/
            mainItem: [
                '<li class="js-navigation-items navigation-items" id="<%= item.id %>" data-id="<%= item.id %>">',
                '   <div <% if (item.items && item.items.length > 0) { %> class="navigation-items-toggle" <% } %> >',
                '       <a class="<% if (!!item.action) { %>js-navigation-item <% } %>navigation-item" href="#">',
                '           <span class="<%= icon %> navigation-item-icon"></span>',
                '           <span class="navigation-item-title"><%= item.title %></span>',
                '       </a>',
                '       <% if (item.hasSettings) { %>',
                '           <a class="icon-cogwheel navigation-settings-icon js-navigation-settings" id="<%= item.id %>" href="#"></a>',
                '       <% } %>',
                '       <% if (item.items && item.items.length > 0) { %>',
                '           <a class="icon-chevron-right navigation-toggle-icon" href="#"></a>',
                '       <% } %>',
                '   </div>',
                '</li>'].join(''),
            /** sub navigation items */
            subToggleItem: [
                '   <li class="js-navigation-items navigation-subitems" id="<%= item.id %>" data-id="<%= item.id %>">',
                '       <div class="navigation-subitems-toggle">',
                '           <a class="<% if (!!item.action) { %>js-navigation-item <% } %> navigation-item" href="#"><%= item.title %></a>',
                '           <% if (item.hasSettings) { %>',
                '           <a class="icon-cogwheel navigation-settings-icon js-navigation-settings" href="#"></a>',
                '           <% } %>',
                '           <a class="icon-chevron-right navigation-toggle-icon" href="#"></a>',
                '       </div>',
                '</li>'].join(''),
            /** siple sub item */
            subItem: [
                '<li class="js-navigation-sub-item" id="<%= item.id %>" data-id="<%= item.id %>">',
                '   <a href="#"><%= item.title %></a>',
                '</li>'
            ].join('')
        },
        defaults = {
            footerTemplate: '',
            labels: {
                hide: 'Hide',
                show: 'Show'
            }
        };


    return {

        initialize: function() {

            this.sandbox.logger.log('Initialized Navigation');

            // merging options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            // binding dom events
            this.bindDOMEvents();

            this.bindCustomEvents();

            // load Data
            if (!!this.options.url) {
                this.sandbox.util.load(this.options.url)
                    .then(this.render.bind(this))
                    .fail(function(data) {
                        this.sandbox.logger.log("data could not be loaded:", data);
                    }.bind(this));
            }
        },

        /**
         * renders the navigation
         * gets called after navigation data was loaded
         * @param data
         */
        render: function(data) {

            // data storage
            this.options.data = data;

            // array to save all navigation items
            this.items = [];

            // add container class to current div
            this.sandbox.dom.addClass(this.$el, 'navigation-container');

            // render skeleton
            this.sandbox.dom.html(this.$el, this.sandbox.template.parse(templates.skeleton, {
                title: this.options.data.title,
                icon: this.options.data.icon
            }));

            // start search component
            this.sandbox.start([
                {
                    name: 'search@husky',
                    options: {
                        el: '#navigation-search',
                        searchOptions: {
                            placeholderText: 'public.search'
                        }
                    }
                }
            ]);

            // render navigation items
            this.renderNavigationItems(this.options.data);

            // render footer
            if (!!this.options.footerTemplate && this.options.footerTemplate !== '') {
                this.renderFooter(this.options.footerTemplate);
            }

            // emit initialized event
            this.sandbox.emit('husky.navigation.initialized');
        },

        /**
         *  renders main navigation elements
         */
        renderNavigationItems: function(data) {
            var $elem, $sectionDiv, $sectionList;
            // iterate through sections
            this.sandbox.util.foreach(data.items, function(section) {
                $sectionDiv = this.sandbox.dom.createElement('<div class="section">');
                $sectionList = this.sandbox.dom.createElement('<ul class="section-items">');
                this.sandbox.dom.append($sectionDiv, '<div class="section-headline"><span class="section-headline-title">' + section.title.toUpperCase() + '</span><span class="section-toggle"><a href="#">' + this.options.labels.hide + '</a></span></div>');

                // iterate through section items
                this.sandbox.util.foreach(section.items, function(item) {
                    // create item
                    $elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.mainItem, {
                        item: item,
                        icon: item.icon ? 'icon-' + item.icon : ''
                    }));
                    //render sub-items
                    if (item.items && item.items.length > 0) {
                        this.renderSubNavigationItems(item, this.sandbox.dom.find('div', $elem));
                    }
                    this.sandbox.dom.append($sectionList, $elem);
                    this.items[item.id] = item;
                }.bind(this));

                this.sandbox.dom.append($sectionDiv, $sectionList);
                this.sandbox.dom.append('#navigation-item-container', $sectionDiv);

            }.bind(this));
        },

        /**
         * renders sub-navigation elements
         */
        renderSubNavigationItems: function(data, after) {
            var elem,
                list = this.sandbox.dom.createElement('<ul style="display:none" />');

            this.sandbox.util.foreach(data.items, function(item) {
                this.items[item.id] = item;
                if (item.items && item.items.length > 0) {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.subToggleItem, {item: item}));
                    this.renderSubNavigationItems(item, this.sandbox.dom.find('div', elem));
                } else {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.subItem, {item: item}));
                }
                this.sandbox.dom.append(list, elem);
            }.bind(this));

            this.sandbox.dom.after(after, list);
        },

        renderFooter: function(footerTemplate) {
            var $footer = this.sandbox.dom.find('footer', this.$el);
            this.sandbox.dom.html($footer, footerTemplate);
        },

        /**
         * Interaction
         */
        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.toggleItems.bind(this), '.navigation-items-toggle, .navigation-subitems-toggle');
            this.sandbox.dom.on(this.$el, 'click', this.toggleSections.bind(this), '.section-toggle');
            this.sandbox.dom.on(this.$el, 'click', this.settingsClicked.bind(this), '.js-navigation-settings');
            this.sandbox.dom.on(this.$el, 'click', this.selectSubItem.bind(this), '.js-navigation-sub-item, .js-navigation-item');
        },

        /**
         * event listener
         */
        bindCustomEvents: function() {
            // change footer template
            this.sandbox.on('husky.navigation.footer.set', function(template) {
                this.options.footerTemplate = template;
                this.renderFooter(template);
            }.bind(this));

        },


        /**
         * gets called when settings icon is clicked
         * @emits husky.navigation.settings (name, id, parent)
         * @param event
         */
        settingsClicked: function(event) {

            event.stopPropagation();
            event.preventDefault();

            // emit event
            var listItem = this.sandbox.dom.closest(event.currentTarget, '.js-navigation-items'),
                item = this.items[this.sandbox.dom.data(listItem, 'id')];

            this.sandbox.emit('husky.navigation.item.settings', item);

        },

        /**
         * Toggles menu element with submenu
         * Raises navigation.toggle
         * @param event
         */
        toggleItems: function(event) {

            event.preventDefault();

            var $items = this.sandbox.dom.closest(event.currentTarget, '.js-navigation-items'),
                item, xBottom, windowHeight, itemHeight, itemTop,
                $toggle,

                $childList = this.sandbox.dom.find('ul:first', $items),
                isExpanded = this.sandbox.dom.hasClass($items, 'is-expanded');


            if (isExpanded) {
                this.sandbox.dom.slideUp($childList, 200, function() {

                    this.sandbox.dom.removeClass($items, 'is-expanded');

                    // change toggle item
                    $toggle = this.sandbox.dom.find('.icon-chevron-down', event.currentTarget);
                    this.sandbox.dom.removeClass($toggle, 'icon-chevron-down');
                    this.sandbox.dom.prependClass($toggle, 'icon-chevron-right');

                }.bind(this));
            } else {
                this.sandbox.dom.addClass($items, 'is-expanded');
                // change toggle item
                $toggle = this.sandbox.dom.find('.icon-chevron-right', event.currentTarget);
                this.sandbox.dom.removeClass($toggle, 'icon-chevron-right');
                this.sandbox.dom.prependClass($toggle, 'icon-chevron-down');

                this.sandbox.dom.slideDown($childList, 200, function() {


                    // check if collapsed element overlaps browser border
                    itemTop = this.sandbox.dom.offset($items).top;
                    itemHeight = this.sandbox.dom.height($items);
                    xBottom = itemTop + itemHeight;
                    windowHeight = this.sandbox.dom.height(this.sandbox.dom.window);
                    if (xBottom > windowHeight) {
                        if (itemHeight < windowHeight) {
                            this.sandbox.dom.scrollAnimate((xBottom - windowHeight + 40), '.navigation-container');
                        } else {
                            this.sandbox.dom.scrollAnimate(itemTop, '.navigation-container');
                        }
                    }
                }.bind(this));
            }

            // emit event
            item = this.items[this.sandbox.dom.data($items, 'id')];
            this.sandbox.emit('husky.navigation.item.toggle', !isExpanded, item);
        },


        /**
         * toggles sections
         * @param event
         */
        toggleSections: function(event) {

            event.preventDefault();

            var $section = this.sandbox.dom.closest(event.currentTarget, '.section'),
                $list = this.sandbox.dom.find('.section-items', $section),
                toggleLink = this.sandbox.dom.find('a', event.currentTarget);


            if (this.sandbox.dom.hasClass($section, 'is-hidden')) {
                // hide section
                this.sandbox.dom.slideDown($list, 200, function() {
                    this.sandbox.dom.html(toggleLink, this.options.labels.hide);
                    this.sandbox.dom.removeClass($section, 'is-hidden');
                }.bind(this));
            } else {
                // show section
                this.sandbox.dom.html(toggleLink, this.options.labels.show);
                this.sandbox.dom.slideUp($list, 200, function() {
                    this.sandbox.dom.addClass($section, 'is-hidden');
                }.bind(this));
            }

            this.sandbox.emit('husky.navigation.section.toggle');
        },

        /**
         * Selects menu element without submenu
         * Raises navigation.select
         * @param event
         */
        selectSubItem: function(event) {

            event.preventDefault();

            var $subItem = this.sandbox.dom.createElement(event.currentTarget),
                $items = this.sandbox.dom.parents(event.currentTarget, '.js-navigation-items'),
                $parent = this.sandbox.dom.parent(event.currentTarget),
                item;

            if (this.sandbox.dom.hasClass($subItem, 'js-navigation-item')) {
                $subItem = this.sandbox.dom.createElement(this.sandbox.dom.closest(event.currentTarget, 'li'));
            }

            // if toggle was clicked, do not set active and selected
            if (this.sandbox.dom.hasClass($parent, 'navigation-items-toggle') || this.sandbox.dom.hasClass($parent, 'navigation-subitems-toggle')) {
                return;
            }

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el), 'is-selected');
            this.sandbox.dom.addClass($subItem, 'is-selected');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-active', this.$el), 'is-active');
            this.sandbox.dom.addClass($items, 'is-active');


            // emit event
            item = this.items[this.sandbox.dom.data($subItem, 'id')];
            this.sandbox.emit('husky.navigation.item.select', item);
        }

    };

});

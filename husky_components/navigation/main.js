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
// TODO: complete yui-doc

define(function() {

    'use strict';

    var templates = {
            /** component skeleton */
            skeleton: [
                '<nav class="navigation<% if (collapsed === "true") {%> collapsed<% } %>">',
                '   <div class="navigation-content">',
                '       <div class="wrapper">',
                '           <header class="navigation-header">',
                '               <div class="navigation-header-title"><% if (data.title) { %> <%= translate(data.title) %><% } %></div>',
                '           </header>',
                '           <div id="navigation-search" class="navigation-search"></div>',
                '           <div id="navigation-item-container" class="navigation-item-container"></div>',
                '       </div>',
                '       <footer>',
                '       </footer>',
                '   </div>',
                '   <div class="icon-remove2 navigation-close-icon">',
                '</nav>'].join(''),
            headerImage: [
                '<div class="navigation-header-image">',
                '   <img alt="#" src="<%= icon %>"/>',
                '</div>'
            ].join(''),
            headerText: [
                '<div class="navigation-header-text"><span><%= text %></span></div>'
            ].join(''),
            /** main navigation items (with icons)*/
            mainItem: [
                '<li class="js-navigation-items navigation-items" id="<%= item.id %>" data-id="<%= item.id %>">',
                '   <div <% if (item.items && item.items.length > 0) { %> class="navigation-items-toggle" <% } %> >',
                '       <a class="<% if (!!item.action) { %>js-navigation-item <% } %>navigation-item" href="#">',
                '           <span class="<%= icon %> navigation-item-icon"></span>',
                '           <span class="navigation-item-title"><%= translate(item.title) %></span>',
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
                '           <a class="<% if (!!item.action) { %>js-navigation-item <% } %> navigation-item" href="#"><%= translate(item.title) %></a>',
                '           <% if (item.hasSettings) { %>',
                '           <a class="icon-cogwheel navigation-settings-icon js-navigation-settings" href="#"></a>',
                '           <% } %>',
                '           <a class="icon-chevron-right navigation-toggle-icon" href="#"></a>',
                '       </div>',
                '</li>'].join(''),
            /** siple sub item */
            subItem: [
                '<li class="js-navigation-sub-item" id="<%= item.id %>" data-id="<%= item.id %>">',
                '   <a href="#"><%= translate(item.title) %></a>',
                '</li>'
            ].join(''),
            //footer template
            footer: [
                '<div class="user">',
                '<div class="icon-user pic"></div>',
                '<div class="name"><%= userName %></div>',
                '</div>',
                '<div class="options">',
                '<div class="locale-dropdown"></div>',
                '<a href="<%= logoutRoute %>" title="Logout" class="icon-lock logout"></a>',
                '</div>',
                '<div class="version"><%= system %> (<%= version %>, <a href="#"><%= versionHistory %></a>)</div>'
            ].join('')
        },
        defaults = {
            footerTemplate: '',
            collapsed: false,
            labels: {
                hide: 'navigation.hide',
                show: 'navigation.show'
            },
            resizeWidth: 800,
            forceCollapse: false,
            systemName: 'Sulu 2.0',
            footer: true,
            logoutRoute: '/logout',
            translations: {
                versionHistory: 'navigation.version-history',
                user: 'navigation.user'
            }
        },
        CONSTANTS = {
            UNCOLLAPSED_WIDTH: 250,
            COLLAPSED_WIDTH: 50,
            TRANSITIONEND_EVENT: 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd'
        },

        namespace = 'husky.navigation.',

        /**
         * listens on and activates the matching navigation-item
         * @event husky.navigation.select-item
         * @param {string} selectAction The select-action to match the navigation-item for
         */
            EVENT_SELECT_ITEM = namespace + 'select-item',

        /**
         * raised when navigation was collapsed
         * @event husky.navigation.collapsed
         * @param {Number} width The width of the collapsed navigation
         */
            EVENT_COLLAPSED = namespace + 'collapsed',

        /**
         * raised when navigation was un-collapsed
         * @event husky.navigation.uncollapsed
         * @param {Number} width The width of the un-collapsed navigation
         */
            EVENT_UNCOLLAPSED = namespace + 'uncollapsed',


        /**
         * forces navigation to collapse
         * @event husky.navigation.collapse
         * @param {Boolean} stayCollapsed - if true the navigation stays collapsed till the custom-uncollapse event is emited
         */
            EVENT_COLLAPSE = namespace + 'collapse',

        /**
         * forces navigation to uncollapse
         * @event husky.navigation.uncollapse
         * @param {Bool} force If true, the navigation will act as overflow and collapse again after interaction
         */
            EVENT_UNCOLLAPSE = namespace + 'uncollapse',


        /**
         * raised when navigation collapse / uncollapse of navigation is triggered. called before transition starts
         * only raised when not forced
         * @event husky.navigation.size.change
         */
            EVENT_SIZE_CHANGE = namespace + 'size.change',

        /**
         * raised when navigation was un / collapsed. called when transition is finished. only raised when not forced
         * @event husky.navigation.size.changed
         */
            EVENT_SIZE_CHANGED = namespace + 'size.changed',

        /**
         * raised when the user locale is changed
         * @event husky.navigation.user-locale.changed
         */
            USER_LOCALE_CHANGED = namespace + 'user-locale.changed',

        /**
         * raised when the version history is clicked
         * @event husky.navigation.version-history.clicked
         */
            VERSION_HISTORY_CLICKED = namespace + 'version-history.clicked',

        /**
         * show the navigation when it was hidden before
         * @event husky.navigation.show
         */
            EVENT_SHOW = namespace + 'show',

        /**
         * hides the navigation completely
         * @event husky.navigation.hide
         */
            EVENT_HIDE = namespace + 'hide'
        ;


    return {

        initialize: function() {

            this.sandbox.logger.log('Initialized Navigation');

            // merging options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.stayCollapsed = false;
            this.hidden = false;
            this.tooltipsEnabled = true;

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
            this.sandbox.dom.html(this.$el, this.sandbox.template.parse(templates.skeleton,
                this.sandbox.util.extend(true, {}, this.options, {translate: this.sandbox.translate}))
            );

            // render header image
            if (typeof this.options.data.icon === 'string') {
                this.sandbox.dom.prepend(this.sandbox.dom.find('header.navigation-header', this.$el),
                    this.sandbox.template.parse(templates.headerImage, {
                        icon: this.options.data.icon
                    })
                );
            } else {
                this.sandbox.dom.prepend(this.sandbox.dom.find('header.navigation-header', this.$el),
                    this.sandbox.template.parse(templates.headerText, {
                        text: this.options.data.title.substr(0, 1)
                    })
                );
            }

            this.$navigation = this.$find('.navigation', this.$el);
            this.$navigationContent = this.$find('.navigation-content', this.$navigation);

            // start search component
            this.sandbox.start([
                {
                    name: 'search@husky',
                    options: {
                        el: '#navigation-search',
                        placeholderText: 'public.search'
                    }
                }
            ]);

            // render navigation items
            this.renderNavigationItems(this.options.data);

            // render footer
            this.renderFooter();

            // preselect item based on url
            if (!!this.options.selectAction && this.options.selectAction.length > 0) {
                this.preselectItem(this.options.selectAction);
            }

            // collapse if necessary
            this.resizeListener();

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
                this.sandbox.dom.append($sectionDiv, '<div class="section-headline"><span class="section-headline-title">' + this.sandbox.translate(section.title).toUpperCase() + '</span><span class="section-toggle"><a href="#">' + this.sandbox.translate(this.options.labels.hide) + '</a></span></div>');

                this.sandbox.dom.append($sectionDiv, $sectionList);
                this.sandbox.dom.append('#navigation-item-container', $sectionDiv);

                // iterate through section items
                this.sandbox.util.foreach(section.items, function(item) {
                    // create item
                    $elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.mainItem, {
                        item: item,
                        icon: item.icon ? 'icon-' + item.icon : '',
                        translate: this.sandbox.translate
                    }));
                    this.sandbox.dom.append($sectionList, $elem);
                    //render sub-items
                    if (item.items && item.items.length > 0) {
                        this.renderSubNavigationItems(item, $elem);
                    }
                    item.domObject = $elem;
                    this.items.push(item);
                }.bind(this));
            }.bind(this));
        },

        /**
         * renders sub-navigation elements
         */
        renderSubNavigationItems: function(data, $parentList) {
            var elem,
                textCont,
                list = this.sandbox.dom.createElement('<ul class="navigation-items-list" />');

            this.sandbox.dom.append($parentList, list);

            this.sandbox.util.foreach(data.items, function(item) {
                item.parentTitle = data.title;
                this.items.push(item);
                if (item.items && item.items.length > 0) {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.subToggleItem, {item: item, translate: this.sandbox.translate}));
                    this.renderSubNavigationItems(item, this.sandbox.dom.find('div', elem));
                } else {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.subItem, {item: item, translate: this.sandbox.translate}));
                }
                this.sandbox.dom.append(list, elem);

                // add tooltip
                textCont = this.sandbox.dom.find('a', elem);
                if (this.sandbox.dom.width(textCont) + 20 < this.sandbox.dom.get(textCont, 0).scrollWidth) {
                    this.sandbox.dom.attr(textCont, {'title': this.sandbox.dom.html(textCont)});
                }

                item.domObject = elem;
            }.bind(this));
        },

        /**
         * Renders the footer of the navigation
         */
        renderFooter: function() {
            if (this.options.footer === true) {
                var $footer = this.sandbox.dom.find('footer', this.$el);
                this.sandbox.dom.html($footer, _.template(templates.footer)({
                    userName: this.options.userName,
                    system: this.options.systemName,
                    version: this.options.systemVersion,
                    versionHistory: this.sandbox.translate(this.options.translations.versionHistory),
                    logoutRoute: this.options.logoutRoute
                }));

                this.sandbox.start([
                    {
                        name: 'select@husky',
                        options: {
                            el: this.sandbox.dom.find('.locale-dropdown', $footer),
                            instanceName: 'navigation-locale',
                            value: 'name',
                            data: this.options.userLocales,
                            preSelectedElements: [this.options.userLocale],
                            style: 'small'
                        }
                    }
                ]);
            }
        },

        /**
         * Handles the event when the collapsed Footer is clicked
         */
        collapsedFooterClickHandler: function() {
            this.unCollapse(true);

            // scroll to footer
            this.sandbox.dom.one(this.sandbox.dom.$window, CONSTANTS.TRANSITIONEND_EVENT,
                this.checkBottomHit.bind(this, null, this.sandbox.dom.find('footer', this.$el)));
        },

        /**
         * Interaction
         */
        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.toggleItems.bind(this), '.navigation-items-toggle, .navigation-subitems-toggle');
            this.sandbox.dom.on(this.$el, 'click', this.toggleSections.bind(this), '.section-toggle');
            this.sandbox.dom.on(this.$el, 'click', this.settingsClicked.bind(this), '.js-navigation-settings');
            this.sandbox.dom.on(this.$el, 'click', this.selectSubItem.bind(this), '.js-navigation-sub-item, .js-navigation-item');

            // collapse events
            this.sandbox.dom.on(this.sandbox.dom.window, 'resize', this.resizeListener.bind(this));
            this.sandbox.dom.on(this.$el, 'click', this.showCollapsedSearch.bind(this), '.navigation #navigation-search a.search-icon');
            this.sandbox.dom.on(this.$el, 'click', this.collapse.bind(this), '.navigation.collapseIcon .navigation-close-icon');
            this.sandbox.dom.on(this.$el, 'click', this.collapsedFooterClickHandler.bind(this), '.navigation.collapsed footer');


            // tooltip events
            this.sandbox.dom.on(this.$el, 'mouseenter', function(event) {
                this.showToolTip.call(this, this.sandbox.dom.attr(this.sandbox.dom.find('input', '.navigation-search'), 'placeholder'), event);
            }.bind(this), '.navigation.collapsed .navigation-search');
            this.sandbox.dom.on(this.$el, 'mouseenter', function(event) {
                this.showToolTip.call(this, this.sandbox.translate(this.options.translations.user), event);
            }.bind(this), '.navigation.collapsed footer');
            this.sandbox.dom.on(this.$el, 'mouseenter', this.showToolTip.bind(this, ''), '.navigation.collapsed .navigation-items');
            this.sandbox.dom.on(this.$el, 'mouseleave', this.hideToolTip.bind(this), '.navigation.collapsed .navigation-items, .navigation.collapsed .navigation-search, .navigation.collapsed footer');

            this.sandbox.dom.on(this.$el, CONSTANTS.TRANSITIONEND_EVENT, function() {
                this.sandbox.emit(EVENT_SIZE_CHANGED, this.sandbox.dom.width(this.$navigation));
                this.tooltipsEnabled = true;
            }.bind(this));
            this.sandbox.dom.on(this.$el, CONSTANTS.TRANSITIONEND_EVENT, function(event) {
                event.stopPropagation();
            }.bind(this), '.navigation *');

            // version history clicked
            this.sandbox.dom.on(this.$el, 'click', function() {
                this.sandbox.emit(VERSION_HISTORY_CLICKED);
            }.bind(this), 'footer .version a');
        },

        /**
         * event listener
         */
        bindCustomEvents: function() {
            // merge options with newly passed options and rerender footer
            this.sandbox.on('husky.navigation.footer.set', function(options) {
                this.options = this.sandbox.util.extend(true, {}, this.options, options);
                this.renderFooter();
            }.bind(this));

            //user locales dropdown
            this.sandbox.on('husky.select.navigation-locale.selected.item', function(locale) {
                this.sandbox.emit(USER_LOCALE_CHANGED, locale);
            }.bind(this));

            this.sandbox.on(EVENT_COLLAPSE, function(stayCollapsed) {
                this.stayCollapsed = (typeof stayCollapsed === 'boolean') ? stayCollapsed : false;
                this.collapse();
            }.bind(this));
            this.sandbox.on(EVENT_UNCOLLAPSE, function(force) {
                this.stayCollapsed = false;
                this.unCollapse(force);
            }.bind(this));

            this.sandbox.on(EVENT_HIDE, this.hide.bind(this));
            this.sandbox.on(EVENT_SHOW, this.show.bind(this));
            this.sandbox.on(EVENT_SELECT_ITEM, this.preselectItem.bind(this));
        },

        resizeListener: function() {
            var windowWidth = this.sandbox.dom.width(this.sandbox.dom.window);

            if (windowWidth <= this.options.resizeWidth || this.stayCollapsed === true) {
                this.collapse();
            } else if (this.sandbox.dom.hasClass(this.$navigation, 'collapsed')) {
                this.unCollapse();
            }
        },

        showToolTip: function(title, event) {
            if (this.tooltipsEnabled === true) {
                var offset,
                    target = event.currentTarget;

                if (!title) {
                    title = this.sandbox.dom.html(this.sandbox.dom.find('.navigation-item-title', event.currentTarget));
                }
                if (!this.$tooltip) {
                    this.$tooltip = this.sandbox.dom.createElement('<div class="navigation-tooltip">' + title + '</div>');
                    this.sandbox.dom.append('body', this.$tooltip);
                }
                offset = this.sandbox.dom.offset(target);
                this.sandbox.dom.css(this.$tooltip, {
                    top: offset.top + (this.sandbox.dom.outerHeight(target) - 30) / 2
                });
            }
        },

        hideToolTip: function() {
            if (!!this.$tooltip) {
                this.sandbox.dom.remove(this.$tooltip);
                this.$tooltip = null;
            }
        },


        /**
         * Takes an action and select the matching navigation point
         * @param selectAction {string}
         */
        preselectItem: function(selectAction) {
            var matchLength = 0, matchItem, parent, match;
            this.sandbox.util.foreach(this.items, function(item) {
                if (!item || !item.action) {
                    return;
                }
                if (selectAction.indexOf(item.action) !== -1 && item.action.length > matchLength) {
                    matchItem = item;
                    matchLength = item.action.length;
                }
            }.bind(this));

            if (matchLength > 0) {
                match = matchItem.domObject;

                if (this.sandbox.dom.hasClass(match, 'js-navigation-sub-item')) {
                    parent = this.sandbox.dom.closest(match, '.navigation-items');
                    this.toggleItems(null, parent);
                }
                this.selectSubItem(null, match, false);
                this.checkBottomHit(null, match);
            }
        },


        /**
         * gets called when settings icon is clicked
         * @emits husky.navigation.item.settings (name, id, parent)
         * @param event
         */
        settingsClicked: function(event) {

            event.stopPropagation();
            event.preventDefault();

            // emit event
            var listItem = this.sandbox.dom.closest(event.currentTarget, '.js-navigation-items'),
                item = this.getItemById(this.sandbox.dom.data(listItem, 'id'));

            this.sandbox.emit('husky.navigation.item.settings', item);

        },

        /**
         * Toggles menu element with submenu
         * Raises navigation.toggle
         * @param event
         * @param customTarget
         */
        toggleItems: function(event, customTarget) {

            if (event) {
                event.preventDefault();
            } else {
                event = {
                    currentTarget: customTarget
                };
            }

            var $items = this.sandbox.dom.closest(event.currentTarget, '.js-navigation-items'),
                $childList = this.sandbox.dom.find('ul:first', $items),
                item, $toggle,
                isExpanded = this.sandbox.dom.hasClass($items, 'is-expanded'),
                navWasCollapsed;

            // only check collapse if event was fired
            if (!customTarget) {
                navWasCollapsed = this.showIfCollapsed();
            }

            if (isExpanded && !navWasCollapsed) {
                this.sandbox.dom.removeClass($items, 'is-expanded');

                // change toggle item
                $toggle = this.sandbox.dom.find('.icon-chevron-down', event.currentTarget);
                this.sandbox.dom.removeClass($toggle, 'icon-chevron-down');
                this.sandbox.dom.prependClass($toggle, 'icon-chevron-right');
            } else {
                this.sandbox.dom.show($childList);
                this.sandbox.dom.addClass($items, 'is-expanded');
                // change toggle item
                $toggle = this.sandbox.dom.find('.icon-chevron-right', event.currentTarget);
                this.sandbox.dom.removeClass($toggle, 'icon-chevron-right');
                this.sandbox.dom.prependClass($toggle, 'icon-chevron-down');

                this.sandbox.dom.one($items, CONSTANTS.TRANSITIONEND_EVENT, this.checkBottomHit.bind(this));
            }

            // emit event
            item = this.getItemById(this.sandbox.dom.data($items, 'id'));
            this.sandbox.emit('husky.navigation.item.toggle', !isExpanded, item);
        },

        checkBottomHit: function(event, customTarget) {
            var xBottom, windowHeight, itemHeight, itemTop, scrollTop,
                $items;

            if (event) {
                $items = event.currentTarget;
            } else {
                $items = customTarget;
            }
            // check if collapsed element overlaps browser border
            itemTop = this.sandbox.dom.offset($items).top;
            itemHeight = this.sandbox.dom.height($items);
            xBottom = itemTop + itemHeight;
            windowHeight = this.sandbox.dom.height(this.sandbox.dom.window);
            scrollTop = this.sandbox.dom.scrollTop(this.$navigationContent);
            if (xBottom > windowHeight) {
                if (itemHeight < windowHeight) {
                    this.sandbox.dom.scrollAnimate(scrollTop + (xBottom - windowHeight + 40), this.$navigationContent);
                } else {
                    this.sandbox.dom.scrollAnimate(itemTop, this.$navigationContent);
                }
            }
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
                    this.sandbox.dom.html(toggleLink, this.sandbox.translate(this.options.labels.hide));
                    this.sandbox.dom.removeClass($section, 'is-hidden');
                }.bind(this));
            } else {
                // show section
                this.sandbox.dom.html(toggleLink, this.sandbox.translate(this.options.labels.show));
                this.sandbox.dom.slideUp($list, 200, function() {
                    this.sandbox.dom.addClass($section, 'is-hidden');
                }.bind(this));
            }

            this.sandbox.emit('husky.navigation.section.toggle');
        },

        // returns if nav was collapsed
        showIfCollapsed: function() {

            if (this.sandbox.dom.hasClass(this.$navigation, 'collapsed')) {
                this.unCollapse(true);
                return true;
            }
            return false;
        },

        collapse: function() {
            if (this.hidden === false) {
                this.sandbox.dom.addClass(this.$navigation, 'collapsed');
                this.sandbox.dom.removeClass(this.$navigation, 'collapseIcon');
                if (!this.collapsed) {
                    this.sandbox.emit(EVENT_COLLAPSED, CONSTANTS.COLLAPSED_WIDTH);
                    this.sandbox.emit(EVENT_SIZE_CHANGE, CONSTANTS.COLLAPSED_WIDTH);
                    this.collapsed = !this.collapsed;
                    this.tooltipsEnabled = false;
                }
            }
        },

        unCollapse: function(forced) {
            if ((this.stayCollapsed === false || forced === true) && this.hidden === false) {
                this.sandbox.dom.removeClass(this.$navigation, 'collapsed');
                this.hideToolTip();
                if (forced) {
                    this.sandbox.dom.addClass(this.$navigation, 'collapseIcon');
                }
                if (this.collapsed) {
                    this.sandbox.emit(EVENT_UNCOLLAPSED, CONSTANTS.UNCOLLAPSED_WIDTH);
                    if (!forced) {
                        this.sandbox.emit(EVENT_SIZE_CHANGE, CONSTANTS.UNCOLLAPSED_WIDTH);
                    }
                    this.collapsed = !this.collapsed;
                    this.tooltipsEnabled = false;
                }
            }
        },

        // called when search icon was clicked
        showCollapsedSearch: function(event) {

            // remove collapse
            this.unCollapse(true);

            // focus search
            var input = this.sandbox.dom.find('input', this.sandbox.dom.parent(event.currentTarget)),
                instanceName;
            this.sandbox.dom.trigger(input, 'focus');

            // close when search is sent
            instanceName = this.options.searchInstanceName ? this.options.searchInstanceName + '.' : '';
            this.sandbox.once('husky.' + instanceName + 'search', this.resizeListener.bind(this));
        },


        /**
         * Selects menu element without submenu
         * Raises navigation.select
         * @param event
         * @param [customTarget] if event is undefined, the target must be passed customly
         * @param emit
         */
        selectSubItem: function(event, customTarget, emit) {

            if (!!event) {
                event.preventDefault();
            } else {
                event = {
                    currentTarget: customTarget
                };
            }

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


            if (emit !== false) {
                // emit event
                item = this.getItemById(this.sandbox.dom.data($subItem, 'id'));
                this.sandbox.emit('husky.navigation.item.select', item);
            }


            if (!customTarget) {
                setTimeout(this.resizeListener.bind(this), 700);
            }

        },

        /**
         * Takes an id and returns the matching item
         * @param id {number|string} id of the item
         * @returns {object|null}
         */
        getItemById: function(id) {
            for (var i = -1, length = this.items.length; ++i < length;) {
                if (id === this.items[i].id) {
                    return this.items[i];
                }
            }
            return null;
        },

        /**
         * Shows the navigation
         */
        show: function() {
            if (!!this.currentNavigationWidth) {
                this.sandbox.dom.removeAttr(this.$navigation, 'style');
                this.currentNavigationWidth = null;
                this.hidden = false;
            }
        },

        /**
         * Hides the navigaiton
         */
        hide: function() {
            this.currentNavigationWidth = this.sandbox.dom.width(this.$navigation);
            this.sandbox.dom.width(this.$navigation, 0);
            this.hidden = true;
        }

    };

});

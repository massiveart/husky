/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/data-navigation
 */

/**
 * @class DataNavigation
 * @constructor
 * @param {Object} [options] Configuration object
 * @param {String} [options.instanceName] - name of instance
 * @param {String} [options.rootUrl] - optional root url to fetch root data
 * @param {String} [options.url] url to fetch data from
 * @param {String} [options.resultKey] - key of array result
 * @param {String} [options.nameKey] - key of object name
 * @param {String} [options.childrenLinkKey] - key of children link in object
 * @param {String} [options.showAddButton] - Indicates if add button should be rendered
 * @param {Object} [options.translates] Holds the translates
 * @param {Bool} [options.globalEvents] Should global events be sent
 */
define([
    'husky_components/data-navigation/list-view'
], function(View) {

    'use strict';

    var defaultOptions = {
            url: null,
            rootUrl: null,
            resultKey: 'items',
            parentResultKey: 'parent',
            nameKey: 'name',
            childrenLinkKey: 'children',
            pageKey: 'page',
            limitKey: 'limit',
            searchKey: 'search',
            limit: 20,
            showAddButton: true,
            globalEvents: true,
            translates: {
                noData: 'No Data',
                title: 'Data',
                addButton: 'Add Data',
                search: 'Search ...'
            }
        },

        templates = {
            header: function() {
                return [
                    '<% if (data.current.id !== \'root\') { %>',
                    '   <div class="data-navigation-back" data-parent-id="<%= !!data.parent ? data.parent.id : \'root\' %>">',
                    '       <span class="fa-chevron-left data-navigation-parent-back"></span>',
                    '       <div class="data-navigation-parent-text">',
                    '           <% if (!!data.current && data.current.name) { %>',
                    '               <%= data.current.name %>',
                    '           <% } else { %>',
                    '               <%= translates.title %>',
                    '           <% } %>',
                    '       </div>',
                    '   </div>',
                    '<% } else { %>',
                    '   <div class="root-text">',
                    '       <%= data.current.name || translates.title %>',
                    '   </div>',
                    '<% } %>'
                ].join('');
            },

            main: function() {
                return [
                    '<div class="data-navigation<% if (options.showAddButton) { %> has-add-btn<% } %>">',
                    '   <div class="data-navigation-header"></div>',
                    '   <div class="data-navigation-list-container iscroll">',
                    '       <div class="data-navigation-search"></div>',
                    '       <div class="data-navigation-list-scroll iscroll-inner"></div>',
                    '       <div class="loader"></div>',
                    '   </div>',
                    '       <div class="data-navigation-list-footer">',
                    '           <button class="data-navigation-add btn">',
                    '               <span class="fa-plus-circle"></span>',
                    '               <%= options.translates.addButton %>',
                    '           </button>',
                    '       </div>',
                    '</div>'
                ].join('');
            }
        },

        constants = {
            ROOT_ID: 'root'
        },

        eventNamespace = 'husky.data-navigation.',

        /**
         * Creates the eventnames
         * @param postFix {String} event name to append
         */
        createEventName = function(postFix) {
            return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
        },

        /**
         * raised after initialization has finished
         * @event husky.data-navigation.initialized
         */
        INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * raised after the item was selected
         * @param item {Object} selected item
         * @event husky.data-navigation.select
         */
        SELECT = function() {
            return createEventName.call(this, 'select')
        },

        /**
         * raised after the item was selected without instancename
         * @param item {Object} selected item
         * @event husky.data-navigation.select
         */
        SELECT_GLOBAL = function() {
            return eventNamespace + 'select';
        },

        /**
         * raised when clicked on the add button
         * @param item {Object} current item
         * @event husky.data-navigation.add
         */
        ADD = function() {
            return createEventName.call(this, 'add')
        },

        /**
         * raised when clicked on the item icon
         * @param item {Object} item to navigate into
         * @event husky.data-navigation.content.navigate
         */
        NAVIGATE = function() {
            return createEventName.call(this, 'navigate')
        },

        /**
         * Setter for current url navigation will be reloaded with data
         * @param url {string} url to load data
         * @event husky.data-navigation.content.set-url
         */
        SET_URL = function() {
            return createEventName.call(this, 'set-url')
        },

        /**
         * Navigation will be reloaded with current url
         * @event husky.data-navigation.content.reload
         */
        RELOAD = function() {
            return createEventName.call(this, 'reload')
        },

        /**
         * Clear cache completely
         * @event husky.data-navigation.content.clear-cache
         */
        CLEAR_CACHE = function() {
            return createEventName.call(this, 'clear-cache')
        };

    return {

        page: 1,
        loading: false,

        /**
         * @method initialize
         */
        initialize: function() {
            this.currentView = null;
            this.cache = this.sandbox.cacheFactory.create();
            this.options = this.sandbox.util.extend(true, {}, defaultOptions, this.options);
            this.mainTpl = this.sandbox.util.template(templates.main());
            this.headerTpl = this.sandbox.util.template(templates.header());

            this.render();
            this.bindCustomEvents();

            this.sandbox.once('husky.loader.initialized', function() {
                this.showLoader();

                this.load()
                    .then(function(data) {
                        this.hideLoader();

                        return data;
                    }.bind(this))
                    .then(function(data) {
                        this.sandbox.emit(INITIALIZED.call(this));

                        this.currentView = this.createView(data);
                        this.updateHeader(data);
                        this.storeData(data);
                        this.appendView();
                    }.bind(this));
            }.bind(this));
        },

        /**
         * Component destructor function
         * @method remove
         */
        remove: function() {
            this.cache.destroy();
        },

        /**
         * Initial render method. Inserts the main template into the dom
         * @method render
         */
        render: function() {
            var tpl = this.mainTpl({options: this.options});
            this.$el.html(tpl);
            this.bindDOMEvents();

            this.sandbox.start([
                {
                    name: 'loader@husky',
                    options: {
                        el: this.sandbox.dom.find('.loader', this.$el),
                        hidden: true
                    }
                }
            ]);

            this.sandbox.start([
                {
                    name: 'search@husky',
                    options: {
                        el: this.sandbox.dom.find('.data-navigation-search', this.$el),
                        appearance: 'white',
                        instanceName: 'data-navigation',
                        placeholderText: this.options.translates.search
                    }
                }
            ]);

            this.startInfiniteScroll();
        },

        /**
         * start infinite scrolling
         * @method startInfiniteScroll
         */
        startInfiniteScroll: function() {
            this.sandbox.infiniteScroll('.iscroll', this.loadNextPage.bind(this), 50);
        },

        /**
         * load children from next page
         * @method startInfiniteScroll
         */
        loadNextPage: function() {
            var def = this.sandbox.data.deferred();

            if (!!this.data.hasNextPage && !this.loading) {
                this.showLoader();

                this.page++;
                this.sandbox.util.load(this.getUrl(this.getCurrentUrl()))
                    .then(function(data) {
                        var children = data._embedded[this.options.resultKey] || [];
                        this.data.children = this.data.children.concat(children);
                        this.data.hasNextPage = this.page < data.pages;
                        this.currentView.append(children, this.options);

                        this.hideLoader();
                        def.resolve();
                    }.bind(this));
            } else {
                def.resolve();
            }

            return def;
        },

        /**
         * @method bindDOMEvents
         */
        bindDOMEvents: function() {
            this.$el.on('click', '.data-navigation-item', this.selectChildrenDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-item-thumb', this.selectChildrenDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-parent-back', this.selectParentDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-add', this.addHandler.bind(this));
        },

        /**
         * @method bindCustomEvents
         */
        bindCustomEvents: function() {
            this.sandbox.on(SET_URL.call(this), function(url) {
                if (url !== this.getCurrentUrl) {
                    this.setUrl(url, true);
                } else {
                    this.cache.deleteAll();
                }
            }.bind(this));

            this.sandbox.on(RELOAD.call(this), function() {
                this.setUrl(this.getCurrentUrl(), true);
            }.bind(this));

            this.sandbox.on(CLEAR_CACHE.call(this), function() {
                this.cache.deleteAll();
            }.bind(this));

            this.sandbox.on('husky.search.data-navigation', function(searchTerm) {
                this.searchTerm = searchTerm;

                this.setUrl(this.getCurrentUrl(), true);
            }.bind(this));

            this.sandbox.on('husky.search.data-navigation.reset', function() {
                this.searchTerm = null;

                this.setUrl(this.getCurrentUrl(), true);
            }.bind(this));
        },

        getCurrentUrl: function() {
            var url = this.options.rootUrl;

            if (!!this.data.current.item) {
                url = this.data.current.item._links[this.options.childrenLinkKey].href;
            }

            return url;
        },

        setUrl: function(url, clearCache) {
            if (!!clearCache) {
                this.cache.deleteAll();
            }

            this.load(url)
                .then(this.storeData.bind(this))
                .then(function(data) {
                    this.updateHeader(data);
                    this.currentView.render(data, this.options);
                }.bind(this));
        },

        /**
         * Fetch the data from the server
         * @method load
         * @param {String} url
         */
        load: function(url) {
            this.page = 1;
            this.loading = true;

            return this.sandbox.util.load(this.getUrl(url))
                .then(this.parse.bind(this))
                .then(this.hideSearch.bind(this))
                .then(function(data) {
                    this.loading = false;

                    return data;
                }.bind(this));
        },

        hideLoader: function() {
            this.sandbox.emit('husky.loader.hide');
        },

        showLoader: function() {
            this.sandbox.emit('husky.loader.show');
        },

        /**
         * @method clearSearch
         */
        clearSearch: function() {
            this.searchTerm = null;

            this.sandbox.emit('husky.search.data-navigation.clear');
        },

        /**
         * Returns full url with search, page and limit parameter
         * @param url
         * @returns {string}
         */
        getUrl: function(url) {
            url = url || this.options.url || this.options.rootUrl;

            var delimiter = (url.indexOf('?') === -1) ? '?' : '&';

            url = [
                url, delimiter, this.options.pageKey, '=', this.page, '&',
                this.options.limitKey, '=', this.options.limit
            ].join('');

            if (!!this.searchTerm) {
                url = [
                    url, '&', this.options.searchKey, '=', this.searchTerm
                ].join('');
            }

            return url;
        },

        /**
         * @method parse
         * @param {Object} response Response
         */
        parse: function(response) {
            var current = {item: response},
                parent = response._embedded.parent;

            current.id = response.id || constants.ROOT_ID;
            current.name = response[this.options.nameKey];

            if (!!parent) {
                parent.id = parent.id || constants.ROOT_ID;
            } else if (current.id === constants.ROOT_ID) {
                current.item = null;
            }

            this.data = {
                children: response._embedded[this.options.resultKey] || null,
                parent: parent,
                current: current,
                hasNextPage: true
            };

            return this.data;
        },

        /**
         * hide search if no children available
         * @param data
         * @returns {*}
         */
        hideSearch: function(data) {
            if (data.children.length === 0 && !this.searchTerm) {
                this.$find('.data-navigation-search').hide();
            } else {
                this.$find('.data-navigation-search').show();
            }

            return data;
        },

        /**
         * caches the data inside a cache object
         * @method storeData
         * @param  {Object} data
         */
        storeData: function(data) {
            var current = data.current;

            if (!this.searchTerm) {
                this.cache.put(current.id, data);
            }

            return data;
        },

        /**
         * check if we already have the data.
         * If this is not the case, we fetch the data from the server
         * @method getItems
         */
        getItems: function(id) {
            var dfd = $.Deferred(),
                data = this.cache.get(id),
                item, url;

            if (!data) {
                if (id === constants.ROOT_ID) {
                    if (!!this.data.parent) {
                        url = this.data.parent._links[this.options.childrenLinkKey].href;
                    } else {
                        url = this.options.rootUrl;
                    }
                } else {
                    // underscores where returns a list but we only want the first item
                    item = _.where(this.data.children, {id: id})[0];

                    if (!item && !!this.data.parent && this.data.parent.id === id) {
                        item = this.data.parent;
                    }

                    url = item._links[this.options.childrenLinkKey].href;
                }

                return this.load(url).then(this.storeData.bind(this));
            } else {
                this.data = data;

                dfd.then(this.hideSearch.bind(this));
                dfd.resolve(data);
            }

            return dfd.promise();
        },

        /**
         * Return item from local cache
         * @param id
         */
        getItem: function(id) {
            return _.where(this.data.children, {id: id})[0];
        },

        /**
         * @method openChildrenHandler
         * @param {Object} event
         */
        openChildrenHandler: function(event) {
            var $item = $(event.currentTarget).closest('li'),
                id = $item.data('id'),
                oldView = this.currentView;

            this.clearSearch();
            this.currentView = this.createView();
            this.appendView(oldView);

            return this.getItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    this.currentView.render(data, this.options);
                }.bind(this));
        },

        /**
         * @method openParentHandler
         */
        openParentHandler: function(event) {
            var $item = $(event.currentTarget).closest('*[data-parent-id]'),
                id = this.sandbox.dom.data($item, 'parent-id'),
                newView = this.createView();

            this.clearSearch();
            this.prependView(newView);

            return this.getItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    newView.render(data, this.options);
                }.bind(this));
        },

        /**
         * Update the header html
         * @method updateHeader
         */
        updateHeader: function(data) {
            var tpl = this.headerTpl({
                data: data,
                translates: this.options.translates,
                nameKey: this.options.nameKey
            });
            this.$el.find('.data-navigation-header').html(tpl);
        },

        /**
         * Navigate to content and throw selected event
         * @method selectDataHandler
         */
        selectParentDataHandler: function(event) {
            event.stopPropagation();

            this.sandbox.emit(SELECT.call(this), this.data.parent);
            if (this.options.globalEvents) {
                this.sandbox.emit(SELECT_GLOBAL.call(this), this.data.parent);
            }

            this.openParentHandler(event);
        },

        /**
         * Navigate to content
         * @method selectDataHandler
         */
        navigateParentDataHandler: function(event) {
            event.stopPropagation();

            this.openParentHandler(event);
        },

        /**
         * Navigate to content and throw selected event
         * @method selectDataHandler
         */
        selectChildrenDataHandler: function(event) {
            event.stopPropagation();

            var $item = $(event.currentTarget).closest('li'),
                id = $item.data('id'),
                item = this.getItem(id);

            this.sandbox.emit(SELECT.call(this), item);
            if (this.options.globalEvents) {
                this.sandbox.emit(SELECT_GLOBAL.call(this), item);
            }

            this.openChildrenHandler(event);
        },

        /**
         * Throw an event to tell that the content should be loaded
         * @method showContentHandler
         */
        navigateChildrenHandler: function(event) {
            event.stopPropagation();

            var $item = $(event.currentTarget).closest('li'),
                id = $item.data('id'),
                item = this.getItem(id);

            this.sandbox.emit(NAVIGATE.call(this), item);

            this.openChildrenHandler(event);
        },

        /**
         * Throw an event to tell that the add button was clicked
         * @method addHandler
         */
        addHandler: function() {
            this.sandbox.emit(ADD.call(this), this.data.current.item);
        },

        /**
         * Initialize a new view
         * @method createView
         * @param  {Object} data
         */
        createView: function(data) {
            var view = (new View(this.options)).init();
            return view.render(data, this.options);
        },

        /**
         * Append the view into the dom
         * @method appendView
         * @param {Object} view
         */
        appendView: function(view) {
            if (!!view) {
                this.currentView.$el.addClass('is-animated');
                this.playAppendAnimation(view);
            }

            this.currentView.placeAt('.data-navigation-list-container .iscroll-inner');
        },

        /**
         * @method playAppendAnimation
         * @param {Object} oldView
         */
        playAppendAnimation: function(oldView) {
            this.currentView.$el
                .css({
                    left: '100%'
                })
                .animate({
                    left: '0%'
                }, {
                    duration: 250,
                    done: function() {
                        oldView.destroy();
                        this.currentView.$el.removeClass('is-animated');
                    }.bind(this)
                });
        },

        /**
         * Handle the back button action
         * @method prependView
         * @param {Object} view
         */
        prependView: function(view) {
            view.placeAt('.data-navigation-list-container .iscroll-inner');
            this.currentView.$el.addClass('is-animated');
            this.playPrependAnimation(view);
        },

        /**
         * @method playPrependAnimation
         * @param {Object} view
         */
        playPrependAnimation: function(view) {
            var oldView = this.currentView;
            this.currentView = view;

            oldView.$el
                .stop()
                .css({
                    left: '0%'
                })
                .animate({
                    left: '100%'
                }, {
                    duration: 250,
                    done: function() {
                        oldView.destroy();
                    }.bind(this)
                });
        }
    };
});

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
 * @param {String} [options.url] url to fetch data from
 * @param {Object} [options.translates] Holds the translates
 */
define([
    'husky_components/data-navigation/list-view',
    'text!data-navigation/main.html',
    'text!data-navigation/header.html'
], function(View, mainTpl, headerTpl) {

    'use strict';

    var defaultOptions = {
            url: null,
            id: null,
            resultKey: 'items',
            parentResultKey: 'parent',
            nameKey: 'name',
            childrenLinkKey: 'children',
            showAddBtn: true,
            translates: {
                noData: 'No Data',
                title: 'Data'
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
         * @event husky.data-navigation.content.show
         */
        NAVIGATE = function() {
            return createEventName.call(this, 'navigate')
        },

        /**
         * Setter for current url navigation will be relaoded with data
         * @param url {string} url to load data
         * @event husky.data-navigation.content.show
         */
        SET_URL = function() {
            return createEventName.call(this, 'set-url')
        };

    return {
        /**
         * @method initialize
         */
        initialize: function() {
            this.currentView = null;
            this.cache = this.sandbox.cacheFactory.create();
            this.options = this.sandbox.util.extend(true, {}, defaultOptions, this.options);
            this.template = this.sandbox.util.template(mainTpl);
            this.headerTpl = this.sandbox.util.template(headerTpl);

            this.render();
            this.bindCustomEvents();

            return this.load().then(function(data) {
                this.sandbox.emit(INITIALIZED.call(this));

                this.currentView = this.createView(data);
                this.updateHeader(data);
                this.storeData(data);
                this.appendView();
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
            var tpl = this.template({options: this.options});
            this.$el.html(tpl);
            this.bindDOMEvents();
        },

        /**
         * @method bindDOMEvents
         */
        bindDOMEvents: function() {
            this.$el.on('click', '.data-navigation-item-name', this.selectChildrenDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-item-thumb', this.selectChildrenDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-item-next', this.navigateChildrenHandler.bind(this));
            this.$el.on('click', '.data-navigation-back', this.selectParentDataHandler.bind(this));
            this.$el.on('click', '.data-navigation-add', this.addHandler.bind(this));
        },

        /**
         * @method bindCustomEvents
         */
        bindCustomEvents: function() {
            this.sandbox.on(SET_URL.call(this), function(url) {
                this.cache.deleteAll();

                this.load(url)
                    .then(this.storeData.bind(this))
                    .then(function(data) {
                        this.updateHeader(data);
                        this.currentView.render(data, this.options);
                    }.bind(this));
            }.bind(this));
        },

        /**
         * Fetch the data from the server
         * @method load
         * @param {String} url
         */
        load: function(url) {
            url = url || this.options.url;

            return this.sandbox.util.load(url)
                .then(this.parse.bind(this));
        },

        /**
         * @method parse
         * @param {Object} response Response
         */
        parse: function(response) {
            var current = {},
                parent = response._embedded.parent;

            current.id = response.id || constants.ROOT_ID;
            current.name = response[this.options.nameKey];

            if (!!parent) {
                parent.id = parent.id || constants.ROOT_ID;
            }

            this.data = {
                children: response._embedded[this.options.resultKey] || null,
                parent: parent,
                current: current
            };

            return this.data;
        },

        /**
         * caches the data inside a cache object
         * @method storeData
         * @param  {Object} data
         */
        storeData: function(data) {
            var current = data.current;

            this.cache.put(current.id, data);

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
                    url = this.data.parent._links[this.options.childrenLinkKey].href;
                } else {
                    // underscores where returns a list but we only want the first item
                    item = _.where(this.data.children, {id: id})[0];

                    if (!item && !!this.data.parent && this.data.parent.id === id) {
                        item = this.data.parent;
                    }

                    url = item._links[this.options.childrenLinkKey].href;
                }

                if (!!item.hasSub) {
                    return this.load(url).then(this.storeData.bind(this));
                } else {
                    this.data = {
                        children: [],
                        parent: this.data.current,
                        current: item
                    };

                    dfd.resolve(this.data);
                }
            } else {
                this.data = data;
                dfd.resolve(data);
            }

            return dfd.promise();
        },

        /**
         * @method openChildrenHandler
         * @param {Object} event
         */
        openChildrenHandler: function(event) {
            var $item = $(event.currentTarget).closest('li'),
                id = $item.data('id'),
                oldView = this.currentView;

            this.currentView = this.createView();
            this.appendView(oldView);

            this.getItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    this.currentView.render(data, this.options);
                }.bind(this));

            return id;
        },

        /**
         * @method openParentHandler
         */
        openParentHandler: function(event) {
            var $item = $(event.currentTarget),
                id = $item.data('parent-id'),
                newView = this.createView();

            this.prependView(newView);

            this.getItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    newView.render(data, this.options);
                }.bind(this));

            return id;
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
           var id = this.openParentHandler(event);
            this.sandbox.emit(SELECT.call(this), {id: id});
        },


        /**
         * Navigate to content and throw selected event
         * @method selectDataHandler
         */
        selectChildrenDataHandler: function(event) {
            var id = this.openChildrenHandler(event);
            this.sandbox.emit(SELECT.call(this), {id: id});
        },

        /**
         * Throw an event to tell that the content should be loaded
         * @method showContentHandler
         */
        navigateChildrenHandler: function(event) {
            event.stopPropagation();

            this.openChildrenHandler(event);
            this.sandbox.emit(NAVIGATE.call(this));
        },

        /**
         * Throw an event to tell that the add button was clicked
         * @method addHandler
         */
        addHandler: function() {
            this.sandbox.emit(ADD.call(this), this.data.current);
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

            this.currentView.placeAt('.data-navigation-list-container');
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
            view.placeAt('.data-navigation-list-container');
            this.currentView.$el.addClass('is-animated');
            this.playPrependAnimation(view);
        },

        /**
         * @method playPrependAnimation
         * @param {Object} view
         */
        playPrependAnimation: function(view) {
            this.currentView.$el
                .css({
                    left: '0%'
                })
                .animate({
                    left: '100%'
                }, {
                    duration: 250,
                    done: function() {
                        this.currentView.destroy();
                        this.currentView = view;
                    }.bind(this)
                });
        }
    };
});

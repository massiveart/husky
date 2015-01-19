/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/collection-navigation
 */

/**
 * @class CollectionNavigation
 * @constructor
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to fetch data from
 * @param {Number} [options.collectionId] The collection which should be loaded initially
 * @param {Object} [options.translations] Holds the translations
 */
define([
    'husky_components/collection-navigation/collections-list-view', 
    'text!./main.html',
    'text!./header.html'
    ], function (CollectionView, mainTpl, headerTpl) {

    'use strict';

    var defaultOptions = {
        url: null,
        collectionId: null,
        translates: {
            noCollections: ''
        }
    },

    namespace = 'husky.collection-navigation.',

    /**
     * Creates the eventnames
     * @param postfix {String} event name to append
     */
    createEventName = function(postfix) {
        return namespace + postfix;
    },

    /**
     * raised after initialization has finished
     * @event husky.collection-navigation.initialized
     */
    INITIALIZED = createEventName('initialized'),

    /**
     * raised after the collection was changed e.g. open new collection
     * @event husky.collection-navigation.collection.change
     */
    CHANGE_COLLECTION = createEventName('collection.change'),

    /**
     * raised when clicked on the add collection button
     * @event husky.collection-navigation.collection.add
     */
    ADD_COLLECTION = createEventName('collection.add'),

    /**
     * raised when clicked on the item icon
     * @event husky.collection-navigation.content.show
     */
    SHOW_CONTENT = createEventName('content.show');

    return {
        /**
         * @method initialize
         */
        initialize: function() {
            this.cache = null;
            this.collectionView = null;
            this.options = this.sandbox.util.extend(true, {}, defaultOptions, this.options);
            this.template = this.sandbox.util.template(mainTpl);
            this.headerTpl = this.sandbox.util.template(headerTpl);
            this.render();

            this.sandbox.emit(INITIALIZED);

            return this.load(this.options.collectionId).then(function(data) {
                this.collectionView = this.createCollectionView(data);
                this.updateHeader(data);
                this.storeData(data);
                this.appendCollectionView();
            }.bind(this));
        },

        /**
         * Component destructor function
         * @method remove
         */
        remove: function() {
            this.cache.destroy();
            this.collectionsList.destroy();
        },

        /**
         * Initial render method. Inserts the main template into the dom
         * @method render
         */
        render: function() {
            var tpl = this.template();
            this.$el.html(tpl);
            this.bindDOMEvents();
        },

        /**
         * @method bindDOMEvents
         */
        bindDOMEvents: function() {
            this.$el.on('click', '.collection-navigation-item-name', this.openChildCollectionHandler.bind(this));
            this.$el.on('click', '.collection-navigation-item-thumb', this.showContentHandler.bind(this));
            this.$el.on('click', '.collection-navigation-back', this.openParentCollectionHandler.bind(this));
            this.$el.on('click', '.collection-navigation-add', this.addCollectionHandler.bind(this));
        },

        /**
         * Fetch the data from the server
         * @method load
         * @param {Mixed} id The collection id
         */
        load: function(id) {
            var url = this.options.url;

            if (!!id && id !== 'root') {
                url = url + '/' + id;
            }

            return this.sandbox.util.load(url)
                        .then(this.parse.bind(this));
        },

        /**
         * @method parse
         * @param {Object} response Response
         */
        parse: function(response) {
            return response._embedded;
        },

        /**
         * caches the data inside a cache object
         * @method storeData
         * @param  {Object}  data [description]
         */
        storeData: function(data) {
            var current = data.current;

            if (!this.cache) {
                this.cache = this.sandbox.cacheFactory.create();
            }

            this.cache.put(current.id, data);

            return data;
        },

        /**
         * check if we already have the data. 
         * If this is not the case, we fetch the data from the server
         * @method getCollectionItems
         */
        getCollectionItems: function(id) {
            var dfd = $.Deferred(),
                data = this.cache.get(id);

            if (!data) {
                return this.load(id).then(this.storeData.bind(this));
            } else {
                dfd.resolve(data);
            }

            return dfd.promise();
        },

        /**
         * @method openChildCollectionHandler
         */
        openChildCollectionHandler: function(event) {
            var $item = $(event.currentTarget).closest('li'),
                id = $item.data('id'),
                oldCollectionView = this.collectionView;

            this.collectionView = this.createCollectionView();
            this.appendCollectionView(oldCollectionView);

            this.getCollectionItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    this.collectionView.render(data);
                    this.sandbox.emit(CHANGE_COLLECTION, { collectionId: id });
                }.bind(this));
        },

        /**
         * @method openParentCollectionHandler
         */
        openParentCollectionHandler: function(event) {
            var $item = $(event.currentTarget),
                id = $item.data('parent-id'),
                newCollectionView = this.createCollectionView();

            this.prependCollectionView(newCollectionView);

            this.getCollectionItems(id)
                .then(function(data) {
                    this.updateHeader(data);
                    newCollectionView.render(data);
                    this.sandbox.emit(CHANGE_COLLECTION, { collectionId: id });
                }.bind(this));
        },

        /**
         * Update the header html
         * @method updateHeader
         */
        updateHeader: function(data) {
            var tpl = this.headerTpl({ data: data });
            this.$el.find('.collection-navigation-header').html(tpl);
        },

        /**
         * Throw an event to tell that the content of the collection should be loaded
         * @method showContentHandler
         */
        showContentHandler: function() {
            this.sandbox.emit(SHOW_CONTENT);
        },

        /**
         * Throw an event to tell that the add collection button was clicked
         * @method addCollectionHandler
         */
        addCollectionHandler: function() {
            this.sandbox.emit(ADD_COLLECTION);
        },

        /**
         * Initialize a new collection view
         * @method createCollectionView
         * @param  {Object} data
         */
        createCollectionView: function(data) {
            var view = (new CollectionView()).init();
            return view.render(data);
        },

        /**
         * Append the collection view into the dom
         * @method appendCollectionView
         * @param {Object} oldView
         */
        appendCollectionView: function(oldView) {
            if (!!oldView) {
                this.collectionView.$el.addClass('is-animated');
                this.playAppendAnimation(oldView);   
            }

            this.collectionView.placeAt('.collection-navigation-list-container');
        },

        /**
         * @method playAppendAnimation
         * @param {Object} oldView
         */
        playAppendAnimation: function(oldView) {
            this.collectionView.$el
                    .css({
                        left: '100%'
                    })
                    .animate({
                        left: '0%'
                    }, {
                        duration: 250,
                        done: function() {
                            oldView.destroy();
                            this.collectionView.$el.removeClass('is-animated');
                        }.bind(this)
                    });
        },

        /**
         * Handle the back button action
         * @method prependCollectionView
         * @param {Object} newView
         */
        prependCollectionView: function(newView) {
            newView.placeAt('.collection-navigation-list-container');
            this.collectionView.$el.addClass('is-animated');
            this.playPrependAnimation(newView);
        },

        /**
         * @method playPrependAnimation
         * @param {Object} oldView
         */
        playPrependAnimation: function(newView) {
            this.collectionView.$el
                    .css({
                        left: '0%'
                    })
                    .animate({
                        left: '100%'
                    }, {
                        duration: 250,
                        done: function() {
                            this.collectionView.destroy();
                            this.collectionView = newView;
                        }.bind(this)
                    });
        },
    };  
});

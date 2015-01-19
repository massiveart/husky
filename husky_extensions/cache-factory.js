(function() {

    'use strict';

    define([], {
        name: 'history',

        initialize: function(app) {
            var caches = {};

            /**
             * @class Cache
             */
            function Cache(cacheId) {
                var store = {};

                return {
                    /**
                     * @method get
                     */
                    get: function(key) {
                        return store[key] || null;
                    },

                    /**
                     * change an entry
                     * @method put
                     */
                    put: function(key, value) {
                        store[key] = value;
                        return value;
                    },

                    /**
                     * Returns the item of the given index
                     * @method delete
                     * @param {Mixed} key
                     * @return {Object}
                     */
                    delete: function(key) {
                        delete store[key];
                    },

                    /**
                     * Clears the cache object of any entries
                     * @method deleteAll
                     */
                    deleteAll: function() {
                        store = {};
                    },

                    /**
                     * Destroys the cache instance
                     * @method destroy
                     * @return {Object}
                     */
                    destroy: function() {
                        delete caches[cacheId];
                    }
                };
            };

            app.sandbox.cacheFactory = {
                /**
                 * Initialize a new cache and store the refernce
                 * @method create
                 * @param  {Number} cacheId
                 */
                create: function(cacheId) {
                    cacheId = cacheId || app.core.util.uniqueId('cache');

                    if (cacheId in caches) {
                        throw new Error('cacheId already exists.');
                    }

                    return caches[cacheId] = new Cache(cacheId);
                },

                /**
                 * Get a cache reference
                 * @method get 
                 * @param  {[Number} cacheId
                 */
                get: function(cacheId) {
                    return caches[cacheId];
                }
            };
        }
    });
})();

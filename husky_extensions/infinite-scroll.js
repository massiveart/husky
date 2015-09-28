/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
(function() {

    'use strict';

    define(function() {

        var scrollTimer = null,

            scrollListener = function(selector, offset, callback) {
                if (!$(selector).data('blocked')) {
                    if (!!scrollTimer) {
                        clearTimeout(scrollTimer);   // clear any previous pending timer
                    }
                    scrollTimer = setTimeout(scrollHandler.bind(this, selector, offset, callback), 50);
                }
            },

            scrollHandler = function(selector, offset, callback) {
                var scrollContainer = $(selector),
                    containerHeight = scrollContainer[0].clientHeight,
                    contentHeight = scrollContainer[0].scrollHeight,
                    scrollTop = scrollContainer.scrollTop(),
                    padding = (isNaN(offset)) ? 0 : offset;

                // check if user scrolled to bottom
                if ((containerHeight + scrollTop + padding - contentHeight) >= 0) {

                    scrollContainer.data('blocked', true);
                    var result = callback();

                    if (!!result && !!result.then) {
                        result.then(function() {
                            $(selector).removeData('blocked');
                        });
                    } else {
                        $(selector).removeData('blocked');
                    }
                }
            };

        return {

            name: 'infinite-scroll',

            initialize: function(app) {
                app.sandbox.infiniteScroll = {

                    /**
                     * Listen for scroll-to-bottom on the element of the given selector
                     * @param selector element to listen on
                     * @param callback function to execute on scrolled-to-bottom
                     * @param offset execute callback before reaching bottom. value in px
                     */
                    initialize: function(selector, callback, offset) {
                        app.sandbox.dom.on(selector, 'scroll.infinite', function() {
                            scrollListener(selector, offset, callback);
                        });
                    },

                    /**
                     * Unbind the scroll event listener
                     * @param selector
                     */
                    destroy: function(selector) {
                        app.sandbox.dom.off(selector, 'scroll.infinite');
                    }
                }
            }
        };
    });
})();

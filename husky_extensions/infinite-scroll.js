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

            scrollListener = function(selector, padding, callback) {
                if (!$(selector).data('blocked')) {
                    if (!!scrollTimer) {
                        clearTimeout(scrollTimer);   // clear any previous pending timer
                    }
                    scrollTimer = setTimeout(scrollHandler.bind(this, selector, padding, callback), 50);
                }
            },

            scrollHandler = function(selector, padding, callback) {
                var scrollContainer = $(selector),
                    containerHeight = scrollContainer[0].clientHeight,
                    contentHeight = scrollContainer[0].scrollHeight,
                    scrollTop = scrollContainer.scrollTop(),
                    padding = (isNaN(padding)) ? 0 : padding;

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

                    initialize: function(selector, callback, padding) {
                        app.sandbox.dom.on(selector, 'scroll.infinite', function() {
                            scrollListener(selector, padding, callback);
                        });
                    },

                    destroy: function(selector) {
                        this.sandbox.dom.off(selector, 'scroll.infinite');
                    }
                }
            }
        };
    });
})
();

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

            scrollListener = function(event, sandbox, padding, callback) {
                if (sandbox.dom.data(sandbox.dom.find(event.currentTarget), 'blocked') !== 'on') {
                    return;
                }

                if (!!scrollTimer) {
                    clearTimeout(scrollTimer);   // clear any previous pending timer
                }
                scrollTimer = setTimeout(
                    scrollHandler.bind(this, event, sandbox, padding, callback), 50
                );
            },

            scrollHandler = function(event, sandbox, padding, callback) {
                var $currentTarget = sandbox.dom.find(event.currentTarget),
                    $inner = getHeighestChild($currentTarget),

                    borderTopWidth = parseInt(sandbox.dom.css($currentTarget, 'borderTopWidth')),
                    borderTopWidthInt = isNaN(borderTopWidth) ? 0 : borderTopWidth,
                    iContainerTop = parseInt(sandbox.dom.css($currentTarget, 'paddingTop')) + borderTopWidthInt,
                    iTopHeight = sandbox.dom.offset($currentTarget).top,
                    innerTop = $inner.length ? sandbox.dom.offset($inner).top : 0,
                    iTotalHeight = Math.ceil(iTopHeight - innerTop + $currentTarget.height() + iContainerTop);

                if (iTotalHeight + (isNaN(padding) ? 0 : padding) >= $inner.outerHeight()) {
                    sandbox.dom.data($currentTarget, 'blocked', 'off');
                    var result = callback();

                    if (!!result && !!result.then) {
                        result.then(function() {
                            sandbox.dom.data($currentTarget, 'blocked', 'on');
                        });
                    } else {
                        sandbox.dom.data($currentTarget, 'blocked', 'on');
                    }
                }
            },

            getHeighestChild = function($parent) {
                var $heighestChild = $($parent.children()[0]);
                $parent.children().each(function(index, $child) {
                    if ($($child).outerHeight() > $heighestChild.outerHeight()) {
                        $heighestChild = $($child);
                    }
                }.bind(this))
                return $heighestChild;
            };

        return {

            name: 'infinite-scroll',

            initialize: function(app) {
                app.sandbox.infiniteScroll = {

                    initialize: function(selector, callback, padding) {
                        $(selector).data('blocked', 'on');

                        app.sandbox.dom.on(selector, 'scroll.infinite', function(event) {
                            scrollListener(event, app.sandbox, padding, callback);
                        });
                    },

                    destroy: function(selector) {
                        $(selector).removeData('blocked');
                        this.sandbox.dom.off(selector, 'scroll.infinite');
                    }
                }
            }
        };
    });
})
();

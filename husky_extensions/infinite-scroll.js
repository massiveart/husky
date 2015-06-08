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

        var scrollHandler = function(event, sandbox, padding, callback) {
            var $currentTarget = sandbox.dom.find(event.currentTarget),
                $inner = sandbox.dom.first(
                    sandbox.dom.find('div.iscroll-inner', $currentTarget)
                ),
                borderTopWidth = parseInt(sandbox.dom.css($currentTarget, 'borderTopWidth')),
                borderTopWidthInt = isNaN(borderTopWidth) ? 0 : borderTopWidth,
                iContainerTop = parseInt(sandbox.dom.css($currentTarget, 'paddingTop')) + borderTopWidthInt,
                iTopHeight = sandbox.dom.offset($currentTarget).top,
                innerTop = $inner.length ? sandbox.dom.offset($inner).top : 0,
                iTotalHeight = Math.ceil(iTopHeight - innerTop + $currentTarget.height() + iContainerTop);

            if (
                sandbox.dom.data($currentTarget, 'blocked') === 'on' &&
                iTotalHeight + (isNaN(padding) ? 0 : padding) >= $inner.outerHeight()
            ) {
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
        };

        return {

            name: 'infinite-scroll',

            initialize: function(app) {
                app.sandbox.infiniteScroll = function(selector, callback, padding) {
                    app.sandbox.dom.data(app.sandbox.dom.find(selector), 'blocked', 'on');

                    app.sandbox.dom.on(selector, 'scroll', function(event) {
                        scrollHandler(event, app.sandbox, padding, callback);
                    });
                };
            }
        };
    });
})();

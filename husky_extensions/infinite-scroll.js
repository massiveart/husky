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
            var $e = sandbox.dom.find(event.currentTarget),
                $inner = sandbox.dom.first(
                    sandbox.dom.find('div.iscroll-inner', $e)
                ),
                borderTopWidth = parseInt(sandbox.dom.css($e, 'borderTopWidth')),
                borderTopWidthInt = isNaN(borderTopWidth) ? 0 : borderTopWidth,
                iContainerTop = parseInt(sandbox.dom.css($e, 'paddingTop')) + borderTopWidthInt,
                iTopHeight = sandbox.dom.offset($e).top,
                innerTop = $inner.length ? sandbox.dom.offset($inner).top : 0,
                iTotalHeight = Math.ceil(iTopHeight - innerTop + $e.height() + iContainerTop);

            if (sandbox.dom.data($e, 'enabled') === 'on' && iTotalHeight + (isNaN(padding) ? 0 : padding) >= $inner.outerHeight()) {
                sandbox.dom.data($e, 'enabled', 'off');
                var result = callback();

                if (!!result && !!result.then) {
                    result.then(function() {
                        sandbox.dom.data($e, 'enabled', 'on');
                    });
                } else {
                    sandbox.dom.data($e, 'enabled', 'on');
                }
            }
        };

        return {

            name: 'infinite-scroll',

            initialize: function(app) {
                app.sandbox.infiniteScroll = function(selector, callback, padding) {
                    app.sandbox.dom.data(app.sandbox.dom.find(selector), 'enabled', 'on');

                    app.sandbox.dom.on(selector, 'scroll', function(event) {
                        scrollHandler(event, app.sandbox, padding, callback);
                    });
                };
            }
        };
    });
})();

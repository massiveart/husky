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

    define({

        name: 'Confirm',

        initialize: function(app) {

            app.sandbox.confirm = {

                /**
                 * Shows a confirmation box
                 * @param that - the context in which the box gets displayed. Must be an aura-component with a sandbox and an element
                 * @param title - the title (or translation key) for the box
                 * @param message - the message (or translation key) for the box
                 * @param okCallback - callback to execute after box was confirmed
                 * @param closeCallback - callback to execute on cancel
                 * @param [type] - 'warning' or 'error' - default 'warning'
                 */
                warning: function (that, title, message, okCallback, closeCallback, type) {
                    var $element = app.core.dom.createElement('<div/>'),
                        type = type || 'warning';
                    app.core.dom.append(that.$el, $element);

                    that.sandbox.start([
                        {
                            name: 'overlay@husky',
                            options: {
                                el: $element,
                                title: app.sandbox.translate(title),
                                message: app.sandbox.translate(message),
                                closeCallback: closeCallback,
                                okCallback: okCallback,
                                type: type
                            }
                        }
                    ]);
                }
            };
        }
    });
})();

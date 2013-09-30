(function() {

    'use strict';

    if (window.jQuery) {
        define('jquery', [], function() {
            return window.jQuery;
        });
    } else {
        require.config({
            paths: { backbone: 'bower_components/jquery/jquery' },
            shim: { backbone: { exports: '$' } }
        });
    }

    define(['jquery'], {

        name: 'jQuery',

        initialize: function(app) {
            app.core.dom.window = window;

            app.core.dom.$window = $(window);

            app.core.dom.document = document;

            app.core.dom.$document = $(document);

            app.core.dom.$ = $;

            app.core.dom.createElement = function(selector, props) {
                props = props || {};
                return $(selector, props);
            };

            app.core.dom.html = function(selector, content) {
                return $(selector).html(content);
            };

            app.core.dom.each = function(selector, callback) {
                $(selector).each(callback);
            };

            app.core.dom.append = function(selector, element) {
                return $(selector).append(element);
            };

            app.core.dom.css = function(selector, style, value) {
                if (!!value) {
                    return $(selector).css(style, value);
                } else {
                    return $(selector).css(style);
                }
            };

            app.core.dom.addClass = function(selector, classes) {
                return $(selector).addClass(classes);
            };

            app.core.dom.removeClass = function(selector, classes) {
                return $(selector).removeClass(classes);
            };

            app.core.dom.toggleClass = function(selector, classes) {
                return $(selector).toggleClass(classes);
            };

            app.core.dom.hasClass = function(selector, classes) {
                return $(selector).hasClass(classes);
            };

            app.core.dom.parent = function(selector) {
                return $(selector).parent();
            };

            app.core.dom.width = function(selector) {
                return $(selector).width();
            };

            app.core.dom.height = function(selector) {
                return $(selector).height();
            };

            app.core.dom.remove = function(context, selector) {
                return $(context).remove(selector);
            };

            app.core.dom.attr = function(selector, attributes) {
                attributes = attributes || {};
                return $(selector).attr(attributes);
            };

            app.core.dom.is = function(selector, type) {
                return $(selector).is(type);
            };

            app.core.dom.data = function(selector, key, value) {
                if (!!value) {
                    return $(selector).data(key, value);
                } else {
                    return $(selector).data(key);
                }
            };

            app.core.dom.onReady = function(callback) {
                $(window).on('load', callback);
            };

            app.core.dom.val = function(selector, value) {
                if (!!value) {
                    $(selector).val(value);
                } else {
                    return $(selector).val();
                }
            };

            app.core.dom.on = function(selector, event, callback, filter) {
                if (!!filter) {
                    $(selector).on(event, filter, callback);
                } else {
                    $(selector).on(event, callback);
                }
            };

            app.core.dom.one = function(selector, event, callback, filter) {
                if (!!filter) {
                    $(selector).one(event, filter, callback);
                } else {
                    $(selector).one(event, callback);
                }
            };

            app.core.dom.toggleClass = function(selector, className) {
                $(selector).toggleClass(className);
            };

            app.core.dom.parent = function(selector, filter) {
                return $(selector).parent(filter);
            };

            app.core.dom.next = function(selector, filter) {
                return $(selector).next(filter);
            };

            app.core.dom.prev = function(selector, filter) {
                return $(selector).prev(filter);
            };

            app.core.dom.text = function(selector, value) {
                if (!!value) {
                    $(selector).text(value);
                } else {
                    return $(selector).text();
                }
            };

            app.core.dom.prop = function(selector, propertyName, value) {
                if (!!value) {
                    return $(selector).prop(propertyName, value);
                } else {
                    return $(selector).prop(propertyName);
                }
            };

            app.core.dom.stopPropagation = function(event) {
                event.stopPropagation();
            };


            app.core.dom.hide = function(selector) {
                return $(selector).hide();
            };

            app.core.dom.show = function(selector) {
                return $(selector).show();
            };

            app.core.util.ajax = $.ajax;
        }
    });
})();

(function() {    
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
            }

            app.core.dom.width = function(selector) {
                return $(selector).width();
            };

            app.core.dom.height = function(selector) {
                return $(selector).height();
            };

            app.core.dom.remove = function(selector) {
                return $(selector).remove();
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

            app.core.dom.on = function(selector, event, filter, callback) {
                $(selector).on(event, filter, callback);
            };

            app.core.util.ajax = $.ajax;
        }
    });
})();

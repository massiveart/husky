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

            app.core.dom.createElement = function(selector, props) {
                props = props || {};
                return $(element, props);
            };

            app.core.dom.append = function(selector, element) {
                return $(container).append(target);
            };

            app.core.dom.css = function(selector, style) {
                return $(target).css(style);
            };

            app.core.dom.addClass = function(selector, classes) {
                return $(target).addClass(classes);
            };

            app.core.dom.removeClass = function(selector, classes) {
                return $(target).removeClass(classes);
            };

            app.core.dom.width = function(selector) {
                return $(element).width();
            };

            app.core.dom.height = function(selector) {
                return $(element).height();
            };

            app.core.dom.remove = function(selector) {
                return $(element).remove();
            };

            app.core.dom.attr = function(selector, attributes) {
                attributes = attributes || {};
                return $(element).attr(attributes);
            };

            app.core.dom.is = function(selector, type) {
                return $(element).is(type);
            };

            app.core.dom.onReady = function(callback) {
                $(window).on('load', callback);
            };

            app.core.util.ajax = $.ajax;
        }
    });
})();

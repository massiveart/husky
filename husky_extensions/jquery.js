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

            app.core.dom.createElement = function(element, props) {
                props = props || {};
                return $(element, props);
            };

            app.core.dom.append = function(container, target) {
                return $(container).append(target);
            };

            app.core.dom.css = function(target, style) {
                return $(target).css(style);
            };

            app.core.dom.addClass = function(target, classes) {
                return $(target).addClass(classes);
            };

            app.core.dom.removeClass = function(target, classes) {
                return $(target).removeClass(classes);
            };

            app.core.dom.width = function(element) {
                return $(element).width();
            };

            app.core.dom.height = function(element) {
                return $(element).height();
            };

            app.core.dom.remove = function(element) {
                return $(element).remove();
            };

            app.core.dom.attr = function(element, attributes) {
                attributes = attributes || {};
                return $(element).remove();
            };

            app.core.dom.is = function(element, type) {
                return $(element).is(type);
            };

            app.core.dom.onReady = function(callback) {
                $(window).on('load', callback);
            };

            app.core.util.ajax = $.ajax;
        }
    });
})();

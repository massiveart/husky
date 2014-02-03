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

    // add remove event for jquery
    var initRemoveEvent = function() {
        var ev = new $.Event('remove'),
            orig = $.fn.remove;
        $.fn.remove = function() {
            $(this).trigger(ev);
            return orig.apply(this, arguments);
        };
    };

    define(['jquery'], {

        name: 'jQuery',

        initialize: function(app) {

            initRemoveEvent();

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
                if (typeof content !== 'undefined') {
                    return $(selector).html(content);
                }
                return $(selector).html();
            };

            app.core.dom.parseHTML = function(data) {
                return $.parseHTML(data);
            };

            app.core.dom.each = function(selector, callback) {
                $(selector).each(callback);
            };

            app.core.dom.append = function(selector, element) {
                return $(selector).append(element);
            };

            app.core.dom.prepend = function(selector, element) {
                return $(selector).prepend(element);
            };

            app.core.dom.before = function(selector, element) {
                return $(selector).before(element);
            };

            app.core.dom.after = function(selector, element) {
                return $(selector).after(element);
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
                if (!classes) {
                    return $(selector).removeClass();
                }
                return $(selector).removeClass(classes);
            };

            app.core.dom.toggleClass = function(selector, classes) {
                return $(selector).toggleClass(classes);
            };

            app.core.dom.hasClass = function(selector, classes) {
                return $(selector).hasClass(classes);
            };

            app.core.dom.prependClass = function(selector, classes) {
                var $el = $(selector),
                    oldClasses = $el.attr('class');

                /* prepend class */
                classes = classes + ' ' + oldClasses;
                $el.attr('class', classes);
            };

            app.core.dom.parent = function(selector) {
                return $(selector).parent();
            };

            app.core.dom.width = function(selector) {
                return $(selector).width();
            };

            app.core.dom.outerWidth = function(selector) {
                return $(selector).outerWidth();
            };

            app.core.dom.height = function(selector) {
                return $(selector).height();
            };

            app.core.dom.offset = function(selector, attributes) {
                if (attributes) {
                    return $(selector).offset(attributes);
                } else {
                    return $(selector).offset();
                }

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
                    $(selector).data(key, value);
                } else {
                    return $(selector).data(key);
                }
            };

            app.core.dom.onReady = function(callback) {
                $(window).on('load', callback);
            };

            app.core.dom.val = function(selector, value) {
                if (!!value || value === '') {
                    $(selector).val(value);
                } else {
                    return $(selector).val();
                }
            };

            app.core.dom.clearVal = function(selector) {
                return $(selector).val('');
            };

            app.core.dom.blur = function(selector) {
                return $(selector).blur();
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

            app.core.dom.off = function(selector, event, filter, handler) {
                $(selector).off(event, filter, handler);
            };

            app.core.dom.trigger = function(selector, eventType, params) {
                $(selector).trigger(eventType, params);
            };

            app.core.dom.toggleClass = function(selector, className) {
                $(selector).toggleClass(className);
            };

            app.core.dom.parent = function(selector, filter) {
                return $(selector).parent(filter);
            };

            app.core.dom.parents = function(selector, filter) {
                return $(selector).parents(filter);
            };

            app.core.dom.children = function(selector, filter) {
                return $(selector).children(filter);
            };

            app.core.dom.next = function(selector, filter) {
                return $(selector).next(filter);
            };

            app.core.dom.prev = function(selector, filter) {
                return $(selector).prev(filter);
            };

            app.core.dom.closest = function(selector, filter) {
                return $(selector).closest(filter);
            };

            app.core.dom.clone = function(selector) {
                return $(selector).clone();
            };

            app.core.dom.text = function(selector, value) {
                if (!!value) {
                    $(selector).text(value);
                } else {
                    return $(selector).text();
                }
            };

            app.core.dom.prop = function(selector, propertyName, value) {
                if (value !== undefined) {
                    return $(selector).prop(propertyName, value);
                } else {
                    return $(selector).prop(propertyName);
                }
            };

            app.core.dom.mouseleave = function(selector, handler) {
                $(selector).mouseleave(handler);
            };

            app.core.dom.stopPropagation = function(event) {
                event.stopPropagation();
            };

            app.core.dom.preventDefault = function(event) {
                event.preventDefault();
            };

            app.core.dom.hide = function(selector) {
                return $(selector).hide();
            };

            app.core.dom.show = function(selector) {
                return $(selector).show();
            };

            app.core.dom.toggle= function(selector) {
                return $(selector).toggle();
            };

            app.core.dom.keypress = function(selector, callback) {
              $(selector).keypress(callback);
            };

            app.core.dom.insertAt = function(index, selector, $container, $item) {
                if (index === 0) {
                    app.core.dom.prepend($container, $item);
                } else {
                    var $before = app.core.dom.find(selector + ':nth-child(' + index + ')', $container);
                    app.core.dom.after($before, $item);
                }
            };

            app.core.dom.scrollTop = function(itemSelector) {
                $(window).scrollTop($(itemSelector).offsset().top);
            };

            app.core.dom.scrollLeft = function(selector, value) {
                if(!!value) {
                    $(selector).scrollLeft(value);
                } else {
                    return $(selector).scrollLeft();
                }
            };


            app.core.dom.scrollAnimate = function(position, selector) {
                if (!!selector) {
                    $(selector).animate({
                        scrollTop: position
                    }, 500);
                } else {
                    $('html, body').animate({
                        scrollTop: position
                    }, 500);
                }
            };

            app.core.dom.slideUp = function(selector, duration, complete) {
                $(selector).slideUp(duration,complete);
            };

            app.core.dom.slideDown = function(selector, duration, complete) {
                $(selector).slideDown(duration,complete);
            };



            app.core.util.ajax = $.ajax;
        }
    });
})();

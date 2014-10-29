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

            app.core.dom.outerHTML = function(selector) {
                return $(selector).wrapAll('<div></div>').parent().html();
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
                if (typeof value !== 'undefined') {
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

            app.core.dom.parent = function(selector, filter) {
                return $(selector).parent(filter);
            };

            app.core.dom.width = function(selector, value) {
                if (typeof value !== 'undefined') {
                    return $(selector).width(value);
                } else {
                    return $(selector).width();
                }
            };

            app.core.dom.outerWidth = function(selector) {
                return $(selector).outerWidth();
            };

            app.core.dom.height = function(selector, value) {
                if (typeof value === 'undefined') {
                    return $(selector).height();
                }
                return $(selector).height(value);
            };

            app.core.dom.outerHeight = function(selector, includeMargin) {
                if (typeof includeMargin === 'undefined') {
                    return $(selector).outerHeight();
                } else {
                    return $(selector).outerHeight(includeMargin);
                }
            };

            app.core.dom.outerWidth = function(selector, includeMargin) {
                if (typeof includeMargin === 'undefined') {
                    return $(selector).outerWidth();
                } else {
                    return $(selector).outerWidth(includeMargin);
                }
            };

            app.core.dom.offset = function(selector, attributes) {
                if (attributes) {
                    return $(selector).offset(attributes);
                } else {
                    return $(selector).offset();
                }

            };

            app.core.dom.position = function(selector) {
                return $(selector).position();
            };

            app.core.dom.remove = function(context, selector) {
                return $(context).remove(selector);
            };

            app.core.dom.detach = function(context, selector) {
                return $(context).detach(selector);
            };

            app.core.dom.attr = function(selector, attributeName, value) {
                if (typeof value === 'undefined') {
                    attributeName = attributeName || {};
                    return $(selector).attr(attributeName);
                } else {
                    return $(selector).attr(attributeName, value);
                }
            };

            app.core.dom.removeAttr = function(selector, attributeName) {
                return $(selector).removeAttr(attributeName);
            };

            app.core.dom.is = function(selector, type) {
                return $(selector).is(type);
            };

            app.core.dom.isArray = function(selector) {
                return $.isArray(selector);
            };

            app.core.dom.isNumeric = function(number) {
                return $.isNumeric(number);
            };

            app.core.dom.data = function(selector, key, value) {
                if (!!value || value === '') {
                    return $(selector).data(key, value);
                } else {
                    return $(selector).data(key);
                }
            };

            app.core.dom.onReady = function(callback) {
                $(window).on('load', callback);
            };

            app.core.dom.val = function(selector, value) {
                if (!!value || value === '') {
                    return $(selector).val(value);
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

            app.core.dom.select = function(selector, handler) {
                if (!!handler) {
                    return $(selector).select(handler);
                } else {
                    return $(selector).select();
                }
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
                    return $(selector).text(value);
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

            app.core.dom.stop = function(selector) {
                $(selector).stop();
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

            app.core.dom.trim = function(string) {
                return $.trim(string);
            };

            app.core.dom.map = function(selector, callback) {
                return $(selector).map(callback);
            };

            app.core.dom.get = function(selector, index) {
                return $(selector).get(index);
            };

            app.core.dom.toggle = function(selector) {
                return $(selector).toggle();
            };

            app.core.dom.index = function(selector, filter) {
                if (!!filter) {
                    return $(selector).index(filter);
                } else {
                    return $(selector).index();
                }
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

            app.core.dom.scrollToTop = function(itemSelector) {
                $(window).scrollTop($(itemSelector).offset().top);
            };

            app.core.dom.scrollTop = function(selector, position) {
                if (typeof position !== 'undefined') {
                    return $(selector).scrollTop(position);
                } else {
                    return $(selector).scrollTop();
                }
            };

            app.core.dom.scrollLeft = function(selector, value) {
                if (typeof value !== 'undefined') {
                    return $(selector).scrollLeft(value);
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
                $(selector).slideUp(duration, complete);
            };

            app.core.dom.slideDown = function(selector, duration, complete) {
                $(selector).slideDown(duration, complete);
            };

            app.core.dom.last = function(selector) {
                return $(selector).last();
            };

            app.core.dom.fadeIn = function(selector, duration, complete) {
                $(selector).fadeIn(duration, complete);
            };

            app.core.dom.fadeTo = function(selector, duration, opacity, complete) {
                $(selector).fadeTo(duration, opacity, complete);
            };

            app.core.dom.fadeOut = function(selector, duration, complete) {
                $(selector).fadeOut(duration, complete);
            };

            app.core.dom.when = function(deffereds) {
                return $.when(deffereds);
            };

            app.core.dom.unbind = function(selector, eventType) {
                $(selector).unbind(eventType);
            };

            app.core.dom.focus = function(selector) {
                $(selector).focus();
            };

            app.core.dom.click = function(selector) {
                $(selector).click();
            };

            app.core.dom.animate = function(selector, properties, options) {
                $(selector).animate(properties, options);
            };

            app.core.dom.empty = function(selector){
              $(selector).empty();
            };

            app.core.dom.replaceWith = function(selector, newContent) {
              $(selector).replaceWith(newContent);
            };

            /**
             * Awesome visible method. Returns false if any part of a given element is not visible
             * Method is copied and slightly adapted from https://github.com/teamdf/jquery-visible/
             * @param selector {Stirng|Object} element selector or jquery dom object
             * @param partial {Boolean} if true only returns false if every part of the element is not visible
             * @param hidden {Boolean} if true checks whether the element is visible, as well as wheter it's within the viewport too. Defaults to true
             * @param direction {String} to specify the direction to check for visibility. This can either be 'horizontal', 'vertical' or 'both'. Default is to 'both'
             * @returns {Boolean} true or false whether the element is visible or not
             */
            app.core.dom.visible = function (selector, partial, hidden, direction) {
                if (this.length < 1) {
                    return;
                }
                direction = (direction) ? direction : 'both';
                hidden = (typeof hidden === 'undefined') ? true : hidden;

                var $element = $(selector), $t = $element.length > 1 ? $element.eq(0) : $element,
                    t = $t.get(0),
                    vpWidth = app.sandbox.dom.$window.width(),
                    vpHeight = app.sandbox.dom.$window.height(),
                    clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true,
                    rec, tViz, bViz, lViz, rViz, vVisible, hVisible, viewTop, viewBottom, viewLeft, viewRight,
                    offset, _top, _bottom, _left, _right, compareTop, compareBottom, compareLeft, compareRight;

                if (typeof t.getBoundingClientRect === 'function') {

                    // Use this native browser method, if available.
                    rec = t.getBoundingClientRect();
                    tViz = rec.top >= 0 && rec.top < vpHeight;
                    bViz = rec.bottom > 0 && rec.bottom <= vpHeight;
                    lViz = rec.left >= 0 && rec.left < vpWidth;
                    rViz = rec.right > 0 && rec.right <= vpWidth;
                    vVisible = partial ? tViz || bViz : tViz && bViz;
                    hVisible = partial ? lViz || lViz : lViz && rViz;

                    if (direction === 'both') {
                        return clientSize && vVisible && hVisible;
                    }
                    else if (direction === 'vertical') {
                        return clientSize && vVisible;
                    }
                    else if (direction === 'horizontal') {
                        return clientSize && hVisible;
                    }
                } else {

                    viewTop = app.sandbox.dom.$window.scrollTop();
                    viewBottom = viewTop + vpHeight;
                    viewLeft = app.sandbox.dom.$window.scrollLeft();
                    viewRight = viewLeft + vpWidth;
                    offset = $t.offset();
                    _top = offset.top;
                    _bottom = _top + $t.height();
                    _left = offset.left;
                    _right = _left + $t.width();
                    compareTop = partial === true ? _bottom : _top;
                    compareBottom = partial === true ? _top : _bottom;
                    compareLeft = partial === true ? _right : _left;
                    compareRight = partial === true ? _left : _right;

                    if (direction === 'both') {
                        return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
                    }
                    else if (direction === 'vertical') {
                        return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
                    }
                    else if (direction === 'horizontal') {
                        return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
                    }
                }
            };

            app.core.util.ajax = $.ajax;

            app.core.util.ajaxError = function(callback) {
                $(document).ajaxError(callback);
            };

            app.core.util.when = function(deferreds){
                return $.when(deferreds);
            };
        }
    });
})();

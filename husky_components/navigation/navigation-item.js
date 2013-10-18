/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: navigation
 * Options:
 *
 * Provided Events:
 *
 * Used Events:
 *
 */

define(function() {
    'use strict';

    var defaults = {
            title: '',
            hasSub: false
        },

        render = function() {
            prepareColumnItem.call(this);

            bindDomEvents.call(this);
        },

        prepareColumnItem = function() {
            var columnItemClasses = ['navigation-column-item'];
            // init classes
            if (!!this.options.data.class) {
                columnItemClasses.push(this.options.data.class);
            }
            if (!!this.options.data.selected) {
                columnItemClasses.push(this.options.data.selected);
            }

            this.sandbox.dom.attr(this.$el, {
                id: this.options.data.id,
                class: columnItemClasses.join(' '),
                title: this.options.data.title,
                'data-has-sub': (!!this.options.data.hasSub) ? 'true' : 'false'
            });

            // add icon
            if (!!this.options.data.icon) {
                this.$el.append(
                    this.sandbox.dom.createElement('<span/>', {
                        class: 'icon-' + this.options.data.icon
                    })
                );
            }
            // add title
            this.$el.append(this.options.data.title);
        },

        bindDomEvents = function() {
            this.sandbox.dom.on(this.$el, 'click', clickItem.bind(this));
        },

        clickItem = function(event) {
            this.sandbox.logger.log('click item', this.options.data);

            event.stopPropagation();

            // emit click callback or event
            if (!!this.options.clickCallback && typeof this.options.clickCallback === 'function') {
                this.options.clickCallback(this.options.data);
            } else {
                this.sandbox.emit('husky.navigation.item.click', this.options.data);
            }

            // selected class
            this.sandbox.dom.addClass(this.$el, 'selected');
        };

    return function() {
        return {
            render: function() {
                render.call(this);
            },

            setOptions: function(options) {
                if (!options) {
                    throw('No options were defined!');
                }
                this.options = this.sandbox.util.extend({}, defaults, options);
                this.$el = this.options.$el;
            },

            loadingItem: function(onOff) {
                if (onOff) {
                    this.sandbox.dom.addClass(this.$el, 'is-loading');
                } else {
                    this.sandbox.dom.removeClass(this.$el, 'is-loading');
                }
            },

            selectItem: function(onOff) {
                if (!!onOff) {
                    this.sandbox.dom.addClass(this.$el, 'selected');
                } else {
                    this.sandbox.dom.removeClass(this.$el, 'selected');
                }
            }
        };
    };
});

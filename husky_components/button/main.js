/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: button
 * Options:
 *  buttontype: type of button [icon, custom]
 *  instancename: name of instance used in events
 *  text: button text
 *  icontype: button icon
 *  background: background color for spinner
 *
 * Provided Events:
 *  husky.button.<<instancename>>.click: button where clicked
 *  husky.button.<<instancename>>.state: change buttonType [icon, custom type]
 *
 */

define([], function() {

    var type,
        types = {
            icon: {
                init: function() {
                    this.sandbox.dom.addClass(this.$el, 'pointer icon-btn');
                    this.$el.html(type.template(this.options.icontype, this.options.text));
                    type.bindDomEvents.call(this);
                },
                bindDomEvents: function() {
                    this.$el.on('click', this.clickEvent.bind(this));
                },
                unBoundDomEvents: function() {
                    this.$el.off('click');
                },
                template: function(icon, text) {
                    return '<div class="loading-content"><span class="icon-' + icon + ' pull-left block"></span><span class="m-left-5 bold pull-left m-top-2 block">' + text + '</span></div>';
                },
                reset: function() {
                    this.sandbox.dom.removeClass(this.$el, 'loading-black');
                    this.sandbox.dom.removeClass(this.$el, 'loading');
                    this.sandbox.dom.removeClass(this.$el, 'disable');
                },

                states: {
                    standard: function() {
                        type.reset.call(this);

                        type.bindDomEvents.call(this);
                    },
                    disable: function() {
                        this.sandbox.dom.addClass(this.$el, 'disable');
                        this.sandbox.dom.removeClass(this.$el, 'pointer');

                        type.unBoundDomEvents.call(this);
                    },
                    loading: function() {
                        if (!!this.options.background) {
                            this.sandbox.dom.addClass(this.$el, 'loading-' + this.options.background);
                        } else {
                            this.sandbox.dom.addClass(this.$el, 'loading');
                        }
                        this.sandbox.dom.removeClass(this.$el, 'pointer');

                        type.unBoundDomEvents.call(this);
                    }
                }
            }
        },
        defaults = {
            buttontype: 'icon',         // type of button [icon, custom]
            instancename: 'undefined',  // name of instance used in events
            text: 'undefined',          // button text
            icontype: 'caution',        // button icon
            background: null            // background color for spinner
        };


    return {

        view: true,

        getEvent: function(append) {
            return 'husky.button.' + this.options.instancename + '.' + append;
        },

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();
        },

        render: function() {
            if (typeof this.options.buttontype === 'string') {
                if (!!types[this.options.buttontype]) {
                    type = types[this.options.buttontype];
                } else {
                    throw 'not implemented';
                }
            } else {
                if (!!this.options.buttontype.init && !!this.options.buttontype.render && !!this.options.buttontype.states) {
                    type = this.options.buttontype;
                } else {
                    throw 'not implemented';
                }
            }
            type.init.call(this);

            this.bindCustomEvents();
        },

        clickEvent: function(event) {
            this.sandbox.emit(this.getEvent('click'));
        },

        bindCustomEvents: function() {
            this.sandbox.on(this.getEvent('state'), this.changeState.bind(this));
        },

        changeState: function(state) {
            if (!!type && !!type.states[state]) {
                type.reset.call(this);
                type.states[state].call(this);
            } else {
                throw 'not implemented';
            }
        }
    }
});

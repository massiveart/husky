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
 *  buttonType: type of button [icon, custom]
 *  instanceName: name of instance used in events
 *  text: button text
 *  iconType: button icon
 *  background: background color for spinner
 *
 * Provided Events:
 *  husky.button.<<instanceName>>.click: button where clicked
 *  husky.button.<<instanceName>>.state: change buttonType [icon, custom type]
 *
 */

define([], function() {

    var type,
        types = {
            icon: {
                init: function() {
                    this.sandbox.dom.addClass(this.$el, 'pointer icon-btn');
                    this.$el.html(type.template(this.options.iconType, this.options.text));
                    type.bindDomEvents.call(this);
                },
                bindDomEvents: function() {
                    this.$el.on('click', this.clickEvent.bind(this));
                },
                unBindDomEvents: function() {
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

                        type.unBindDomEvents.call(this);
                    },
                    loading: function() {
                        if (!!this.options.background) {
                            this.sandbox.dom.addClass(this.$el, 'loading-' + this.options.background);
                        } else {
                            this.sandbox.dom.addClass(this.$el, 'loading');
                        }
                        this.sandbox.dom.removeClass(this.$el, 'pointer');

                        type.unBindDomEvents.call(this);
                    }
                }
            }
        },
        defaults = {
            buttonType: 'icon',         // type of button [icon, custom]
            instanceName: 'undefined',  // name of instance used in events
            text: 'undefined',          // button text
            iconType: 'caution',        // button icon
            state: null,            // has dom events
            background: null            // background color for spinner
        };


    return {

        getEvent: function(append) {
            return 'husky.button.' + this.options.instanceName + '.' + append;
        },

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();
        },

        render: function() {
            if (typeof this.options.buttonType === 'string') {
                if (!!types[this.options.buttonType]) {
                    type = types[this.options.buttonType];
                } else {
                    throw 'not implemented';
                }
            } else {
                if (!!this.options.buttonType.init && !!this.options.buttonType.render && !!this.options.buttonType.states) {
                    type = this.options.buttonType;
                } else {
                    throw 'not implemented';
                }
            }

            type.init.call(this);

            this.bindCustomEvents();

            if(!!this.options.state) {
                this.changeState(this.options.state);
            }
        },

        clickEvent: function() {
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

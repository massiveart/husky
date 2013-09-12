define([], function() {

    var type,
        types = {
            icon: {
                init: function() {
                    this.sandbox.dom.addClass(this.$el, 'pointer icon-btn');
                    this.html(type.template(this.options.icontype, this.options.text));

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
            buttontype: 'icon',
            instancename: 'undefined',
            text: 'undefined',
            icontype: 'caution',
            background: null
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

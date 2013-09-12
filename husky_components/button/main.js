define([], function() {

    var defaults = {
        buttontype: 'icon',
        instancename: 'undefined',
        text: 'undefined',
        icontype: 'caution'
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
            if (!!this.types[this.options.buttontype]) {
                this.types[this.options.buttontype].init.call(this);
            } else {
                throw 'not implemented';
            }

            this.bindCustomEvents();
        },

        clickEvent: function(event) {
            this.sandbox.emit(this.getEvent('click'));
        },

        bindCustomEvents: function() {
            this.sandbox.on(this.getEvent('state'), this.changeState.bind(this));
        },

        changeState: function(state) {
            if (!!this.types[this.options.buttontype].states[state]) {
                this.types[this.options.buttontype].reset.call(this);
                this.types[this.options.buttontype].states[state].call(this);
            } else {
                throw 'not implemented';
            }
        },

        types: {
            icon: {
                init: function() {
                    this.$el.addClass('pointer');
                    this.html(this.types.icon.template(this.options.icontype, this.options.text));

                    this.types.icon.bindDomEvents.call(this);
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
                        this.types.icon.reset.call(this);

                        this.types.icon.bindDomEvents.call(this);
                    },
                    disabled: function() {
                        this.sandbox.dom.addClass(this.$el, 'disable');

                        this.types.icon.unBoundDomEvents.call(this);
                    },
                    loading: function() {
                        this.sandbox.dom.addClass(this.$el, 'loading');

                        this.types.icon.unBoundDomEvents.call(this);
                    },
                    'loading-black': function() {
                        this.sandbox.dom.addClass(this.$el, 'loading-black');

                        this.types.icon.unBoundDomEvents.call(this);
                    }
                }
            }
        }
    }
});

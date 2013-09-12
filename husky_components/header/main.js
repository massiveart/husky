/**
 * Name: header
 * Options:
 *  margin: add margin to navWidth
 *
 * Provided Events:
 *  husky.header.move-buttons: move middle part to match given navigation width
 *  husky.header.button-type: change ButtonType [save, saveDelete, add, template]
 *
 * Used Events:
 *  navigation:item:content:show: used to move buttons when the content is changing
 *
 */

define([], function() {

    var sandbox,
        type,
        types = {
            save: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6 left">',
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instancename="save" data-aura-buttontype="icon" data-aura-background="black" data-aura-icontype="caution" data-aura-text="Save"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function() {
                    // do nothing
                },

                states: {
                    standard: function() {
                        sandbox.emit('husky.button.save.state', 'standard');
                    },
                    disable: function() {
                        sandbox.emit('husky.button.save.state', 'disable');
                    },
                    'loading-save-button': function() {
                        sandbox.emit('husky.button.save.state', 'loading');
                    }
                }
            },
            saveDelete: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6 left">',
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instancename="save" data-aura-buttontype="icon" data-aura-background="black" data-aura-icontype="caution" data-aura-text="Save"/>',
                        '   </div>',
                        '   <div class="grid-col-6 right">',
                        '       <div id="delete-button" class="pull-right" data-aura-component="button@husky" data-aura-instancename="delete" data-aura-buttontype="icon" data-aura-background="black" data-aura-icontype="circle-remove" data-aura-text="Delete"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function() {
                    // do nothing
                },

                states: {
                    standard: function() {
                        sandbox.emit('husky.button.save.state', 'standard');
                        sandbox.emit('husky.button.delete.state', 'standard');
                    },
                    disable: function() {
                        sandbox.emit('husky.button.save.state', 'disable');
                        sandbox.emit('husky.button.delete.state', 'disable');
                    },
                    'loading-save-button': function() {
                        sandbox.emit('husky.button.save.state', 'loading');
                        sandbox.emit('husky.button.delete.state', 'disable');
                    },
                    'loading-delete-button': function() {
                        sandbox.emit('husky.button.save.state', 'disable');
                        sandbox.emit('husky.button.delete.state', 'loading');
                    }
                }
            },
            add: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6 left">',
                        '       <div id="add-button" data-aura-component="button@husky" data-aura-instancename="add" data-aura-buttontype="icon" data-aura-background="black" data-aura-icontype="add" data-aura-text="Add"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function() {
                    // do nothing
                },

                states: {
                    standard: function() {
                        sandbox.emit('husky.button.add.state', 'standard');
                    },
                    disable: function() {
                        sandbox.emit('husky.button.add.state', 'disable');
                    },
                    'loading-add-button': function() {
                        sandbox.emit('husky.button.add.state', 'loading');
                    }
                }
            }
        },
        defaults = {
            marginmid: 45,   // add 45px to navWidth
            marginright: 20, // add 20px to margin mid part
            buttontype: null // type of button at start
        };

    return {

        view: true,

        initialize: function() {
            sandbox = this.sandbox;

            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            // init html elements
            this.$header = this.sandbox.dom.$('<div/>', {
                class: 'header header-fixed-top'
            });
            this.$left = this.sandbox.dom.$('<div/>', {
                class: 'header-left'
            });
            this.$right = this.sandbox.dom.$('<div/>', {
                class: 'header-right'
            });
            this.$mid = this.sandbox.dom.$('<div/>', {
                id: 'header-mid',
                class: 'header-mid grid'
            });

            // render header
            this.render();
        },

        render: function() {
            // append needed elements
            this.$el.append(this.$header);
            this.$header.append(this.$left);
            this.$header.append(this.$mid);
            this.$header.append(this.$right);

            // bind events
            this.bindDomEvents();
            this.bindCustomEvents();

            // set default type
            if(!!this.options.buttontype){
                this.changeButtonType(this.options.buttontype);
            }
        },

        bindDomEvents: function() {

        },

        bindCustomEvents: function() {
            // move buttons
            this.sandbox.on('navigation:item:content:show', function(item) {
                this.moveButtons(item.data.navWidth);
            }.bind(this));
            this.sandbox.on('husky.header.move-buttons', this.moveButtons.bind(this));

            // add buttons
            this.sandbox.on('husky.header.button-type', this.changeButtonType.bind(this));

            // change state
            this.sandbox.on('husky.header.button-state', this.changeState.bind(this));
        },

        // move buttons with navigation width
        moveButtons: function(navWidth) {
            var headerLeft = parseInt(this.sandbox.dom.css(this.$header, 'margin-left')),
                marginLeft = navWidth + this.options.marginmid - headerLeft,
                width = parseInt(this.sandbox.dom.css(this.$mid, 'width'));

            this.$mid.css('margin-left', marginLeft);
            this.$right.css('margin-left', width + marginLeft + this.options.marginright);
        },

        changeButtonType: function(newType) {
            this.buttonCleanUp();

            if (typeof newType === 'string') {
                if (!!types[newType]) {
                    type = types[newType];
                } else {
                    throw 'Not implemented';
                }
            } else {
                if (!!newType.template && !!newType.reset && !!newType.states) {
                    type = newType;
                } else {
                    throw 'Not implemented';
                }
            }
            this.$mid.html(type.template.call(this));

            this.sandbox.start('#header-mid');
        },

        // clean up buttons and turn off events
        buttonCleanUp: function() {
            this.sandbox.stop('#header-mid');
        },

        changeState: function(state) {
            if (!!type && !!type.states[state]) {
                type.reset.call(this);
                type.states[state].call(this);
            } else {
                throw 'Not implemented';
            }
        }
    };
});

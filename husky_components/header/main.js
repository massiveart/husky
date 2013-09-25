/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: header
 * Options:
 *  marginMid: add 45px to navWidth
 *  marginRight: add 20px to margin mid part
 *  buttonType: type of button at start
 *
 * Provided Events:
 *  husky.header.move-buttons: move middle part to match given navigation width
 *  husky.header.button-type: change ButtonType [save, saveDelete, saved, savedDelete, add, reset, template]
 *  husky.header.button-state: change state of buttons
 *
 * Used Events:
 *  navigation.item.content.show: used to move buttons when the content is changing
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
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instance-name="save" data-aura-button-type="icon" data-aura-button-state="disable" data-aura-background="black" data-aura-icon-type="circle-ok" data-aura-text="Saved"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function() {
                    // do nothing
                },

                states: {
                    standard: function() {
                        // set text to saved and OK
                        sandbox.emit('husky.button.save.set-content', 'Saved', 'circle-ok');
                        sandbox.emit('husky.button.save.state', 'disable');
                    },
                    dirty: function() {
                        // set text to save and icon to !
                        sandbox.emit('husky.button.save.set-content', 'Save', 'caution');
                        sandbox.emit('husky.button.save.state', 'standard');
                    },
                    disable: function() {
                        sandbox.emit('husky.button.save.state', 'disable');
                    },
                    'loading-save-button': function() {
                        sandbox.emit('husky.button.save.state', 'loading');
                    },
                    hide: function() {
                        // hide save button
                    }
                }
            },
            saveDelete: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6 left">',
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instance-name="save" data-aura-button-type="icon" data-aura-button-state="disable" data-aura-background="black" data-aura-icon-type="circle-ok" data-aura-text="Saved"/>',
                        '   </div>',
                        '   <div class="grid-col-6 right">',
                        '       <div id="delete-button" class="pull-right" data-aura-component="button@husky" data-aura-instance-name="delete" data-aura-button-type="icon" data-aura-background="black" data-aura-icon-type="circle-remove" data-aura-text="Delete"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function() {
                    // do nothing
                },

                states: {
                    standard: function() {
                        sandbox.emit('husky.button.save.set-content', 'Saved', 'circle-ok');
                        sandbox.emit('husky.button.save.state', 'disable');
                        sandbox.emit('husky.button.delete.state', 'standard');
                    },
                    dirty: function() {
                        // set text to save and icon to !
                        sandbox.emit('husky.button.save.set-content', 'Save', 'caution');
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
                        '       <div id="add-button" data-aura-component="button@husky" data-aura-instance-name="add" data-aura-button-type="icon" data-aura-background="black" data-aura-icon-type="add" data-aura-text="Add"/>',
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
            },
            reset: {
                template: function() {
                    return [];
                },
                reset: function() {
                },
                states: { }
            }
        },
        defaults = {
            marginMid: 45,   // add 45px to navWidth
            marginRight: 20, // add 20px to margin mid part
            buttonType: null // type of button at start
        };

    return {

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
            if (!!this.options.buttonType) {
                this.changeButtonType(this.options.buttonType);
            }
        },

        bindDomEvents: function() {

        },

        bindCustomEvents: function() {
            // move buttons
            this.sandbox.on('navigation.item.content.show', function(item) {
                this.moveButtons(item.data.navWidth);
            }.bind(this));
            this.sandbox.on('navigation.size.changed', function(data) {
                this.moveButtons(data.navWidth);
            }.bind(this));
            
            this.sandbox.on('husky.header.move-buttons', this.moveButtons.bind(this));

            // add buttons
            this.sandbox.on('husky.header.button-type', this.changeButtonType.bind(this));

            // change state
            this.sandbox.on('husky.header.button-state', this.changeState.bind(this));
        },

        // move buttons with navigation width
        moveButtons: function(navWidth) {
            var headerLeft = parseInt(this.sandbox.dom.css(this.$header, 'padding-left')),
                marginLeft = navWidth + this.options.marginMid - headerLeft,
                width = parseInt(this.sandbox.dom.css(this.$mid, 'width'));

            this.$mid.css('margin-left', marginLeft);
            this.$right.css('margin-left', width + marginLeft + this.options.marginRight);
        },

        changeButtonType: function(newType) {
            // TODO perhaps sandbox.stop('#header-mid')

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

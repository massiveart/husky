/**
 * Name: HeaderBar
 * Options:
 *  margin: add margin to navWidth
 *
 * Provided Events:
 *  husky.headerbar.move-buttons: move middle part to match given navigation width
 *  husky.headerbar.button-type: change ButtonType [save, saveDelete, add, template]
 *
 * Used Events:
 *  navigation:item:content:show: used to move buttons when the content is changing
 *
 */

define([], function() {

    var sandbox,
        type,
        defaults = {
            margin: 45  // add 45px to navWidth
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
            this.$headerbar = this.sandbox.dom.$('<div/>', {
                class: 'headerbar headerbar-fixed-top'
            });
            this.$left = this.sandbox.dom.$('<div/>', {
                class: 'headerbar-left'
            });
            this.$right = this.sandbox.dom.$('<div/>', {
                class: 'headerbar-right'
            });
            this.$mid = this.sandbox.dom.$('<div/>', {
                id: 'headerbar-mid',
                class: 'headerbar-mid grid'
            });

            // render headerBar
            this.render();
        },

        render: function() {
            // append needed elements
            this.$el.append(this.$headerbar);
            this.$headerbar.append(this.$left);
            this.$headerbar.append(this.$mid);
            this.$headerbar.append(this.$right);

            // bind events
            this.bindDomEvents();
            this.bindCustomEvents();
        },

        bindDomEvents: function() {

        },

        bindCustomEvents: function() {
            // move buttons
            this.sandbox.on('navigation:item:content:show', function(item) {
                this.moveButtons(item.data.navWidth);
            }.bind(this));
            this.sandbox.on('husky.headerbar.move-buttons', this.moveButtons.bind(this));

            // add buttons
            this.sandbox.on('husky.headerbar.button-type', this.changeButtonType.bind(this));

            // change state
            this.sandbox.on('husky.headerbar.button-state', this.changeState.bind(this));
        },

        // move buttons with navigation width
        moveButtons: function(navWidth) {
            var headerbarLeft = parseInt(this.sandbox.dom.css(this.$headerbar, 'margin-left')),
                marginLeft = navWidth + this.options.margin - headerbarLeft,
                width = parseInt(this.sandbox.dom.css(this.$mid, 'width'));

            this.$mid.css('margin-left', marginLeft);
            this.$right.css('margin-left', width + marginLeft + 20);
        },

        changeButtonType: function(newType) {
            this.buttonCleanUp();

            if (!!this.types[newType]) {
                this.$mid.html(this.types[newType].template.call(this));
            } else {
                throw 'Not implemented';
            }

            type = newType;
            this.sandbox.start('#headerbar-mid');
        },

        // clean up buttons and turn off events
        buttonCleanUp: function() {
            this.sandbox.stop('#headerbar-mid');
        },

        changeState: function(state) {
            if (!!this.types[type] && !!this.types[type].states[state]) {
                this.types[type].states[state].call(this);
                this.types[type].reset.call(this);
            } else {
                throw 'Not implemented';
            }
        },

        types: {
            save: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6">',
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instancename="save" data-aura-buttontype="icon" data-aura-icontype="caution" data-aura-text="Save"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                },
                reset: function(){
                    // do nothing
                },
                states: {
                    standard: function() {
                        sandbox.emit('husky.button.save.state', 'standard');
                    },
                    'loading-save-button': function() {
                        sandbox.emit('husky.button.save.state', 'loading-black');
                    }
                }
            },
            saveDelete: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6">',
                        '       <div id="save-button" data-aura-component="button@husky" data-aura-instancename="save" data-aura-buttontype="icon" data-aura-icontype="caution" data-aura-text="Save"/>',
                        '   </div>',
                        '   <div class="grid-col-6">',
                        '       <div id="delete-button" class="pull-right" data-aura-component="button@husky" data-aura-instancename="delete" data-aura-buttontype="icon" data-aura-icontype="circle-remove" data-aura-text="Delete"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                }
            },
            add: {
                template: function() {
                    return [
                        '<div class="grid-row">',
                        '   <div class="grid-col-6">',
                        '       <div id="add-button" data-aura-component="button@husky" data-aura-instancename="add" data-aura-buttontype="icon" data-aura-icontype="add" data-aura-text="Add"/>',
                        '   </div>',
                        '</div>'
                    ].join('');
                }
            }
        }
    };
});

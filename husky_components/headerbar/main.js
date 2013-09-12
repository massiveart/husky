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

    var defaults = {
        margin: 45  // add 45px to navWidth
    };

    return {

        view: true,

        initialize: function() {
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
        },

        // move buttons with navigation width
        moveButtons: function(navWidth) {
            // FIXME jquery extension
            var headerbarLeft = parseInt(this.$headerbar.css('margin-left')),
                marginLeft = navWidth + this.options.margin - headerbarLeft,
                width = parseInt(this.$mid.css('width'));

            this.$mid.css('margin-left', marginLeft);
            this.$right.css('margin-left', width + marginLeft + 20);
        },

        changeButtonType: function(type) {
            if (type === 'save') {
                this.saveButtonType();
            } else if (type === 'saveDelete') {
                throw 'Not implemented';
            } else if (type === 'add') {
                throw 'Not implemented';
            } else {
                throw 'Not implemented';
            }
        },

        // clean up buttons and turn off events
        buttonCleanUp: function() {
        },

        // change to button type save
        saveButtonType: function() {
            this.$mid.html(this.template.save());
            this.sandbox.start('#headerbar-mid');
        },

        template: {
            saveType: function() {
                return [
                    '<div class="grid-row">',
                    '<div class="grid-col-6">',
                    '<div id="save-button" data-aura-component="button@husky" data-aura-istanceName="save" data-aura-buttonType="icon" data-aura-iconType="caution" data-aura-text="Save"/>',
                    '</div>',
                    '<div class="grid-col-6">',
                    '<div id="delete-button" data-aura-component="button@husky" data-aura-istanceName="delete" data-aura-buttonType="icon" data-aura-iconType="circle-remove" data-aura-text="Delete"/>',
                    '</div>',
                    '</div>'
                ].join('');
            },
            saveDeleteType: function() {

            },
            addType: function() {

            }
        }
    };
});

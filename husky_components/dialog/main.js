/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART Webservices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(['jquery'], function($) {

    'use strict';

    var sandbox,
        defaults = {
            data: {
                footer: {
                    buttonCancelText: 'Cancel',
                    buttonSubmitText: 'Ok'
                }
            },
            backdrop: true,
            backdropClick: false, // if true, click on backdrop is going to hide dialogbox
            width: '550px',
            template: {
                content: '<h3><%= title %></h3><p><%= content %></p>',
                footer: '<button class="btn btn-gray" id="dialog-button-cancel"><%= buttonCancelText %></button><button class="btn btn-black" id="dialog-button-submit"><%= buttonSubmitText %></button>',
                header: ''
            }
        },
        defaultsOk = {
            data: {
                footer: {
                    buttonCancelText: "Ok"
                }
            },
            backdrop: true,
            backdropClick: false,
            width: '550px',
            template: {
                content: '<h3><%= title %></h3><p><%= content %></p>',
                footer: '<button class="btn btn-black" id="dialog-button-cancel"><%= buttonCancelText %></button>',
                header: ''
            }
        };

    return {
        initialize: function() {
            sandbox = this.sandbox;

            if (!!this.options.templateType && this.options.templateType.toLowerCase() === 'okdialog') {
                this.options = this.sandbox.util.extend(true, {}, defaultsOk, this.options);
            } else {
                this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            }

            this.$element = $('<div class="husky-dialog hidden fade"/>');
            $(this.options.el).append(this.$element);

            this.init();
        },

        init: function() {
            sandbox.logger.log('initialize', this);

            this.prepare();

            this.bindDOMEvents();
            this.bindCustomEvents();

            this.show();
        },

        // prepares the dialog structure
        prepare: function() {
            this.$header = $('<div class="husky-dialog-header align-right"/>');
            this.$content = $('<div class="husky-dialog-body" />');
            this.$footer = $('<div class="husky-dialog-footer" />');

            this.$element.append(this.$header);
            this.$element.append(this.$content);
            this.$element.append(this.$footer);

            var width = this.options.width,
                marginLeft = parseInt(this.options.width, 10) / 2;

            this.$element.css({
                'width': width,
                'margin-left': '-' + marginLeft + 'px'
            });

        },

        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.$element.off();

            this.$element.on('click', '.close', this.hide.bind(this));
            this.$element.on('click', '#dialog-button-cancel', this.cancel.bind(this));
            this.$element.on('click', '#dialog-button-submit', this.submit.bind(this));
        },


        // listen for private events
        bindCustomEvents: function() {

            // listen for public events
            sandbox.on('husky.dialog.hide', this.hide.bind(this));
        },

        // Shows the dialog and compiles the different dialog template parts
        show: function() {
            this.data = this.options.data;
            this.template = this.options.template;

            this.$header.append(this.sandbox.template.parse(this.template.header, this.data.header));
            this.$content.append(this.sandbox.template.parse(this.template.content, this.data.content));
            this.$footer.append(this.sandbox.template.parse(this.template.footer, this.data.footer));

            this.$element.show();

            if (this.options.backdrop) {
                var $backdrop = $('<div id="husky-dialog-backdrop" class="husky-dialog-backdrop fade in"></div>');
                $('body').append($backdrop);

                $backdrop.click(function() {
                    if (this.options.backdropClick && this.options.backdropClick === true) {
                        this.trigger('dialog:backdrop:click', null);
                        this.hide();
                    }
                }.bind(this));
            }
        },

        // Hides the dialog and empties the contents of the different template parts
        hide: function() {

            this.$element.hide();

            if (this.options.backdrop) {
                $('#husky-dialog-backdrop ').remove();
            }

            this.template = null;
            this.data = null;
            this.$header.empty();
            this.$content.empty();
            this.$footer.empty();
        },

        // Handles the click event of the cancel button
        cancel: function() {
            if (!!this.data.callback.cancel && typeof this.data.callback.cancel === 'function') {
                this.data.callback.cancel();
            } else {
                /**
                 * @deprecated use callback functions
                 */
                sandbox.emit('husky.dialog.cancel');
            }
        },

        submit: function() {
            if (!!this.data.callback.submit && typeof this.data.callback.submit === 'function') {
                this.data.callback.submit();
            } else {
                /**
                 * @deprecated use callback functions
                 */
                sandbox.emit('husky.dialog.submit');
            }
        }
    };
});

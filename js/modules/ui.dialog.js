/*****************************************************************************
 *
 *  Husky.Ui.Dialog
 *
 *  Shows a dialog and displays the given data and template.
 *  The show function accepts different template parts (dialog header, content,
 *  footer) and data as parameters
 *
 *
 *****************************************************************************/

(function($, window, document, undefined) {

    'use strict';

    var moduleName = 'Husky.Ui.Dialog';
    var $backdrop;

    Husky.Ui.Dialog = function(element, options) {

        this.name = moduleName;
        this.options = options;
        this.configs = {};

        this.$element = $('<div class="husky-dialog hidden fade"/>');
        $(element).append(this.$element);

        this.init();
    };

    $.extend(Husky.Ui.Dialog.prototype, Husky.Events, {

        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        init: function() {

            Husky.DEBUG && console.log(this.name, 'init');

            this.prepare();

            this.bindDOMEvents();
            this.bindCustomEvents();
        },

        // prepares the dialog structure
        prepare: function() {

            this.$header = $('<div class="husky-dialog-header align-right"/>');
            this.$content = $('<div class="husky-dialog-body" />');
            this.$footer = $('<div class="husky-dialog-footer" />');

            this.$element.append(this.$header);
            this.$element.append(this.$content);
            this.$element.append(this.$footer);

            var width = this.options.width;
            var marginLeft = parseInt(this.options.width) / 2;

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
        },


        // listen for private events
        bindCustomEvents: function() {

            this.vent.off();

            // listen for public events
            this.on('dialog:show', this.show.bind(this));
            this.on('dialog:hide', this.hide.bind(this));

        },

        // Shows the dialog and compiles the different dialog template parts 
        show: function(params) {
            params = params || {};

            var optionslocal;
            if (params.templateType && params.templateType.toLowerCase() === "okdialog") {
                optionslocal = $.extend(true, {}, $.fn.huskyDialog.okDialog, params);
            } else {
                optionslocal = $.extend(true, {}, $.fn.huskyDialog.defaults, params);
            }

            this.data       = optionslocal.data;
            this.template   = optionslocal.template;


            this.$header.append(_.template(this.template.header, this.data.header));
            this.$content.append(_.template(this.template.content, this.data.content));
            this.$footer.append(_.template(this.template.footer, this.data.footer));

            this.$element.show();

            if (this.options.backdrop) {
                $backdrop = $('<div id="husky-dialog-backdrop" class="husky-dialog-backdrop fade in"></div>');
                $('body').append($backdrop);

                $backdrop.click(function(){
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
        }

    });

    $.fn.huskyDialog = function(options) {
        var $element = $(this);

        options = $.extend({}, $.fn.huskyDialog.defaults, typeof options == 'object' && options);

        // return if this plugin has a module instance
        if (!!$element.data(moduleName)) {
            return this;
        }

        // store the module instance into the jQuery data property
        $element.data(moduleName, new Husky.Ui.Dialog(this, options));

        return this;
    };

    $.fn.huskyDialog.defaults = {
        data: {
            footer: {
                buttonCancelText: "Cancel",
                buttonSubmitText: "Ok"
            }
        },
        backdrop: true,
        backdropClick: false, // if true, click on backdrop is going to hide dialogbox
        width: '550px',
        template: {
            content: '<h3><%= title %></h3><p><%= content %></p>',
            footer: '<button class="btn btn-gray dialogButtonCancel"><%= buttonCancelText %></button><button class="btn btn-black dialogButtonSubmit"><%= buttonSubmitText %></button>',
            header: ''
        }
    };

    $.fn.huskyDialog.okDialog = {
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
            footer: '<button class="btn btn-black dialogButtonCancel"><%= buttonCancelText %></button>',
            header: ''
        }
    };

})(Husky.$, this, this.document);

/*****************************************************************************
 *
 *  Husky.Ui.Dialog
 *  Shows a dialog and displays the given data and template.
 *
 *****************************************************************************/

// TODO verschiedene größen der box?


(function($, window, document, undefined) {

    'use strict';

    var moduleName = 'Husky.Ui.Dialog';

    Husky.Ui.Dialog = function(element, options) {
        
        this.name = moduleName;
        this.options = options;
        this.configs = {};

        Husky.DEBUG && console.log(this.name, 'created instance');

        this.init();
        $(element).append(this.$element); 
    };

    $.extend(Husky.Ui.Dialog.prototype, Husky.Events, {

        // private event dispatcher
        vent: (function() {
            return $.extend({}, Husky.Events);
        })(),

        init: function() {

            Husky.DEBUG && console.log(this.name, 'init');

            // ------------------------------------------------------------
            // initialization
            // ------------------------------------------------------------
            this.render();


            // bind dom elements
            this.bindDOMEvents();
            this.bindCustomEvents();
        },

        render: function(){


            this.$header = ('<div class="husky-dialog-header align-right">'+
                                '<button type="button" class="close">×</button>'+
                            '</div>');
            this.$content = ('<div class="husky-dialog-body">'+
                                '<h3>Modal header</h3>'+
                                '<p>One fine body…</p>'+
                              '</div>');
            this.$footer = ('<div class="husky-dialog-footer">'+
                                '<button class="btn btn-black">Close</button>'+
                                '<button class="btn btn-black">Save changes</button>'+
                              '</div>');
            this.$element = $('<div class="husky-dialog hidden fade"/>');
            
            this.$element.append(this.$header.concat(this.$content.concat(this.$footer)));

        },

        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.$element.off();

            // ------------------------------------------------------------
            // DOM events
            // ------------------------------------------------------------
            this.$element.on('click', '.close', this.hide.bind(this));


        },

        bindCustomEvents: function() {
            // listen for private events
            this.vent.off();

            // listen for public events
            console.log("adfasdf");
            this.on('dialog:show',this.show.bind(this));
            
        },

        show: function(params) {
            this.$element.show();
            this.template = params.template;
            this.data = params.data;

            if(this.options.backdrop) {
                $('body').append('<div id="husky-dialog-backdrop" class="husky-dialog-backdrop fade in"></div>');
            }            
        },

        hide: function(params) {

            this.$element.hide();
            this.template = "";
            this.data = null;
            
            if(this.options.backdrop) {
                $('#husky-dialog-backdrop ').remove();
            }            
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
        data: null,
        template: '', 
        backdrop: true
    };

})(Husky.$, this, this.document);

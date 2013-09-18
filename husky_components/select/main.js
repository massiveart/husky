/*****************************************************************************
 *
 *  Select
 *      - url: url to fetch data from
 *      - data: array of objects
 *      - valueName: name of the attribute used for display
 *      - selected: object with an id attribute e.g. {id : 1}
 *      - defaultItem: object with an id attribute e.g. {id : 1}
 *
 *  Provided Events
 *      - select.item.changed - raised when the selected element changed
 *
 *
 *****************************************************************************/

define(function() {


    var defaults =  {
        url: '',
        data: [],
        valueName: 'name',
        selected: null,
        defaultItem: { id: 1 },
        instanceName: 'undefined'
    };

    return {

        view: true,

        initialize: function() {
            this.sandbox.logger.log('initialized select');

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);
            this.configs = {};

            this.$originalElement = this.sandbox.dom.$(this.options.el);
            // TODO class via options
            this.$select = $('<select class="select-value form-element"/>');
            this.$element = this.sandbox.dom.$('<div class="husky-select"/>');

            this.$element.append(this.$select);
            this.$originalElement.append(this.$element);
           
            this.prepareData();
            this.bindDOMEvents();
        },
        
        // bind dom elements
        bindDOMEvents: function() {

            // turn off all events
            this.$element.off();

            this.$select.on('change', function() {
                var id= this.$select.val();
               this.sandbox.logger.log('changed: '+id);
                this.sandbox.emit('select.'+this.options.instanceName+'.item.changed', id);
            }.bind(this));

        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                this.generateOptions(this.options.data);
            } else {
                this.loadData();
            }
        },

        // load data with ajax
        loadData: function() {
            this.sandbox.logger.log('load: ' + this.options.url);

            this.sandbox.util.ajax({
                url: this.options.url,
                success: function(response) {
                    this.sandbox.logger.log('load', 'success');

                    if (response.total > 0 && response.items.length == response.total) {
                        this.options.data = response.items;
                    } else {
                        this.options.data = [];
                    }
                    this.generateOptions(this.options.data);
                }.bind(this),
                error: function() {
                    this.sandbox.logger.log('load', 'error');

                    this.options.data = [];
                    this.generateOptions(this.options.data);
                }.bind(this)
            });

            // FIXME event will be binded later
            setTimeout(function() {
                this.sandbox.emit('select.'+this.options.instanceName+'.loadData');
            }.bind(this), 200);

        },

        generateOptions: function(items) {
            this.clearOptions();
            items.forEach(this.generateOption.bind(this));
        },

        generateOption: function(item) {
            var $option = $('<option value="' + item.id + '">' + item[this.options.valueName] + '</option>');
            if ((this.options.selected != null && this.options.selected.id == item.id) ||
                (this.options.selected == null && this.options.defaultItem.id == item.id)) {
                $option.attr("selected", true);
            }
            this.$select.append($option);
        },

        clearOptions: function() {
            this.$select.find('option').remove();
        }    

    };

});

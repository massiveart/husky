/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: dropdown
 * Options:
 *
 *
 * Provided Events:
 * husky.dropdown.<<instanceName>>.item.click   - triggered when item clicked
 * husky.dropdown.<<instanceName>>.data.load    - triggered when data loaded
 *
 * Use Events
 * husky.dropdown.<<instanceName>>.toggle       - toggles (show/hide) dropdown menu
 * husky.dropdown.<<instanceName>>.show       - show dropdown menu
 * husky.dropdown.<<instanceName>>.hide       - hide dropdown menu
 */

define([], function() {

    var sandbox,
        selectedElements,

        labelId,
        listId,
        dropdownContainerId,

        $dropdownContainer,
        $list,

        defaults = {
            url: null,     // url for lazy loading
            data: [],    // data array
            valueName: 'name', // name of text property
            excludeItems: [], // items to filter,
            instanceName: 'undefined', // instance name
            defaultLabel: 'Please choose'
        };


    return {
        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);
            selectedElements = [];


            labelId = 'husky-dropdown-multiple-select-'+this.options.instanceName+'-label';
            listId = 'husky-dropdown-multiple-select-'+this.options.instanceName+'-list';
            dropdownContainerId = 'husky-dropdown-multiple-select-'+this.options.instanceName+'-menu';

            this.render();
        },

        render: function() {

            var $originalElement = this.sandbox.dom.$(this.options.el);
            this.sandbox.dom.append($originalElement, this.template.basicStructure(this.options.defaultLabel));
            $list = this.sandbox.dom.$('#'+listId);
            $dropdownContainer = this.sandbox.dom.$('#'+dropdownContainerId);
            this.prepareData();


            // bind dom elements
            this.bindDOMEvents();
//// TODO
//            this.bindCustomEvents();
        },

        // prepares data for dropDown, if options.data not set load with ajax
        prepareData: function() {
            if (this.options.data.length > 0) {
                this.generateDropDown(this.options.data);
            } else if (!!this.options.url){
                this.loadData();
            } else {
                this.sandbox.logger.log('error: wether url nor data set');
            }
        },

        // generate dropDown with given items
        generateDropDown: function(items) {

            // remove all elements
            this.sandbox.dom.remove($list, 'li');

            if (items.length > 0) {
                this.sandbox.util.each(items, function(index,value){
                    this.sandbox.dom.append($list, this.template.menuElement(value));
                }.bind(this));
            } else {
                this.$dropDownList.append('<li>No data received</li>');
            }
        },

        // bind dom elements
        bindDOMEvents: function() {

            // toggle drop-down
            this.sandbox.dom.on('#'+ this.options.instanceName,'click', this.toggleDropDown.bind(this), '.dropdown-label');

            // click on single item
            this.sandbox.dom.on('#husky-dropdown-multiple-select-ddms-list','click', this.clickItem.bind(this), 'li');




            // click on checkbox of item

            // mouse control
//            this.$dropDownList.on('click', 'li', function(event) {
//                var $element = $(event.currentTarget);
//                var id = $element.data('id');
//                this.clickItem(id);
//            }.bind(this));


        },

//        bindCustomEvents : function() {
//            this.sandbox.on(this.getEvent('toggle'), this.triggerClick.bind(this));
//            this.sandbox.on(this.getEvent('show'), this.showDropDown.bind(this));
//            this.sandbox.on(this.getEvent('hide'), this.hideDropDown.bind(this));
//        },

        // trigger event with clicked item
        clickItem: function(event) {

            var key = this.sandbox.dom.attr(event.currentTarget, 'data-key'),
                $checkbox = this.sandbox.dom.find('input[type=checkbox]', event.currentTarget),
                index = selectedElements.indexOf(key);

            if (index > -1) {

                this.sandbox.dom.removeClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', false);
                selectedElements.splice(index, 1);
                this.sandbox.emit('husky.dropdown.multiple.deselected.item', key);

            } else {

                this.sandbox.dom.addClass($checkbox, 'is-selected');
                this.sandbox.dom.prop($checkbox, 'checked', true);
                selectedElements.push(key);
                this.sandbox.emit('husky.dropdown.multiple.selected.item', key);
            }

            this.changeLabel();

        },

        changeLabel: function() {

            if (selectedElements.length === this.options.data.length) {
                this.sandbox.dom.text('#' + labelId, 'All languages');
            } else if (selectedElements.length === 0) {
                this.sandbox.dom.text('#' + labelId, 'Please choose...');
            } else {
                var text = "";
                this.sandbox.util.each(selectedElements, function(index, value) {
                    text += ' '+value + ',';
                });
                this.sandbox.dom.text('#' + labelId, text.substring(1, text.length - 1));
            }
        },

        // load data with ajax
        loadData: function() {
            var url = this.getUrl();
            this.sandbox.logger.log(this.name, 'load: ' + url);

            sandbox.util.ajax({
                url: url,
                success: function(response) {
                   this.sandbox.logger.log(this.name, 'load', 'success');

                    if (response.total > 0 && response.items.length == response.total) {
                        this.options.data = response.items;
                    } else {
                        this.options.data = [];
                    }
                    this.generateDropDown(this.options.data);
                }.bind(this),
                error: function() {
                    this.sandbox.logger.log(this.name, 'load', 'error');

                    this.options.data = [];
                    this.generateDropDown(this.options.data);
                }.bind(this)
            });

            // FIXME event will be binded later
            setTimeout(function() {
                this.sandbox.emit(this.getEvent('data.load'));
            }.bind(this), 200);
        },





        // toggle dropDown visible
        toggleDropDown: function() {
            this.sandbox.logger.log('toggle dropdown');
            this.sandbox.dom.toggleClass($dropdownContainer, 'hidden');
        },

        // make dropDown visible
        showDropDown: function() {
            this.sandbox.logger.log(this.name, 'show dropdown');
            this.$dropDown.show();
        },

        // hide dropDown
        hideDropDown: function() {
            this.sandbox.logger.log(this.name, 'hide dropdown');
            this.$dropDown.hide();
        },

        // get url for pattern
        getUrl: function() {
            return this.options.url;
        },

        template: {

            basicStructure: function(defaultLabel){
                return [
                    '<div class="husky-dropdown-multiple-select">',
                    '    <div class="grid-row dropdown-label dropdown-open">',
                    '       <div class="grid-col-11 checkbox">',
                    '           <span id="',labelId,'">',defaultLabel,'</span>',
                    '       </div>',
                    '       <div class="grid-col-1 align-right">',
                    '           <span class="dropdown-toggle inline-block"></span>',
                    '       </div>',
                    '   </div>',
                    '   <div class="grid-row dropdown-list dropdown-align-right hidden" id="',dropdownContainerId,'">',
                    '       <ul id="',listId,'"></ul>',
                    '   </div>',
                    '</div>'
                ].join('');
            },
            menuElement: function(value){
                return [
                    '<li data-key="',value,'">',
                    '    <div class="grid-row">',
                    '        <div class="grid-col-1">',
                    '            <input type="checkbox" class="form-element custom-checkbox"/>',
                    '            <span class="custom-checkbox-icon"></span>',
                    '        </div>',
                    '        <div class="grid-col-11 m-top-10">',value,'</div>',
                    '    </div>',
                    '</li>'
                ].join('');
            }

        }

    };

});

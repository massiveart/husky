define(function() {

    'use strict';

    var templates = {
        skeleton: [
                '<nav class="navigation">',
                '   <div class="navigation-content">',
                '       <div class="navigation-header">',
                '           <div class="navigation-header-image">',
                '               <img alt="#" src="<%= navigation.icon %>"/>',
                '           </div>',
                '       <div class="navigation-header-title"><%= navigation.title %></div>',
                '   </div>',
                '   <div id="navigation-search" class="navigation-search"></div>',
                '   <ul id="navigation-item-container" class="navigation-item-container"></ul>',
                '</nav>'].join(''),
        mainItem: [
                '<li class="js-navigation-items navigation-items">',
                '   <div class="navigation-items-toggle">',
                '       <a class="js-navigation-item navigation-item" href="#">',
                '           <span class="<%= icon %> navigation-item-icon"></span>',
                '           <span class="navigation-item-title"><%= title %></span>',
                '       </a>',
                '       <a class="icon-shevron-right navigation-toggle-icon" href="#"></a>',
                '   </div>',
                '</li>'].join(''),
        subToggleItem: [
                '<li class="asdfasdf">',
                '   <div class="js-navigation-items navigation-subitems">',
                '       <div class="navigation-subitems-toggle">',
                '           <a class="js-navigation-item navigation-item" href="#"><%= title %></a>',
                '           <a class="icon-shevron-right navigation-toggle-icon" href="#"></a>',
                '       </div>',
                '   </div>',
                '</li>'].join('')

    };



    return {
        initialize: function() {
            this.bindDOMEvents();
            this.sandbox.logger.log('Initialized Navigation');


            this.render();
        },


        render : function() {

            // add container class to current div
            this.sandbox.dom.addClass(this.$el,'navigation-container');

            // render skeleton
            this.sandbox.dom.html(this.$el, this.sandbox.template.parse(templates.skeleton,{
                navigation: {
                    title: 'title',
                    icon: '../../img/tmp/husky.png'
                }
            }));

            // start search component
            this.sandbox.start([ {name:'search@husky', options: {el:'#navigation-search'}}]);


            // load Data
            if (!!this.options.url) {
                this.sandbox.util.load(this.options.url)
                    .then(this.renderNavigationItems.bind(this));
            }
        },

        // renders main navigation elements
        renderNavigationItems : function(data) {
            var elem;
            if(data.hasSub) {
                this.sandbox.util.foreach(data.sub.items, function(item) {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.mainItem, {title: item.title, icon:'icon-'+item.icon}));
                    this.sandbox.dom.append('#navigation-item-container', elem);
                    if (item.hasSub) {
                        this.renderSubNavigationItems(item, this.sandbox.dom.find('div',elem));
                    }
                }.bind(this));
            }
        },

        // renders sub-navigation elements
        renderSubNavigationItems: function(data, after) {
            var elem,
                list = this.sandbox.dom.createElement('<ul />');

            this.sandbox.util.foreach(data.sub.items, function(item) {
                if (item.hasSub) {
                    elem = this.sandbox.dom.createElement(this.sandbox.template.parse(templates.subToggleItem, {title: item.title}));
                    this.renderSubNavigationItems(item, this.sandbox.dom.find('div',elem));
                } else {
                    elem = this.sandbox.dom.createElement('<li class="js-navigation-sub-item"><a href="#">'+item.title+'</a></li>');
                }
                this.sandbox.dom.append(list, elem);
            }.bind(this));

            this.sandbox.dom.after(after, list);
        },


        /**
         * Interaction
         */

        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.toggleItems.bind(this),'.js-navigation-item');
            this.sandbox.dom.on(this.$el, 'click', this.selectSubItem.bind(this),'.js-navigation-sub-item');
        },

        /**
         * Toggles menu element with submenu
         * Raises navigation.toggle
         * @param event
         */
        toggleItems: function(event) {

            event.preventDefault();

            var $items = this.sandbox.dom.parents(event.currentTarget, '.js-navigation-items')[0];

            if (this.sandbox.dom.hasClass($items, 'is-expanded')) {
                this.sandbox.dom.removeClass($items, 'is-expanded');
            } else {
                this.sandbox.dom.addClass($items, 'is-expanded');
            }
        },

        /**
         * Selects menu element without submenu
         * Raises navigation.select
         * @param event
         */
        selectSubItem: function(event) {

            event.preventDefault();

            var $subItem = this.sandbox.dom.createElement(event.currentTarget),
                $items = this.sandbox.dom.parents(event.currentTarget, '.js-navigation-items');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-selected', this.$el),'is-selected');
            this.sandbox.dom.addClass($subItem, 'is-selected');

            this.sandbox.dom.removeClass(this.sandbox.dom.find('.is-active', this.$el),'is-active');
            this.sandbox.dom.addClass($items, 'is-active');

        }
    };

});

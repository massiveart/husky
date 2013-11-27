/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: search
 * Options:
 *      instanceName: instance name of this component
 *
 * Provided Events:
 * husky.search.<<instanceName>> , string  - triggered when search is performed - returns the searchstring
 *
 * Use Events:
 *
 */

define([], function() {

    'use strict';

    var templates = {
            skeleton: function() {
                return [
                    '<a class="navigation-search-icon" href="#"></a>',
                    '<input id="navigation-search-input" type="text" class="form-element input-round navigation-search-input" placeholder="Suche..."/>'
                ].join('');
            }
        },
        defaults = {
            instanceName: null
        };





    return {

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();

            this.bindDOMEvents();

        },

        render: function() {
            this.sandbox.dom.html(this.$el,this.sandbox.template.parse(templates.skeleton()));
        },

        // bind dom elements
        bindDOMEvents: function() {
            this.sandbox.dom.on('.navigation-search-icon', 'click', this.submitSearch.bind(this));
            this.sandbox.dom.on('#navigation-search', 'keyup', this.checkEnterPressed.bind(this));
        },

        bindCustomEvents: function() {

        },

        checkEnterPressed: function(event) {
            if(event.keyCode === 13)
            {
                this.submitSearch();
            }
        },

        submitSearch: function() {

            // get search value
            var searchString = this.sandbox.dom.val('#navigation-search-input');

            // check if searchstring is emtpy
            if (searchString === '') {
                return;
            }

            // emit event
            this.emitSearchEvent(searchString);
        },


        /**
         * function emits event based on options.name
         * @param searchString
         */
        emitSearchEvent: function(searchString) {

            var event = 'husky.search';
            if (this.options.instanceName) {
                event += '.'+this.options.instanceName;
            }

            // trigger sandbox event
            this.sandbox.emit(event, searchString);
        }

    };

});

/**
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
 *      placeholderText: text to show in search field
 *      appearance [gray, white, small]: look and feel of search
 *
 * Provided Events:
 *
 *
 * Triggers Events:
 *  husky.search.<<instanceName>> , string  - triggered when search is performed - returns the searchstring
 *  husky.search.<<instanceName>>.initialized - triggered when search is initialized
 *
 */

define([], function() {

    'use strict';

    var templates = {
            skeleton: [
                    '<a class="search-icon" href="#"></a>',
                    '<input id="search-input" type="text" class="form-element input-round search-input" placeholder="<%= placeholderText %>"/>'
                ].join('')
        },
        defaults = {
            instanceName: null,
            placeholderText: 'Search...',
            appearance: 'gray'
        };

    return {

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();

            this.bindDOMEvents();

            var instanceName = this.options.instanceName ? this.options.instanceName+'.' : '';
            this.sandbox.emit('husky.search.'+instanceName+'initialized');

        },

        render: function() {
            this.sandbox.dom.addClass(this.options.el, 'search-container');
            this.sandbox.dom.addClass(this.options.el, this.options.appearance);
            this.sandbox.dom.html(this.$el,this.sandbox.template.parse(templates.skeleton, {placeholderText: this.sandbox.translate(this.options.placeholderText)}));
        },

        // bind dom elements
        bindDOMEvents: function() {
            this.sandbox.dom.on(this.options.el, 'click', this.submitSearch.bind(this), '.search-icon');
            this.sandbox.dom.on(this.options.el, 'keyup', this.checkEnterPressed.bind(this), '#search-input');
        },

        bindCustomEvents: function() {

        },

        checkEnterPressed: function(event) {
            if (event.keyCode === 13) {
                this.submitSearch();
            }
        },

        submitSearch: function() {

            // get search value

            var searchString = this.sandbox.dom.val(this.sandbox.dom.find('#search-input', this.options.el));

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
                event += '.' + this.options.instanceName;
            }

            // trigger sandbox event
            this.sandbox.emit(event, searchString);
        }

    };

});

/**
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */


/**
 * @class Search
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.instanceName=null] allows to createa custom events (in case of multiple tabs on one page)
 * @param {String} [options.placeholderText=Search...] the text to be shown as placeholder
 * @param {String} [options.appearance=gray] appearance can be 'gray', 'white' or 'small'
 */
define([], function() {

    'use strict';

    var templates = {
            skeleton: [
                '<a class="search-icon" href="#"></a>',
                '<a class="icon-circle-remove remove-icon" href="#"></a>',
                '<input id="search-input" type="text" class="form-element input-round search-input" placeholder="<%= placeholderText %>"/>'
            ].join('')
        },
        defaults = {
            instanceName: null,
            placeholderText: 'public.search',
            appearance: 'gray'
        },


        /**
         * triggered when user clicked on search icon or pressed enter
         * @event husky.search[.INSTANCE_NAME]
         * @param {String} the string thats been looked for
         */
            SEARCH = function() {
            return this.getEventName();
        },

        /**
         * triggered when user clicks on reset button of search
         * @event husky.search[.INSTANCE_NAME].reset
         */
            RESET = function() {
            return this.getEventName('reset');
        },

        /**
         * triggered when user clicks on search icon or pressed enter
         * @event husky.search[.INSTANCE_NAME].initialized
         */
            INITIALIZED = function() {
            return this.getEventName('initialized');
        };

    return {

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();

            this.bindDOMEvents();

            this.sandbox.emit(INITIALIZED.call(this));

        },

        render: function() {
            this.sandbox.dom.addClass(this.$el, 'search-container');
            this.sandbox.dom.addClass(this.$el, this.options.appearance);
            this.sandbox.dom.html(this.$el, this.sandbox.template.parse(templates.skeleton, {placeholderText: this.sandbox.translate(this.options.placeholderText)}));

        },

        // bind dom elements
        bindDOMEvents: function() {
            this.sandbox.dom.on(this.$el, 'click', this.selectInput.bind(this), 'input');
            this.sandbox.dom.on(this.$el, 'click', this.submitSearch.bind(this), '.search-icon');
            this.sandbox.dom.on(this.$el, 'click', this.removeSearch.bind(this), '.remove-icon');
            this.sandbox.dom.on(this.$el, 'keyup onchange', this.checkKeyPressed.bind(this), '#search-input');
        },

        bindCustomEvents: function() {

        },

        checkKeyPressed: function(event) {

            var $removeIcon;

            // when search contains text show remove icon
            $removeIcon = this.sandbox.dom.prev(event.currentTarget, '.remove-icon');
            if (this.sandbox.dom.val(event.currentTarget).length > 0) {
                this.sandbox.dom.show($removeIcon);
            } else {
                this.sandbox.dom.hide($removeIcon);
            }

            // enter pressed
            if (event.keyCode === 13) {
                this.submitSearch();
            }
        },

        submitSearch: function(event) {
            event.preventDefault();

            // get search value

            var searchString = this.sandbox.dom.val(this.sandbox.dom.find('#search-input', this.$el));

            // check if searchstring is emtpy
            if (searchString === '') {
                return;
            }

            // emit event
            this.sandbox.emit(SEARCH.call(this), searchString);
        },

        removeSearch: function(event) {
            if (!!event) {
                event.preventDefault();
            }
            var $input;
            $input = this.sandbox.dom.next(event.currentTarget, 'input');

            this.sandbox.dom.hide(event.target);
            this.sandbox.dom.val($input, '');
            this.sandbox.emit(RESET.call(this), '');
        },

        selectInput: function(event) {
            this.sandbox.dom.trigger(event.currentTarget, 'select');
        },


        /**
         * function emits event based on options.name
         * @param postfix
         */
        getEventName: function(postfix) {
            var event = 'husky.search';

            if (!!postfix) {
                postfix = '.' + postfix;
            } else {
                postfix = '';
            }

            if (this.options.instanceName) {
                event += '.' + this.options.instanceName;
            }

            return event + postfix;
        }

    };

});

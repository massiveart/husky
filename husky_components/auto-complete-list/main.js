/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/auto-complete-list
 */

/**
 * @class AutoCompleteList
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.instanceName] name of the component instance
 * @param {Array} [options.items] preloaded items
 * @param {String} [options.itemsUrl] url to load items
 * @param {String} [options.itemsKey] Key for AJAX response
 * @param {Array} [options.suggestions] suggestions for suggestions box
 * @param {String} [options.suggestionsHeadline] Headline for suggestions bxo
 * @param {String} [options.suggestionsUrl] url to load suggestions
 * @param {String} [options.suggestionsKey] Key for AJAX response
 * @param {String} [options.inputSelector] CSS-selector for input wrapper div
 * @param {String} [options.label] label (headline)
 * @param {Boolean} [options.autocomplete] enable/disable autocomplete
 * @param {Array} [options.localData] local data passed to the autocomplete component
 * @param {String} [options.prefetchUrl] url to prefetch data for the autocomplete component
 * @param {String} [options.remoteUrl] url to fetch data  for the autocomplete component from on input
 * @param {Object} [options.autocompleteOptions] options to pass to the autocomplete component
 * @param {String} [options.autocompleteParameter] name of parameter which contains the user's input (for auto-complete)
 * @param {Integer} [options.maxListItems] maximum amount of list items accepted (0 = no limit)
 * @param {Boolean} [options.CapitalizeFirstLetter] if true the first letter of each item gets capitalized
 * @param {String} [options.listItemClass] CSS-class for list items
 * @param {String} [options.suggestionDeactivatedClass] CSS-class for suggestion-element if suggestion is already used
 * @param {String} [options.AjaxPush] url to which added list items get send via ajax POST
 * @param {Boolean} [options.AjaxPushAllItems] if true all list items get sent if an item is added
 * @param {Object} [options.AjaxPushParameters] additional parameter payload to push with each AjaxPush
 * @param {String} [options.togglerSelector] CSS-selector for suggestion-toggler
 * @param {String} [options.arrowDownClass] CSS-class for arrow down icon
 * @param {String} [options.arrowUpClass] CSS-class for arrow up icon
 * @param {Integer} [options.slideDuration] ms - duration for sliding suggestinos up/down
 * @param {String} [options.elementTagDataName] attribute name to store list of tags on element
 * @param {String} [options.autoCompleteIcon] Icon Class-suffix for autocomplete-suggestion-icon
 */
define([], function() {

        'use strict';

        /**
         * Default values for options
         */
        var defaults = {
                instanceName: 'undefined',
                items: [],
                itemsUrl: '',
                itemsKey: '_embedded',
                suggestions: [],
                suggestionsHeadline: '',
                suggestionsUrl: '',
                suggestionsKey: 'suggestions',
                label: '',
                inputSelector: '.husky-auto-complete',
                autocomplete: true,
                localData: [],
                prefetchUrl: '',
                remoteUrl: '',
                autocompleteOptions: {},
                getParameter: 'query',
                maxListItems: 0,
                CapitalizeFirstLetter: false,
                listItemClass: 'auto-complete-list-selection',
                suggestionDeactivatedClass: 'deactivated',
                AjaxPush: '',
                AjaxPushAllItems: false,
                AjaxPushParameters: null,
                togglerSelector: '.toggler',
                arrowDownClass: 'arrow-down',
                arrowUpClass: 'arrow-up',
                slideDuration: 500,
                elementTagDataName: 'tags',
                autoCompleteIcon: 'tag'
            },

            templates = {
                main: [
                    '<div class="auto-complete-list-container">',
                    '    <label>',
                    '        <%= label %>',
                    '            <div class="auto-complete-list">',
                    '                <div class="husky-auto-complete"></div>',
                    '                <div class="toggler"><span></span></div>',
                    '            </div>',
                    '        </label>',
                    '    </div>'
                ].join(''),
                suggestion: [
                    '<div class="auto-complete-list-suggestions">',
                    '    <h5><%= headline %></h5>',
                    '    <ul>',
                    '    </ul>',
                    '</div>'
                ].join('')
            },

            /** Position values for toggling suggestions */
                togglerPosUp = 'up',
            togglerPosDown = 'down',

            eventNamespace = 'husky.auto-complete-list.',

            /**
             * raised after initialization
             * @event husky.auto-complete-list.initialized
             */
                INITIALIZED = function() {
                return createEventName.call(this, 'initialized');
            },

            /**
             * raised after AJAX request for loading items is sent
             * @event husky.auto-complete-list.items-request
             */
                ITEM_REQUEST = function() {
                return createEventName.call(this, 'item-request');
            },

            /**
             * raised after AJAX request for loading suggestions is sent
             * @event husky.auto-complete-list.sug-request
             */
                SUGGESTION_REQUEST = function() {
                return createEventName.call(this, 'sug-request');
            },

            /**
             * raised after a suggestion element is clicked and added to the list
             * @event husky.auto-complete-list.sug-added
             * @param {object} suggestion - the suggestion element with id, name, DOM-object
             */
                SUGGESTION_ADDED = function() {
                return createEventName.call(this, 'sug-added');
            },

            /**
             * raised after an item is deleted
             * @event husky.auto-complete-list.item-deleted
             */
                ITEM_DELETED = function() {
                return createEventName.call(this, 'item-deleted');
            },

            /**
             * raised after an item is added
             * @event husky.auto-complete-list.item-added
             * @param {string} item value
             */
                ITEM_ADDED = function() {
                return createEventName.call(this, 'item-added');
            },

            /**
             * raised when the suggestion container is closed
             * @event husky.auto-complete-list.sug-closed
             */
                SUGGESTIONS_CLOSED = function() {
                return createEventName.call(this, 'sug-closed');
            },

            /**
             * raised when the suggestion container is opened
             * @event husky.auto-complete-list.sug-opened
             */
                SUGGESTIONS_OPENED = function() {
                return createEventName.call(this, 'sug-opened');
            },

            /** returns normalized event names */
                createEventName = function(postFix) {
                return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
            };


        return {

            initialize: function() {
                this.sandbox.logger.log('initialize', this);

                this.setVars();

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.renderMain();
                this.initInputCont();
                this.initSuggestions();
                this.initItems();

                this.sandbox.emit(INITIALIZED.call(this));
            },

            /**
             * object properties get initialized
             */
            setVars: function() {
                this.suggestions = [];
                this.$suggestions = null;
                this.$input = null;
                this.tagApi = null;
                this.toggler = null;
                this.$inputCont = null;
            },

            /**
             * the main-template gets rendered and displayed
             */
            renderMain: function() {
                this.sandbox.dom.html(this.$el,
                    _.template(templates.main)({
                        label: this.options.label
                    })
                );
            },

            /**
             * the container for the input field gets assigned to a object property
             * @returns {boolean}
             */
            initInputCont: function() {
                this.$inputCont = this.sandbox.dom.find(this.options.inputSelector, this.$el);
                if (!this.$inputCont.length) {
                    this.sandbox.logger.log('Initializing input-container failed.');
                    return false;
                }
                return true;
            },

            /**
             * Autocomplete component and/or tagmanager plugin get started
             */
            startPlugins: function() {
                if (this.options.autocomplete === true) {
                    this.bindStartTmEvent();
                    this.startAutocomplete();
                } else {
                    //if autocomplete component is disabled, input field needs to be inserted
                    this.initInput();
                    this.appendInput();

                    this.startTagmanager();
                    this.bindEvents();
                }
            },

            /**
             * Input DOM-object gets assigned to an object property
             */
            initInput: function() {
                this.$input = this.sandbox.dom.createElement('<input type="text"/>');
            },

            /**
             * The input field gets inserted into the input-container
             */
            appendInput: function() {
                if (!!this.$input.length) {
                    this.sandbox.dom.append(this.$inputCont, this.$input);
                }
            },

            /**
             * husky-auto-complete component gets started
             */
            startAutocomplete: function() {
                this.sandbox.start([
                    {
                        name: 'auto-complete@husky',
                        options: this.sandbox.util.extend(
                            {
                                el: this.$inputCont,
                                emptyOnBlur: true,
                                instanceName: this.options.instanceName,
                                localData: this.options.localData,
                                prefetchUrl: this.options.prefetchUrl,
                                remoteUrl: this.options.remoteUrl,
                                getParameter: this.options.getParameter,
                                suggestionImg: this.options.autoCompleteIcon
                            },
                            this.options.autocompleteOptions
                        )
                    }
                ]);
            },

            /**
             * Tagmanager plugin gets started
             */
            startTagmanager: function() {
                this.tagApi = this.sandbox.autocompleteList.init(this.$input, {
                    tagClass: this.options.listItemClass,
                    prefilled: this.options.items,
                    tagCloseIcon: '',
                    maxTags: this.options.maxListItems,
                    AjaxPush: this.options.AjaxPush,
                    AjaxPushAllTags: this.options.AjaxPushAllItems,
                    AjaxPushParameters: this.options.AjaxPushParameters,
                    CapitalizeFirstLetter: this.options.CapitalizeFirstLetter,
                    validator: function(string) {
                        this.sandbox.emit(ITEM_ADDED.call(this), string);
                        return true;
                    }.bind(this)
                });
                this.setElementDataTags();
            },

            /**
             * Binds the start of the tagmanager plugin, to the initialize event of the auto-complete component
             * (autocomplete-component needs to be running to start tagmanager)
             */
            bindStartTmEvent: function() {
                this.sandbox.on('husky.auto-complete.' + this.options.instanceName + '.initialized', function(data) {
                    this.$input = data;
                    this.startTagmanager();
                    this.bindEvents();
                }.bind(this));
            },

            /**
             * Bind several events
             */
            bindEvents: function() {
                this.sandbox.on(createEventName.call(this, 'getTags'), function(callback) {
                    if (typeof callback === 'function') {
                        callback(this.getTags());
                    } else {
                        this.sandbox.logger.log('Error: Callback is not a function');
                    }
                }.bind(this));

                this.sandbox.on(createEventName.call(this, 'set-tags'), function(tags) {
                    this.pushTags(tags);
                }.bind(this));

                this.sandbox.on(ITEM_ADDED.call(this), function(newTag) {
                    this.setElementDataTags(newTag);
                }.bind(this));

                //if an autocomplete-suggestion gets clicked on, it gets added to the list
                this.sandbox.on('husky.auto-complete.' + this.options.instanceName + '.select', function(d) {
                    this.pushTag(d.name);
                }.bind(this));

                this.sandbox.dom.on(this.$input, 'keydown', function(event) {
                    if (event.keyCode === 8 && this.sandbox.dom.val(this.$input).trim() === '') {
                        this.itemDeleteHandler();
                        this.setElementDataTags();
                    }
                }.bind(this));

                this.sandbox.dom.on(this.$el, 'click', function(event) {
                    if (this.sandbox.dom.hasClass(event.target, 'tm-tag-remove') === true) {
                        this.itemDeleteHandler();
                        this.setElementDataTags();
                    }
                }.bind(this));

                if (this.toggler !== null) {
                    this.sandbox.dom.on(this.toggler.$el, 'click', function(event) {
                        this.sandbox.dom.preventDefault(event);
                        this.changeToggler();
                        this.toggleSuggestions();
                    }.bind(this));
                }
            },

            /**
             * Binds the tags to the element
             * @param newTag {String} newly added tag
             */
            setElementDataTags: function(newTag) {
                var tags = this.sandbox.util.extend([], this.getTags());
                if (tags.indexOf(newTag) === -1 && typeof newTag !== 'undefined') {
                    tags = tags.concat([newTag]);
                }
                this.sandbox.dom.data(this.$el, this.options.elementTagDataName, tags);
            },

            /**
             * items for the list get loaded and plugins get started
             */
            initItems: function() {
                if (this.options.itemsUrl !== '') {
                    this.requestItems();
                } else {
                    //if no items need to be loaded start the plugins right ahead
                    this.startPlugins();
                }
            },

            /**
             * request the items for the list, merge them with the options and start the pluins
             */
            requestItems: function() {
                this.sandbox.util.ajax({
                    url: this.options.itemsUrl,

                    success: function(data) {
                        this.options.items = this.options.items.concat(data[this.options.itemsKey]);
                        this.startPlugins();
                    }.bind(this),

                    error: function(error) {
                        this.sandbox.logger.log(error);
                    }.bind(this)
                });
                this.sandbox.emit(ITEM_REQUEST.call(this));
            },

            /**
             * Load the suggestions, render them, initialize toggler
             */
            initSuggestions: function() {
                if (this.options.suggestionsUrl !== '') {
                    this.requestSuggestions();
                } else {
                    //if no suggestions need to be loaded, render them right ahead
                    this.loadSuggestions();
                    this.renderSuggestions();
                    this.initToggler();
                }
            },

            /**
             * load suggestions from url, render them, initialize toggler
             */
            requestSuggestions: function() {
                this.sandbox.util.ajax({
                    url: this.options.suggestionsUrl,

                    success: function(data) {
                        this.options.suggestions = this.options.suggestions.concat(data[this.options.suggestionsKey]);
                        this.loadSuggestions();
                        this.renderSuggestions();
                        this.initToggler();
                    }.bind(this),

                    error: function(error) {
                        this.sandbox.logger.log(error);
                    }.bind(this)
                });
                this.sandbox.emit(SUGGESTION_REQUEST.call(this));
            },

            /**
             * Converts the suggestion-strings to objects with name and DOM-object
             */
            loadSuggestions: function() {
                if (!!this.options.suggestions.length) {
                    for (var i = -1, length = this.options.suggestions.length; ++i < length;) {
                        this.suggestions[i] = {
                            name: this.options.suggestions[i],
                            $el: this.sandbox.dom.createElement('<li/>')
                        };
                        this.sandbox.dom.html(this.suggestions[i].$el, this.suggestions[i].name);
                    }
                }
            },

            /**
             * Renders the suggestion container and appends the suggestion elements
             */
            renderSuggestions: function() {
                if (!!this.options.suggestions.length) {
                    var box, list, i = -1, length = this.suggestions.length;
                    box = this.sandbox.dom.parseHTML(
                        _.template(templates.suggestion)({
                            headline: this.options.suggestionsHeadline
                        })
                    );
                    list = this.sandbox.dom.children(box, 'ul');
                    for (; ++i < length;) {
                        this.sandbox.dom.append(list, this.suggestions[i].$el);
                        this.bindSuggestionEvents(this.suggestions[i]);
                    }
                    this.$suggestions = box;
                    this.sandbox.dom.append(this.$el, this.$suggestions);
                }
            },

            /**
             * Initializes the toggler object with position and DOM-element
             */
            initToggler: function() {
                if (!!this.options.suggestions.length) {
                    this.toggler = {
                        $el: this.sandbox.dom.find(this.options.togglerSelector, this.$el),
                        pos: togglerPosUp
                    };
                    this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowUpClass);
                }
            },

            /**
             * toggles the Toggler-icon
             */
            changeToggler: function() {
                if (this.toggler.pos === togglerPosDown) {
                    this.togglerUp();
                } else {
                    this.togglerDown();
                }
            },

            /**
             * toggles the suggestions-container
             */
            toggleSuggestions: function() {
                if (this.toggler.pos === togglerPosDown) {
                    this.hideSuggestions();
                } else {
                    this.showSuggestions();
                }
            },

            /**
             * hides the suggestions-container
             */
            hideSuggestions: function() {
                this.sandbox.dom.slideUp(this.$suggestions, this.options.slideDuration);
                this.sandbox.emit(SUGGESTIONS_CLOSED.call(this));
            },

            /**
             * shows the suggestions-container
             */
            showSuggestions: function() {
                this.sandbox.dom.slideDown(this.$suggestions, this.options.slideDuration);
                this.sandbox.emit(SUGGESTIONS_OPENED.call(this));
            },

            /**
             * Ensures the toggler is pointing down (sets CSS-classes)
             */
            togglerDown: function() {
                this.sandbox.dom.removeClass(this.toggler.$el, this.options.arrowUpClass);
                this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowDownClass);
                this.toggler.pos = togglerPosDown;
            },

            /**
             * Ensures the toggler is pointing up (sets CSS-classes)
             */
            togglerUp: function() {
                this.sandbox.dom.removeClass(this.toggler.$el, this.options.arrowDownClass);
                this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowUpClass);
                this.toggler.pos = togglerPosUp;
            },

            /**
             * Adds click event -> suggestion gets added to the list
             * @param suggestion {object} with DOM-element as property
             */
            bindSuggestionEvents: function(suggestion) {
                this.sandbox.dom.on(suggestion.$el, 'click', function() {
                    if (!this.sandbox.dom.hasClass(suggestion, this.options.suggestionDeactivatedClass)) {
                        this.pushTag(suggestion.name);
                        this.deactivateSuggestion(suggestion);
                        this.sandbox.emit(SUGGESTION_ADDED.call(this), suggestion);
                    }
                }.bind(this));
            },

            /**
             * gets called if an item is deleted from the list
             */
            itemDeleteHandler: function() {
                this.refreshSuggestions();
                this.sandbox.emit(ITEM_DELETED.call(this));
            },

            /**
             * Deactivated-CSS-class gets added to suggestion
             * @param suggestion {object} with DOM-element as property
             */
            deactivateSuggestion: function(suggestion) {
                this.sandbox.dom.addClass(suggestion.$el, this.options.suggestionDeactivatedClass);
            },

            /**
             * Activated-CSS-class gets added to suggestion
             * @param suggestion {object} with DOM-element as property
             */
            activateSuggestion: function(suggestion) {
                this.sandbox.dom.removeClass(suggestion.$el, this.options.suggestionDeactivatedClass);
            },

            /**
             * Checks if suggestions are used in list and activates them if not
             */
            refreshSuggestions: function() {
                for (var i = -1, length = this.suggestions.length; ++i < length;) {
                    if (this.sandbox.dom.hasClass(this.suggestions[i].$el, this.options.suggestionDeactivatedClass) === true) {
                        if (this.suggestionContainedInTags(this.suggestions[i]) === false) {
                            this.activateSuggestion(this.suggestions[i]);
                        }
                    }
                }
            },

            /**
             * Checks if suggestion is used in list
             * @param suggestion {object} with name as property
             * @returns {boolean}
             */
            suggestionContainedInTags: function(suggestion) {
                var tags = this.getTags(), i, length;
                for (i = -1, length = tags.length; ++i < length;) {
                    if (tags[i] === suggestion.name) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Pushes an Item to the list
             * @param value {String} string to push into the list
             * @returns {boolean}
             */
            pushTag: function(value) {
                if (this.tagApi !== null) {
                    this.tagApi.tagsManager('pushTag', value);
                } else {
                    return false;
                }
            },

            /**
             * Pushes an array of items to the list
             * @param value {Array} array with items to push to the list
             */
            pushTags: function(tags) {
                for (var i = -1, length = tags.length; ++i < length;) {
                    this.pushTag(tags[i]);
                }
            },

            /**
             * Returns an array with all list items
             * @returns {Array}
             */
            getTags: function() {
                if (this.tagApi !== null) {
                    return this.tagApi.tagsManager('tags');
                } else {
                    return [];
                }
            }
        };
    }
);

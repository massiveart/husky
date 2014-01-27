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
 * @param {String} [options.tags]
 * @param {String} [options.url] url to load autocomplete data
 * @param {String} [options.suggestions]
 * @param {String} [options.suggestionUrl] url to load suggestions
 */
define([
    'text!husky_components/auto-complete-list/main.html',
    'text!husky_components/auto-complete-list/suggestions.html'
], function(tplMain, tplSuggestions) {

        'use strict';

        var defaults = {
                instanceName: 'undefined', //name of the component instance
                items: [], //preloaded tags
                itemsUrl: '', //url to load tags
                itemsKey: 'items', //Key for AJAX respons
                suggestions: [], //suggestions for suggestions box
                suggestionsHeadline: '', //Headline for suggestions bxo
                suggestionsUrl: '', // url to load suggestions
                suggestionsKey: 'suggestions', //Key for AJAX response
                label: '', //label (headline),
                inputSelector: '.husky-autocomplete', //Selector for input wrapper div
                autocomplete: true, //enable/disable autocomplete
                localData: [], //local data passed to the autocomplete component
                prefetchUrl: '', //url to prefetch data for the autocomplete component
                remoteUrl: '', //url to fetch data on input for the autocomplete component
                getParameter: 'query',
                autocompleteOptions: {}, //options to pass to the autocomplete component
                maxListItems: 0, //maximum amount of list items accepted (0 = no limit)
                CapitalizeFirstLetter: false, //if true the first letter of each item gets capitalized
                listItemClass: 'auto-complete-list-selection', //class for list items
                suggestionDeactivatedClass: 'deactivated', //class if suggestion is already used,
                AjaxPush: '', //url to which added list items get send via ajax POST
                AjaxPushAllItems: false, //if true all list items get sent if an item is added
                AjaxPushParameters: null, //additional parameter payload to push with each AJAX request
                togglerSelector: '.toggler', //CSS-selector for suggestion-toggler
                arrowDownClass: 'arrow-down', //CSS-class for arrow down icon
                arrowUpClass: 'arrow-up', //CSS-class for arrow up icon
                slideDuration: 500 //ms - duration for sliding suggestinos up/down
            },
            eventNamespace = 'husky.auto-complete-list.',

            togglerPosUp = 'up',
            togglerPosDown = 'down';


        return {

            initialize: function() {
                this.setVars();

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.renderMain();
                this.initInputCont();
                this.initSuggestions();
                this.initItems();
            },

            setVars: function() {
                this.suggestions = [];
                this.$suggestions = null;
                this.$input = null;
                this.tagApi = null;
                this.toggler = null;
                this.$inputCont = null;
            },

            getEvent: function(append) {
                return eventNamespace + this.options.instanceName + '.' + append;
            },

            renderMain: function() {
                this.sandbox.dom.html(this.$el,
                    _.template(tplMain)({
                        label: this.options.label
                    })
                );
            },

            initInputCont: function() {
                this.$inputCont = this.sandbox.dom.find(this.options.inputSelector, this.$el);
                if (!this.$inputCont.length) {
                    this.sandbox.logger.log('Initializing input-container failed.');
                    return false;
                }
            },

            startPlugins: function() {
                if (this.options.autocomplete === true) {
                    this.bindStartTmEvent();
                    this.startAutocomplete();
                } else {
                    this.initInput();
                    this.appendInput();
                    this.startTagmanager();
                    this.bindEvents();
                }
            },

            initInput: function() {
                this.$input = this.sandbox.dom.createElement('<input type="text"/>');
            },

            appendInput: function() {
                if (!!this.$input.length) {
                    this.sandbox.dom.append(this.$inputCont, this.$input);
                }
            },

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
                                getParameter: this.options.getParameter
                            },
                            this.options.autocompleteOptions
                        )
                    }
                ]);
            },

            startTagmanager: function() {
                this.tagApi = this.sandbox.autocompleteList.init(this.$input, {
                    tagClass: this.options.listItemClass,
                    prefilled: this.options.items,
                    tagCloseIcon: '',
                    maxTags: this.options.maxListItems,
                    AjaxPush: this.options.AjaxPush,
                    AjaxPushAllTags: this.options.AjaxPushAllItems,
                    AjaxPushParameters: this.options.AjaxPushParameters,
                    CapitalizeFirstLetter: this.options.CapitalizeFirstLetter
                });
            },

            bindStartTmEvent: function() {
                this.sandbox.on('husky.auto-complete.' + this.options.instanceName + '.initialized', function(data) {
                    this.$input = data;
                    this.startTagmanager();
                    this.bindEvents();
                }.bind(this));
            },

            bindEvents: function() {
                this.sandbox.on('husky.auto-complete.' + this.options.instanceName + '.select', function(d) {
                    this.pushTag(d.name);
                }.bind(this));

                this.sandbox.dom.on(this.$input, 'keydown', function(event) {
                    if (event.keyCode === 8 && this.sandbox.dom.val(this.$input).trim() === '') {
                        this.refreshSuggestions();
                    }
                }.bind(this));

                this.sandbox.dom.on(this.$el, 'click', function(event) {
                    if (this.sandbox.dom.hasClass(event.target, 'tm-tag-remove') === true) {
                        this.refreshSuggestions();
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

            initItems: function() {
                if (this.options.itemsUrl !== '') {
                    this.requestItems();
                } else {
                    this.startPlugins();
                }
            },

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
                this.sandbox.emit(this.getEvent('items-request'));
            },

            initSuggestions: function() {
                if (this.options.suggestionsUrl !== '') {
                    this.requestSuggestions();
                } else {

                    this.loadSuggestions();
                    this.renderSuggestions();
                    this.initToggler();
                }
            },

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
                this.sandbox.emit(this.getEvent('sug-request'));
            },

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

            renderSuggestions: function() {
                if (!!this.options.suggestions.length) {
                    var box, list, i = -1, length = this.suggestions.length;
                    box = this.sandbox.dom.parseHTML(
                        _.template(tplSuggestions)({
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

            initToggler: function() {
                if (!!this.options.suggestions.length) {
                    this.toggler = {
                        $el: this.sandbox.dom.find(this.options.togglerSelector, this.$el),
                        pos: togglerPosUp
                    };
                    this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowUpClass);
                }
            },

            changeToggler: function() {
                if (this.toggler.pos === togglerPosDown) {
                    this.togglerUp();
                } else {
                    this.togglerDown();
                }
            },

            toggleSuggestions: function() {
                if (this.toggler.pos === togglerPosDown) {
                    this.hideSuggestions();
                } else {
                    this.showSuggestions();
                }
            },

            hideSuggestions: function() {
                this.sandbox.dom.slideUp(this.$suggestions, this.options.slideDuration);
            },

            showSuggestions: function() {
                this.sandbox.dom.slideDown(this.$suggestions, this.options.slideDuration);
            },

            togglerDown: function() {
                this.sandbox.dom.removeClass(this.toggler.$el, this.options.arrowUpClass);
                this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowDownClass);
                this.toggler.pos = togglerPosDown;
            },

            togglerUp: function() {
                this.sandbox.dom.removeClass(this.toggler.$el, this.options.arrowDownClass);
                this.sandbox.dom.addClass(this.toggler.$el, this.options.arrowUpClass);
                this.toggler.pos = togglerPosUp;
            },

            bindSuggestionEvents: function(suggestion) {
                this.sandbox.dom.on(suggestion.$el, 'click', function() {
                    this.pushTag(suggestion.name);
                    this.deactivateSuggestion(suggestion);
                }.bind(this));
            },

            deactivateSuggestion: function(suggestion) {
                this.sandbox.dom.addClass(suggestion.$el, this.options.suggestionDeactivatedClass);
            },

            activateSuggestion: function(suggestion) {
                this.sandbox.dom.removeClass(suggestion.$el, this.options.suggestionDeactivatedClass);
            },

            refreshSuggestions: function() {
                for (var i = -1, length = this.suggestions.length; ++i < length;) {
                    if (this.sandbox.dom.hasClass(this.suggestions[i].$el, this.options.suggestionDeactivatedClass) === true) {
                        if (this.suggestionContainedInTags(this.suggestions[i]) === false) {
                            this.activateSuggestion(this.suggestions[i]);
                        }
                    }
                }
            },

            suggestionContainedInTags: function(suggestion) {
                var tags = this.getTags(), i, length;
                for (i = -1, length = tags.length; ++i < length;) {
                    if (tags[i] === suggestion.name) {
                        return true;
                    }
                }
                return false;
            },

            pushTag: function(value) {
                if (this.tagApi !== null) {
                    this.tagApi.tagsManager('pushTag', value);
                } else {
                    return false;
                }
            },

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

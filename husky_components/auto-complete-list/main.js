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
    'text!husky_components/auto-complete-list/suggestions.html',
    'text!husky_components/auto-complete-list/tag.html'
], function(tplMain, tplSuggestions, tplTag) {

        'use strict';

        var defaults = {
                tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
                suggestions: [{"id": 1, "name": "Sugg1"}, {"id": 2, "name": "Sugg2"}, {"id": 3, "name": "Sugg3"}],
                suggestionUrl: '', // url to load suggestions
                label: '', //label (headline),
                inputSelector: '#husky-autocomplete', //Selector for input wrapper div
                autocompleteOptions: {
                    localData: [{id: 1, name: 'Deutschland'}, {id: 2, name: 'Frankreich'}]
                },
                listItemClass: 'auto-complete-list-selection', //class for list items
                suggestionDeactivatedClass: 'deactivated' //class if suggestion is already used
            },
            eventNamespace = 'husky.auto-complete-list.',

            /**
             * @event husky.auto-complete-list.rendered
             * @description the component has been rendered
             */
            RENDERED = eventNamespace + 'rendered';



        return {

            view: true,
            suggestions: [],
            $input: null,
            tagApi: null,

            initialize: function() {
                this.sandbox.logger.log('initialize', this);

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.loadSuggestions();
                this.render();
                this.startAutocomplete();
                this.bindStartTmEvent();
            },

            render: function() {
                this.renderMain();
                this.renderSuggestions();

                this.sandbox.emit(RENDERED);
            },

            renderMain: function() {
                this.sandbox.dom.html(this.$el,
                    _.template(tplMain)({
                        label: this.options.label
                    })
                );
            },

            renderSuggestions: function() {
                if (!!this.suggestions.length) {
                    var box, list, i = -1, length = this.suggestions.length;
                    box = this.sandbox.dom.parseHTML(
                               _.template(tplSuggestions)({
                                    headline: 'Recent Tags'
                               })
                            );
                    list = this.sandbox.dom.children(box, 'ul');
                    for(;++i<length;) {
                        this.sandbox.dom.append(list, this.suggestions[i].$el);
                        this.bindSuggestionEvents(this.suggestions[i]);
                    }
                    this.sandbox.dom.append(this.$el, box);
                }
            },

            startAutocomplete: function() {
                this.sandbox.start([{
                    name: 'auto-complete@husky',
                    options: this.sandbox.util.extend(
                        {el: this.options.inputSelector},
                        this.options.autocompleteOptions
                    )
                }]);
            },

            startTagmanager: function() {
                this.tagApi = this.$input.tagsManager({
                        tagClass: this.options.listItemClass,
                        prefilled: this.options.tags,
                        tagCloseIcon: ''
                    });
            },

            bindStartTmEvent: function() {
                this.sandbox.on('husky.auto-complete.initialized', function(data) {
                    this.$input = data
                    this.startTagmanager();
                    this.bindEvents();
                }.bind(this));
            },

            bindEvents: function() {
                this.sandbox.on('husky.auto-complete.select', function(d) {
                    this.pushTag(d.name);
                }.bind(this));

                this.sandbox.dom.on(this.$input, 'keydown', function(event) {
                    if(event.keyCode === 8 && this.sandbox.dom.val(this.$input).trim() === '') {
                        this.refreshSuggestions();
                    }
                }.bind(this));
                this.sandbox.dom.on(this.$el, 'click', function(event) {
                    if(this.sandbox.dom.hasClass(event.target, 'tm-tag-remove') === true) {
                        this.refreshSuggestions();
                    }
                }.bind(this));
            },

            loadSuggestions: function() {
                if (!!this.options.suggestions.length) {
                    for (var i = -1, length = this.options.suggestions.length; ++i<length;) {
                        this.suggestions[i] = {
                            id: this.options.suggestions[i].id,
                            name: this.options.suggestions[i].name,
                            $el: this.sandbox.dom.createElement('<li/>')
                        }
                        this.sandbox.dom.html(this.suggestions[i].$el, this.suggestions[i].name);
                    }
                }
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
                    if(this.sandbox.dom.hasClass(this.suggestions[i].$el, this.options.suggestionDeactivatedClass) === true) {
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
                return false
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

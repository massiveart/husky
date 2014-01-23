/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/column-navigation
 */


/**
 * @class SmartContent
 * @constructor
 *
 * @params {Object} [options] Configuration object
 *
 */
define([], function() {

    'use strict';

    var defaults = {
        visibleItems: 3,
        dataSources: [],
        includeSubFolders: false,
        preSelectedDataSource: 0,
        categories: [],
        preSelectedCategory: 0,
        tags: [],
        tagsAutoCompleteUrl: '',
        sortBy: null,
        preSelectedSortBy: [],
        preSelectedSortMethod: 'asc', //asc, desc
        presentAs: [],
        preSelectedPresentAs: 0,
        limitResult: 0 //0 = no-limit
    },

    sortMethods = {
        asc: 'Ascending',
        desc: 'Descanding'
    },

    constants = {
        containerSelector: '.smart-content-container',
        headerSelector: '.smart-header',
        contentSelector: '.smart-content',
        sourceSelector: '.source',
        footerClass: 'smart-footer',
        buttonClass: 'icon-adjust-alt',
        overlayCloseSelector: '.close-button',
        overlayOkSelector: '.save-button',
        overlayContentSelector: '.smart-overlay-content',
        dataSourceDDId: 'data-source-dropdown',
        categoryDDId: 'category-dropdown',
        tagListId: 'tag-list',
        sortByDDId: 'sort-by-dropdown',
        sortMethodDDId: 'sort-method-dropdown',
        presentAsDDId: 'present-as-dropdown'
    },

    /** templates for component */
    templates = {
        skeleton: [
            '<div class="smart-content-container">',
                '<div class="smart-header"></div>',
                '<div class="smart-content"></div>',
            '</div>'
        ].join(''),
        source: [
            '<div class="source">',
                '<span class="desc"><%= desc %></span>',
                '<span class="val"><%= val %></span>',
            '</div>'
        ].join(''),
        overlaySkeleton: [
            '<div class="overlay-container">',
                '<div class="overlay-header">',
                    '<span class="title"><%= title %></span>',
                    '<a class="icon-remove2 close-button" href="#"></a>',
                '</div>',
                '<div class="smart-overlay-content"></div>',
                '<div class="overlay-footer">',
                '   <a class="icon-half-ok save-button btn btn-highlight" href="#"></a>',
                '</div>',
            '</div>'
        ].join(''),
        overlayContent: [
            '<div class="item-half left">',
                '<span class="desc"><%= data_source %></span>',
                '<div id="' + constants.dataSourceDDId + '"></div>',
            '</div>',
            '<div class="item-half left">',
                '<div class="check">',
                    '<label>',
                        '<input type="checkbox" class="form-element custom-checkbox"<%= include_sub_checked %>/>',
                        '<span class="custom-checkbox-icon"></span>',
                        '<span class="description"><%= include_sub %></span>',
                    '</label>',
                '</div>',
            '</div>',
            '<div class="clear"></div>',
            '<div class="item">',
                '<span class="desc"><%= filter_by_cat %></span>',
                '<div id="' + constants.categoryDDId + '"></div>',
            '</div>',
            '<div class="item">',
                '<span class="desc"><%= filter_by_tags %></span>',
                '<div id="' + constants.tagListId + '" class="tag-list"></div>',
            '</div>',
            '<div class="item-half left">',
                '<span class="desc"><%= sort_by %></span>',
                '<div id="' + constants.sortByDDId + '"></div>',
            '</div>',
            '<div class="item-half">',
                '<div id="' + constants.sortMethodDDId + '" class="sortMethod"></div>',
            '</div>',
            '<div class="clear"></div>',
            '<div class="item-half left">',
                '<span class="desc"><%= present_as %></span>',
                '<div id="' + constants.presentAsDDId + '"></div>',
            '</div>',
            '<div class="item-half">',
                '<span class="desc"><%= limit_result_to %></span>',
                '<input type="text" value="<%= limit_result %>" class="limit-to"/>',
            '</div>',
            '<div class="clear"></div>'
        ].join('')
    },

    /**
     * namespace for events
     * @type {string}
     */
     eventNamespace = 'husky.smart-content.';

    return {

        /**
         * Initialize component
         */
        initialize: function() {
            this.sandbox.logger.log('initialize', this);

            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.setVariables();
            this.render();
            this.bindEvents();
        },

        setVariables: function() {
            this.$container = null;
            this.$header = null;
            this.$content = null;
            this.$footer = null;
            this.$button = null;
            this.items = [];
            this.overlay = {
                opened: false,
                $el: null,
                $close: null,
                $ok: null
            };
        },

        render: function() {
            this.renderContainer();
            this.renderHeader();
            this.renderContent();
            this.renderFooter();
        },

        renderContainer: function() {
            this.sandbox.dom.html(this.$el, templates.skeleton);
            this.$container = this.sandbox.dom.find(constants.containerSelector, this.$el);
        },

        renderHeader: function() {
            this.$header = this.sandbox.dom.find(constants.headerSelector, this.$el);
            if (!!this.$header.length) {
                this.sandbox.dom.append(this.$header, this.getSourceHTML());
                this.renderButton();
            } else {
                this.sandbox.logger.log('Error: no Header-container found!');
            }
        },

        getSourceHTML: function() {
            var html = '', desc;
            if (this.options.source !== null) {
                desc = 'From'; //todo translate
                if (this.options.includeSubFolders !== false) {
                    desc += ' (incl. Subfolders):'; //todo translate
                } else {
                    desc += ':';
                }
                html = _.template(templates.source)({desc: desc, val: this.options.source});
            }
            return html;
        },

        renderButton: function() {
            this.$button = this.sandbox.dom.createElement('<a href="#"/>');
            this.sandbox.dom.addClass(this.$button, constants.buttonClass);
            this.sandbox.dom.append(this.$header, this.$button);
        },

        renderContent: function() {
            this.$content = this.sandbox.dom.find(constants.contentSelector, this.$el);
            if (this.items.length !== 0) {
                this.sandbox.logger.log('render items');
            } else {
                this.sandbox.dom.html(this.$content, [
                                                      '<div class="no-content">',
                                                            '<span class="icon-file"></span>',
                                                            '<div class="text">No content selected</div>',
                                                      '</div>'
                                                     ].join(''));
            }
        },

        renderFooter: function() {
            var visible = 0;

            this.$footer = this.sandbox.dom.createElement('<div/>');
            this.sandbox.dom.addClass(constants.footerClass, this.$footer);

            if (this.items.length !== 0) {
                visible = (this.items.length <= this.options.visibleItems) ? this.items.length : this.options.visibleItems;
                this.sandbox.dom.html(this.$footer, [
                                                        '<span>',
                                                            '<strong>'+ visible +'</strong>of',
                                                            '<strong>'+ this.items.length +'</strong>visible',
                                                        '</span>'
                                                    ].join(''));
                if (visible !== this.items.length) {
                    this.sandbox.dom.append(this.$footer, '<span class="view-all">view all</span>');
                }
                this.sandbox.dom.append(this.$container, this.$footer);
            } else {
                this.$footer.remove();
            }
        },

        bindEvents: function() {
            this.sandbox.dom.on(this.$button, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.openOverlay();
            }.bind(this));
        },

        openOverlay: function() {
            if (this.overlay.opened === false) {
                if (this.overlay.$el === null) {
                    this.loadOverlay();
                    this.loadOverlayContent();
                    this.startOverlayComponents();
                    this.bindOverlayEvents();
                }
                this.sandbox.dom.append($('body'), this.overlay.$el);
                this.overlay.opened = true;
            }
        },

        closeOverlay: function() {
            this.sandbox.dom.detach(this.overlay.$el);
            this.overlay.opened = false;
        },

        loadOverlay: function() {
            this.overlay.$el = this.sandbox.dom.createElement(
                _.template(templates.overlaySkeleton)({
                    title: 'Configure smart content'
            }));
            this.overlay.$close = this.sandbox.dom.find(constants.overlayCloseSelector, this.overlay.$el);
            this.overlay.$ok = this.sandbox.dom.find(constants.overlayOkSelector, this.overlay.$el);
            this.overlay.$content = this.sandbox.dom.find(constants.overlayContentSelector, this.overlay.$el);
        },

        loadOverlayContent: function() {
            this.sandbox.dom.html(this.overlay.$content,
                _.template(templates.overlayContent)({
                    data_source: 'Data source',
                    include_sub: 'Include Sub folders',
                    filter_by_cat: 'Filter by category',
                    include_sub_checked: (this.options.includeSubFolders) ? ' checked' : '',
                    filter_by_tags: 'Filter by Tags',
                    sort_by: 'Sort by',
                    present_as: 'Present as',
                    limit_result_to: 'Limit result to',
                    limit_result: (this.options.limitResult > 0) ? this.options.limitResult : ''
            }));

        },

        startOverlayComponents: function() {
            this.sandbox.start([
                {
                    name: 'dropdown-multiple-select@husky',
                    options: {
                        el: '#' + constants.dataSourceDDId,
                        instanceName: constants.dataSourceDDId,
                        defaultLabel: 'Choose folder ...',
                        value: 'name',
                        data: this.options.dataSources,
                        preSelectedElements: [this.options.preSelectedDataSource],
                        singleSelect: true
                    }
                },
                {
                    name: 'dropdown-multiple-select@husky',
                    options: {
                        el: '#' + constants.categoryDDId,
                        instanceName: constants.categoryDDId,
                        defaultLabel: 'All categories',
                        value: 'name',
                        data: this.options.categories,
                        preSelectedElements: [this.options.preSelectedCategory],
                        singleSelect: true
                    }
                },
                {
                    name: 'auto-complete-list@husky',
                    options: {
                        el: '#' + constants.tagListId,
                        instanceName: constants.tagListId,
                        items: this.options.tags,
                        remoteUrl: this.options.tagsAutoCompleteUrl,
                        autocomplete: (this.options.tagsAutoCompleteUrl !== '')
                    }
                },
                {
                    name: 'dropdown-multiple-select@husky',
                    options: {
                        el: '#' + constants.sortByDDId,
                        instanceName: constants.sortByDDId,
                        defaultLabel: 'No sorting',
                        value: 'name',
                        data: this.options.sortBy,
                        preSelectedElements: [this.options.preSelectedSortBy],
                        singleSelect: true
                    }
                },
                {
                    name: 'dropdown-multiple-select@husky',
                    options: {
                        el: '#' + constants.sortMethodDDId,
                        instanceName: constants.sortMethodDDId,
                        defaultLabel: 'Select sort method',
                        value: 'name',
                        data: [sortMethods.asc, sortMethods.desc],
                        preSelectedElements: [sortMethods[this.options.preSelectedSortMethod]],
                        singleSelect: true
                    }
                },
                {
                    name: 'dropdown-multiple-select@husky',
                    options: {
                        el: '#' + constants.presentAsDDId,
                        instanceName: constants.presentAsDDId,
                        defaultLabel: 'Choose..',
                        value: 'name',
                        data: this.options.presentAs,
                        preSelectedElements: [this.options.preSelectedPresentAs],
                        singleSelect: true
                    }
                }
            ]);
        },

        bindOverlayEvents: function() {
            this.sandbox.dom.on(this.overlay.$close, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.closeOverlay();
            }.bind(this));

            this.sandbox.dom.on(this.overlay.$ok, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                //generate request
                this.closeOverlay();
            }.bind(this));
        }

    };

});

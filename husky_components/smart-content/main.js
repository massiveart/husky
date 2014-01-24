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
        preSelectedDataSource: [],
        categories: [],
        preSelectedCategory: null,
        tags: [],
        tagsAutoCompleteUrl: '',
        sortBy: null,
        preSelectedSortBy: null,
        preSelectedSortMethod: 'asc', //asc, desc
        presentAs: [],
        preSelectedPresentAs: null,
        limitResult: 0, //0 = no-limit
        instanceName: '',
        url: '',
        dataSourceParameter: 'dataSource',
        includeSubFoldersParameter: 'incSubFolders',
        categoryParameter: 'category',
        tagsParameter: 'tags',
        sortByParameter: 'sortBy',
        sortMethodParameter: 'sortMethod',
        presentAsParameter: 'presentAs',
        limitResultParameter: 'limitResult',
        resultKey: 'result' //key for JSON result
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
        viewTogglerClass: 'view-toggler',
        buttonClass: 'icon-adjust-alt',
        overlayCloseSelector: '.close-button',
        overlayOkSelector: '.save-button',
        overlayContentSelector: '.smart-overlay-content',
        dataSourceDDId: 'data-source-dropdown',
        includeSubSelector: '.includeSubCheck',
        categoryDDId: 'category-dropdown',
        tagListId: 'tag-list',
        sortByDDId: 'sort-by-dropdown',
        sortMethodDDId: 'sort-method-dropdown',
        presentAsDDId: 'present-as-dropdown',
        limitToSelector: '.limit-to',
        contentListClass: 'items-list'
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
        noContent: [
            '<div class="no-content">',
                 '<span class="icon-file"></span>',
                 '<div class="text"><%= no_content %></div>',
            '</div>'
        ].join(''),
        contentItem: [
            '<li data-id="<%= data_id %>">',
                '<span class="num"><%= num %></span>',
                '<span class="value"><%= value %></span>',
            '</li>'
        ].join(''),
        overlaySkeleton: [
            '<div class="overlay-container">',
                '<div class="overlay-header">',
                    '<span class="title"><%= title %></span>',
                    '<a class="icon-remove2 close-button" href="#"></a>',
                '</div>',
                '<div class="smart-overlay-content"></div>',
                '<div class="overlay-footer">',
                '   <a class="icon-half-ok save-button btn btn-highlight btn-large" href="#"></a>',
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
                        '<input type="checkbox" class="includeSubCheck form-element custom-checkbox"<%= include_sub_checked %>/>',
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
     eventNamespace = 'husky.smart-content.',

    /**
     * raised when all overlay components returned their value
     * @event husky.smart-content.input-retrieved
     */
     INPUT_RETRIEVED = function() {
        return createEventName.call(this, 'input-retrieved');
     },

    /**
     * raised when data has returned from the ajax request
     * @event husky.smart-content.data-retrieved
     */
     DATA_RETRIEVED = function() {
        return createEventName.call(this, 'data-retrieved');
     },

    /** returns normalized event names */
    createEventName = function(postFix) {
        return eventNamespace + (this.options.instanceName ? this.options.instanceName + '.' : '') + postFix;
    };

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
            this.setURI();
            this.loadContent();
        },

        setVariables: function() {
            this.$container = null;
            this.$header = null;
            this.$content = null;
            this.$footer = null;
            this.$button = null;
            this.itemsVisible = this.options.visibleItems;
            this.items = [];
            this.URI = {
                str: '',
                hasChanged: false
            };
            this.overlay = {
                opened: false,
                $el: null,
                $close: null,
                $ok: null,
                data: {}
            };
            this.overlay.data =  {
                dataSource: this.options.preSelectedDataSource,
                includeSubFolders: this.options.includeSubFolders,
                category: this.options.preSelectedCategory,
                tags: this.options.tags,
                sortBy: this.options.preSelectedSortBy,
                sortMethod: this.options.preSelectedSortMethod,
                presentAs: this.options.preSelectedPresentAs,
                limitResult: this.options.limitResult
            };
        },

        render: function() {
            this.renderContainer();
            this.renderHeader();
        },

        renderContainer: function() {
            this.sandbox.dom.html(this.$el, templates.skeleton);
            this.$container = this.sandbox.dom.find(constants.containerSelector, this.$el);
        },

        renderHeader: function() {
            this.$header = this.sandbox.dom.find(constants.headerSelector, this.$el);
            if (!!this.$header.length) {
                this.renderButton();
            } else {
                this.sandbox.logger.log('Error: no Header-container found!');
            }
        },

        prependSource: function() {
            var desc;
            if (!!this.overlay.data.dataSource.length) {
                desc = 'From';
                if (this.overlay.data.includeSubFolders !== false) {
                    desc += ' (incl. Subfolders):';
                } else {
                    desc += ':';
                }
                this.sandbox.dom.prepend(this.$header, _.template(templates.source)({
                                                        desc: desc,
                                                        val: this.getSourceNameById(this.overlay.data.dataSource)
                }));
            }
        },

        getSourceNameById: function(id) {
            id = parseInt(id);
            for(var i = -1, length = this.options.dataSources.length; ++i < length;) {
                if (this.options.dataSources[i].id === id) {
                    return this.options.dataSources[i].name;
                }
            }
            return '';
        },

        removeSource: function() {
            this.sandbox.dom.remove(this.sandbox.dom.find(constants.sourceSelector, this.$header));
        },

        renderButton: function() {
            this.$button = this.sandbox.dom.createElement('<a href="#"/>');
            this.sandbox.dom.addClass(this.$button, constants.buttonClass);
            this.sandbox.dom.append(this.$header, this.$button);
        },

        renderContent: function() {
            if(this.$content === null) {
                this.$content = this.sandbox.dom.find(constants.contentSelector, this.$el);
            }
            if (this.items.length !== 0) {
                var ul, i = -1, length = this.items.length;
                ul = this.sandbox.dom.createElement('<ul class="'+ constants.contentListClass +'"/>');

                for(;++i < length && i < this.itemsVisible;) {
                    this.sandbox.dom.append(ul, _.template(templates.contentItem)({
                                                    data_id: this.items[i].id,
                                                    value: this.items[i].name,
                                                    num: (i + 1)
                    }));
                }

                this.sandbox.dom.html(this.$content, ul);
                this.renderFooter();
            } else {
                this.sandbox.dom.html(this.$content, _.template(templates.noContent)({
                                                    no_content: 'No content selected'
                }));
                this.detachFooter();
            }
        },

        renderFooter: function() {
            if (this.$footer === null) {
                this.$footer = this.sandbox.dom.createElement('<div/>');
                this.sandbox.dom.addClass(this.$footer, constants.footerClass);
            }

            this.sandbox.dom.html(this.$footer, [
                                                    '<span>',
                                                        '<strong>'+ this.itemsVisible +' </strong>of ',
                                                        '<strong>'+ this.items.length +' </strong>visible',
                                                    '</span>'
                                                ].join(''));

            this.appendViewToggler();
            this.sandbox.dom.append(this.$container, this.$footer);
            this.bindFooterEvents();
        },

        appendViewToggler: function() {
            if (this.itemsVisible < this.items.length) {
                this.sandbox.dom.append(this.$footer, '<span class="'+ constants.viewTogglerClass +'">(view all)</span>');
            } else {
                this.sandbox.dom.append(this.$footer, '<span class="'+ constants.viewTogglerClass +'">(view less)</span>');
            }
        },

        detachFooter: function() {
            if (this.$footer !== null) {
                this.sandbox.dom.remove(this.$footer);
            }
        },

        bindEvents: function() {
            this.sandbox.dom.on(this.$button, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.openOverlay();
            }.bind(this));

            this.sandbox.on(DATA_RETRIEVED.call(this), function() {
                this.renderContent();
                this.removeSource();
                this.prependSource();
            }.bind(this));
        },

        bindFooterEvents: function() {
            this.sandbox.dom.on(this.sandbox.dom.find('.' + constants.viewTogglerClass, this.$footer), 'click', function() {
                this.toggleView();
            }.bind(this));
        },

        toggleView: function() {
            if (this.itemsVisible < this.items.length) {
                this.itemsVisible = this.items.length;
            } else {
                this.itemsVisible = this.options.visibleItems;
            }
            this.renderContent();
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
                this.setOverlayTop();
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
                        singleSelect: true,
                        noDeselect: true
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
                        singleSelect: true,
                        noDeselect: true
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
                        singleSelect: true,
                        noDeselect: true
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
                this.getOverlayData();
                this.closeOverlay();
            }.bind(this));

            this.sandbox.on(INPUT_RETRIEVED.call(this), function() {
                this.setURI();
                this.loadContent();
            }.bind(this));
        },

        setURI: function() {
            var newURI = [this.options.url,
                          '?', this.options.dataSourceParameter, '=', this.overlay.data.dataSource,
                          '&', this.options.includeSubFoldersParameter, '=', this.overlay.data.includeSubFolders,
                          '&', this.options.categoryParameter, '=', this.overlay.data.category,
                          '&', this.options.tagsParameter, '=', this.overlay.data.tags,
                          '&', this.options.sortByParameter, '=', this.overlay.data.sortBy,
                          '&', this.options.sortMethodParameter, '=', this.overlay.data.sortMethod,
                          '&', this.options.presentAsParameter, '=', this.overlay.data.presentAs].join('');
            if (newURI !== this.URI.str) {
                this.URI.str = newURI;
                this.URI.hasChanged = true;
            } else {
                this.URI.hasChanged = false;
            }
        },

        loadContent: function() {
            if(this.URI.hasChanged === true) {
                this.sandbox.util.ajax({
                    url: this.URI.str,

                    success: function(data) {
                        this.items = data[this.options.resultKey];
                        this.sandbox.emit(DATA_RETRIEVED.call(this));
                    }.bind(this),

                    error: function(error) {
                        this.sandbox.logger.log(error);
                    }.bind(this)
                });
            }
        },

        getOverlayData: function() {
            var dataSourceDef, categoryDef, tagsDef, sortByDef, sortMethodDef, presentAsDef;
            dataSourceDef = categoryDef = tagsDef = sortByDef = sortMethodDef = presentAsDef = this.sandbox.data.deferred();

            //include sub folders
            this.overlay.data.includeSubFolders = this.sandbox.dom.prop(
                                                        this.sandbox.dom.find(constants.includeSubSelector, this.overlay.$el),
                                                        'checked');

            //limit result
            this.overlay.data.limitResult = this.sandbox.dom.val(this.sandbox.dom.find(constants.limitToSelector, this.overlay.$el));

            //data-source
            this.sandbox.emit('husky.dropdown.multiple.select.'+ constants.dataSourceDDId +'.getChecked', function(dataSource){
                this.overlay.data.dataSource = dataSource;
                dataSourceDef.resolve();
            }.bind(this));

            //category
            this.sandbox.emit('husky.dropdown.multiple.select.'+ constants.categoryDDId +'.getChecked', function(category){
                this.overlay.data.category = category;
                categoryDef.resolve();
            }.bind(this));

            //tags
            this.sandbox.emit('husky.auto-complete-list.'+ constants.tagListId +'.getTags', function(tags){
                this.overlay.data.tags = tags;
                tagsDef.resolve();
            }.bind(this));

            //sort by
            this.sandbox.emit('husky.dropdown.multiple.select.'+ constants.sortByDDId +'.getChecked', function(sortBy){
                this.overlay.data.sortBy = sortBy;
                sortByDef.resolve();
            }.bind(this));

            //sort method
            this.sandbox.emit('husky.dropdown.multiple.select.'+ constants.sortMethodDDId +'.getChecked', function(sortMethod){
                this.overlay.data.sortMethod = (sortMethod[0] === sortMethods.asc) ? 'asc' : 'desc';
                sortMethodDef.resolve();
            }.bind(this));

            //present as
            this.sandbox.emit('husky.dropdown.multiple.select.'+ constants.presentAsDDId +'.getChecked', function(presentAs){
                this.overlay.data.presentAs = presentAs;
                presentAsDef.resolve();
            }.bind(this));

            this.sandbox.dom.when(dataSourceDef.promise(), categoryDef.promise(), tagsDef.promise(), sortByDef.promise(), sortMethodDef.promise(), presentAsDef.promise()).then(function() {
                this.sandbox.emit(INPUT_RETRIEVED.call(this));
            }.bind(this));
        },

        setOverlayTop: function() {
            this.sandbox.dom.css(this.overlay.$el, {'top': (this.sandbox.dom.$window.height() - this.overlay.$el.outerHeight())/2 + 'px'});
        }
    };

});

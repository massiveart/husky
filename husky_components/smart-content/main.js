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
        source: null,
        includeSubFolders: false,
        categories: [],
        tags: [],
        sortBy: null,
        sortMethod: 'desc', //desc, asc
        presentAs: [],
        limitResult: 0, //0 = no-limit
        visibleItems: 3
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
        overlayContentSelector: '.overlay-content'
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
                '<div class="overlay-content"></div>',
                '<div class="overlay-footer">',
                '   <a class="icon-half-ok save-button btn btn-highlight" href="#"></a>',
                '</div>',
            '</div>'
        ].join(''),
        overlayContent: [
            'here could be your template'
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

            }));
        },

        bindOverlayEvents: function() {
            this.sandbox.dom.on(this.overlay.$close, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                this.closeOverlay();
            }.bind(this));

            this.sandbox.dom.on(this.overlay.$ok, 'click', function(event) {
                this.sandbox.dom.preventDefault(event);
                //do some stuff
                this.closeOverlay();
            }.bind(this));
        }

    };

});

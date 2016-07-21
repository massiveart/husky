/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
(function() {

    'use strict';

    require.config({
        paths: {
            ckeditor: 'bower_components/ckeditor/ckeditor',
            jqueryAdapter: 'bower_components/ckeditor/adapters/jquery'
        },
        shim: {
            jqueryAdapter: {
                deps: ['jquery', 'ckeditor']
            }
        }
    });

    define(['underscore', 'services/husky/util', 'ckeditor', 'jqueryAdapter'], function(_, Util) {

        var getConfig = function() {
            return {
                format_tags: 'p;h1;h2;h3;h4;h5;h6',
                width: '100%',
                defaultLanguage: 'en',
                removeButtons: '',
                removePlugins: 'elementspath,magicline',
                removeDialogTabs: 'image:advanced;link:advanced',
                allowedContent: true,
                resize_enabled: false,
                enterMode: 'P',
                uiColor: '#ffffff',
                skin: 'husky'
            };
        };

        /**
         * Builder to extend basic toolbar.
         *
         * @param toolbar
         *
         * @constructor
         */
        function ToolbarBuilder(toolbar) {
            this.toolbar = toolbar;
        }

        /**
         * Add toolbar items.
         *
         * @param {String} name
         * @param {String[]} items
         */
        ToolbarBuilder.prototype.add = function(name, items) {
            if (!this.toolbar[name]) {
                this.toolbar[name] = [];
            }

            this.toolbar[name] = this.toolbar[name].concat(items);
        };

        /**
         * Remove toolbar items.
         *
         * @param {String} name
         * @param {String[]} items
         */
        ToolbarBuilder.prototype.remove = function(name, items) {
            if (!this.toolbar[name]) {
                this.toolbar[name] = [];
            }

            this.toolbar[name] = _.difference(this.toolbar[name], items);
        };

        /**
         * Returns toolbar.
         *
         * @returns {{name, items}[]}
         */
        ToolbarBuilder.prototype.get = function() {
            return _.map(this.toolbar, function(items, name) {
                return {name: name, items: items};
            });
        };

        /**
         * Returns raw toolbar data.
         *
         * @returns {Object}
         */
        ToolbarBuilder.getRaw = function() {
            return this.toolbar;
        };

        return {

            name: 'ckeditor',

            initialize: function(app) {

                var availableToolbarSections = {
                        semantics: ['Format'],
                        basicstyles: ['Superscript', 'Subscript', 'Italic', 'Bold', 'Underline', 'Strike'],
                        blockstyles: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                        list: ['NumberedList', 'BulletedList'],
                        paste: ['PasteFromWord'],
                        links: ['Link'],
                        insert: ['Table'],
                        styles: ['Styles'],
                        code: ['Source']
                    },
                    toolbar,
                    plugins = ['justify', 'format', 'sourcearea', 'link', 'table', 'pastefromword', 'autogrow'],
                    icons = {
                        Format: 'font',
                        Strike: 'strikethrough',
                        JustifyLeft: 'align-left',
                        JustifyCenter: 'align-center',
                        JustifyRight: 'align-right',
                        JustifyBlock: 'align-justify',
                        NumberedList: 'list-ol',
                        BulletedList: 'list',
                        PasteFromWord: 'clipboard',
                        Styles: 'header',
                        Source: 'code'
                    },
                    relations = {
                        Link: ['Unlink']
                    },

                    /**
                     * Expands a given toolbar. Iterates over all sections and
                     * all section items in the toolbar. If there is a relation
                     * defined for a section item it adds all items of the relations
                     * to that section.
                     *
                     * @param {Object} toolbar The toolbar to expand
                     * @returns {Object} the expanded toolbar
                     */
                    expandToolbar = function(toolbar) {
                        var expandedToolbar = {}, expandedSection;

                        Util.each(toolbar, function(sectionName, section) {
                            expandedSection = [];

                            Util.foreach(section, function(sectionItem) {
                                expandedSection.push(sectionItem);
                                if (!!relations[sectionItem]) {
                                    expandedSection = expandedSection.concat(relations[sectionItem]);
                                }
                            }.bind(this));

                            expandedToolbar[sectionName] = expandedSection;
                        }.bind(this));

                        return expandedToolbar;
                    };

                app.sandbox.ckeditor = {

                    addPlugin: function(name, plugin) {
                        plugins.push(name);

                        CKEDITOR.plugins.add(name, plugin);
                    },

                    addToolbarButton: function(sectionName, button, icon, buttonRelations) {
                        if (!availableToolbarSections[sectionName]) {
                            availableToolbarSections[sectionName] = [];
                        }

                        availableToolbarSections[sectionName].push(button);

                        if (!!icon) {
                            icons[button] = icon;
                        }

                        relations[button] = buttonRelations;
                    },

                    setToolbar: function(newToolbar) {
                        toolbar = Util.deepCopy(newToolbar);
                    },

                    getAvailableToolbarSections: function() {
                        return Util.deepCopy(availableToolbarSections);
                    },

                    getToolbar: function() {
                        if (!toolbar) {
                            return expandToolbar(this.getAvailableToolbarSections());
                        }

                        return expandToolbar(toolbar);
                    },

                    getIcon: function(button) {
                        if (icons.hasOwnProperty(button)) {
                            return icons[button];
                        }

                        return button.toLowerCase();
                    },

                    getToolbarBuilder: function() {
                        return new ToolbarBuilder(this.getToolbar());
                    },

                    createToolbarBuilder: function(sections) {
                        var toolbarSections = {};
                        for (var i = 0, length = sections.length; i < length; ++i) {
                            toolbarSections[sections[i].name] = sections[i].items;
                        }

                        return new ToolbarBuilder(toolbarSections);
                    },

                    // callback when editor is ready
                    init: function(selector, callback, config) {
                        var configuration = app.sandbox.util.extend(true, {}, getConfig.call(), config), $editor;
                        configuration.extraPlugins = plugins.join(',');

                        if (!!callback && typeof callback === 'function') {
                            $editor = $(selector).ckeditor(callback, configuration);
                        } else {
                            $editor = $(selector).ckeditor(configuration);
                        }

                        // customize ckeditor dialog appearance on 'dialogDefinition' (=> open)
                        // and filter link/target options
                        CKEDITOR.on('dialogDefinition', function(ev) {
                            // take the dialog name and its definition from the event
                            // data.
                            var dialogName = ev.data.name,
                                dialogDefinition = ev.data.definition;

                            // check if the definition is from the dialog we're
                            // interested in (the "Link" dialog).
                            if (dialogName == 'link') {
                                // get a reference to the "Link Info" and "Target" tab.
                                var infoTab = dialogDefinition.getContents('info'),
                                    targetTab = dialogDefinition.getContents('target'),

                                // get a reference to the link type
                                    linkOptions = infoTab.get('linkType'),
                                    targetOptions = targetTab.get('linkTargetType'),

                                // list of included link options
                                    includedLinkOptions = [
                                        'url',
                                        'email'
                                    ],
                                    selectedLinkOption = [],

                                // list of included link target options
                                    includedTargetOptions = [
                                        'notSet',
                                        '_blank',
                                        '_self'
                                    ],
                                    selectedTargetOptions = [];

                                // just show included link options
                                for (var i = 0; i < linkOptions.items.length; i++) {
                                    if (includedLinkOptions.indexOf(linkOptions.items[i][1]) !== -1) {
                                        selectedLinkOption.push(linkOptions.items[i]);
                                    }
                                }

                                // just show included target options
                                for (var i = 0; i < targetOptions.items.length; i++) {
                                    if (includedTargetOptions.indexOf(targetOptions.items[i][1]) !== -1) {
                                        selectedTargetOptions.push(targetOptions.items[i]);
                                    }
                                }

                                linkOptions.items = selectedLinkOption;
                                targetOptions.items = selectedTargetOptions;
                            }
                        });

                        return $editor.editor;
                    },

                    getInstance: function(id) {
                        var instance = CKEDITOR.instances[id];

                        if (!!instance) {
                            return instance;
                        }
                    }
                };
            }

        };
    });
})();

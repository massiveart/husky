/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/listbox
 */

define(function() {

    'use strict';

    var defaults = {
            instanceName: null,
            visibleItems: 6,
            displayOptions: {
                leftTop: true,
                top: true,
                rightTop: true,
                left: true,
                middle: true,
                right: true,
                leftBottom: true,
                bottom: true,
                rightBottom: true
            },
            translations: {
                noContentSelected: 'listbox.nocontent-selected',
                viewAll: 'public.view-all',
                viewLess: 'public.view-less'
            }
        },

        templates = {
            skeleton: function() {
                return [
                    '<div class="white-box form-element" id="', this.options.ids.container, '">',
                    '    <div class="header">',
                    '        <span class="fa-plus-circle icon left action" id="', this.options.ids.addButton, '"></span>',
                    '            <div class="position', !!this.options.hidePositionElement ? ' hidden' : '', '">',
                    '                <div class="husky-position" id="', this.options.ids.displayOption, '">',
                    '                <div class="top left ', (!this.options.displayOptions.leftTop ? 'inactive' : ''), '" data-position="leftTop"></div>',
                    '                <div class="top middle ', (!this.options.displayOptions.top ? 'inactive' : ''), '" data-position="top"></div>',
                    '                <div class="top right ', (!this.options.displayOptions.rightTop ? 'inactive' : ''), '" data-position="rightTop"></div>',
                    '                <div class="middle left ', (!this.options.displayOptions.left ? 'inactive' : ''), '" data-position="left"></div>',
                    '                <div class="middle middle ', (!this.options.displayOptions.middle ? 'inactive' : ''), '" data-position="middle"></div>',
                    '                <div class="middle right ', (!this.options.displayOptions.right ? 'inactive' : ''), '" data-position="right"></div>',
                    '                <div class="bottom left ', (!this.options.displayOptions.leftBottom ? 'inactive' : ''), '" data-position="leftBottom"></div>',
                    '                <div class="bottom middle ', (!this.options.displayOptions.bottom ? 'inactive' : ''), '" data-position="bottom"></div>',
                    '                <div class="bottom right ', (!this.options.displayOptions.rightBottom ? 'inactive' : ''), '" data-position="rightBottom"></div>',
                    '            </div>',
                    '        </div>',
                    '        <span class="fa-cog icon right border" id="', this.options.ids.configButton, '" style="display:none"></span>',
                    '    </div>',
                    '    <div class="content" id="', this.options.ids.content, '"></div>',
                    '    <div id="', this.options.ids.footer, '"></div>',
                    '</div>'
                ].join('');
            },

            noContent: function() {
                return [
                    '<div class="no-content">',
                    '    <span class="fa-coffee icon"></span>',
                    '    <div class="text">', this.sandbox.translate(this.options.translations.noContentSelected), '</div>',
                    '</div>'
                ].join('');
            },

            footer: function() {
                [
                    '<span>',
                    '    <strong>' + this.itemsVisible + ' </strong>', this.sandbox.translate(this.options.translations.of), ' ',
                    '    <strong>' + this.items.length + ' </strong>', this.sandbox.translate(this.options.translations.visible),
                    '</span>'
                ].join('')
            }
        },

        itembox = {
            render: function() {
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.options.ids = {
                    container: 'listbox-' + this.options.instanceName + '-container',
                    addButton: 'listbox-' + this.options.instanceName + '-add',
                    configButton: 'listbox-' + this.options.instanceName + '-config',
                    displayOption: 'listbox-' + this.options.instanceName + '-display-option',
                    content: 'listbox-' + this.options.instanceName + '-content',
                    footer: 'listbox-' + this.options.instanceName + '-footer',
                    chooseTab: 'listbox-' + this.options.instanceName + '-choose-tab',
                    uploadTab: 'listbox-' + this.options.instanceName + '-upload-tab',
                    gridGroup: 'listbox-' + this.options.instanceName + '-grid-group',
                    loader: 'listbox-' + this.options.instanceName + '-loader',
                    collectionSelect: 'listbox-' + this.options.instanceName + '-collection-select',
                    dropzone: 'listbox-' + this.options.instanceName + '-dropzone'
                };

                this.itemsVisible = this.options.visibleItems;

                this.sandbox.dom.html(this.$el, templates.skeleton.call(this));

                // TODO init container
                this.$content = this.sandbox.dom.find(this.getId('content'), this.$el);
                this.$footer = this.sandbox.dom.find(this.getId('footer'), this.$el);

                this.detachFooter();

                // TODO set preselected values

                this.renderNoContent();
            },

            renderNoContent: function() {
                this.sandbox.dom.html(this.$content, templates.noContent.call(this));
            },

            /**
             * renders the footer and calls a method to bind the events for itself
             */
            renderFooter: function() {
                this.sandbox.dom.html(this.$footer, templates.footer.call(this));

                if (this.itemsVisible < this.items.length) {
                    this.sandbox.dom.append(
                        this.sandbox.dom.find('span', this.$footer),
                        '<strong class="view-all pointer"> (' + this.sandbox.translate(this.options.translations.viewAll) + ')</strong>'
                    );
                } else if (this.itemsVisible > this.options.visibleItems) {
                    this.sandbox.dom.append(
                        this.sandbox.dom.find('span', this.$footer),
                        '<strong class="view-less pointer"> (' + this.sandbox.translate(this.options.translations.viewLess) + ')</strong>'
                    );
                }

                this.sandbox.dom.append(this.$container, this.$footer);
            },

            detachFooter: function() {
                this.sandbox.dom.remove(this.$footer);
            },

            getId: function(type) {
                return ['#', this.options.ids[type]].join('');
            }
        };

    return {
        name: 'itembox',

        initialize: function(app) {
            app.components.addType('itembox', itembox);
        }
    }
});

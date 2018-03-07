/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/ckeditor
 */

/**
 * Overlay for paste-from-word plugin.
 *
 * @class PasteFromWord
 * @constructor
 */
define(['underscore'], function(_) {

    'use strict';

    var defaults = {
        title: 'Paste from Word',
        info: '',
        enterMode: 'P',
        saveCallback: function(content) {
        }
    };

    return {

        templates: {
            form: _.template('<p class="input-description"><%= info %></p><p class="input-description"><%= message %></p><textarea class="form-element"></textarea>')
        },

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults.options, this.options);

            this.initializeDialog();
        },

        initializeDialog: function() {
            var $element = this.sandbox.dom.createElement('<div class="overlay-container"/>');
            this.sandbox.dom.append(this.$el, $element);

            this.sandbox.start([
                {
                    name: 'overlay@husky',
                    options: {
                        openOnStart: true,
                        removeOnClose: true,
                        el: $element,
                        container: this.$el,
                        instanceName: 'paste-from-word',
                        slides: [
                            {
                                title: this.options.title,
                                data: this.templates.form({info: this.options.info, message: this.options.message}),
                                buttons: [
                                    {
                                        type: 'cancel',
                                        align: 'left'
                                    },
                                    {
                                        type: 'ok',
                                        text: 'OK',
                                        align: 'right'
                                    }
                                ],
                                okCallback: function() {
                                    var text = this.$el.find('textarea').val();
                                    // remove all spaces at the begin and end of a line
                                    text = text.replace(/^ +| +$/gm, '');

                                    // replace all breaks with br tag
                                    text = text.replace(/(?:\r\n|\r|\n)/g, '<br/>');

                                    if ('P' === this.options.enterMode) {
                                        // replace all double br tags with paragraphs
                                        text = text.replace(/<br\/><br\/>/g, '</p><p>');
                                        // wrap text with paragraph
                                        text = '<p>' + text + '</p>';
                                    } else if ('DIV' === this.options.enterMode) {
                                        // replace all double br tags with divs
                                        text = text.replace(/<br\/><br\/>/g, '</div><div>');
                                        // wrap text with div
                                        text = '<div>' + text + '</div>';
                                    }

                                    this.options.saveCallback(text);
                                }.bind(this)
                            }
                        ]
                    }
                }
            ]);

            this.sandbox.once('husky.overlay.paste-from-word.opened', function() {
                this.$el.find('textarea').focus();
            }.bind(this));
        }
    };
});

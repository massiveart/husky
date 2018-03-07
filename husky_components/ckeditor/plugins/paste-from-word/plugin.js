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

define(function() {

    'use strict';

    var addText = function(editor, content) {
        var element = editor.document.createElement('p');
        element.setHtml(content);
        editor.insertElement(element);
    };

    return function(sandbox) {
        return {
            init: function(editor) {
                editor.addCommand('pasteFromWordDialog', {
                    dialogName: 'pasteFromWordDialog',
                    exec: function() {
                        var $element = $('<div/>');
                        $('body').append($element);

                        sandbox.start([
                            {
                                name: 'ckeditor/plugins/paste-from-word@husky',
                                options: {
                                    el: $element,
                                    title: editor.lang.pastefromword.title,
                                    info: editor.lang.clipboard.copyError,
                                    enterMode: editor.config.enterMode,
                                    message: editor.lang.clipboard.pasteMsg,
                                    saveCallback: function(content) {
                                        sandbox.stop($element);
                                        addText(editor, content);
                                    }
                                }
                            }
                        ]);
                    }
                });

                editor.ui.addButton(
                    'PasteFromWord',
                    {
                        label: editor.lang.pastefromword.toolbar,
                        command: 'pasteFromWordDialog',
                        toolbar: 'clipboard,50'
                    }
                );
            }
        };
    };
});

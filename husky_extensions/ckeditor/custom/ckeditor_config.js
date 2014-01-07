/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

define([], function() {

    'use strict';

    return {

        toolbarGroups: [
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ] },
            { name: 'links' },
            { name: 'insert' },
            { name: 'forms' },
            { name: 'tools' },
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            { name: 'others' },
            '/',
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
            { name: 'styles' },
            { name: 'colors' },
            { name: 'about' }
        ],

        // Remove some buttons, provided by the standard plugins, which we don't
        // need to have in the Standard(s) toolbar.
        removeButtons: 'Underline,Subscript,Superscript',

        // Se the most common block elements.
        format_tags: 'p;h1;h2;h3;pre',

        // Make dialogs simpler.
        removeDialogTabs: 'image:advanced;link:advanced'

    };
});

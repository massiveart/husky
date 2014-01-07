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
 * @class CKEditor
 * @constructor
 *
 */
define([], function() {

    'use strict';

    var defaults = {

        };

    return {

        initialize: function() {

            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.render();
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {

            this.sandbox.ckeditor.ckeditor(this.$el);

        },



        /**
         * Templates for various parts
         */
        template: {


        }
    };
});

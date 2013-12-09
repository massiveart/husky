/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: column navigation
 * Options:
 *
 * Emits:
 *  husky.column.navigation.initialized
 *  husky.column.navigation.data.loaded
 *  husky.column.navigation.selected
 *
 * Listens:
 */

define([], function() {

    'use strict';

    var defaults = {
        wrapper: {
            height: "300px"
        },
        url: null
    };

    return {

        initialize: function() {

            this.sandbox.logger.log("column navigation initializing ...");
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.render();
            this.load();

            this.sandbox.emit('husky.column.navigation.initialized');
        },

        /**
         * Renders basic structure (wrapper) of column navigation
         */
        render: function() {
            var $wrapper;

            $wrapper = this.sandbox.dom.$('<div/>');
            this.sandbox.dom.addClass($wrapper, 'column-navigation');
            this.sandbox.dom.css($wrapper, 'height', this.options.wrapper.height);

            this.$element = this.sandbox.dom.$(this.options.el);
            this.sandbox.dom.append(this.$element, $wrapper);

            // TODO
            // add and settings button
        },

        /**
         * Loads data from a specific url
         */
        load: function() {

            this.sandbox.util.ajax({

                url: this.options.url,

                error: function(jqXHR, textStatus, errorThrown) {
                    this.sandbox.logger.log("An error occured while fetching data from: " + this.options.url);
                    this.sandbox.logger.log("errorthrown",errorThrown.message);
                }.bind(this),

                success: function(response) {

                    this.data = {};
                    this.data.links = response._links;
                    this.data.embedded = response._embedded;
                    this.data.title = response.title;
                    this.data.id = response.id;
                    this.data.hasSub = response.hasSub;

                    this.sandbox.emit('husky.column.navigation.data.loaded');

                }.bind(this)
            });


        }
    };
});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/input
 */

/**
 * @class Url-Input
 * @constructor
 */
define(['services/husky/url-validator'], function(urlValidator) {
    var defaults = {
            instanceName: 'url-input',
            inputClass: '',
            scheme: 'http://',
            specificPart: ''
        },

        constants = {
            triggerClass: 'drop-down-trigger',
            toggleClass: 'dropdown-toggle',
            schemeClass: 'scheme',
            specificPartClass: 'specific-part-input',
            linkClass: 'link',
            dataKey: 'url-data',
            dataChangedEvent: 'data-changed'
        },

        templates = {
            skeleton: [
                '<div class="front"',
                '<% if (items.length > 1) { %>',
                '     data-aura-component="dropdown@husky"',
                '     data-aura-trigger=".<%= constants.triggerClass %>"',
                '     data-aura-instance-name="<%= options.instanceName %>"',
                '     data-aura-data=\'<%= JSON.stringify(items) %>\'',
                '<% } %>',
                '     >',
                '    <a class="<%= constants.schemeClass %> <%= constants.linkClass %> text text-link"',
                '       href="<%= data.url %>" target="_blank"><%= data.scheme %></a>',
                '<% if (items.length > 1) { %>',
                '    <span class="<%= constants.triggerClass %>">',
                '        <span class="<%= constants.toggleClass %>" style="display: inline-block;"/>',
                '    </span>',
                '<% } %>',
                '</div>',
                '<div class="input">',
                '    <input type="text"',
                '           class="<%= constants.specificPartClass %> <%= options.inputClass %>" ',
                '           value="<%= data.specificPart %>"/>',
                '</div>'
            ].join('')
        };

    return {
        /**
         * Initialize component
         */
        initialize: function() {
            // the array will be extend with all default.schemes if this.options.schemes are set
            if (!this.options.schemes || this.options.schemes.length === 0) {
                this.options.schemes = urlValidator.getDefaultSchemes();
            }

            // merge defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            if (this.getData() === undefined) {
                this.setData({scheme: this.options.scheme, specificPart: this.options.specificPart});
            }

            this.prepareItems(this.options.schemes);
            this.render();
            this.bindCustomEvents();
            this.bindDomEvents();
        },

        /**
         * Prepare schemes to use it in dropdown.
         */
        prepareItems: function(schemes) {
            this.items = this.sandbox.util.arrayMap(schemes, function(scheme) {
                return {
                    id: scheme,
                    name: scheme
                }
            }.bind(this));
        },

        /**
         * Render skeleton of component
         */
        render: function() {
            this.$el.addClass('husky-input');

            this.html(this.sandbox.util.template(templates.skeleton, {
                constants: constants,
                options: this.options,
                data: this.getData(),
                items: this.items
            }));
        },

        /**
         * Bind necessary dom events.
         */
        bindDomEvents: function() {
            this.sandbox.dom.on(
                this.$find('.' + constants.linkClass),
                'click',
                this.linkHandler.bind(this)
            );

            this.sandbox.dom.on(
                this.$find('.' + constants.specificPartClass),
                'keyup',
                this.specificPartChangedHandler.bind(this)
            );

            this.sandbox.dom.on(
                this.$el,
                constants.dataChangedEvent,
                this.dataChangedHandler.bind(this)
            );
        },

        /**
         * Handles click on scheme.
         */
        linkHandler: function() {
            var data = this.getData();
            if (!data.url) {
                return false;
            }
        },

        /**
         * Handles input changed.
         */
        specificPartChangedHandler: function(e) {
            this.sandbox.dom.stopPropagation(e);

            var specificPart = this.$find('.' + constants.specificPartClass).val(),
                data = this.setData({specificPart: specificPart});

            this.$find('.' + constants.schemeClass).attr('href', data.url);
        },

        /**
         * Handles data changed.
         */
        dataChangedHandler: function() {
            var data = this.getData();
            this.$find('.' + constants.specificPartClass).val(data.specificPart);
            this.$find('.' + constants.schemeClass).html(data.scheme);
            this.$find('.' + constants.schemeClass).attr('href', data.url);
        },

        /**
         * Bind necessary aura events.
         */
        bindCustomEvents: function() {
            this.sandbox.on(
                'husky.dropdown.' + this.options.instanceName + '.item.click',
                this.selectSchemeHandler.bind(this)
            );
        },

        /**
         * Handles scheme dropdown value click.
         *
         * @param {{id, name}} item
         */
        selectSchemeHandler: function(item) {
            this.$find('.' + constants.schemeClass).html(item.name);

            var data = this.setData({scheme: item.id});
            this.$find('.' + constants.schemeClass).attr('href', data.url);
        },

        /**
         * Set data to dom-data and generate URL.
         *
         * @param {{scheme, specificPart}} data
         */
        setData: function(data) {
            var newData = this.sandbox.util.extend(true, {}, this.getData(), data);

            newData.url = null;
            if (!!newData.scheme && !!newData.specificPart) {
                newData.url = this.getUrl(newData);
            }

            this.$el.data(constants.dataKey, newData);
            this.$el.trigger('change');

            return newData;
        },

        /**
         * Returns URL generated from given data.
         *
         * @param {{scheme, specificPart}} data
         *
         * @returns {String}
         */
        getUrl: function(data) {
            return data.scheme + data.specificPart;
        },

        /**
         * Returns dom-data.
         *
         * @returns {{scheme, specificPart, url}}
         */
        getData: function() {
            return this.$el.data(constants.dataKey);
        }
    };
});

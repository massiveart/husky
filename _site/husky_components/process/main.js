/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/process
 */

/**
 * @class Process
 * @constructor
 *
 * @params {Object} [options] Configuration object
 * @params {Array} [options.data] Array of processes array items can be strings and/or objects with id and name
 * @params {Number} [options.activeProcess] process to activate at the beginning, can be either the id or the position-index of the process
 */
define([], function() {

    'use strict';

    var defaults = {
            instanceName: 'undefined',
            data: null,
            activeProcess: null
        },

        constants = {
            componentClass: 'husky-process',
            activeClass: 'active',
            firstClass: 'first',
            lastClass: 'last',
            processClass: 'process',
            processNameClass: 'name',
            backClass: 'back',
            frontClass: 'front'
        },

        templates = {
            process: [
                '<div class="process<%= classes %>" data-id="<%= id %>">',
                '   <div class="back"></div>',
                '   <div class="name"><p><%= name %></p></div>',
                '   <div class="front"></div>',
                '</div>'
            ].join('')
        },

        /**
         * namespace for events
         * @type {string}
         */
            eventNamespace = 'husky.process.',

        /**
         * raised after initialization process
         * @event husky.process.<instance-name>.initialize
         */
            INITIALIZED = function() {
            return createEventName.call(this, 'initialized');
        },

        /**
         * listens on and changes the active process
         * @event husky.process.<instance-name>.set-active
         * @param {Number} id or position of the process
         */
            SET_ACTIVE = function() {
            return createEventName.call(this, 'set-active');
        },

        /**
         * listens on and passes the active process to it
         * @event husky.process.<instance-name>.get-active
         * @param {Function} callback to pass the active process to
         */
            GET_ACTIVE = function() {
            return createEventName.call(this, 'get-active');
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
            //merge options with defaults
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.sandbox.dom.addClass(this.$el, constants.componentClass);

            this.setProperties();
            this.parseData();

            this.render();
            this.setProcessWidth();
            this.setProcessActive(this.options.activeProcess);

            this.bindDomEvents();
            this.bindCustomEvents();

            this.sandbox.emit(INITIALIZED.call(this));
        },

        /**
         * Sets the default property values
         */
        setProperties: function() {
            this.data = [];
            this.processes = [];
        },

        /**
         * Brings the passed data into the right format
         */
        parseData: function() {
            var id, name;

            this.sandbox.util.foreach(this.options.data, function(process, i) {
                if (typeof process === 'string') {
                    name = process;
                    id = Math.floor((Math.random() * 10000) + 1);
                } else {
                    name = process.name;
                    id = process.id;
                }
                this.data[i] = {
                    id: id,
                    name: name,
                    origData: this.options.data[i]
                };
            }.bind(this));
        },

        bindDomEvents: function() {
            this.sandbox.dom.on(this.sandbox.dom.$window, 'resize', this.setProcessWidth.bind(this));
        },

        bindCustomEvents: function() {
            this.sandbox.on(SET_ACTIVE.call(this), function(id) {
                this.setProcessActive(id);
            }.bind(this));

            this.sandbox.on(GET_ACTIVE.call(this), function(callback) {
                var processId = this.sandbox.dom.attr(
                    this.sandbox.dom.find('.' + constants.activeClass, this.$el),
                    'data-id'
                );
                if (typeof processId !== 'undefined') {
                    callback(this.getProcessWithId(parseInt(processId, 10)).origData);
                } else {
                    callback(null);
                }
            }.bind(this));
        },

        /**
         * Renders the processes
         */
        render: function() {
            var classes,
                dataLength = this.data.length,
                $element;

            this.sandbox.util.foreach(this.data, function(process, i) {
                classes = '';
                if (i === 0) {
                    classes = ' ' + constants.firstClass;
                } else if (i + 1 === dataLength) {
                    classes = ' ' + constants.lastClass;
                }

                $element = this.sandbox.dom.createElement(_.template(templates.process)({
                    classes: classes,
                    name: process.name,
                    id: process.id
                }));

                this.processes[i] = {
                    name: process.name,
                    id: process.id,
                    $el: $element,
                    origData: process.origData
                };

                this.sandbox.dom.append(this.$el, this.processes[i].$el);
            }.bind(this));
        },

        /**
         * Sets the width of the processes
         */
        setProcessWidth: function() {
            var processWidth = Math.floor(this.sandbox.dom.width(this.$el) / this.processes.length),
                processNameWidth = processWidth - this.sandbox.dom.width(
                    this.sandbox.dom.find('.' + constants.backClass, this.$el)
                ) - this.sandbox.dom.width(
                    this.sandbox.dom.find('.' + constants.frontClass, this.$el)
                );

            //set width of the process container
            this.sandbox.dom.width(this.sandbox.dom.find('.' + constants.processClass, this.$el), processWidth);

            //set the width of the process-name container
            this.sandbox.dom.width(
                this.sandbox.dom.find('.' + constants.processClass + ' .' + constants.processNameClass, this.$el),
                processNameWidth
            );
        },

        /**
         * Returns the process for a given id
         * @param {Number} id
         */
        getProcessWithId: function(id) {
            for (var i = -1, length = this.processes.length; ++i < length;) {
                if (id === this.processes[i].id) {
                    return this.processes[i];
                }
            }
            return null;
        },

        /**
         * Sets a process active
         * @param {Number} id The id of the process - if non existent it takes the param as the index
         */
        setProcessActive: function(id) {
            var process = this.getProcessWithId(id);

            if (process !== null) {
                this.setAllProcessesInactive();
                this.sandbox.dom.addClass(process.$el, constants.activeClass);
            } else if (!!this.processes[(id - 1)]) {
                this.setAllProcessesInactive();
                this.sandbox.dom.addClass(this.processes[(id - 1)].$el, constants.activeClass);
            }
        },

        /**
         * Sets all processes inactive
         */
        setAllProcessesInactive: function() {
            this.sandbox.dom.removeClass(
                this.sandbox.dom.find('.' + constants.activeClass, this.$el),
                constants.activeClass
            );
        }
    };

});

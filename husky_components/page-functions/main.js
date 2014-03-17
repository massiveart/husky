/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/page-functions
 */

/**
 * @class PageFunctions
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.url] url to load data
 * @param {Object} [options.data] data to view
 */
define([], function() {

        'use strict';

        var defaults = {
                url: '', // url to load data
                data: {}
            },

            template = function() {
                return [
                    '<div class="page-function"> ',
                    '   <a href="#" id="<%= id %>"><span class="icon-<%= icon %>"></span></a>',
                    '</div>'
                ].join('');
            },

            /**
             * Namespace of events
             * @type {string}
             */
            eventNamespace = 'husky.page-functions.',

            /**
             * @event husky.page-functions.rendered
             * @description the component has been rendered
             */
            RENDERED = eventNamespace + 'rendered',

            /**
             * @event husky.page-functions.clicked
             * @description link was clicked
             */
            CLICK = eventNamespace + 'clicked',

            /**
             * @event husky.page-functions.show
             * @description displays page functions
             */
            SHOW = eventNamespace+'show',

            /**
             * @event husky.page-functions.hide
             * @description hides page functions
             */
            HIDE = eventNamespace+'hide';

        return {

            view: true,

            initialize: function() {
                this.sandbox.logger.log('initialize', this);
                this.sandbox.logger.log(arguments);

                // extend default options
                this.options = this.sandbox.util.extend({}, defaults, this.options);

                this.render();
            },

            render: function() {
                if (!this.options.data.id) {
                    this.options.data.id = this.sandbox.util.uniqueId();
                }

                this.sandbox.dom.append(this.options.el, this.sandbox.template.parse(template(), this.options.data));

                this.$pageFunction = this.sandbox.dom.find('.page-function', this.$el);

                this.bindDomEvents();
                this.bindCustomEvents();

                this.sandbox.emit(RENDERED);
            },

            bindDomEvents: function() {
                this.sandbox.dom.on(this.options.el, 'click', function(e) {
                    e.preventDefault();
                    this.sandbox.emit(CLICK);

                    return false;
                }.bind(this), '#' + this.options.data.id);
            },

            bindCustomEvents: function(){
                this.sandbox.on(HIDE, function(){


                    this.elWidth = this.sandbox.dom.width(this.$pageFunction);
                    this.sandbox.dom.animate(this.$pageFunction,{
                        width:0
                    },{
                        duration:400
                    });

                }.bind(this));

                this.sandbox.on(SHOW, function(){

                    if(!!this.elWidth){
                        this.sandbox.dom.animate(this.$pageFunction,{
                            width:this.elWidth+'px'
                        },{
                            duration:400,
                            queue: false
                        });
                    }

                }.bind(this));
            }
        };
    }
);

/*****************************************************************************
 *
 *  Loader
 *  makes use of bouncing balls of http://tobiasahlin.com/spinkit/
 *
 *  Options (defaults)
 *      - size: size of element
 *      - color: color of bouncers
 *      - hidden: hide component on load
 *  Provides Events
 *      - husky.loader.show - shows loader
 *      - husky.loader.hide - hides loader
 *
 *  TODO: write tests
 *
 *****************************************************************************/



/**
 * @class Loader
 * @constructor
 *
 * @param {Object} [options] Configuration object
 * @param {String} [options.size] size of the spinner
 * @param {String} [options.color] color of the spinner
 */
define(function() {

    'use strict';

    var defaults = {
        size: '40px',
        color: '#666',
        hidden: false
        },

        namespace = 'husky.loader.',

        /**
         * makes loader visible
         *
         * @event husky.loader.show
         */
        SHOW = namespace + 'show',

        /**
         * hides the loader
         *
         * @event husky.loader.hide
         */
        HIDE = namespace + 'hide',

        /**
         * called when loader is initialized
         *
         * @event husky.loader.initialized
         */
        INITIALIZED = namespace + 'initialized',

        templates = {
            doubleBounce: [
                '<div class="spinner">',
                    '<div class="double-bounce1"></div>',
                    '<div class="double-bounce2"></div>',
                '</div>'].join('')
        },

        bindCustomEvents = function() {
            this.sandbox.on(SHOW, showLoader.bind(this));
            this.sandbox.on(HIDE, hideLoader.bind(this));
        },

        hideLoader = function() {
            this.sandbox.dom.hide(this.$spinner);
        },
        showLoader = function() {
            this.sandbox.dom.show(this.$spinner);
        };

    return {

        view: true,

        initialize: function() {
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.render();

            bindCustomEvents.call(this);

            this.sandbox.emit(INITIALIZED);
        },

        render: function() {
            this.$spinner = this.sandbox.dom.createElement(templates.doubleBounce);
            var $elements, styles;

            this.sandbox.dom.html(this.$el, this.$spinner);

            // style adjustments
            // size
            styles = {
                width: this.options.size,
                height: this.options.size
            };
            this.sandbox.dom.css(this.$spinner, styles);
            // color
            $elements = this.sandbox.dom.find('div', this.$spinner);
            this.sandbox.dom.css($elements, 'background-color', this.options.color);
            // visibility
            if (this.options.hidden) {
                this.sandbox.dom.hide(this.$spinner);
            }
        }
    };

});

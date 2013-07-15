(function($, window, document, undefined) {
    'use strict';

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
                if (i in this) {
                    fn.call(scope, this[i], i, this);
                }
            }
        };
    }

    if (!Function.prototype.bind) {
        /**
         * @link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         */
        Function.prototype.bind = function(oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var Args = Array.prototype.slice.call(arguments, 1),
                ToBind = this,
                NOP = function() {
                },
                Bound = function() {
                    return ToBind.apply(this instanceof NOP ? this : oThis || window, Args.concat(Array.prototype.slice.call(arguments)));
                };

            NOP.prototype = this.prototype;
            Bound.prototype = new NOP();

            return Bound;
        };
    }


    var Husky = {
        version: '0.1.0',

        ui: {},
        util: {}
    };


    // Debug configuration
    Husky.DEBUG = false;
    

    window.Husky = Husky;

})(window.jQuery, window, document);
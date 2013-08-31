define([
    'bower_components/aura/lib/aura'
], function(Aura) {

    'use strict';

    // Husky - subclass of Aura
    function Husky(config) {

        if (!(this instanceof Husky)) {
            return new Husky(config);
        }

        Aura.call(this, config);  // call super constructor.

        var app = this;

        app.components.addSource('husky', './husky_components');

    }

    // subclass extends superclass
    Husky.prototype = Object.create(Aura.prototype);
    Husky.prototype.constructor = Husky;

    return Husky;
});

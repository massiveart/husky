define([
    'bower_components/aura/lib/aura'
], function(Aura) {

    'use strict';

    // husky - subclass of aurajs
    function Husky(config) {

        if (!(this instanceof Husky)) {
            return new Husky(config);
        }

        Aura.call(this, config);  // call super constructor.

        var app = this;

        app.components.addSource('husky', './husky_components');

        app.use('./husky_extensions/sandbox');
        app.use('./husky_extensions/backbone');
        app.use('./husky_extensions/collection');
        app.use('./husky_extensions/model');

    }

    // subclass extends superclass
    Husky.prototype = Object.create(Aura.prototype);
    Husky.prototype.constructor = Husky;

    return Husky;
});

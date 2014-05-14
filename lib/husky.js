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

        app.use('./husky_extensions/jquery');
        app.use('./husky_extensions/backbone');
        app.use('./husky_extensions/collection');
        app.use('./husky_extensions/model');
        app.use('./husky_extensions/html5sortable');
        app.use('./husky_extensions/husky-validation');
        app.use('./husky_extensions/util');
        app.use('./husky_extensions/template');
        app.use('./husky_extensions/globalize');
        app.use('./husky_extensions/uri-template');
        app.use('./husky_extensions/ckeditor-extension');
		app.use('./husky_extensions/typeahead');
        app.use('./husky_extensions/tagmanager');
        app.use('./husky_extensions/dropzone');

    }

    // subclass extends superclass
    Husky.prototype = Object.create(Aura.prototype);
    Husky.prototype.constructor = Husky;

    // Husky version flag
    Husky.prototype.version = '0.1.0';

    return Husky;
});

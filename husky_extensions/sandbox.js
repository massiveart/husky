define({
    name: 'Sandbox',

    initialize: function(app) {
        define('sandbox', [], function() {
            return app.sandbox;
        });
    }
});

define(function() {

    // simplified backbone collection
    var Collection = {
        byId: {},
        objs: [],

        add: function(obj) {
            this.byId[obj.id] = obj;
            this.objs.push(obj);
        },

        get: function(obj) {
            return this.byId[obj.id || obj];
        }
    };

    return {

        name: 'Collection',

        initialize: function(app) {
            app.sandbox.data.Collection = Collection;
        }

    }
});

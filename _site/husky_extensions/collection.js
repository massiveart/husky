/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */
define(function() {

    'use strict';

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

    };
});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

/**
 * Introduces functionality used by multiple components, which are displaying some items in a list
 */
define(function() {

    'use strict';

    function DummyStorage(name) {
        this.name = name;
    }

    DummyStorage.prototype.set = function(key, value) {
    };

    DummyStorage.prototype.get = function(key, defaultValue) {
        return defaultValue;
    };

    DummyStorage.prototype.has = function(key) {
        return false;
    };

    function ArrayStorage(name) {
        this.values = {};
        this.name = name;
    }

    ArrayStorage.prototype.set = function(key, value) {
        this.values[key] = value;
    };

    ArrayStorage.prototype.get = function(key, defaultValue) {
        if (!this.values[key]) {
            return defaultValue;
        }

        return this.values[key];
    };

    ArrayStorage.prototype.has = function(key) {
        return !!this.values[key];
    };

    return {

        storages: {},

        create: function(name) {
            if (!!this.storages[name]) {
                return this.storages[name];
            }

            return this.storages[name] = new ArrayStorage(name);
        },

        createDummy: function(name) {
            return new ArrayStorage(name);
        }
    };
});

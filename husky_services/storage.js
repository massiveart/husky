/*
 * This file is part of Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function() {

    'use strict';

    function Storage() {
        this.values = {};
    }

    Storage.prototype.set = function(key, value) {
        this.values[key] = value;
    };

    Storage.prototype.remove = function(key, value) {
        delete this.values[key];
    };

    Storage.prototype.has = function(key) {
        return this.values.hasOwnProperty(key);
    };

    Storage.prototype.get = function(key) {
        if (!this.has(key)) {
            throw 'Value for key "' + key + '" does not exist';
        }

        return this.values[key];
    };

    Storage.prototype.getWithDefault = function(key, defaultValue) {
        if (!this.has(key)) {
            return defaultValue;
        }

        return this.get(key);
    };

    function StorageService() {
        this.storages = {};
    }

    StorageService.prototype.get = function(type, instanceName) {
        var key = type + '.' + instanceName;
        if (!this.storages.hasOwnProperty(key)) {
            this.storages[key] = new Storage();
        }

        return this.storages[key];
    };

    return new StorageService();
});

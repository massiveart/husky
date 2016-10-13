/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(['underscore', 'services/husky/logger'], function(_, Logger) {

    'use strict';

    function Expression() {
    }

    /**
     * Evaluates the given display-conditions against the condition-data.
     *
     * @param {[{property, operator, value}]} displayConditions
     * @param {Object} values
     *
     * @returns {boolean}
     */
    Expression.prototype.evaluate = function(displayConditions, values) {
        for (var i = 0, length = displayConditions.length; i < length; i++) {
            var item = _.extend(
                {
                    property: null,
                    operator: null,
                    value: null
                },
                displayConditions[i]
            );

            if (!values.hasOwnProperty(item.property)) {
                Logger.warn('property "' + item.property + '" does not exists in data');

                return false;
            }

            switch (item.operator) {
                case 'eq':
                    if (values[item.property] !== item.value) {
                        return false;
                    }
                    break;
                case 'neq':
                    if (values[item.property] === item.value) {
                        return false;
                    }
                    break;
                default:
                    Logger.error('operator "' + item.operator + '" is not implemented.');

                    return false;
            }
        }

        return true;
    };

    return new Expression();
});

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
 * @deprecated use util-service instead
 */
define(['services/husky/util'], function(Util) {

    'use strict';

    return {
        name: 'Util',

        initialize: function(app) {
            app.core.util.compare = Util.compare;

            app.core.util.typeOf = Util.typeOf;

            app.core.util.isEqual = Util.isEqual;

            app.core.util.isEmpty = Util.isEmpty;

            app.core.util.foreach = Util.foreach;

            app.core.util.load = Util.load;

            app.core.util.save = Util.save;

            app.core.util.cropMiddle = Util.cropMiddle,

            app.core.util.cropFront = Util.cropFront,

            app.core.util.cropTail = Util.cropTail,

            app.core.util.contains = Util.contains;

            app.core.util.isAlphaNumeric = Util.isAlphaNumeric;

            app.core.util.uniqueId = Util.uniqueId;

            app.core.util.delay = Util.delay;

            app.core.util.union = Util.union;

            app.core.util.deepCopy = Util.deepCopy;

            app.core.util.getParameterByName =  Util.getParameterByName;

			app.core.util.template = Util.template;

            app.core.util.escapeHtml = Util.escapeHtml;

            app.core.util.arrayGetColumn = Util.arrayGetColumn;

            app.core.util.removeFromArray = Util.removeFromArray;
        }
    };
});

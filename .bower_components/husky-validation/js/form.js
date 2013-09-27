/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

require.config({
    paths: {
        'form': 'js/form',
        'form/mapper': 'js/mapper',
        'form/validation': 'js/validation',
        'form/element': 'js/element',
        'form/util': 'js/util',

        'type/default': 'js/types/default',
        'type/string': 'js/types/string',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',
        'type/label': 'js/types/label',

        'validator/default': 'js/validators/default',
        'validator/min': 'js/validators/min',
        'validator/max': 'js/validators/max',
        'validator/minLength': 'js/validators/min-length',
        'validator/maxLength': 'js/validators/max-length',
        'validator/required': 'js/validators/required',
        'validator/unique': 'js/validators/unique'
    }
});

define([
    'form/element',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, Validation, Mapper, Util) {

    'use strict';

    return function(el, options) {
        var defaults = {
                //language: 'de',                // language
                debug: false,                     // debug on/off
                validation: true,                 // validation on/off
                validationTrigger: 'focusout',    // default validate trigger
                validationAddClassesParent: true, // add classes to parent element
                validationAddClasses: true,       // add error and success classes
                validationSubmitEvent: true,      // avoid submit if not valid
                mapper: true                      // mapper on/off
            },

        // private functions
            that = {
                initialize: function() {
                    this.$el = $(el);
                    this.options = $.extend(defaults, this.$el.data(), options);

                    // set culture
                    //require(['cultures/globalize.culture.' + this.options.language], function() {
                    //    Globalize.culture(this.options.language);
                    //}.bind(this));

                    // enable / disable debug
                    Util.debugEnabled = this.options.debug;

                    that.initFields.call(this);

                    if (!!this.options.validation) {
                        this.validation = new Validation(this);
                    }

                    if (!!this.options.mapper) {
                        this.mapper = new Mapper(this);
                    }

                    this.$el.data('form-object', this);
                    Util.debug('Form', this);
                    Util.debug('Elements', this.elements);
                },

                // initialize field objects
                initFields: function() {
                    $.each(Util.getFields(this.$el), function(key, value) {
                        this.addField.call(this, value);
                    }.bind(this));
                },

                bindValidationDomEvents: function() {
                    if (!!this.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        this.$el.on('submit', function() {
                            return this.validation.validate();
                        }.bind(this));
                    }
                }
            },

            result = {
                elements: [],
                options: {},
                validation: false,
                mapper: false,

                addField: function(selector) {
                    var $element = $(selector),
                        options = Util.parseData($element, '', this.options),
                        element = new Element($element, this, options);

                    this.elements.push(element);
                    Util.debug('Element created', options);
                    return element;
                },

                removeField: function(selector) {
                    var $element = $(selector),
                        element = $element.data('element');

                    this.elements.splice(this.elements.indexOf(element), 1);
                }
            };

        that.initialize.call(result);
        return result;
    };

});

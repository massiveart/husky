/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define(['form/util'], function(Util) {

    'use strict';

    return function(el, form, options) {

        var defaults = {
                type: 'string',
                validationTrigger: 'focusout',                     // default validate trigger
                validationAddClasses: true,                        // add error and success classes
                validationAddClassesParent: true,                  // add classes to parent element
                validationSuccessClass: 'husky-validate-success',  // success class
                validationErrorClass: 'husky-validate-error',      // error class
                validationClass: 'husky-validate',                 // default class
                validation: true                                   // validation on/off
            },
            ignoredOptions = [
                'validation',
                'validationTrigger',
                'validationAddClasses',
                'validationAddClassesParent',
                'validationClass',
                'validationSuccessClass',
                'validationErrorClass',
                'validationSubmitEvent'
            ],
            valid,
            validators = {},
            type,
            lastValue = null,
            dfd = null,

            that = {
                initialize: function() {
                    dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    this.$el = $(el);

                    // set data element
                    this.$el.data('element', this);

                    this.options = $.extend({}, defaults, options);

                    if (!!this.options.validationAddClasses) {
                        this.$el.addClass(this.options.validationClass);
                    }

                    // init validation if necessary
                    if (!!this.options.validation) {
                        that.initValidation.call(this);
                    }
                },

                resolveInitialization: function() {
                    this.requireCounter--;
                    if (this.requireCounter === 0) {
                        dfd.resolve();
                    }
                },

                initValidation: function() {
                    that.bindValidationDomEvents.call(this);

                    that.initValidators.call(this);
                    that.initType.call(this);
                },

                bindValidationDomEvents: function() {
                    // build trigger
                    var triggers = ( !this.options.validationTrigger ? '' : this.options.validationTrigger );

                    // break if no trigger is set
                    if (triggers === '' || triggers === 'none') {
                        return;
                    }

                    // always bind change event, for better UX when a select is invalid
                    if (this.$el.is('select')) {
                        triggers += new RegExp('change', 'i').test(triggers) ? '' : ' change';
                    }

                    // trim triggers to bind them correctly with .on()
                    triggers = triggers.replace(/^\s+/g, '').replace(/\s+$/g, '');

                    // bind event
                    this.$el.bind(triggers, this.validate.bind(this));
                },

                initValidators: function() {
                    // create validators for each of the constraints
                    $.each(this.options, function(key, val) {
                        // val not false
                        // key is not ignored
                        // and key starts with validation
                        if (!!val && $.inArray(key, ignoredOptions) === -1 && Util.startsWith(key, 'validation')) {
                            // filter validation prefix
                            var name = Util.lcFirst(key.replace('validation', ''));
                            this.requireCounter++;
                            require(['validator/' + name], function(Validator) {
                                var options = Util.buildOptions(this.options, 'validation', name);
                                validators[name] = new Validator(this.$el, form, options);
                                Util.debug('Element Validator', key, options);
                                that.resolveInitialization.call(this);
                            }.bind(this));
                        }
                    }.bind(this));
                },

                initType: function() {
                    // if type exists
                    if (!!this.options.type) {
                        this.requireCounter++;
                        require(['type/' + this.options.type], function(Type) {
                            var options = Util.buildOptions(this.options, 'type');
                            type = new Type(this.$el, options);
                            Util.debug('Element Type', type, options);
                            that.resolveInitialization.call(this);
                        }.bind(this));
                    }
                },

                hasConstraints: function() {
                    return Object.keys(validators).length > 0 || (type !== null && type.needsValidation());
                },

                needsValidation: function() {
                    return lastValue !== this.$el.val();
                },

                reset: function() {
                    var $element = this.$el;
                    if (!!this.options.validationAddClassesParent) {
                        $element = $element.parent();
                    }
                    $element.removeClass(this.options.validationSuccessClass);
                    $element.removeClass(this.options.validationErrorClass);
                },

                setValid: function(state) {
                    valid = state;
                    if (!!this.options.validationAddClasses) {
                        that.reset.call(this);

                        var $element = this.$el;
                        if (!!this.options.validationAddClassesParent) {
                            $element = $element.parent();
                        }
                        if (!!state) {
                            $element.addClass(this.options.validationSuccessClass);
                        } else {
                            $element.addClass(this.options.validationErrorClass);
                        }
                    }
                }
            },

            result = {
                validate: function(force) {
                    // only if value changed or force is set
                    if (force || that.needsValidation.call(this)) {
                        if (!that.hasConstraints.call(this)) {
                            // delete state
                            that.reset.call(this);
                            return true;
                        }

                        var result = true;
                        // check each validator
                        $.each(validators, function(key, validator) {
                            if (!validator.validate()) {
                                result = false;
                                // TODO Messages
                            }
                        });

                        // check type
                        if (type !== null && !type.validate()) {
                            result = false;
                        }

                        that.setValid.call(this, result);
                    }
                    return this.isValid();
                },

                isValid: function() {
                    return valid;
                },

                updateConstraint: function(name, options) {
                    if ($.inArray(name, Object.keys(validators)) > -1) {
                        validators[name].updateConstraint(options);
                        this.validate();
                    } else {
                        throw 'No constraint with name: ' + name;
                    }
                },

                deleteConstraint: function(name) {
                    if ($.inArray(name, Object.keys(validators)) > -1) {
                        delete validators[name];
                        this.validate(true);
                    } else {
                        throw 'No constraint with name: ' + name;
                    }
                },

                addConstraint: function(name, options) {
                    if ($.inArray(name, Object.keys(validators)) === -1) {
                        require(['validator/' + name], function(Validator) {
                            validators[name] = new Validator(this.$el, form, options);
                        }.bind(this));
                    } else {
                        throw 'Constraint with name: ' + name + ' already exists';
                    }
                },

                setValue: function(value) {
                    type.setValue(value);
                },

                getValue: function(data) {
                    return type.getValue(data);
                }
            };

        that.initialize.call(result);
        return result;
    };

});

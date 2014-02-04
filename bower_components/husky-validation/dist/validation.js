
/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/util',[], function() {

    

    var ignoredKeys = [
        'form',
        'validation'
    ];

    return {
        debugEnabled: false,

        // get form fields
        getFields: function(element) {
            return $(element).find('input:not([data-form="false"], [type="submit"], [type="button"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"], *[data-type="collection"], *[contenteditable="true"]');
        },

        /**
         * Parses the data of a element
         * Inspired by aurajs <http://aurajs.com>
         */
        parseData: function(el, namespace, defaults) {
            var $el = $(el);
            return this.buildOptions($el.data(), namespace, '', defaults);
        },

        /**
         * Build options for given data
         * Inspired by aurajs <http://aurajs.com>
         *
         * TODO Example
         */
        buildOptions: function(data, namespace, subNamespace, defaults) {
            if (!subNamespace) {
                subNamespace = '';
            }

            if (!defaults) {
                defaults = {};
            }

            var options = $.extend({}, defaults, {}),
                fullNamespace = namespace + this.ucFirst(subNamespace);

            $.each(data, function(key, value) {
                var regExp = new RegExp('^' + fullNamespace);
                if (regExp.test(key)) {
                    if ($.inArray(key, ignoredKeys) === -1) {
                        if (key !== fullNamespace) {
                            key = key.replace(regExp, '');
                        } else {
                            key = key.replace(new RegExp('^' + namespace), '');
                        }
                        if (key !== '') {
                            key = this.lcFirst(key);
                            options[key] = value;
                        }
                    }
                }
            }.bind(this));

            return options;
        },

        /**
         * returns true if .val can be used to this dom object
         * @param el {String|Object} valid selector or dom-object
         * @returns {Boolean}
         */
        isValueField: function(el) {
            var $el = $(el);

            return $el.is('input, select, textarea, option, button');
        },

        /**
         * Returns input values for elements
         * @param el {String|Object} valid selector or dom-object
         * @returns {String} value or empty string
         */
        getValue: function(el) {
            var $el = $(el);
            if (this.isValueField($el)) {
                return $el.val();
            } else {
                return $el.html();
            }
        },

        /**
         * Sets a value for an element
         * @param el {String|Object} valid selector or dom-object to set the value for
         * @param value {String|Number} value to insert
         */
        setValue: function(el, value) {
            var $el = $(el);
            if (this.isValueField($el)) {
                $el.val(value);
            } else {
                $el.html(value);
            }
        },

        debug: function(p1, p2, p3) {
            if (!!this.debugEnabled) {
                if (!!p1) {
                    if (!!p2) {
                        if (!!p3) {
                            console.log('Husky Validation:', p1, p2, p3);
                        } else {
                            console.log('Husky Validation:', p1, p2);
                        }
                    } else {
                        console.log('Husky Validation:', p1);
                    }
                } else {
                    console.log('Husky Validation');
                }
            }
        },

        /**
         *  JavaScript equivalent of PHP’s ucfirst
         *  inspired by http://kevin.vanzonneveld.net
         */
        ucFirst: function(str) {
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        },

        lcFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        startsWith: function(str, starts) {
            return str.indexOf(starts) === 0;
        },

        /**
         * Prints object
         */
        print: function(object, stage) {
            if (!stage) {
                stage = 1;
            }

            var str = '',
                oneIndent = '&nbsp;&nbsp;&nbsp;&nbsp;',
                property, value,
                indent = '',
                i = 0;

            while (i < stage) {
                indent += oneIndent;
                i++;
            }

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    value = object[property];
                    if (typeof value === 'string') {
                        if (this.isNumeric(value)) {
                            str += indent + property + ': ' + value + '; </br>';
                        } else {
                            if (value.length > 7) {
                                value = value.substring(0, 6) + ' ...';
                            }
                            str += indent + property + ': \'' + value + '\'; </br>';
                        }
                    } else {
                        str += indent + property + ': { </br>' + indent + oneIndent + print(value, stage++) + '}';
                    }
                }
            }

            return str;
        },

        isNumeric: function(str) {
            return str.match(/-?\d+(.\d+)?/);
        }

    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/element',['form/util'], function(Util) {

    

    return function(el, form, options) {

        var defaults = {
                type: null,
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
                    var addFunction = function(name, options) {
                        this.requireCounter++;
                        require(['validator/' + name], function(Validator) {
                            validators[name] = new Validator(this.$el, form, this, options);
                            Util.debug('Element Validator', name, options);
                            that.resolveInitialization.call(this);
                        }.bind(this));
                    }.bind(this);

                    // create validators for each of the constraints
                    $.each(this.options, function(key, val) {
                        // val not false
                        // key is not ignored
                        // and key starts with validation
                        if (!!val && $.inArray(key, ignoredOptions) === -1 && Util.startsWith(key, 'validation')) {
                            // filter validation prefix
                            var name = Util.lcFirst(key.replace('validation', '')),
                                options = Util.buildOptions(this.options, 'validation', name);

                            addFunction(name, options);
                        }
                    }.bind(this));

                    // HTML 5 attributes
                    // required
                    if (this.$el.attr('required') === 'required' && !validators.required) {
                        addFunction('required', {required: true});
                    }
                    // min
                    if (!!this.$el.attr('min') && !validators.min) {
                        addFunction('min', {min: parseInt(this.$el.attr('min'), 10)});
                    }
                    // max
                    if (!!this.$el.attr('max') && !validators.max) {
                        addFunction('max', {max: parseInt(this.$el.attr('max'), 10)});
                    }
                    // regex
                    if (!!this.$el.attr('pattern') && !validators.pattern) {
                        addFunction('regex', {regex: this.$el.attr('pattern')});
                    }
                },

                initType: function() {
                    var addFunction = function(typeName, options) {
                            this.requireCounter++;
                            require(['type/' + typeName], function(Type) {
                                type = new Type(this.$el, options);
                                Util.debug('Element Type', typeName, options);
                                that.resolveInitialization.call(this);
                            }.bind(this));
                        }.bind(this),
                        options = Util.buildOptions(this.options, 'type'),
                        typeName, tmpType;

                    // FIXME date HTML5 type browser language format

                    // if type exists
                    if (!!this.options.type) {
                        typeName = this.options.type;
                    } else if (!!this.$el.attr('type')) {
                        // HTML5 type attribute
                        tmpType = this.$el.attr('type');
                        if (tmpType === 'email') {
                            typeName = 'email';
                        } else if (tmpType === 'url') {
                            typeName = 'url';
                        } else if (tmpType === 'number') {
                            typeName = 'decimal';
                        } else if (tmpType === 'date') {
                            typeName = 'date';
                            if (!!options.format) {
                                options.format = 'd';
                            }
                        } else if (tmpType === 'time') {
                            typeName = 'date';
                            if (!!options.format) {
                                options.format = 't';
                            }
                        } else if (tmpType === 'datetime') {
                            typeName = 'date';
                        } else {
                            typeName = 'string';
                        }
                    } else {
                        typeName = 'string';
                    }
                    addFunction(typeName, options);
                },

                hasConstraints: function() {
                    var typeConstraint = (!!type && type.needsValidation()),
                        validatorsConstraint = Object.keys(validators).length > 0;

                    return validatorsConstraint || typeConstraint;
                },

                needsValidation: function() {
                    return lastValue !== Util.getValue(this.$el);
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
                            //that.reset.call(this);
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

                        if (!result) {
                            Util.debug('Field validate', !!result ? 'true' : 'false', this.$el);
                        }
                        that.setValid.call(this, result);
                    }
                    return this.isValid();
                },

                update: function() {
                    if (!that.hasConstraints.call(this)) {
                        // delete state
                        //that.reset.call(this);
                        return true;
                    }

                    var result = true;
                    // check each validator
                    $.each(validators, function(key, validator) {
                        if (!validator.update()) {
                            result = false;
                            // TODO Messages
                        }
                    });

                    // check type
                    if (type !== null && !type.validate()) {
                        result = false;
                    }

                    if (!result) {
                        Util.debug('Field validate', !!result ? 'true' : 'false', this.$el);
                    }
                    that.setValid.call(this, result);

                    return result;
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
                            validators[name] = new Validator(this.$el, form, this, options);
                        }.bind(this));
                    } else {
                        throw 'Constraint with name: ' + name + ' already exists';
                    }
                },

                hasConstraint: function(name) {
                    return !!validators[name];
                },

                getConstraint: function(name) {
                    if (!this.hasConstraint(name)) {
                        return false;
                    }
                    return validators[name];
                },

                fieldAdded: function(element) {
                    $.each(validators, function(key, validator) {
                        // FIXME better solution? perhaps only to interested validators?
                        validator.fieldAdded(element);
                    });
                },

                fieldRemoved: function(element) {
                    $.each(validators, function(key, validator) {
                        // FIXME better solution? perhaps only to interested validators?
                        validator.fieldRemoved(element);
                    });
                },

                setValue: function(value) {
                    type.setValue(value);
                },

                getValue: function(data) {
                    return type.getValue(data);
                },

                getType: function() {
                    return type;
                }
            };

        that.initialize.call(result);
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/validation',[
    'form/util'
], function(Util) {

    

    return function(form) {
        var valid,

        // private functions
            that = {
                initialize: function() {
                    that.bindValidationDomEvents.call(this);

                    Util.debug('INIT Validation');
                },

                bindValidationDomEvents: function() {
                    if (!!form.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        form.$el.on('submit', function() {
                            return form.validation.validate();
                        }.bind(this));
                    }
                },

                setValid: function(state) {
                    valid = state;
                }
            },

        // define validation interface
            result = {
                validate: function(force) {
                    var result = true, focus = false;
                    // validate each element
                    $.each(form.elements, function(key, element) {
                        if (!element.validate(force)) {
                            if (!focus) {
                                element.$el.focus();
                                focus = true;
                            }
                            result = false;
                        }
                    });

                    that.setValid.call(this, result);
                    Util.debug('Validation', !!result ? 'success' : 'error');
                    return result;
                },

                isValid: function() {
                    return valid;
                },

                updateConstraint: function(selector, name, options) {
                    var $element = $(selector);
                    if (!!$element.data('element')) {
                        $(selector).data('element').updateConstraint(name, options);
                    } else {
                        throw 'No validation element';
                    }
                },

                deleteConstraint: function(selector, name) {
                    var $element = $(selector);
                    if (!!$element.data('element')) {
                        $element.data('element').deleteConstraint(name);
                    } else {
                        throw 'No validation element';
                    }
                },

                addConstraint: function(selector, name, options) {
                    var $element = $(selector), element;
                    if (!!$element.data('element')) {
                        $element.data('element').addConstraint(name, options);
                    } else {
                        // create a new one
                        element = form.addField(selector);
                        // add constraint
                        element.addConstraint(name, options);
                        form.elements.push(element);
                    }
                }
            };

        that.initialize.call(result);
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/mapper',[
    'form/util'
], function(Util) {

    

    return function(form) {

        var filters = {},

        // private functions
            that = {
                initialize: function() {
                    Util.debug('INIT Mapper');

                    form.initialized.then(function() {
                        var selector = '*[data-type="collection"]',
                            $elements = form.$el.find(selector);

                        $elements.each(that.initCollection.bind(this));
                    });
                },

                initCollection: function(key, value) {
                    var $element = $(value),
                        element = $element.data('element');

                    // save first child element
                    element.$children = $element.children().first().clone();
                    element.$children.find('*').removeAttr('id');

                    // init add button
                    form.$el.on('click', '*[data-mapper-add="' + $element.data('mapper-property') + '"]', that.addClick.bind(this));

                    // init remove button
                    form.$el.on('click', '*[data-mapper-remove="' + $element.data('mapper-property') + '"]', that.removeClick.bind(this));
                },

                addClick: function(event) {
                    var $addButton = $(event.currentTarget),
                        propertyName = $addButton.data('mapper-add'),
                        $collectionElement = $('#' + propertyName),
                        collectionElement = $collectionElement.data('element');

                    if (collectionElement.getType().canAdd()) {
                        that.appendChildren.call(this, $collectionElement, collectionElement.$children);

                        $('#current-counter-' + $collectionElement.data('mapper-property')).text($collectionElement.children().length);
                    }
                },

                removeClick: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = $removeButton.data('mapper-remove'),
                        $collectionElement = $('#' + propertyName),
                        $element = $removeButton.closest('.' + propertyName + '-element'),
                        collectionElement = $collectionElement.data('element');

                    if (collectionElement.getType().canRemove()) {
                        that.remove.call(this, $element);

                        $('#current-counter-' + $collectionElement.data('mapper-property')).text($collectionElement.children().length);
                    }
                },

                processData: function(el) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        property = $el.data('mapper-property'),
                        element = $el.data('element'),
                        result, item;

                    // if type == collection process children, else get value
                    if (type !== 'collection') {
                        if (!!element) {
                            return element.getValue();
                        } else {
                            return null;
                        }
                    } else {
                        result = [];
                        $.each($el.children(), function(key, value) {
                            item = form.mapper.getData($(value));

                            var keys = Object.keys(item);
                            if (keys.length === 1) { // for value only collection
                                if (item[keys[0]] !== '') {
                                    result.push(item[keys[0]]);
                                }
                            } else if (!filters[property] || (!!filters[property] && filters[property](item))) {
                                result.push(item);
                            }
                        });
                        return result;
                    }
                },

                setCollectionData: function(collection, $el) {

                    // remember first child remove the rest
                    var $element = $($el[0]),
                        collectionElement = $element.data('element'),
                        $child = collectionElement.$children,
                        count = collection.length,
                        dfd = $.Deferred(),
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        };

                    // remove children
                    $element.children().each(function(key, value) {
                        that.remove.call(this, $(value));
                    }.bind(this));

                    // foreach collection elements: create a new dom element, call setData recursively
                    $.each(collection, function(key, value) {
                        that.appendChildren($element, $child).then(function($newElement) {
                            form.mapper.setData(value, $newElement).then(function() {
                                resolve();
                            });
                        });
                    });

                    // set current length of collection
                    $('#current-counter-' + $element.data('mapper-property')).text(collection.length);

                    return dfd.promise();
                },

                appendChildren: function($element, $child) {
                    var $newElement = $child.clone(),
                        $newFields = Util.getFields($newElement),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        element;

                    // add fields
                    $.each($newFields, function(key, field) {
                        element = form.addField($(field));
                        element.initialized.then(function() {
                            counter--;
                            if (counter === 0) {
                                $element.append($newElement);
                                dfd.resolve($newElement);
                            }
                        });
                    }.bind(this));

                    return dfd.promise();
                },

                remove: function($element) {
                    // remove all fields of element
                    $.each(Util.getFields($element), function(key, value) {
                        form.removeField(value);
                    }.bind(this));

                    // remove element
                    $element.remove();
                }

            },

        // define mapper interface
            result = {
                setData: function(data, $el) {
                    if (!$el) {
                        $el = form.$el;
                    }

                    var dfd = $.Deferred(),
                        selector,
                        $element,
                        element,
                        count = 1,
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        };

                    if (typeof data !== 'object') {
                        selector = '*[data-mapper-property]';
                        $element = $el.find(selector);
                        element = $element.data('element');
                        // if element is not in form add it
                        if (!element) {
                            element = form.addField($element);
                            element.initialized.then(function() {
                                element.setValue(data);
                                // resolve this set data
                                resolve();
                            });
                        } else {
                            element.setValue(data);
                            // resolve this set data
                            resolve();
                        }
                    } else {
                        count = Object.keys(data).length;
                        $.each(data, function(key, value) {
                            // search field with mapper property
                            var selector = '*[data-mapper-property="' + key + '"]',
                                $element = $el.find(selector),
                                element = $element.data('element');

                            if ($element.length > 0) {
                                // if field is an collection
                                if ($.isArray(value) && $element.data('type') === 'collection') {
                                    that.setCollectionData.call(this, value, $element).then(function() {
                                        resolve();
                                    });
                                } else {
                                    // if element is not in form add it
                                    if (!element) {
                                        element = form.addField($element);
                                        element.initialized.then(function() {
                                            element.setValue(value);
                                            // resolve this set data
                                            resolve();
                                        });
                                    } else {
                                        element.setValue(value);
                                        // resolve this set data
                                        resolve();
                                    }
                                }
                            } else {
                                resolve();
                            }
                        }.bind(this));
                    }

                    return dfd.promise();
                },

                getData: function($el) {
                    if (!$el) {
                        $el = form.$el;
                    }

                    var data = { }, $childElement, property, parts,

                    // search field with mapper property
                        selector = '*[data-mapper-property]',
                        $elements = $el.find(selector);

                    // do it while elements exists
                    while ($elements.length > 0) {
                        // get first
                        $childElement = $($elements.get(0));
                        property = $childElement.data('mapper-property');

                        if (property.match(/.*\..*/)) {
                            parts = property.split('.');
                            data[parts[0]] = {};
                            data[parts[0]][parts[1]] = that.processData.call(this, $childElement);
                        } else {
                            // process it
                            data[property] = that.processData.call(this, $childElement);
                        }

                        // remove element itself
                        $elements = $elements.not($childElement);

                        // remove child elements
                        $elements = $elements.not($childElement.find(selector));
                    }

                    return data;
                },

                addCollectionFilter: function(name, callback) {
                    filters[name] = callback;
                },

                removeCollectionFilter: function(name) {
                    delete filters[name];
                }

            };

        that.initialize.call(result);
        return result;
    };

});

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
        'type/select': 'js/types/select',
        'type/collection': 'js/types/collection',

        'validator/default': 'js/validators/default',
        'validator/min': 'js/validators/min',
        'validator/max': 'js/validators/max',
        'validator/minLength': 'js/validators/min-length',
        'validator/maxLength': 'js/validators/max-length',
        'validator/required': 'js/validators/required',
        'validator/unique': 'js/validators/unique',
        'validator/equal': 'js/validators/equal',
        'validator/regex': 'js/validators/regex'
    }
});

define('form',[
    'form/element',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, Validation, Mapper, Util) {

    

    return function(el, options) {
        var defaults = {
                debug: false,                     // debug on/off
                validation: true,                 // validation on/off
                validationTrigger: 'focusout',    // default validate trigger
                validationAddClassesParent: true, // add classes to parent element
                validationAddClasses: true,       // add error and success classes
                validationSubmitEvent: true,      // avoid submit if not valid
                mapper: true                      // mapper on/off
            },
            dfd = null,

        // private functions
            that = {
                initialize: function() {
                    // init initialized
                    dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    this.$el = $(el);
                    this.options = $.extend(defaults, this.$el.data(), options);

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
                        this.requireCounter++;
                        that.addField.call(this, value, false).initialized.then(function() {
                            that.resolveInitialization.call(this);
                        }.bind(this));
                    }.bind(this));
                },

                resolveInitialization: function() {
                    this.requireCounter--;
                    if (this.requireCounter === 0) {
                        dfd.resolve();
                    }
                },

                bindValidationDomEvents: function() {
                    if (!!this.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        this.$el.on('submit', function() {
                            return this.validation.validate();
                        }.bind(this));
                    }
                },

                addField: function(selector) {
                    var $element = $(selector),
                        options = Util.parseData($element, '', this.options),
                        element = new Element($element, this, options);

                    this.elements.push(element);
                    Util.debug('Element created', options);
                    return element;
                }
            },

            result = {
                elements: [],
                options: {},
                validation: false,
                mapper: false,

                addField: function(selector) {
                    var element = that.addField.call(this, selector);

                    element.initialized.then(function() {
                        // say everybody I have a new field
                        // FIXME better solution?
                        $.each(this.elements, function(key, element) {
                            element.fieldAdded(element);
                        });
                    }.bind(this));

                    return element;
                },

                removeField: function(selector) {
                    var $element = $(selector),
                        el = $element.data('element');

                    // say everybody I have a lost field
                    // FIXME better solution?
                    $.each(this.elements, function(key, element) {
                        element.fieldRemoved(el);
                    });

                    this.elements.splice(this.elements.indexOf(el), 1);
                }
            };

        that.initialize.call(result);
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/default',[
    'form/util'
],function(Util) {

    

    return function($el, defaults, options, name, typeInterface) {

        var that = {
                initialize: function() {
                    this.$el = $el;
                    this.options = $.extend({}, defaults, options);

                    if (!!this.initializeSub) {
                        this.initializeSub();
                    }
                }
            },

            defaultInterface = {
                name: name,

                needsValidation: function() {
                    return true;
                },

                updateConstraint: function(options) {
                    $.extend(this.options, options);
                },

                // mapper functionality set value into input
                setValue: function(value) {
                    Util.setValue(this.$el, this.getViewData.call(this, value));
                },

                // mapper functionality get value from input
                getValue: function() {
                    return this.getModelData.call(this, Util.getValue(this.$el));
                },

                // internationalization of view data: default none
                getViewData: function(value) {
                    return value;
                },

                // internationalization of model data: default none
                getModelData: function(value) {
                    return value;
                }
            },
            result = $.extend({}, defaultInterface, typeInterface);

        that.initialize.call(result);

        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/string',[
    'type/default'
], function(Default) {

    

    return function($el, options) {
        var defaults = { },

            typeInterface = {
                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'string', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/date',[
    'type/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, options) {
        var defaults = {
                format: 'd'     // possibilities f, F, t, T, d, D
            },

            getDate = function(value) {
                Util.debug(value, new Date(value));
                return new Date(value);
            },

            subType = {
                validate: function() {
                    var val = Util.getValue(this.$el), date;
                    if (val === '') {
                        return true;
                    }

                    date = Globalize.parseDate(val, this.options.format);
                    return date !== null;
                },

                needsValidation: function() {
                    var val = Util.getValue(this.$el);
                    return val !== '';
                },

                // internationalization of view data: Globalize library
                getViewData: function(value) {
                    return Globalize.format(getDate(value), this.options.format);
                },

                // internationalization of model data: Globalize library
                getModelData: function(value) {
                    if (value !== '') {
                        var date = Globalize.parseDate(value, this.options.format);
                        return date.toISOString();
                    } else {
                        return value;
                    }
                }
            };

        return new Default($el, defaults, options, 'date', subType);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/decimal',[
    'type/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, options) {
        var defaults = {
                regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
            },

            typeInterface = {
                initializeSub: function() {
                    // TODO internationalization
                },

                validate: function() {
                    var val = Util.getValue(this.$el);

                    if (val === '') {
                        return true;
                    }

                    return this.options.regExp.test(val);
                }
            };

        return new Default($el, defaults, options, 'decimal', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/email',[
    'type/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, options) {
        var defaults = {
                regExp: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i
            },

            typeInterface = {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    if (val === '') {
                        return true;
                    }

                    return this.options.regExp.test(val);
                },

                needsValidation: function() {
                    var val = this.$el.val();
                    return val !== '';
                }
            };

        return new Default($el, defaults, options, 'email', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/url',[
    'type/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, options) {
        var defaults = {
                regExp: /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
            },

            typeInterface = {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    if (val === '') {
                        return true;
                    }

                    if (this.options['url-strict'] !== 'true') {
                        val = new RegExp('(https?|s?ftp|git)', 'i').test(val) ? val : 'http://' + val;
                    }
                    return this.options.regExp.test(val);
                },

                needsValidation: function() {
                    var val = Util.getValue(this.$el);
                    return val !== '';
                }
            };

        return new Default($el, defaults, options, 'email', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/label',[
    'type/default'
], function(Default) {

    

    return function($el, options) {
        var defaults = {
                id: 'id',
                label: 'name',
                translate: true
            },

            typeInterface = {
                setValue: function(value) {
                    if (!!value[this.options.label]) {
                        var label = value[this.options.label],
                            labelValue = value[this.options.label];
                        if (!!this.options.translate) {
                            labelValue = Globalize.localize(label, Globalize.culture().name);
                            if (labelValue === undefined) {
                                labelValue = label;
                            }
                        }
                        this.$el.text(labelValue);
                    }

                    if (!!value[this.options.id]) {
                        this.$el.data(this.options.id, value[this.options.id]);
                    }
                },

                getValue: function() {
                    var result = {};
                    result[this.options.id] = this.$el.data(this.options.id);
                    result[this.options.label] = this.$el.text();
                    return result;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'label', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/select',[
    'type/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, options) {
        var defaults = {
                id: 'id',
                label: 'name'
            },

            typeInterface = {
                setValue: function(value) {
                    this.$el.val(value[this.options.id]);
                },

                getValue: function() {
                    var result = {};
                    result[this.options.id] = Util.getValue(this.$el);
                    result[this.options.label] = this.$el.find('option:selected').text();
                    return result;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'select', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/collection',[
    'type/default'
], function(Default) {

    

    return function($el, options) {
        var defaults = {
                min: 1,
                max: 2
            },

            subType = {
                validate: function() {
                    return true;
                },

                needsValidation: function() {
                    return false;
                },

                canAdd: function() {
                    var length = this.$el.children().length;
                    return length < this.options.max;
                },

                canRemove: function() {
                    var length = this.$el.children().length;
                    return length > this.options.min;
                }
            };

        return new Default($el, defaults, options, 'collection', subType);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/default',[],function() {

    

    return function($el, form, defaults, options, name) {

        return {
            name: name,

            initialize: function() {
                this.$el = $el;
                this.data = $.extend(defaults, this.$el.data(), options);
                this.updateData();

                if (!!this.initializeSub) {
                    this.initializeSub();
                }
            },

            validate: function() {
                // do nothing
            },

            update: function() {
                // do nothing
                return this.validate();
            },

            updateConstraint: function(options) {
                $.extend(this.data, options);
                this.updateData();
            },

            updateData: function() {
                $.each(this.data, function(key, value) {
                    this.$el.data(key, value);
                }.bind(this));
            },

            fieldRemoved: function() {
                // do nothing
            },

            fieldAdded: function() {
                // do nothing
            }
        };

    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/min',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                min: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min'), {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    return Number(val) >= this.data.min;
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/max',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                max: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max'), {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    return Number(val) <= this.data.max;
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/minLength',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                minLength: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min-length'), {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    return val.length >= this.data.minLength;
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/maxLength',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                maxLength: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max-length'), {
                validate: function() {
                    var val = Util.getValue(this.$el);
                    return val.length <= this.data.maxLength;
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/required',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = { },

            result = $.extend(new Default($el, form, defaults, options, 'required'), {
                validate: function(value) {
                    if (!!this.data.required) {
                        var val = value || Util.getValue(this.$el), i;
                        // for checkboxes and select multiples.
                        // check there is at least one required value
                        if ('object' === typeof val) {
                            for (i in val) {
                                if (val.hasOwnProperty(i)) {
                                    if (this.validate(val[i])) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }

                        // notNull && notBlank
                        return val.length > 0 && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
                    }
                    return true;
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/unique',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {

        var defaults = {
                validationUnique: null
            },

        // elements with same group name
            relatedElements = [],

        // is the element related
            isElementRelated = function(element, group) {
                return relatedElements.indexOf(element) && !!element.options.validationUnique && element.options.validationUnique === group;
            },

        // validate all related element
            validateElements = function(val) {
                var result = true;
                $.each(relatedElements, function(key, element) {
                    if (!validateElement(val, element)) {
                        result = false;
                        return false;
                    }
                    return true;
                });
                return result;
            },

        // validate one element
            validateElement = function(val, element) {
                return val !== element.getValue();
            },

        // update all related elements
            updateRelatedElements = function() {
                $.each(relatedElements, function(key, element) {
                    element.update();
                });
            },

            result = $.extend({}, new Default($el, form, defaults, options, 'unique'), {

                initializeSub: function() {
                    // init related elements
                    element.initialized.then(function() {
                        $.each(form.elements, function(key, element) {
                            this.fieldAdded(element);
                        }.bind(this));
                    }.bind(this));
                },

                validate: function() {
                    var val = Util.getValue(this.$el),
                        result;
                    if (!!this.data.unique) {
                        result = validateElements(val);
                        updateRelatedElements();
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                update: function() {
                    var val = Util.getValue(this.$el),
                        result;
                    if (!!this.data.unique) {
                        result = validateElements(val);
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                fieldAdded: function(element) {
                    if (element.$el !== this.$el && isElementRelated(element, this.data.unique)) {
                        Util.debug('field added', this.$el);
                        relatedElements.push(element);
                    }
                },

                fieldRemoved: function(element) {
                    Util.debug('field removed', this.$el);
                    relatedElements = relatedElements.splice(relatedElements.indexOf(element), 1);
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/equal',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                equal: null
            },

        // elements with same group name
            relatedElements = [],

        // is the element related
            isElementRelated = function(element, group) {
                return relatedElements.indexOf(element) && !!element.options.validationEqual && element.options.validationEqual === group;
            },

        // validate all related element
            validateElements = function(val) {
                var result = true;
                $.each(relatedElements, function(key, element) {
                    if (!validateElement(val, element)) {
                        result = false;
                        return false;
                    }
                    return true;
                });
                return result;
            },

        // validate one element
            validateElement = function(val, element) {
                return val === element.getValue();
            },

        // update all related elements
            updateRelatedElements = function() {
                $.each(relatedElements, function(key, element) {
                    element.update();
                });
            },

            result = $.extend(new Default($el, form, defaults, options, 'equal'), {

                initializeSub: function() {
                    // init related elements
                    element.initialized.then(function() {
                        $.each(form.elements, function(key, element) {
                            this.fieldAdded(element);
                        }.bind(this));
                    }.bind(this));
                },

                validate: function() {
                    var val = this.$el.val(),
                        result;
                    if (!!this.data.equal) {
                        result = validateElements(val);
                        updateRelatedElements();
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                update: function() {
                    var val = Util.getValue(this.$el),
                        result;
                    if (!!this.data.equal) {
                        result = validateElements(val);
                        return result;
                    } else {
                        throw 'No option group set';
                    }
                },

                fieldAdded: function(element) {
                    if (element.$el !== this.$el && isElementRelated(element, this.data.equal)) {
                        relatedElements.push(element);
                    }
                },

                fieldRemoved: function(element) {
                    relatedElements = relatedElements.splice(relatedElements.indexOf(element), 1);
                }
            });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/regex',[
    'validator/default',
    'form/util'
], function(Default, Util) {

    

    return function($el, form, element, options) {
        var defaults = {
                regex: /\w*/
            },

            result = $.extend(new Default($el, form, defaults, options, 'regex'), {
                validate: function() {
                    // TODO flags
                    var pattern = this.data.regex,
                        regex = new RegExp(pattern),
                        val = Util.getValue(this.$el);

                    if (val === '') {
                        return true;
                    }

                    return regex.test(val);
                }
            });

        result.initialize();
        return result;
    };

});

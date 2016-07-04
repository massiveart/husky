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

    'use strict';

    var ignoredKeys = [
        'form',
        'validation'
    ];

    return {
        debugEnabled: false,

        // get form fields
        getFields: function(element) {
            return $(element).find('input:not([data-form="false"], [type="submit"], [type="button"], [type="checkbox"], [type="radio"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"], *[data-type="collection"], *[contenteditable="true"]');
        },

        findGroupedFieldsBySelector: function(element, filter) {
            var groupedFields = {}, fieldName;

            $(element).find(filter).each(function(key, field) {
                fieldName = $(field).data('mapper-property');
                if (!groupedFields[fieldName]) {
                    groupedFields[fieldName] = [];
                }
                groupedFields[fieldName].push(field);
            });

            return groupedFields;
        },

        getCheckboxes: function(element) {
            return this.findGroupedFieldsBySelector(element, 'input[type="checkbox"]');
        },

        getRadios: function(element) {
            return this.findGroupedFieldsBySelector(element, 'input[type="radio"]');
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
         * returns true if element is checkbox
         * @param el {String|Object} valid selector or dom-object
         * @returns {Boolean}
         */
        isCheckbox: function(el) {
            var $el = $(el);

            return $el.is(':checkbox');
        },

        /**
         * Returns input values for elements
         * @param el {String|Object} valid selector or dom-object
         * @returns {String} value or empty string
         */
        getValue: function(el) {
            var $el = $(el);
            if (this.isCheckbox($el)) {
                return $el.prop('checked');
            } else if (this.isValueField($el)) {
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
            if (this.isCheckbox($el)) {
                $el.prop('checked', value);
            } else if (this.isValueField($el)) {
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

    'use strict';

    return function(el, form, options) {

        var defaults = {
                type: null,
                validationTrigger: 'focusout',                     // default validate trigger
                validationAddClasses: true,                        // add error and success classes
                validationAddClassesParent: true,                  // add classes to parent element
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
                                type = new Type(this.$el, options, form);

                                type.initialized.then(function() {
                                    Util.debug('Element Type', typeName, options);
                                    that.resolveInitialization.call(this);
                                }.bind(this));

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
                        if (!state) {
                            $element.addClass(this.options.validationErrorClass);
                        }
                    }
                }
            },

            result = {
                validate: function(force) {
                    var result = true,
                        validated = false;

                    // only if value changed or force is set
                    if (force || that.needsValidation.call(this)) {
                        if (that.hasConstraints.call(this)) {
                            // check each validator
                            $.each(validators, function (key, validator) {
                                if (!validator.validate()) {
                                    result = false;
                                    // TODO Messages
                                }
                            });
                            validated = true;
                        }
                    }

                    // check type
                    if (!!type && type.needsValidation()) {
                        if (!type.validate()) {
                            result = false;
                        }
                        validated = true;
                    }

                    // set css classes
                    if (validated === true) {
                        if (!result) {
                            Util.debug('Field validate', !!result ? 'true' : 'false', this.$el);
                        }
                        that.setValid.call(this, result);
                    }

                    return result;
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
                    var dfd = $.Deferred(),
                        result;

                    this.initialized.then(function() {
                        result = type.setValue(value);

                        // if setvalue returns a deferred wait for that
                        if (!!result) {
                            result.then(function() {
                                dfd.resolve();
                            });
                        } else {
                            dfd.resolve();
                        }
                    }.bind(this));

                    return dfd.promise();
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
 * This file is part of Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define('form/elementGroup',[],function() {
    'use strict';

    var setMultipleValue = function(elements, values) {
            elements.forEach(function(element) {
                values.forEach(function(value) {
                    if (element.$el.val() === value) {
                        element.$el.prop('checked', true);
                    }
                });
            });
        },

        setSingleValue = function(elements, value) {
            for (var i = -1; ++i < elements.length;) {
                if (elements[i].$el.val() === value) {
                    elements[i].$el.prop('checked', true);

                    return;
                }
            }
        };

    return function(elements, isSingleValue) {
        var result = {
            getValue: function() {
                var value = [];
                elements.forEach(function(element) {
                    if (element.$el.is(':checked')) {
                        value.push(element.$el.val());
                    }
                });

                if (!!isSingleValue) {
                    if (value.length > 1) {
                        throw new Error('Single value element group cannot return more than one value');
                    }

                    return value[0];
                }

                return value;
            },

            setValue: function(values) {
                if (!!isSingleValue && !!$.isArray(values)) {
                    throw new Error('Single value element cannot be set to an array value');
                }

                if (!isSingleValue && !$.isArray(values)) {
                    throw new Error('Field with multiple values cannot be set to a single value');
                }

                if ($.isArray(values)) {
                    setMultipleValue.call(this, elements, values);
                } else {
                    setSingleValue.call(this, elements, values);
                }
            }
        };

        elements.forEach(function(element) {
            element.$el.data('elementGroup', result);
        });

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

    'use strict';

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
                    var result = true;
                    // validate each element
                    $.each(form.elements, function(key, element) {
                        if (!element.validate(force)) {
                            // TODO: scroll to first invalid element you can't use $.focus because an element mustn't be an input
                            result = false;
                        }
                    });

                    $.each(form.mapper.collections, function(i, collection) {
                        $.each(collection.items, function(j, item) {
                            $.each(item.data('collection').childElements, function(k, childElement) {
                                if (!childElement.validate(force)) {
                                    result = false;
                                }
                            });
                        });
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

    'use strict';

    return function(form) {

        var filters = {},

        // private functions
            that = {
                initialize: function() {
                    Util.debug('INIT Mapper');

                    this.collections = [];
                    this.collectionsSet = {};
                    this.emptyTemplates = {};
                    this.templates = {};

                    form.initialized.then(function() {
                        var selector = '*[data-type="collection"]',
                            $elements = form.$el.find(selector);

                        $elements.each(that.initCollection.bind(this));
                    }.bind(this));
                },

                initCollection: function(key, value) {
                    var $element = $(value),
                        element = $element.data('element'),
                        property = $element.data('mapper-property'),
                        newChild, collection, emptyTemplate,
                        dfd = $.Deferred(),
                        counter = 0,
                        resolve = function() {
                            counter--;
                            if (counter === 0) {
                                dfd.resolve();
                            }
                        };

                    if (!$.isArray(property)) {
                        if (typeof property === 'object') {
                            property = [property];
                            $element.data('mapper-property', property);
                        } else {
                            throw 'no valid mapper-property value';
                        }
                    }

                    // get templates
                    element.$children = $element.children().clone(true);

                    // remove children
                    $element.html('');

                    // add to collections
                    collection = {
                        id: _.uniqueId('collection_'),
                        property: property,
                        $element: $element,
                        element: element,
                        items: []
                    };
                    this.collections.push(collection);

                    counter += element.$children.length;
                    // iterate through collection
                    element.$children.each(function(i, child) {
                        var $child = $(child), propertyName, x, len,
                            propertyCount = 0,
                            resolveElement = function() {
                                propertyCount--;
                                if (propertyCount === 0) {
                                    resolve();
                                }
                            };

                        // attention: template has to be markuped as 'script'
                        if (!$child.is('script')) {
                            throw 'template has to be defined as <script>';
                        }

                        newChild = {tpl: $child.html(), id: $child.attr('id'), collection: collection};
                        element.$children[i] = newChild;

                        for (x = -1, len = property.length; ++x < len;) {
                            if (property[x].tpl === newChild.id) {
                                propertyName = property[x].data;
                                emptyTemplate = property[x]['empty-tpl'];
                            }
                            // if child has empty template, set to empty templates
                            if (property[x]['empty-tpl'] && property[x]['empty-tpl'] === newChild.id) {
                                this.emptyTemplates[property[x].data] = {
                                    id: property[x]['empty-tpl'],
                                    tpl: $child.html()
                                };
                            }
                        }
                        // check if template is set
                        if (!!propertyName) {
                            newChild.propertyName = propertyName;
                            propertyCount = collection.element.getType().getMinOccurs();
                            this.templates[propertyName] = {
                                tpl: newChild,
                                collection: collection,
                                emptyTemplate: emptyTemplate,
                            };
                            // init default children
                            for (x = collection.element.getType().getMinOccurs() + 1; --x > 0;) {
                                that.appendChildren.call(this, collection, newChild).then(function() {
                                    // set counter
                                    $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(newChild.id).length);
                                    resolveElement();
                                }.bind(this));
                            }
                        } else {
                            resolveElement();
                        }
                    }.bind(this));

                    $.each(property, function(i, item) {
                        // init add button
                        form.$el.on('click', '*[data-mapper-add="' + item.data + '"]', that.addClick.bind(this));

                        // init remove button
                        form.$el.on('click', '*[data-mapper-remove="' + item.data + '"]', that.removeClick.bind(this));

                        // emit collection init event after resolve
                        dfd.then(function() {
                            that.emitInitCollectionEvent(item.data);
                        });
                    }.bind(this));

                    that.checkFullAndEmpty.call(this, property[0].data);

                    dfd.then(function() {
                        Util.debug('collection resolved');
                    });

                    return dfd.promise();
                },

                addClick: function(event) {
                    var $addButton = $(event.currentTarget),
                        propertyName = $addButton.data('mapper-add'),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection;

                    if (collection.element.getType().canAdd(tpl.id)) {
                        that.appendChildren.call(this, collection, tpl).then(function() {
                            // set counter
                            $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(tpl.id).length);
                            that.emitAddEvent(propertyName, null);
                        }.bind(this));
                    }
                    that.checkFullAndEmpty.call(this, propertyName);
                },

                addEmptyTemplate: function($element, propertyName) {
                    if (this.emptyTemplates.hasOwnProperty(propertyName)) {
                        var $emptyTemplate = $(this.emptyTemplates[propertyName].tpl);
                        $emptyTemplate.attr('id', this.emptyTemplates[propertyName].id);
                        $element.append($emptyTemplate);
                    }
                },

                removeClick: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = $removeButton.data('mapper-remove'),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection,
                        $element = $removeButton.closest('.' + propertyName + '-element');

                    if (collection.element.getType().canRemove(tpl.id)) {
                        that.remove.call(this, $element);
                        // set counter
                        $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(tpl.id).length);
                        that.emitRemoveEvent(propertyName, null);
                    }
                    that.checkFullAndEmpty.call(this, propertyName);
                },

                checkFullAndEmpty: function(propertyName) {
                    var $addButton = $("[data-mapper-add='" + propertyName + "']"),
                        $removeButton = $("[data-mapper-remove='" + propertyName + "']"),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection,
                        fullClass = collection.element.$el.data('mapper-full-class') || 'full',
                        emptyClass = collection.element.$el.data('mapper-empty-class') || 'empty';

                    $addButton.removeClass(fullClass);
                    $addButton.removeClass(emptyClass);
                    $(collection.element.$el).removeClass(fullClass);
                    $(collection.element.$el).removeClass(emptyClass);

                    if (!!$addButton.length || !!$removeButton.length) {
                        // if no add is possible add full style-classes
                        if (!collection.element.getType().canAdd(tpl.id)) {
                            $addButton.addClass(fullClass);
                            $(collection.element.$el).addClass(fullClass);

                            // else, if no remove is possible add empty style-classes
                        } else if (!collection.element.getType().canRemove(tpl.id)) {
                            $addButton.addClass(emptyClass);
                            $(collection.element.$el).addClass(emptyClass);

                        }
                    }
                },

                emitInitCollectionEvent: function(propertyName) {
                    $(form.$el).trigger('form-collection-init', [propertyName]);
                },

                emitAddEvent: function(propertyName, data) {
                    $(form.$el).trigger('form-add', [propertyName, data]);
                },

                emitRemoveEvent: function(propertyName, data) {
                    $(form.$el).trigger('form-remove', [propertyName, data]);
                },

                processData: function(el, collection, returnMapperId) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        property = $el.data('mapper-property'),
                        element = $el.data('element'),
                        result,
                        filtersAction;


                    if (collection && !!filters[collection.data]) {
                        filtersAction = filters[collection.data];
                    } else if (!!filters[property]) {
                        filtersAction = filters[property];
                    }

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
                            if (!collection || collection.tpl === value.dataset.mapperPropertyTpl) {
                                var elements = $(value).data('collection').childElements,
                                    elementGroups = $(value).data('collection').childElementGroups,
                                    data = {};

                                elements.forEach(function(child) {
                                    that.addDataFromElement.call(this, child, data, returnMapperId);
                                });

                                for (key in elementGroups) {
                                    if (elementGroups.hasOwnProperty(key)) {
                                        data[key] = elementGroups[key].getValue();
                                    }
                                }

                                // only set mapper-id if explicitly set
                                if (!!returnMapperId) {
                                    data.mapperId = value.dataset.mapperId;
                                }

                                var keys = Object.keys(data);
                                if (keys.length === 1) { // for value only collection
                                    if (data[keys[0]] !== '') {
                                        result.push(data[keys[0]]);
                                    }
                                } else if (!filtersAction || filtersAction(data)) {
                                    result.push(data);
                                }
                            }
                        }.bind(this));
                        return result;
                    }
                },

                setCollectionData: function(data, collection) {
                    // remember first child remove the rest
                    var $element = collection.$element,
                        child = this.templates[collection.key].tpl,
                        count = data.length,
                        dfd = $.Deferred(),
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        },
                        x,
                        length;

                    // no element in collection
                    if (count === 0) {
                        // check if empty template exists for that element and show it
                        that.addEmptyTemplate.call(this, $element, child.propertyName);
                        dfd.resolve();
                    } else {
                        if (data.length < collection.element.getType().getMinOccurs()) {
                            for (x = collection.element.getType().getMinOccurs() + 1, length = data.length; --x > length;) {
                                data.push({});
                            }
                        }

                        // FIXME the old DOM elements should be reused, instead of generated over and over again
                        // remove all prefilled items from the collection, because the DOM elements are recreated
                        collection.items = [];

                        // foreach collection elements: create a new dom element, call setData recursively
                        $.each(data, function(key, value) {
                            that.appendChildren.call(this, collection, child, value).then(function($newElement) {
                                that.setData.call(this, value, $newElement).then(function() {
                                    resolve();
                                }.bind(this));
                            }.bind(this));
                        }.bind(this));
                    }

                    // set current length of collection
                    $('#current-counter-' + $element.attr('id')).text(data.length);
                    that.checkFullAndEmpty.call(this, collection.property[0].data);
                    return dfd.promise();
                },

                appendChildren: function(collection, child, tplOptions, data, insertAfter) {
                    var clonedChild = $.extend(true, {}, child),
                        index = clonedChild.collection.element.getType().getChildren(clonedChild.id).length,
                        options = $.extend({}, {index: index}, tplOptions || {}),
                        template = _.template(clonedChild.tpl, options, form.options.delimiter),
                        $template = $(template),
                        $newFields = Util.getFields($template),
                        $radioFields = Util.getRadios($template),
                        $checkboxFields = Util.getCheckboxes($template),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        $element = collection.$element,
                        $lastElement,
                        element;

                    // adding
                    $template.attr('data-mapper-property-tpl', clonedChild.id);
                    $template.attr('data-mapper-id', _.uniqueId());

                    // add template to element
                    if (insertAfter && ($lastElement = $element.find('*[data-mapper-property-tpl="' + clonedChild.id + '"]').last()).length > 0) {
                        $lastElement.after($template);
                    } else {
                        $element.append($template);
                    }

                    clonedChild.collection.childElements = [];
                    clonedChild.collection.childElementGroups = {};
                    // add fields
                    if ($newFields.length > 0) {
                        $newFields.each(function(key, field) {
                            element = form.createField($(field));
                            clonedChild.collection.childElements.push(element);
                            element.initialized.then(function() {
                                counter--;
                                if (counter === 0) {
                                    dfd.resolve($template);
                                }
                            });
                        }.bind(this));
                    } else {
                        dfd.resolve($template);
                    }

                    if (_.size($radioFields) > 0) {
                        $.each($radioFields, function(key, field) {
                            clonedChild.collection.childElementGroups[key] = form.createFieldGroup(field, true);
                        });
                    }
                    if (_.size($checkboxFields) > 0) {
                        $.each($checkboxFields, function(key, field) {
                            clonedChild.collection.childElementGroups[key] = form.createFieldGroup(field, false);
                        });
                    }

                    $template.data('collection', clonedChild.collection);

                    // if automatically set data after initialization ( needed for adding elements afterwards)
                    if (!!data) {
                        dfd.then(function() {
                            that.setData.call(this, data, $newFields);
                        }.bind(this));
                    }

                    collection.items.push($template);

                    return dfd.promise();
                },

                /**
                 * Returns a collection element for a given mapper-id
                 * @param {number} mapperId
                 * @return {Object|null} the dom object or null
                 **/
                getElementByMapperId: function(mapperId) {
                    for (var i = -1, iLength = this.collections.length; ++i < iLength;) {
                        for (var j = -1, jLength = this.collections[i].items.length; ++j < jLength;) {
                            if (this.collections[i].items[j].data('mapper-id') === mapperId) {
                                return this.collections[i].items[j];
                            }
                        }
                    }

                    return null;
                },

                /**
                 * Delets an element from the DOM and the global object by a given unique-id
                 * @param {number} mapperId
                 * @return {boolean|string} if an element was found and deleted it returns its template-name, else it returns false
                 **/
                deleteElementByMapperId: function(mapperId) {
                    var templateName;

                    $.each(this.collections, function(i, collection) {
                        $.each(collection.items, function(j, item) {
                            if (item.data('mapper-id').toString() !== mapperId.toString()) {
                                return true;
                            }

                            templateName = item.attr('data-mapper-property-tpl');
                            item.remove();
                            collection.items.splice(j, 1);

                            return false;
                        });
                    }.bind(this));

                    return templateName;
                },

                remove: function($element) {
                    // remove all fields of element
                    $.each(Util.getFields($element), function(key, value) {
                        form.removeField(value);
                    }.bind(this));

                    // remove element
                    $element.remove();
                },

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
                                element.setValue(data).then(function() {
                                    // resolve this set data
                                    resolve();
                                });
                            }.bind(this));
                        } else {
                            element.setValue(data).then(function() {
                                // resolve this set data
                                resolve();
                            });
                        }
                    } else if (data !== null && !$.isEmptyObject(data)) {
                        count = Object.keys(data).length;
                        $.each(data, function(key, value) {
                            var $element, element, collection;

                            // if field is a collection
                            if ($.isArray(value) && this.templates.hasOwnProperty(key)) {
                                collection = this.templates[key].collection;
                                collection.key = key;

                                // if first element of collection, clear collection
                                if (!this.collectionsSet.hasOwnProperty(collection.id)) {
                                    collection.$element.children().each(function(key, value) {
                                        $(value).remove();
                                    }.bind(this));
                                }
                                this.collectionsSet[collection.id] = true;

                                that.setCollectionData.call(this, value, collection).then(function() {
                                    resolve();
                                });
                            } else if (form.elementGroups.hasOwnProperty(key)) {
                                form.elementGroups[key].setValue(value);
                                resolve();
                            } else {
                                // search field with mapper property
                                selector = '*[data-mapper-property="' + key + '"]';
                                $element = $el.andSelf().find(selector);

                                element = $element.data('element');

                                if ($element.length > 0) {
                                    // if element is not in form add it
                                    if (!element) {
                                        element = form.addField($element);
                                        element.initialized.then(function() {
                                            element.setValue(value).then(function() {
                                                resolve();
                                            });
                                        }.bind(this));
                                    } else {
                                        element.setValue(value).then(function() {
                                            resolve();
                                        });
                                    }
                                } else {
                                    resolve();
                                }
                            }
                        }.bind(this));
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
                },

                addDataFromElement: function(element, data, returnMapperId) {
                    var $element = element.$el,
                        property = $element.data('mapper-property'),
                        parts;

                    if (!property) {
                        return;
                    }

                    if ($.isArray(property)) {
                        $.each(property, function(i, prop) {
                            data[prop.data] = that.processData.call(this, $element, prop, returnMapperId);
                        }.bind(this));
                    } else if (property.match(/.*\..*/)) {
                        parts = property.split('.');
                        data[parts[0]] = {};
                        data[parts[0]][parts[1]] = that.processData.call(this, $element);
                    } else {
                        // process it
                        data[property] = that.processData.call(this, $element);
                    }
                },

                getDataFromElements: function(elements, elementGroups, returnMapperId) {
                    var data = {};

                    elements.forEach(function(element) {
                        that.addDataFromElement.call(this, element, data, returnMapperId);
                    }.bind(this));

                    for (var key in elementGroups) {
                        if (elementGroups.hasOwnProperty(key)) {
                            data[key] = elementGroups[key].getValue();
                        }
                    }

                    return data;
                }
            },

        // define mapper interface
            result = {

                setData: function(data, $el) {
                    this.collectionsSet = {};

                    return that.setData.call(this, data, $el);
                },

                /**
                 * extracts data from $element or default form element
                 * @param {Object} [$el=undefined] element to select data from
                 * @param {Boolean} [returnMapperId=false] returnMapperId
                 */
                getData: function($el, returnMapperId) {
                    if (!!$el && !!$el.data('mapper-id')) {
                        var collection = that.getElementByMapperId.call(this, $el.data('mapper-id')).data('collection');
                        return that.getDataFromElements(
                            collection.childElements,
                            collection.childElementGroups,
                            returnMapperId
                        );
                    } else {
                        return that.getDataFromElements(form.elements, form.elementGroups, returnMapperId);
                    }
                },

                addCollectionFilter: function(name, callback) {
                    filters[name] = callback;
                },

                removeCollectionFilter: function(name) {
                    delete filters[name];
                },

                /**
                 * adds an element to a existing collection
                 * @param {String} propertyName property defined by 'data' attribute in data-mapper-property
                 * @param {Object} [data] Possibility to set data
                 * @param {Boolean} [append=false] Define if element should be added at the end of the collection. By default items are grouped by tpl name
                 */
                addToCollection: function(propertyName, data, append) {
                    var template = this.templates[propertyName],
                        element = template.collection.$element,
                        insertAfterLast = false,
                        lastElement,
                        $emptyTpl,
                        dfd = $.Deferred();

                    // check if element exists and put it after last
                    if (!append) {
                        insertAfterLast = true;
                    }
                    // check if empty template is set and lookup in dom
                    if (template.emptyTemplate) {
                        $emptyTpl = $(element).find('#' + template.emptyTemplate);
                        if ($emptyTpl) {
                            $emptyTpl.remove();
                        }
                    }

                    that.appendChildren.call(this, template.collection, template.tpl, data, data, insertAfterLast).then(function($element) {
                        dfd.resolve($element);
                    }.bind(this));

                    return dfd;
                },

                /**
                 * Edits a field in an collection
                 * @param mapperId {Number} the unique Id of the field
                 * @param data {Object} new data to apply
                 */
                editInCollection: function(mapperId, data) {
                    var $element = that.getElementByMapperId.call(this, mapperId);
                    that.setData.call(this, data, $element);
                },

                /**
                 * Removes a field from a collection
                 * @param mapperId {Number} the unique Id of the field
                 */
                removeFromCollection: function(mapperId) {
                    var i,
                        templateName = that.deleteElementByMapperId.call(this, mapperId);

                    // check if collection still has elements with propertyName, else render empty Template
                    if (form.$el.find('*[data-mapper-property-tpl=' + templateName + ']').length < 1) {
                        // get collection with is owner of templateName
                        for (i in this.templates) {
                            // if emptyTemplates is set
                            if (this.templates[i].tpl.id === templateName) {
                                that.addEmptyTemplate.call(this, this.templates[i].collection.$element, i);
                                return;
                            }
                        }
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

require.config({
    paths: {
        'form': 'js/form',
        'form/mapper': 'js/mapper',
        'form/validation': 'js/validation',
        'form/element': 'js/element',
        'form/elementGroup': 'js/elementGroup',
        'form/util': 'js/util',

        'type/default': 'js/types/default',
        'type/readonly-select': 'js/types/readonlySelect',
        'type/string': 'js/types/string',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/hiddenData': 'js/types/hiddenData',
        'type/mappingData': 'js/types/mappingData',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',
        'type/label': 'js/types/label',
        'type/select': 'js/types/select',
        'type/collection': 'js/types/collection',
        'type/attributes': 'js/types/attributes',

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
    'form/elementGroup',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, ElementGroup, Validation, Mapper, Util) {

    'use strict';

    return function(el, options) {
        var defaults = {
                debug: false,                     // debug on/off
                delimiter: {                      // defines which delimiter should be used for templating
                    interpolate: /<~=(.+?)~>/g,
                    escape: /<~-(.+?)~>/g,
                    evaluate: /<~(.+?)~>/g
                },
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

                    // enable / disable debug
                    Util.debugEnabled = this.options.debug;

                    this.initialized = that.initFields.call(this);

                    if (!!this.options.validation) {
                        this.validation = new Validation(this);
                    }

                    if (!!this.options.mapper) {
                        this.mapper = new Mapper(this);
                    }

                    this.$el.data('form-object', this);
                },

                // initialize field objects
                initFields: function($el) {
                    var dfd = $.Deferred(),
                        requireCounter = 0,
                        resolve = function() {
                            requireCounter--;
                            if (requireCounter === 0) {
                                dfd.resolve();
                            }
                        };

                    $.each(Util.getFields($el || this.$el), function(key, value) {
                        requireCounter++;
                        that.addField.call(this, value).initialized.then(resolve.bind(this));
                    }.bind(this));

                    that.addGroupedFields.call(this, $el);

                    return dfd.promise();
                },

                bindValidationDomEvents: function() {
                    if (!!this.options.validationSubmitEvent) {
                        // avoid submit if not valid
                        this.$el.on('submit', function() {
                            return this.validation.validate();
                        }.bind(this));
                    }
                },

                createField: function(selector) {
                    var $element = $(selector),
                        options = Util.parseData($element, '', this.options);

                    return new Element($element, result, options);
                },

                createFieldGroup: function(selectors, single) {
                    return new ElementGroup(
                        selectors.map(function(selector) {
                            var $element = $(selector),
                                options = Util.parseData($element, '', this.options);

                            return new Element($element, result, options);
                        }.bind(this)),
                        single
                    );
                },

                addField: function(selector) {
                    var element = this.createField(selector);

                    this.elements.push(element);
                    Util.debug('Element created', options);

                    return element;
                },

                addSingleGroupedField: function(key, selectors, single) {
                    this.elementGroups[key] = this.createFieldGroup(selectors, single);
                },

                addGroupedFields: function($el) {
                    $.each(Util.getCheckboxes($el || this.$el), function(key, value) {
                        if (value.length > 1) {
                            that.addSingleGroupedField.call(this, key, value, false);
                        } else {
                            // backwards compatibility: single checkbox are handled as boolean values
                            that.addField.call(this, value);
                        }
                    }.bind(this));

                    $.each(Util.getRadios($el || this.$el), function(key, value) {
                        that.addSingleGroupedField.call(this, key, value, true);
                    }.bind(this));
                }
            },

            result = {
                elements: [],
                elementGroups: {},
                options: {},
                validation: false,
                mapper: false,

                createField: function(selector) {
                    var element = that.createField(selector);

                    element.initialized.then(function() {
                        element.fieldAdded(element);
                    }.bind(this));

                    return element;
                },

                createFieldGroup: function(selectors, single) {
                    return that.createFieldGroup(selectors, single);
                },

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

                addGroupedFields: function($el) {
                    return that.addGroupedFields.call(this, $el);
                },

                initFields: function($el) {
                    return that.initFields.call(this, $el);
                },

                removeFields: function($el) {
                    Util.getFields($el).each(function(i, item) {
                        this.removeField(item);
                    }.bind(this));
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

    'use strict';

    return function($el, defaults, options, name, typeInterface, form) {

        var that = {
                initialize: function() {
                    this.$el = $el;
                    this.options = $.extend({}, defaults, options);

                    var dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    if (!!this.initializeSub) {
                        this.initializeSub();
                    }
                    dfd.resolve();
                }
            },

            defaultInterface = {
                name: name,

                form: form,

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

    'use strict';

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

    'use strict';

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
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                format: 'n', // n, d, c, p
                regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
                nullable: false
            },

            typeInterface = {
                initializeSub: function() {
                },

                validate: function() {
                    var val = this.getValue();

                    if (val === '' || (this.options.nullable === true && val === null)) {
                        return true;
                    }

                    return this.options.regExp.test(val);
                },

                getModelData: function(val) {
                    if(val === '') {
                        if (this.options.nullable === true) {
                            return null;
                        }
                        
                        return '';
                    }
                    return Globalize.parseFloat(val);
                },

                getViewData: function(val) {
                    if(typeof val === 'string'){
                        if(val === '') {
                            return '';
                        }
                        val = parseFloat(val);
                    }
                    return Globalize.format(val, this.options.format);
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

define('type/hiddenData',[
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: 'id',
                defaultValue: null
            },

            typeInterface = {

                hiddenData: null,

                setValue: function(value) {
                    this.hiddenData = value;
                    if (!!value && typeof value === 'object' && !!value[this.options.id]) {
                        this.$el.data('id', value[this.options.id]);
                    }
                },

                getValue: function() {
                    if (this.hiddenData !== null) {
                        return this.hiddenData;
                    } else {
                        return this.options.defaultValue;
                    }
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'hiddenData', typeInterface);
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

define('type/mappingData',[
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                defaultValue: null,
                mapping: null,
                searchProperty: 'id',
                showProperty: 'name'
            },

            typeInterface = {

                setValue: function(value) {
                    if (value !== null && typeof value !== 'object') {
                        this.$el.data('value', value);
                        this.$el.text(this.getMappingValue(value) || this.options.defaultValue);
                    }
                },

                getValue: function() {

                    var value = this.$el.data('value');

                    if (value !== null) {
                        return value;
                    } else {
                        return this.options.defaultValue;
                    }
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                },

                getMappingValue: function(val) {

                    var key, obj = this.options.mapping;

                    if (!!obj) {
                        for (key in this.options.mapping) {
                            if (!!obj.hasOwnProperty(key)) {
                                if (obj[key].hasOwnProperty(this.options.searchProperty) &&
                                    obj[key].hasOwnProperty(this.options.showProperty) &&
                                    String(obj[key][this.options.searchProperty]) === String(val)) {
                                    return obj[key][this.options.showProperty];
                                }
                            }
                        }
                    }
                }
            };

        return new Default($el, defaults, options, 'hiddenData', typeInterface);
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

    'use strict';

    return function($el, options) {
        var defaults = {
                regExp: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i
            },

            typeInterface = {
                validate: function() {
                    var val = this.getValue();
                    if (val === '') {
                        return true;
                    }

                    return this.options.regExp.test(val);
                },

                needsValidation: function() {
                    var val = this.getValue();
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

    'use strict';

    return function($el, options) {
        var defaults = {
                regExp: /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
            },

            typeInterface = {
                validate: function() {
                    var val = this.getValue();
                    if (val === '') {
                        return true;
                    }

                    if (this.options['url-strict'] !== 'true') {
                        val = new RegExp('(https?|s?ftp|git)', 'i').test(val) ? val : 'http://' + val;
                    }
                    return this.options.regExp.test(val);
                },

                needsValidation: function() {
                    var val = this.getValue();
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

    'use strict';

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

    'use strict';

    return function($el, options) {
        var defaults = {
                id: 'id',
                label: 'name',
                type: 'object'
            },

            typeInterface = {
                setValue: function(value) {
                    if (typeof value === 'object') {
                        this.$el.val(value[this.options.id]);
                    } else {
                        // find option where id == value and set it to selected
                        this.$el.find('option[id='+value+']').attr('selected','selected');
                        this.options.type = 'string';
                    }
                },

                getValue: function() {
                    if (this.options.type === 'object') {
                        var result = {};
                        result[this.options.id] = Util.getValue(this.$el);
                        result[this.options.label] = this.$el.find('option:selected').text();
                        return result;
                    } else {
                        // return id of selected element
                        return this.$el.children(':selected').attr('id');
                    }

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

define('type/readonly-select',[
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                id: null,
                data: [],
                idProperty: 'id',
                outputProperty: 'name'
            },

            typeInterface = {
                setValue: function(value) {
                    var data = this.options.data,
                        idProperty = this.options.idProperty,
                        i , len;

                    // check if value is an object
                    if (typeof value === 'object') {
                        if (value.hasOwnProperty(idProperty)) {
                            value = value[idProperty];
                        } else {
                            throw "value has no property named " + idProperty;
                        }
                    // if value is null continue
                    } else if (value === null) {
                        return;
                    }

                    // set data id to value
                    this.$el.data('id', value);

                    // find value in data
                    if (data.length > 0) {
                        for (i = -1, len = data.length; ++i < len;) {
                            if (data[i].hasOwnProperty(idProperty) && data[i][idProperty].toString() === value.toString()) {
                                this.$el.html(data[i][this.options.outputProperty]);
                                break;
                            }
                        }
                    }
                },

                getValue: function() {
                    var id = this.$el.data('id'),
                        i, len;

                    for (i = -1, len = this.options.data.length; ++i < len;) {
                        if (this.options.data[i][this.options.idProperty].toString() === id.toString()) {
                            return this.options.data[i];
                        }
                    }
                    return null;
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'readonly-select', typeInterface);
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

    'use strict';

    return function($el, options) {
        var defaults = {
                min: 0,
                max: null
            },

            subType = {
                validate: function() {
                    return true;
                },

                needsValidation: function() {
                    return false;
                },

                getChildren: function(id) {
                    return this.$el.find('*[data-mapper-property-tpl="' + id + '"]');
                },

                getMinOccurs: function() {
                    return this.options.min;
                },

                getMaxOccurs: function() {
                    return this.options.max;
                },

                canAdd: function(id) {
                    var length = this.getChildren(id).length;
                    return this.getMaxOccurs() === null || length < this.getMaxOccurs();
                },

                canRemove: function(id) {
                    var length = this.getChildren(id).length;
                    return length > this.getMinOccurs();
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

define('type/attributes',[
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
            },

            typeInterface = {
                setValue: function(value) {
                   this.$el.data('attributes', value);
                },

                getValue: function() {
                    return this.$el.data('attributes');
                },

                needsValidation: function() {
                    return false;
                },

                validate: function() {
                    return true;
                }
            };

        return new Default($el, defaults, options, 'attributes', typeInterface);
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

    'use strict';

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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                min: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min'), {
                validate: function() {
                    var val = this.data.element.getValue();
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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                max: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max'), {
                validate: function() {
                    var val = this.data.element.getValue();
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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                minLength: 0
            },

            result = $.extend(new Default($el, form, defaults, options, 'min-length'), {
                validate: function() {
                    var val = this.data.element.getValue();
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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                maxLength: 999
            },

            result = $.extend(new Default($el, form, defaults, options, 'max-length'), {
                validate: function() {
                    var val = this.data.element.getValue();
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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = { },

            result = $.extend(new Default($el, form, defaults, options, 'required'), {
                validate: function() {
                    if (!!this.data.required) {
                        var val = this.data.element.getValue();

                        if (typeof val === 'number') {
                            return true;
                        }

                        if (!!_.isString(val)) {
                            val = val.trim();
                        }

                        // notNull && notBlank && not undefined
                        if (!val) {
                            return false;
                        }

                        // not empty array, object and string
                        return _.size(val) > 0;
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

    'use strict';

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
                    var val = this.data.element.getValue(),
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
                    var val = this.data.element.getValue(),
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
    'validator/default'
], function(Default) {

    'use strict';

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
                    var val = this.data.element.getValue(),
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
    'validator/default'
], function(Default) {

    'use strict';

    return function($el, form, element, options) {
        var defaults = {
                regex: /\w*/
            },

            result = $.extend(new Default($el, form, defaults, options, 'regex'), {
                validate: function() {
                    // TODO flags
                    var pattern = this.data.regex,
                        regex = new RegExp(pattern),
                        val = this.data.element.getValue();

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


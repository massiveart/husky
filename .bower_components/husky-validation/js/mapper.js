/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([
    'form/util'
], function(Util) {

    'use strict';

    return function(form) {

        // private functions
        var that = {
                initialize: function() {
                    Util.debug('INIT Mapper');
                },

                processData: function(el) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        element = $el.data('element'),
                        result;

                    // if type == array process children, else get value
                    if (type !== 'array') {
                        return element.getValue();
                    } else {
                        result = [];
                        $.each($el.children(), function(key1, value1) {
                            result.push(form.mapper.getData($(value1)));
                        });
                        return result;
                    }
                },

                setArrayData: function(array, $element) {
                    // remember first child remove the rest
                    var $child = $element.children().first(),
                        element;

                    // remove fields
                    $.each(Util.getFields($element), function(key, value) {
                        form.removeField(value);
                    }.bind(this));
                    $element.children().remove();

                    // foreach array elements: create a new dom element, call setData recursively
                    $.each(array, function(key, value) {
                        var $newElement = $child.clone(),
                            $newFields = Util.getFields($newElement),
                            dfd = $.Deferred(), counter = $newFields.length;

                        $element.append($newElement);

                        // set data after fields has been added
                        dfd.then(function() {
                            form.mapper.setData(value, $newElement);
                        });

                        // add fields
                        $.each($newFields, function(key, field) {
                            element = form.addField($(field));
                            element.initialized.then(function() {
                                counter--;
                                if (counter === 0) {
                                    dfd.resolve();
                                }
                            });
                        }.bind(this));

                    });
                }

            },

        // define mapper interface
            result = {
                setData: function(data, $el) {
                    if (!$el) {
                        $el = form.$el;
                    }

                    $.each(data, function(key, value) {
                        // search field with mapper property
                        var selector = '*[data-mapper-property="' + key + '"]',
                            $element = $el.find(selector),
                            element = $element.data('element');

                        if ($element.length > 0) {
                            // if field is an array
                            if ($.isArray(value)) {
                                that.setArrayData.call(this, value, $element);
                            } else {
                                // if element is not in form add it
                                if (!element) {
                                    element = form.addField($element);
                                    element.initialized.then(function() {
                                        element.setValue(value);
                                    });
                                } else {
                                    element.setValue(value);
                                }
                            }
                        }
                    }.bind(this));
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
                }
            };

        that.initialize.call(result);
        return result;
    };

});

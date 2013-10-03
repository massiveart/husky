/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * Name: button
 * Options:
 *  labels.inputPassword1: text for the label for the first password field
 *  labels.inputPassword2: text for the label for the second password field
 *  labels.generateLabel: text for the generate label
 *  instanceName: name of the instance of this component
 *
 * Provided Events:
 *  husky.passwords.fields.<<instanceName>>.generated.passwords: password generated
 *
 * Used Events
 *  husky.passwords.fields.<<instanceName>>.get.passwords: callback for passwords
 *
 */

define([], function() {

    'use strict';

    var defaults = {
        instanceName: 'undefined',
        validation: false,
        labels: {
            inputPassword1: 'Password',
            inputPassword2: 'Repeat Password',
            generateLabel: 'Generate password'
        },
        values: {
            inputPassword1: '',
            inputPassword2: ''
        }

    };

    return {

        initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);
            this.options.ids =
            {
                inputPassword1: 'husky-password-fields-' + this.options.instanceName + '-password1',
                inputPassword2: 'husky-password-fields-' + this.options.instanceName + '-password2',
                generateLabel: 'husky-password-fields-' + this.options.instanceName + '-generate'
            };
            this.render();
        },

        render: function() {

            this.$originalElement = this.sandbox.dom.$(this.options.el);
            this.$element = this.sandbox.dom.$(this.template());
            this.$originalElement.append(this.$element);

            if (!!this.options.validation) {
                this.sandbox.form.addField(this.options.validation, this.$el.find('#' + this.options.ids.inputPassword1));
                this.sandbox.form.addField(this.options.validation, this.$el.find('#' + this.options.ids.inputPassword2));
            }

            this.bindDomEvents();
            this.bindCustomEvents();
        },

        bindCustomEvents: function(){

            this.sandbox.on('husky.password.fields.' + this.options.instanceName + '.get.passwords', function(callback){

                if(typeof callback === 'function'){
                    var password1 = this.sandbox.dom.val('#'+this.options.ids.inputPassword1),
                        password2 = this.sandbox.dom.val('#'+this.options.ids.inputPassword2);
                    callback(password1, password2);
                }

            }.bind(this));

        },

        bindDomEvents: function() {

            this.$element.on('click', '#'+this.options.ids.generateLabel, function() {
                this.generatePasswords();
                this.sandbox.emit('husky.passwords.fields.' + this.options.instanceName + '.generated.passwords');
            }.bind(this));
        },

        generatePasswords: function() {
            var generatedPassword = 'test';

            // TODO generate password

            this.sandbox.dom.val('#'+this.options.ids.inputPassword1, generatedPassword);
            this.sandbox.dom.val('#'+this.options.ids.inputPassword2, generatedPassword);
        },

        template: function() {

            return [
                '<div class="husky-password-fields grid">',
                '    <div class="grid-row">',
                '        <div class="grid-col-6">',
                '            <div class="grid-row m-height-25">',
                '                <div class="grid-col-6">',
                '                    <label>', this.options.labels.inputPassword1, '</label>',
                '                </div>',
                '                <div class="grid-col-6 align-right hidden" id="', this.options.ids.generateLabel, '">',
                '                    <span class="icon-keys m-right-10"></span><span class="pointer">', this.options.labels.generateLabel, '</span>',
                '                </div>',
                '            </div>',
                '            <div class="grid-row">',
                '                <input class="form-element" value="', this.options.values.inputPassword1, '" type="text" id="', this.options.ids.inputPassword1, '"', (!!this.options.validation ? 'data-validation-equal="' + this.options.instanceName + '"' : ''), '/>',
                '            </div>',
                '        </div>',
                '        <div class="grid-col-6">',
                '            <div class="grid-row m-height-25">',
                '                <label>', this.options.labels.inputPassword2, '</label>',
                '            </div>',
                '            <div class="grid-row">',
                '                <input class="form-element" value="', this.options.values.inputPassword2, '" type="text" id="', this.options.ids.inputPassword2, '"', (!!this.options.validation ? 'data-validation-equal="' + this.options.instanceName + '"' : ''), '/>',
                '            </div>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('');
        }
    };
});

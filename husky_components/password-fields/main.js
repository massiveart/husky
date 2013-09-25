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
 *  buttonType: type of button [icon, custom]
 *  instanceName: name of instance used in events
 *  text: button text
 *  iconType: button icon
 *  background: background color for spinner
 *
 * Provided Events:
 *  husky.button.<<instanceName>>.click: button where clicked
 *  husky.button.<<instanceName>>.state: change buttonType [icon, custom type]
 *
 */

define([], function() {

    var defaults = {
        labels: {
            inputPassword1: 'Password',
            inputPassword2: 'Repeat Password',
            generateLabel: 'Generate password'
        }
    };

    return {

       initialize: function() {
            this.sandbox.logger.log('initialize', this);
            this.sandbox.logger.log(arguments);

            // extend default options
            this.options = this.sandbox.util.extend({}, defaults, this.options);

            this.render();
        },

        render: function() {

            this.$originalElement = this.sandbox.dom.$(this.options.el);
            this.$element = this.sandbox.dom.$(this.template());
            this.$originalElement.append(this.$element);

            this.bindDomEvents();
        },

        bindDomEvents: function() {

            this.$element.on('click', '#husky-password-fields-generate', function() {
                this.generatePasswords();
                this.sandbox.emit('husky.passwords-fiels.generated-passwords');
            }.bind(this));
        },

        generatePasswords: function(){
            var password = "test";

            this.sandbox.dom.val('#husky-password-fields-password1')
        },

        template: function(){

            return [
                '<div class="husky-password-fields grid">',
                '    <div class="grid-row">',
                '        <div class="grid-col-6">',
                '            <div class="grid-row m-height-25">',
                '                <div class="grid-col-6">',
                '                    <label>',this.options.labels.inputPassword1,'</label>',
                '                </div>',
                '                <div class="grid-col-6 align-right" id="husky-password-fields-generate">',
                '                    <span class="icon-keys m-right-10"></span><span class="pointer">',this.options.labels.generateLabel,'</span>',
                '                </div>',
                '            </div>',
                '            <div class="grid-row">',
                '                <input class="form-element" type="text" id="husky-password-fields-password1"/>',
                '            </div>',
                '        </div>',
                '        <div class="grid-col-6">',
                '            <div class="grid-row m-height-25">',
                '                <label>',this.options.labels.inputPassword2,'</label>',
                '            </div>',
                '            <div class="grid-row">',
                '                <input class="form-element" type="text" id="husky-password-fields-password2"/>',
                '            </div>',
                '        </div>',
                '    </div>',
                '</div>'
                 ].join('');
        }
    };
});

/**
 * This file is part of Husky frontend development framework.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky/components/preview
 */

/**
 * @class Preview
 * @constructor
 *
 * @param {Object}  [options] Configuration object
 * @param {String}  [options.mainContentElementIdentifier] ID / tagname of the element which will be next to the preview
 * @param {Number}  [options.marginLeft] margin in pixles from the left for the wrapper
 * @param {String}  [options.url] url used for the iframe
 * @param {String}  [options.webspace] webspace section of the url
 * @param {String}  [options.lang] language section of the url
 * @param {String}  [options.id] id of the element
 * @param {Object}  [options.toolbar] options for the toolbar
 * @param {Array}   [options.toolbar.resolutions] options for the toolbar
 * @param {Boolean} [options.toolbar.showLeft] show the left part of the toolbar
 * @param {Boolean} [options.toolbar.showRight] show the right part of the toolbar
 *
 */
define([], function() {

        'use strict';

        /**
         * Default values for options
         */
        var defaults = {
                toolbar: {
                    resolutions: [
                        '1920x1080',
                        '1680x1050',
                        '1440x1050',
                        '1024x768',
                        '800x600',
                        '600x480',
                        '480x320'
                    ],
                    showLeft: true,
                    showRight: true
                },
                mainContentElementIdentifier: '',
                marginLeft:30,
                url: '',
                webspace: '',
                lang: '',
                id: ''
            },

            eventNamespace = 'husky.preview.',

            /**
             * raised after initialization
             * @event husky.preview.initialized
             */
             INITIALIZED = eventNamespace+'initialized',

            /**
             * Returns an object with a height and width property from  a string in pixles
             * @param dimension {String} a string with dimensions e.g 1920x1080
             * @return {Object} object with width and height property
             */
            parseHeightAndWidthFromString = function(dimension){
                var tmp = dimension.split('x');

                if(tmp.length == 2) {
                    return {width: tmp[0],height: tmp[1]}
                } else {
                    this.sandbox.logger.error('Dimension string has invalid format -> 1920x1080');
                    return '';
                }
            },

            /**
             * Concatenates the given strings to an url
             * @param {String} base url
             * @param {String} webspace
             * @param {String} language
             * @param {String} id
             * @return {String} url string
             */
            getUrl = function(baseUrl, webspace, language, id) {

                var url = '';

                return url;
            };

        return {

            initialize: function() {

                this.options = this.sandbox.util.extend({}, defaults, this.options);
                this.currentSize = parseHeightAndWidthFromString.call(this, this.options.toolbar.resolutions[0]);

                this.render();

                this.sandbox.emit(INITIALIZED);
            },

            /**
             * Initializes the rendering process
             */
            render: function(){
                this.renderWrapper(this.currentSize.height);
                this.renderIframe(this.currentSize.width, this.currentSize.height, getUrl);
            },

            /**
             * Renders the div which contains the iframe
             * with the maximum available space
             * @param height {Integer} height of wrapper
             */
            renderWrapper:function(height){

                var mainWidth, mainMarginLeft, totalWidth, wrapperWidth,
                    $main = this.sandbox.dom.$(this.options.mainContentElementIdentifier)[0];

                if(!$main) {
                    this.sandbox.logger.error('main content element could not be found!')
                }

                // caculate the available space next to the
                mainWidth = this.sandbox.dom.outerWidth($main);
                mainMarginLeft = $main.offsetLeft;
                totalWidth = this.sandbox.dom.width(document);
                wrapperWidth = totalWidth - (mainWidth+mainMarginLeft+this.options.marginLeft);

                this.$wrapper = this.sandbox.dom.$('<div class="previewWrapper" id="previewWrapper" style="">wrapper</div>');
                this.sandbox.dom.css(this.$wrapper, 'height', height+'px');
                this.sandbox.dom.css(this.$wrapper, 'width', wrapperWidth+'px');

                this.sandbox.dom.append(this.$el,this.$wrapper);
            },

            /**
             * Renders iframe
             * @param {Number} width of iframe
             * @param {Number} height of iframe
             * @param {String} url for iframe target
             */
            renderIframe: function(width, height, url){
                var $iframe = this.sandbox.dom('<iframe id="previewIframe" src="'+url+'" width="'+width+'px" height="'+height+'px"></iframe>');
                this.sandbox.dom.append(this.$wrapper, $iframe);
            }


        };
    }
);

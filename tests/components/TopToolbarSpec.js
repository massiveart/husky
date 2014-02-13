define(['husky'], function(husky) {

    'use strict';

    var app, callbackCalled = false;

    describe('Top-toolbar', function() {

        beforeEach(function() {

            var initialized = false,

            testData = [
                {
                    id: 1,
                    icon: 'remove',
                    container: 'left',
                    align: 'left',
                    customClass: 'button1',
                    callback: function() {
                        callbackCalled = true;
                    }
                },
                {
                    id: 2,
                    icon: 'publish',
                    container: 'left',
                    align: 'right',
                    customClass: 'button2',
                    dynamicIcon: true,
                    title: 'MyTitle',
                    items: [
                        {
                            title: 'publish',
                            selectedIcon: 'publish',
                            callback: function() {
                                callbackCalled = true;
                            }
                        },
                        {
                            title: 'unpublish',
                            selectedIcon: 'CHANGED_ICON',
                            callback: function() {
                                return true;
                            }
                        }
                    ]
                },
                {
                    id: 3,
                    icon: 'ICON_SUFFIX',
                    container: 'middle',
                    align: 'left',
                    customClass: 'button3',
                    callback: function() {
                        return true;
                    }
                },
                {
                    id: 4,
                    icon: 'floppy-save',
                    disabledIcon: 'remove',
                    container: 'middle',
                    align: 'right',
                    customClass: 'button4',
                    highlight: true,
                    callback: function() {
                        return true;
                    }
                },
                {
                    id: 5,
                    container: 'right',
                    align: 'left',
                    customClass: 'button5',
                    title: '1024 x 768',
                    dynamicTitle: true,
                    closeComponent: true,
                    items: [
                        {
                            title: 'MyItemTitle',
                            callback: function() {
                                return true;
                            }
                        },
                        {
                            title: '1280 x 800',
                            callback: function() {
                                return true;
                            }
                        },
                        {
                            title: '1920 x 1080',
                            callback: function() {
                                return true;
                            }
                        }
                    ]
                },
                {
                    id: 6,
                    icon: 'ENABLED_ICON',
                    disabledIcon: 'DISABLED_ICON',
                    container: 'right',
                    align: 'right',
                    customClass: 'button6',
                    callback: function() {
                        callbackCalled = true;
                    }
                },
                {
                    id: 7,
                    icon: 'ENABLED_ICON',
                    disabledIcon: 'DISABLED_ICON',
                    container: 'right',
                    align: 'right',
                    customClass: 'button7',
                    disabled: true,
                    callback: function() {
                        return true;
                    }
                }
            ];

            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                $('body').off();
                app.start(document.body).then(function() {

                    app.sandbox.on('husky.top-toolbar.initialized', function() {
                       initialized = true;
                    });

                    app.sandbox.start([{
                        name: 'top-toolbar@husky',
                        options: {
                            el: 'body',
                            data: testData,
                            iconClassPrefix: 'ICON_PREFIX_',
                            highlightClass: 'HIGHLIGHTED',
                            iconTitleClass: 'title',
                            disabledClass: 'disabled',
                            loadingClass: 'loading'
                        }
                    }]);
                });
            });

            waitsFor(function() {
               return initialized;
            },'Component should have been initialized', 500);
        });

        afterEach(function() {
            callbackCalled = false;
            // check if any have failed
            if (this.results_.failedCount > 0) {
                // if so, change the function which should move to the next test
                jasmine.Queue.prototype.next_ = function() {
                    // to instead skip to the end
                    this.onComplete();
                };
            }
        });

        /**
         *
         * DOM related tests
         *
         */

        /**
         * Check initialization by inspecting the DOM
         */
        it('should initialize the component', function() {
            expect($('.husky-top-toolbar').length).toEqual(1);
        });

        /**
         * Check if all buttons get rendered
         */
        it('should contain 7 buttons', function() {
           expect($('.husky-top-toolbar').find('.button').length).toEqual(7);
        });

        /**
         * Check if all button-containers get rendered
         */
        it('should contain all button-containers', function() {
            expect($('.husky-top-toolbar').find('.top-toolbar-left .left-list').length).toEqual(1);
            expect($('.husky-top-toolbar').find('.top-toolbar-left .right-list').length).toEqual(1);

            expect($('.husky-top-toolbar').find('.top-toolbar-middle .left-list').length).toEqual(1);
            expect($('.husky-top-toolbar').find('.top-toolbar-middle .right-list').length).toEqual(1);

            expect($('.husky-top-toolbar').find('.top-toolbar-right .left-list').length).toEqual(1);
            expect($('.husky-top-toolbar').find('.top-toolbar-right .right-list').length).toEqual(1);
        });

        /**
         * Check if buttons are in the right container
         * (each container should contain one button)
         */
        it('should append the buttons to their right containers', function() {
            expect($('.husky-top-toolbar .top-toolbar-left .left-list').find('.button').length).toEqual(1);
            expect($('.husky-top-toolbar .top-toolbar-left .right-list').find('.button').length).toEqual(1);

            expect($('.husky-top-toolbar .top-toolbar-middle .left-list').find('.button').length).toEqual(1);
            expect($('.husky-top-toolbar .top-toolbar-middle .right-list').find('.button').length).toEqual(1);

            expect($('.husky-top-toolbar .top-toolbar-right .left-list').find('.button').length).toEqual(1);
            expect($('.husky-top-toolbar .top-toolbar-right .right-list').find('.button').length).toEqual(2);
        });

        /**
         * Check if component adds the custom class to the buttons
         */
        it('should add custom classes to the buttons', function() {
            expect($('.husky-top-toolbar .top-toolbar-left .left-list').find('.button1').length).toEqual(1);
        });

        /**
         * Check if the button-title gest displayd
         */
        it('should display the buttons title', function() {
           expect($('.husky-top-toolbar').find('.button2').html()).toContain('MyTitle');
        });

        /**
         * Check if a button child has the right icon class (iconPrefix + iconSuffix)
         */
        it('should add the correct icon class to the icon-container', function() {
            expect($('.husky-top-toolbar').find('.button3').find('.ICON_PREFIX_ICON_SUFFIX').length).toBeGreaterThan(0);
        });

        /**
         * Check if the highlighted class gets added if the highlight option is true
         */
        it('should add a highlighted class if the highlight option is true', function() {
            expect($('.husky-top-toolbar').find('.HIGHLIGHTED').length).toEqual(1);
        });

        /**
         * Check if dropdown-menu DOM-object ist added if a button has items
         */
        it('should render dropdown-menus', function() {
            expect($('.husky-top-toolbar .button5').find('.top-toolbar-dropdown-menu').length).toEqual(1);
        });

        /**
         * Check if dropdown-menu items contain their configured title
        */
        it('should display the titles of dropdown-items', function() {
            expect($('.husky-top-toolbar .button5').find('.top-toolbar-dropdown-menu').html()).toContain('MyItemTitle');
        });

        /**
         * Check if button starts in disabled state if configured
         */
        it('should start buttons in disabled state', function() {
           expect($('.husky-top-toolbar .button7').hasClass('disabled')).toBe(true);
        });

        /**
         *
         * Event related tests
         *
         */

        /**
         * Check if a callback gets executed if a button is clicked on
         */
        it('should execute a callback if a button is clicked', function() {
            runs(function() {
                $('.husky-top-toolbar .button1').click();
            });

            waitsFor(function() {
                return callbackCalled;
            }, 'Callback should have been called', 500);

            runs(function() {
                expect(callbackCalled).toBe(true);
            });
        });

        /**
         * Check if a callback gets executed if a dropdown-item is clicked on
         */
        it('should execute a callback if a dropdown-item is clicked', function() {
            runs(function() {
                //click on first dropdown item
                $('.husky-top-toolbar .button2 .top-toolbar-dropdown-menu li').eq(0).click();
            });

            waitsFor(function() {
                return callbackCalled;
            }, 'Callback should have been called', 500);

            runs(function() {
                expect(callbackCalled).toBe(true);
            });
        });

        /**
         * Check if button title changes to the title of the clicked dropdown-item
         * (dynamicTitle option must be true)
         */
        it('should change button title to the title of the clicked dropdown-item', function() {
            runs(function() {
                //click on first dropdown item
               $('.husky-top-toolbar .button5 .top-toolbar-dropdown-menu li').eq(0).click();
            });

            waitsFor(function() {
                return ($('.husky-top-toolbar .button5 .title').html() === 'MyItemTitle');
            }, 'button title should have changed', 500);

            runs(function() {
                expect($('.husky-top-toolbar .button5 .title').html()).toContain('MyItemTitle');
            });
        });

        /**
         * Check if button icon changes to the configured icon of the clicked dropdown item
         * (dynamicIcon option must be treu)
         */
        it('should change button icon to the icon of the clicked dropdown-item', function() {
            runs(function() {
                //click on second dropdown item
                $('.husky-top-toolbar .button2 .top-toolbar-dropdown-menu li').eq(1).click();
            });

            waitsFor(function() {
                return ($('.husky-top-toolbar .button2').find('.ICON_PREFIX_CHANGED_ICON').length === 1);
            }, 'button title should have changed', 500);

            runs(function() {
                expect($('.husky-top-toolbar .button2').find('.ICON_PREFIX_CHANGED_ICON').length).toEqual(1);
            });
        });

        /**
         *
         * Custom-event related tests
         *
         */

        /**
         * Check if button switches to disabled mode
         */
        it('should switch buttons to disabled mode', function() {
            var flag = false;

            runs(function() {
                app.sandbox.emit('husky.top-toolbar.6.disable');
            });

            waitsFor(function() {
                return ($('.husky-top-toolbar .button6').hasClass('disabled'));
            }, 'button should have been disabled', 500);

            runs(function() {
                //try to call callback
                $('.husky-top-toolbar .button6').click();
                _.delay(function(){
                    flag = true;
                }, 100);
            });

            waitsFor(function() {
                return flag;
            }, 'waited for callack to not execute', 200);

            runs(function() {
                //has disabled-class
                expect($('.husky-top-toolbar .button6').hasClass('disabled')).toBe(true);
                //icon changed
                expect($('.husky-top-toolbar .button6').find('.ICON_PREFIX_DISABLED_ICON').length).toEqual(1);
                //calback not executed
                expect(callbackCalled).toBe(false);
            });
        });

        /**
         * Check if button switches to enabled mode
         */
        it('should switch buttons to enabled mode', function() {
            var flag = false;

            runs(function() {
                app.sandbox.emit('husky.top-toolbar.6.disable');
            });

            waitsFor(function() {
                return ($('.husky-top-toolbar .button6').hasClass('disabled'));
            }, 'button should have been disabled', 500);

            runs(function() {
                app.sandbox.emit('husky.top-toolbar.6.enable');
            });

            waitsFor(function() {
                return (!$('.husky-top-toolbar .button6').hasClass('disabled'));
            }, 'button should have been enabled', 500);

            runs(function() {
                //try to call callback
                $('.husky-top-toolbar .button6').click();
                _.delay(function(){
                    flag = true;
                }, 100);
            });

            waitsFor(function() {
                return flag;
            }, 'waited for callack to execute', 200);

            runs(function() {
                //has no disabled-class
                expect($('.husky-top-toolbar .button6').hasClass('disabled')).toBe(false);
                //icon back to noraml
                expect($('.husky-top-toolbar .button6').find('.ICON_PREFIX_ENABLED_ICON').length).toEqual(1);
                //calback executed
                expect(callbackCalled).toBe(true);
            });
        });

        /**
         * Check if button switches to loading mode
         */
        it('should switch buttons to loading mode', function() {
            runs(function() {
                app.sandbox.on('husky.loader.initialized', function() {
                    callbackCalled = true;
                });
                app.sandbox.emit('husky.top-toolbar.6.loading');
            });

            waitsFor(function() {
                return callbackCalled;
            }, 'loading component should have been initialized', 500);

            runs(function() {
                expect($('.husky-top-toolbar .button6').find('.loading').length).toEqual(1);
                expect(callbackCalled).toBe(true);
            });
        });
    });
});

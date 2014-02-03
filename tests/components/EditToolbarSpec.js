define(['husky'], function(husky) {

    'use strict';

    var app, initialized = false, callbackCalled = false;

    describe('Edit-toolbar', function() {

        beforeEach(function() {

            var testData = [
                {
                    'id': '1',
                    'icon': 'ICON_ENABLED',
                    'disabledIcon': 'ICON_DISABLED',
                    'iconSize': 'large',
                    'class': 'highlight',
                    'callback': function() {
                        callbackCalled = true;
                    }.bind(this)
                },
                {
                    'id': '2',
                    'icon': 'ICON_ENABLED',
                    'iconSize': 'large',
                    'disabledIcon': 'ICON_DISABLED',
                    'title': '',
                    'group': 'right',
                    'items': [
                        {
                            'title': 'Item 1',
                            'callback': function() {
                                callbackCalled = true;
                            }
                        },
                        {
                            'divider': true
                        },
                        {
                            'title': 'Item 2',
                            'callback': function() {
                                callbackCalled = true;
                            }
                        }
                    ]
                },
                {
                    'id': '3',
                    'icon': 'ICON_ENABLED',
                    'group': 'right',
                    'title': 'startingTitle',
                    'class': 'highlight-gray',
                    'type': 'select',
                    'items': [
                        {
                            'icon': 'ITEM_ICON_2',
                            'title': 'itemTitle1',
                            'callback': function() {
                                callbackCalled = true;
                            }
                        },
                        {
                            'icon': 'ITEM_ICON_2',
                            'title': 'itemTitel2',
                            'callback': function() {
                                callbackCalled = true;
                            }
                        }
                    ]
                },
                {
                    'id': 4,
                    'icon': 'ICON_ENABLED',
                    'disabledIcon': 'ICON_DISABLED',
                    'title': 'Import',
                    'disabled': true,
                    'callback': function() {
                        callbackCalled = true;
                    }
                },
            ];

            $('body').append('<div id="testContainer"/>');

            runs(function() {
                app = husky({ debug: { enable: true }});

                // Fix multiple events
                $('body').off();
                app.start(document.body).then(function() {

                    app.sandbox.on('husky.edit-toolbar.1.initialized', function() {
                        initialized = true;
                    });

                    app.sandbox.start([
                        {
                            name: 'edit-toolbar@husky',
                            options: {
                                el: '#testContainer',
                                instanceName: '1',
                                data: testData
                            }
                        }
                    ]);
                });
            });

            waitsFor(function() {
                return initialized;
            }, 'Toolbar should have been initialized', 500);
        });

        afterEach(function() {
            initialized = false;
            callbackCalled = false;
            $('#testContainer').remove();

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
         * Check if the component initialized by inspecting the DOM
         */
        it('should initialize', function() {
            expect($('.edit-toolbar-container').length).toEqual(1);
        });

        /**
         * Check if all buttons got rendered
         */
        it('should render all buttons', function() {
            expect($('.edit-toolbar-container .edit-toolbar-item').length).toEqual(4);
        });

        /**
         * Check if buttons are in the right container
         */
        it('should append buttons to their configured container', function() {
            expect($('.edit-toolbar-container .edit-toolbar-left').find('.edit-toolbar-item').length).toEqual(2);
            expect($('.edit-toolbar-container .edit-toolbar-right').find('.edit-toolbar-item').length).toEqual(2);
        });

        /**
         * Check if the title gets displayd
         */
        it('should display a button title', function() {
            expect($('.edit-toolbar-container li[data-id=3]').html()).toContain('startingTitle');
        });

        /**
         * Check if data-id attribute is set
         */
        it('should set data-id attribute with the buttons id', function() {
            expect($('.edit-toolbar-container').find('[data-id=1]').length).toEqual(1);
        });

        /**
         * Check if dropdown-menu is generated
         */
        it('should generate dropdown-menus for buttons', function() {
            expect($('.edit-toolbar-container li[data-id=2]').find('.edit-toolbar-dropdown-menu').length).toEqual(1);
        });

        /**
         * Check if icon-class has been added
         */
        it('should add an icon class to buttons', function() {
           expect($('.edit-toolbar-container li[data-id=1]').find('.icon-ICON_ENABLED').length).toEqual(1);
        });

        /**
         * Check if disabled icon-class has been added
         */
        it('should add the disabled-icon-class to disabled buttons', function() {
            expect($('.edit-toolbar-container li[data-id=4]').find('.icon-ICON_DISABLED').length).toEqual(1);
        });

        /**
         * Check if icon-size-class has been added
         */
        it('should add icon-size-classes to buttons', function() {
            expect($('.edit-toolbar-container li[data-id=1]').find('.large').length).toEqual(1);
        });

        /**
         * Check if the custom-class gets added to buttons
         */
        it('should add custom classes to buttons', function() {
            expect($('.edit-toolbar-container li[data-id=1]').hasClass('highlight')).toBe(true);
        });

        /**
         * Check if divider-class gets add to dropdown items
         */
        it('should add a divider class to configured dropdown-items', function() {
            expect( $('.edit-toolbar-container li[data-id=2]').find('.edit-toolbar-dropdown-menu li').eq(1).hasClass('divider')).toBe(true);
        });

        /**
         *
         * Event related tests
         *
         */

        /**
         * Check if dropdown-menus are shown if button is clicked on
         */
        it('should show dropdown-menus', function() {
            runs(function() {
                $('.edit-toolbar-container li[data-id=2] .dropdown-toggle').click();
            });

            waitsFor(function() {
                return ($('.edit-toolbar-container li[data-id=2]').hasClass('is-expanded'));
            }, 'Dropdown should have been expanded', 500);

            runs(function() {
                expect($('.edit-toolbar-container li[data-id=2]').hasClass('is-expanded')).toBe(true);
            });
        });

        /**
         * Check if dropdown-menus get hidden if button is clicked twice
         */
        it('should hide dropdown-menus', function() {
            runs(function() {
                $('.edit-toolbar-container li[data-id=2] .dropdown-toggle').click();
            });

            waitsFor(function() {
                return ($('.edit-toolbar-container li[data-id=2]').hasClass('is-expanded'));
            }, 'Dropdown should have been expanded', 500);

            runs(function() {
                $('.edit-toolbar-container li[data-id=2] .dropdown-toggle').click();
            });

            waitsFor(function() {
                return (!$('.edit-toolbar-container li[data-id=2]').hasClass('is-expanded'));
            }, 'Dropdown should have got hidden', 500);

            runs(function() {
                expect($('.edit-toolbar-container li[data-id=2]').hasClass('is-expanded')).toBe(false);
            });
        });

        /**
         * Check if callback gets called if button is clicked on
         */
        it('should call button callbacks', function() {
            runs(function() {
                $('.edit-toolbar-container li[data-id=1]').click();
            });

            waitsFor(function() {
                return callbackCalled;
            }, 'Callback should have been called', 500);

            runs(function() {
                 expect(callbackCalled).toBe(true);
            });
        });

        /**
         * Check if callback gets not called if disabled button is clicked on
         */
        it('should not call disabled button callbacks', function() {
            var flag = false;
            runs(function() {
                $('.edit-toolbar-container li[data-id=4]').click();
                _.delay(function() {
                    flag = true;
                }, 200);
            });

            waitsFor(function() {
                return flag;
            }, 'Callback should not have been called', 300);

            runs(function() {
                expect(callbackCalled).toBe(false);
            });
        });

        /**
         * Check if callback gets executed if dropdown-item is clicked on
         */
        it('should execute dropdown-item callbacks', function() {
            runs(function() {
                $('.edit-toolbar-container li[data-id=2]').find('.edit-toolbar-dropdown-menu li').eq(0).click();
            });

            waitsFor(function() {
                return callbackCalled;
            }, 'Callback should have been called', 500);

            runs(function() {
                expect(callbackCalled).toBe(true);
            });
        });

        /**
         *
         * Custom-event related tests
         *
         */

        /**
         * Check if it's possible to disable items
         */
        it('should disable buttons', function() {
            runs(function() {
                app.sandbox.emit('husky.edit-toolbar.1.item.disable', '1');
            });

            waitsFor(function() {
                return ($('.edit-toolbar-container li[data-id=1]').hasClass('disabled'));
            }, 'Button should have been disabled', 500);

            runs(function() {
               expect($('.edit-toolbar-container li[data-id=1]').hasClass('disabled')).toBe(true);
            });
        });

        /**
         * Check if it's possible to enable items
         */
        it('should enable buttons', function() {
            runs(function() {
                app.sandbox.emit('husky.edit-toolbar.1.item.disable', '1');
            });

            waitsFor(function() {
                return ($('.edit-toolbar-container li[data-id=1]').hasClass('disabled'));
            }, 'Button should have been disabled', 500);

            runs(function() {
                app.sandbox.emit('husky.edit-toolbar.1.item.enable', '1');
            });

            waitsFor(function() {
                return !($('.edit-toolbar-container li[data-id=1]').hasClass('disabled'));
            }, 'Button should have been enabled', 500);

            runs(function() {
                expect($('.edit-toolbar-container li[data-id=1]').hasClass('disabled')).toBe(false);
            });
        });

        /**
         * Check if it's possible to set a loading state
         */
        it('should set buttons into loading state', function() {
           var flag = false;
           runs(function() {
               app.sandbox.on('husky.loader.initialized', function() {
                  flag = true;
               });
               app.sandbox.emit('husky.edit-toolbar.1.item.loading', '1');
           });

           waitsFor(function() {
              return flag;
           }, 'Loader should have been initialized', 500);

           runs(function() {
               expect(flag).toBe(true);
           });
        });
    });
});

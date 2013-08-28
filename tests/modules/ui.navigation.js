Husky.DEBUG = true;

describe('Husky.Ui.Navigation', function() {
    var $navigationContainer, $navigation, fakeServer;

    beforeEach(function() {
        !!$navigationContainer && $navigationContainer.remove();

        $navigationContainer = $('<div id="navigation"/>');

        fakeServer = sinon.fakeServer.create();

        fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
            '{"title":"Root","hasSub":true,"id":"51f258be2e45b","header":{ "title":"Ivoclar", "logo": "http://lorempixel.com/32/32/nature/" },"sub":{"items":[{"title":"Portals","icon":"portals","hasSub":true,"id":"52f258bc2e47f","action":"/navigation/portals"},{"title":"Settings","icon":"settings","hasSub":true,"id":"51f258be2e47f","sub":{"items":[{"title":"Translate","icon":"translate","hasSub":"false","id":"51f258be2e49a","action":"/settings/translates"}, {"title":"Item","icon":"translate","hasSub":true,"id":"51f258be4e49a","action":"/settings/item"}]}}]}}'
        ]);

        fakeServer.respondWith('GET', '/navigation/portals', [200, { 'Content-Type': 'application/json' },
            '{"header": { "title":"Portals" }, "sub":{"items":[{"title":"Products","icon":"settings","id":"products","hasSub":true,"action":"/portals/products"}, {"title":"Portal 1","icon":"settings","id":"portal_1","hasSub":false,"action":"/portals/products/content","type":"content"}]}}'
        ]);

        fakeServer.respondWith('GET', '/portals/products', [200, { 'Content-Type': 'application/json' },
            '{"sub":{"items":[{"title":"Item 1","id":"item_1","hasSub":true,"action":"/portals/products/product_1"}]}}'
        ]);

        fakeServer.respondWith('GET', '/portals/products/product_1', [200, { 'Content-Type': 'application/json' },
            '{"sub":{"items":[{"title":"Produkt 2","id":"product_2","hasSub":false,"type":"content","action":"/portals/products/product_1/content"}]}}'
        ]);

        $navigation = $navigationContainer.huskyNavigation({
            url: '/navigation',
            collapse: true
        });

        fakeServer.respond();

    });

    afterEach(function() {
        $navigationContainer.remove();
    });

    it('should be defined on jquery object', function() {
        expect(!!$(document).huskyNavigation).toBe(true);
    });

    it('should return the target DOM object', function() {
        expect($('body').huskyNavigation()[0]).toEqual(document.body);
    });

    it('should create an instance of Husky.Ui.Navigation', function() {
        expect(typeof $navigation.data('Husky.Ui.Navigation')).toEqual('object')
        expect($navigation.find('.navigation-columns').length).toEqual(1);
    });

    it('should have 2 navigation-items', function() {
        expect($navigation.find('.navigation-column-item').size()).toEqual(2);
    });

    it('should add another column', function() {
        // navigation item
        $navigation.find('#52f258bc2e47f').click();

        fakeServer.respond();

        expect($navigation.find('.navigation-column').size()).toEqual(2);
    });


    describe('with sub-columns', function() {
        beforeEach(function() {
            $navigation.find('#52f258bc2e47f').click();
            fakeServer.respond();

            $navigation.find('#products').click();
            fakeServer.respond();

            $navigation.find('#item_1').click();
            fakeServer.respond();
        });

        it('should create sub-columns element', function() {
            expect($navigation.find('.navigation-sub-columns').size()).toEqual(1);
        });

        xit('should collapse the first column', function() {
            expect($navigation.find('.navigation-column').size()).toEqual(3);
            expect($navigation.html()).toBe(true);
        });

        xit('should remove sub-columns element', function() {
            $navigation.find('#column-0').click();

            expect($navigation.find('.navigation-sub-columns').size()).toEqual(0);
        });
    });
});
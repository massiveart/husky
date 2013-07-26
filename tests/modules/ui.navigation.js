Husky.DEBUG = true;

describe('Husky.Ui.Navigation', function() {
    var $navigationContainer, fakeServer;

    beforeEach(function() {
        $navigationContainer = $('<div id="navigation"/>');
        $('body').append($navigationContainer);


        fakeServer = sinon.fakeServer.create();

        fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
            '{"title":"Root","hasChildren":true,"id":"51f258be2e45b","sub":{"entries":[{"title":"Settings","icon":"settings", "hasChildren":true,"id":"51f258be2e47f","sub":{"entries":[{"title":"Translate","hasChildren":true,"id":"51f258be2e49a", "action": "dashboard"}]}}]}}'
        ]);

    });

    afterEach(function() {

    });

    it('Create instance', function() {

        try {
            var $navigation = $('#navigation').huskyNavigation({
                url: '/navigation',
                collapse: true
            });

            fakeServer.respond();

        } catch (e) {
            // TODO fail('Navigation instantiation');
        }

        expect(typeof $navigation.data('Husky.Ui.Navigation')).toEqual('object')
        expect($navigationContainer.find('.navigation-columns').length).toEqual(1);
    });
});
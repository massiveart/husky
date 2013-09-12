require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

    var fakeServer;
    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/navigation', [200, { 'Content-Type': 'application/json' },
        '{"title":"Root","hasSub":true,"id":"51f258be2e45b","header":{ "title":"Ivoclar Vivadent", "logo": "../../img/tmp/logo.png" },"sub":{"items":[{"title":"Portals","icon":"portals","hasSub":true,"id":"52f258bc2e47f","action":"/navigation/portals"},{"title":"Settings","icon":"settings","hasSub":true,"id":"51f258be2e47f","sub":{"items":[{"title":"Translate","icon":"translate","hasSub":"false","id":"51f258be2e49a","action":"/settings/translates"}, {"title":"Item","icon":"translate","hasSub":true,"id":"51f258be4e49a","action":"/settings/item"}]}}]}}'
    ]);

    fakeServer.respondWith('GET', '/navigation/portals', [200, { 'Content-Type': 'application/json' },
        '{"header": { "title":"Portals" }, "sub":{"items":[{"title":"Products","icon":"settings","id":"products","hasSub":true,"action":"/portals/products"}, {"title":"Portal 1","icon":"settings","id":"portal_1","hasSub":false,"action":"/portals/products","type":"content"}]}}'
    ]);

    fakeServer.respondWith('GET', '/settings/item', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Items","id":"items","hasSub":false,"action":"/null","type":"content"}]}}'
    ]);

    fakeServer.respondWith('GET', '/settings/translates', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Deutschland","id":"de","hasSub":true,"action":"/settings/translates/de"}]}}'
    ]);

    fakeServer.respondWith('GET', '/settings/translates/de', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Items","id":"items","hasSub":true,"action":"/settings/translates/de/items"}]}}'
    ]);

    fakeServer.respondWith('GET', '/settings/translates/de/items', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Item","id":"item","hasSub":true,"action":"/settings/translates/de/item/sub"}]}}'
    ]);

    fakeServer.respondWith('GET', '/settings/translates/de/item/sub', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Sub","id":"sub","hasSub":false,"type":"content","action":"de"}]}}'
    ]);


    fakeServer.respondWith('GET', '/portals/products', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Produkt 1","id":"product_1","hasSub":true,"action":"/portals/products/product_1"}]}}'
    ]);

    fakeServer.respondWith('GET', '/portals/products/product_1', [200, { 'Content-Type': 'application/json' },
        '{"sub":{"items":[{"title":"Produkt 2","id":"product_2","hasSub":false,"type":"content","action":"/portals/products/product_1/content"}]}}'
    ]);

    var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start().then(function() {
        app.logger.log('Aura started...');
        _.delay(function() {
            fakeServer.respond();
        }, 200);


        app.sandbox.on('navigation:item:selected', function(item) {
            app.logger.log(item);
            _.delay(function() {
                fakeServer.respond();
            }, 500);
        });

        app.sandbox.on('navigation:item:content:show', function(item) {
            app.logger.log('navigation:item:content:show', item);
        });

        _.delay(function() {
            app.sandbox.emit('husky.header.button-type', 'saveDelete');

            _.delay(function() {
                app.sandbox.emit('husky.header.button-state', 'disable');
            }, 1000);

        }, 500);

        app.sandbox.on('husky.button.save.click', function() {
            app.sandbox.emit('husky.header.button-type', 'add');
        });

        app.sandbox.on('husky.button.delete.click', function() {
            app.sandbox.emit('husky.header.button-type', 'add');
        });

        app.sandbox.on('husky.button.add.click', function() {
            app.sandbox.emit('husky.header.button-type', 'saveDelete');
        });
    });

});

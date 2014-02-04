require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

	var fakeServer;
	
	fakeServer = sinon.fakeServer.create();
	fakeServer.respondWith('GET', '/contacts', [200, { 'Content-Type': 'application/json' },
		'{"total": 3, "items": [ { "id": "1", "name": "Private" }, { "id": "2", "name": "Mobile" }, { "id": "3", "name":"Work" }] }'
	]);

	var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start([
        { 
            name: 'select@husky', options: 
            { 
				el: '#s1',
				url: '/contacts'
           	}
        },
       
    ]).then(function() {
        app.logger.log('Aura started...');

         _.delay(function() {
                fakeServer.respond();
            }, 500);

    });

});

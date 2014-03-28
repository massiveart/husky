require.config({
    baseUrl: '../../'
});

require(['lib/husky'], function(Husky) {
    'use strict';

	var app = Husky({ debug: { enable: true }}),
        _ = app.sandbox.util._;

    app.start([
        { 
            name: 'select-url@husky', options:
            { 
				el: '#s1',
				'data': [
					{
						id: 1,
						name: 'abc'
					},
					{
						id: 2,
						name: 'qwertz'
					},
					{
						id: 3,
						name: 'asdf'
					}
				]
           	}
        },
       
    ]).then(function() {
        app.logger.log('Aura started...');

    });

});

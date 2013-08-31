require(['lib/husky'], function(Husky) {
    'use strict';

    Husky({
        debug: {
            enable: true
        }
    }).start().then(function() {
            console.warn('Aura started...');
        });
});

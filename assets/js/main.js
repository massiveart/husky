// component auto-complete
var fakeServer;
$(document).ready(function() {
    fakeServer = sinon.fakeServer.create();

    fakeServer.respondWith('GET', '/contacts?search=abc', [200, { 'Content-Type': 'application/json' },
        '{"total": 3, "items": [ { "id": "1", "name": "abcd" }, { "id": "2", "name": "abcde" }, { "id": "3", "name":"abcdef" }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?search=abcd', [200, { 'Content-Type': 'application/json' },
        '{"total": 3, "items": [ { "id": "1", "name": "abcd" }, { "id": "2", "name": "abcde" }, { "id": "3", "name":"abcdef" }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?search=abcde', [200, { 'Content-Type': 'application/json' },
        '{"total": 2, "items": [ { "id": "2", "name": "abcde" }, { "id": "3", "name":"abcdef" }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?search=abcdef', [200, { 'Content-Type': 'application/json' },
        '{"total": 1, "items": [ { "id": "3", "name":"abcdef" }] }'
    ]);

    fakeServer.respondWith('GET', '/contacts?search=abcdefg', [200, { 'Content-Type': 'application/json' },
        '{"total": 0, "items": [ ] }'
    ]);

    var autoComplete = $('#auto-complete-example').huskyAutoComplete({
        url: '/contacts'
    });

    autoComplete.data('Husky.Ui.AutoComplete').on('auto-complete:loadData', function() {
        setTimeout(function() {
            fakeServer.respond();
        }, 1000);
    });

    fakeServer.respond();
});

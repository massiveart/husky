requirejs.config({
    baseUrl: '../../',
    paths: {
        'form/util': 'js/util',
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'form/util', 'globalize'], function(Form, Util) {
    var form = new Form($('#demo-form'));

    $('#get-data').on('click', function() {
        if (form.validation.validate()) {
            $('.messages').html('<pre>{<br/>' + Util.print(form.mapper.getData()) + '}</pre>')
                .append('<p style="margin: 5px">Everything OK</p>');
        } else {
            $('.messages').html('<p style="margin: 5px">Seems there are some errors.</p>');
        }
    });

    $('#set-data').on('click', function() {
        form.mapper.setData({
            fullName: 'Johannes Wachter',
            email: 'johannes@example.com',
            url: 'example.com',
            message: 'ich bin ein berliner'
        });
    });
});

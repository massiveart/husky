requirejs.config({
    baseUrl: '../../',
    paths: {
        'form/util': 'js/util',
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'form/util', 'globalize'], function(Form, Util) {
    var changeLanguage = function(language) {
        require(['cultures/globalize.culture.' + language], function() {
            Globalize.culture(language);
            form.validation.validate(true);
        }.bind(this));
    };

    var language = 'de';
    changeLanguage(language);

    var form = new Form($('#contact-form'));

    $('#send').on('click', function() {
        if (form.validation.validate()) {
            $('#result').html('<pre>{<br/>' + Util.print(form.mapper.getData()) + '}</pre>');
        }
    });

    $('#language').on('change', function() {
        language = $('#language').val();
        changeLanguage(language);
    });
});

// Register a user into the database
function check_then_register() {
    $.get(
        'http://localhost:3000/users/exists/' + $('#user-reg').val(),
        function(exists) {
            if (exists && !$('#exist-account').attr('loggedin') == 'true') {
                $('#user-reg').addClass('is-invalid');
                $('#user-taken-text').show();

                if ($('#form-reg').attr('driver') == 'true') {
                    toPartOne();
                }
                return;
            } else {
                register();
            }
        }
    );
}

function register() {
    var data = {};
    $('#form-reg :input').each(function() {
        var input = $(this);
        if (!input.is('button')) {
            data[input.attr('name')] = input.val();
        }
    });

    if ($('#form-reg').attr('driver') == 'true') {
        data['driver'] = true;
    } else {
        data['driver'] = false;
    }

    console.log(data);

    $.post(
        'http://localhost:3000/auth/register',
        data,
        function() {
            console.log('redirect')
            if ($('#form-reg').attr('driver') == 'true') {
                window.location = 'http://localhost:3000/make';
            } else {
                window.location = 'http://localhost:3000/search';
            }
        },
        'json'
    );
}

// Check empty fields
function checkEmptyFields() {
    var empty = false;
    $('#form-reg :input').each(function() {
        var input = $(this);
        if (
            input.attr('name') !== undefined && !input.prop('disabled') &&
            (input.val() == undefined || input.val().length == 0)
        ) {
            console.log(input.attr('name') + 'empty');
            if (input.is('#user-reg')) {
                $('#user-taken-text').hide();
            }

            input.addClass('is-invalid');
            empty = true;
        }
    });

    return !empty;
}

function toPartOne() {
    $('#form-reg div').each(function() {
        var input = $(this);
        if (input.hasClass('driver-reg-2')) {
            input.hide(300);
        }
    });
    $('#form-reg div').each(function() {
        var input = $(this);
        if (input.hasClass('driver-reg-1')) {
            input.show(300);
        }
    });
}

$('document').ready(function() {
    $('#continue-form').bind('click', function() {
        $('#form-reg div').each(function() {
            var input = $(this);
            if (input.hasClass('driver-reg-1')) {
                input.hide(200);
            }
        });
        $('#form-reg div')
            .delay(200)
            .each(function() {
                var input = $(this);
                if (input.hasClass('driver-reg-2')) {
                    if (input.is('#car-desc-reg')) {
                        input.css('display', 'flex');
                        input.hide();
                    }
                    input.show(300);
                }
            });
    });

    $('#exist-account').bind('click', function() {
        var redirectURL = 'http://localhost:3000/auth/signin?redirect=';
        if ($('#form-reg').attr('driver') == 'true') {
            redirectURL += encodeURIComponent('http://localhost:3000/auth/register/drive');
        } else  {
            redirectURL += encodeURIComponent('http://localhost:3000/auth/register/ride');
        }
        window.location = redirectURL;
    });

    $('#go-back-reg').bind('click', toPartOne);

    const typeHandler = function(e) {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $('#incorrect-creds').hide(150);
        }
    };

    $('#form-reg :input').each(function() {
        var input = $(this);
        input.bind('input', typeHandler);
    });

    var form_reg = document.getElementById('form-reg');
    form_reg.addEventListener(
        'submit',
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (checkEmptyFields()) {
                if ($('#exist-account').attr('loggedin') == 'true') {
                    register();
                } else {
                    check_then_register();
                }
            }
        },
        false
    );
});

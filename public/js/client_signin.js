// Change from the sign-in page to register
function si_to_reg() {
    $('#sign-in').hide(300, function() {
        var si_form = document.getElementById('form-si');
        si_form.reset();
        si_form.classList.remove('was-validated');
        $('#incorrect-creds').hide();
    });
    $('#auth-splash').animate({ left: '-100%' }, 300, 'linear', function() {
        $('#auth-splash').css('display', 'none');
        $('#register-sel').show(300);
        $('#register-sel').css('display', 'flex');
    });
}

// Change from the register page to sign-in
function reg_to_si() {
    $('#register-sel').hide(300, function() {
        $('#auth-splash').css('display', 'flex');
        $('#auth-splash').animate({ left: '0' }, 200);
        $('#sign-in').show(300);
    });
}

// Check empty fields
function checkEmptyFields() {
    var empty = false;
    $('#form-si :input').each(function() {
        var input = $(this);
        if (input.attr('name') !== undefined && (input.val() == undefined || input.val().length == 0)) {
            console.log(input.attr('name') + "empty")
            input.addClass('is-invalid');
            empty = true;
        }
    });

    return !empty;
}

// Sign an user into the system
function signin() {
    var data = {};
    $('#form-si :input').each(function() {
        var input = $(this);
        if (!input.is('button')) {
            data[input.attr('name')] = input.val();
        }
    });

    $.post(
        'http://localhost:3000/auth/signin',
        data,
        function(res) {
            if (window.location.search.length != 0) {
                redirectURL = decodeURIComponent(window.location.search.slice(3));
                window.location = redirectURL
            } else if (res.mode) {
                window.location = 'http://localhost:3000/make'
            } else {
                window.location = 'http://localhost:3000/search'
            }
        },
        'json'
    ).fail(function() {
        $('#incorrect-creds').show(150);
        $('#form-si :input').each(function() {
            var input = $(this);
            input.addClass('is-invalid');
        });
    });
}

$('document').ready(function() {
    $('#si-to-reg').bind('click', si_to_reg);
    $('#reg-to-si').bind('click', reg_to_si);
    $('#to-drive-reg').bind('click', function() {
        window.location = 'http://localhost:3000/auth/register/drive';
    });
    $('#to-ride-reg').bind('click', function() {
        window.location = 'http://localhost:3000/auth/register/ride';
    });

    const typeHandler = function(e) {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $('#incorrect-creds').hide(150);
        }
    }

    $('#form-si :input').each(function() {
        var input = $(this);
        input.bind('input', typeHandler);
    });
    
    var form_si = document.getElementById("form-si");
    form_si.addEventListener(
        'submit',
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Reset validation
            $('#incorrect-creds').hide();
            if (checkEmptyFields() === true) {
                signin();
            }
        },
        false
    );
});

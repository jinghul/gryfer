// Change from the sign-in page to register
function si_to_reg() {
    $('#sign-in').hide(300, function() {
        var si_form = document.getElementById('form-si');
        si_form.reset();
        si_form.classList.remove('was-validated');
    });
    $('#auth-splash').animate({ left: '-100%' }, 300, 'linear', function() {
        $('#auth-splash').css('display', 'none');
        $('#register').show(300);
    });
}

// Change from the register page to sign-in
function reg_to_si() {
    $('#register').hide(300, function() {
        $('#auth-splash').css('display', 'flex');
        $('#auth-splash').animate({ left: '0' }, 200);

        var reg_form = document.getElementById('form-reg');
        reg_form.reset();
        reg_form.classList.remove('was-validated');

        $('#sign-in').show(300);
    });
}

// Register a user into the database
function register() {
    var data = {};
    $('#form-reg :input').each(function() {
        var input = $(this);
        data[input.attr('name')] = input.val();
    });

    $.post(
        'http://localhost:3000/auth/register',
        data,
        function() {
            reg_to_si();
        },
        'json'
    ).fail(function() {
        // TODO: handle errors
        console.log('registration fail...');
    });
}

// Sign an user into the system
function signin() {
    var data = {};
    $('#form-si :input').each(function() {
        var input = $(this);
        data[input.attr('name')] = input.val();
    });

    $.post(
        'http://localhost:3000/auth/signin',
        data,
        function() {
            console.log('success!');
        },
        'json'
    ).fail(function() {
        console.log('incorrect username or pass');
    });
}

// Reset user entries
function reset(form) {}

$('document').ready(function() {
    $('#si-to-reg').bind('click', si_to_reg);
    $('#reg-to-si').bind('click', reg_to_si);

    var form_reg = document.getElementById("form-reg");
    form_reg.addEventListener(
        'submit',
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (form_reg.checkValidity() === true) {
                register();
            }
            form_reg.classList.add('was-validated');
        },
        false
    );
    
    var form_si = document.getElementById("form-si");
    form_si.addEventListener(
        'submit',
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (form_si.checkValidity() === true) {
                signin();
            }
            form_si.classList.add('was-validated');
        },
        false
    );
});

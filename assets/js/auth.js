// Change from the sign-in page to register
function si_to_reg() {
    $('#sign-in').hide(300);
    // $('#auth-splash').hide(300, function() {
    // });
    $('#auth-splash').animate(
        { left: '-100%'},
        300,
        'linear',
        function() {
            $('#auth-splash').css('display', 'none');
            $('#register').show(300);
        }
    );
}

// Change from the register page to sign-in
function reg_to_si() {
    $('#register').hide(300, function() {
        $('#auth-splash').css('display', 'flex');
        $('#auth-splash').animate(
            { left: '0' },
            200,
        );
        $('#sign-in').show(300);
    });
}

// Register a user into the database
function register() {}

// Sign an user into the system
function signin() {}

// Reset user entries
function reset(form) {}

$('document').ready(function() {
    $('#si-to-reg').bind('click', si_to_reg);
    $('#reg-to-si').bind('click', reg_to_si);

    // TODO: More validation
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener(
            'submit',
            function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            },
            false
        );
    });
});

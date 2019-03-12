// Change from the sign-in page to register
function si_to_reg() {
    $('#sign-in').hide(300, function() {
        si_form = document.getElementById('form-si')
        si_form.reset();
        si_form.classList.remove('was-validated');
    });
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

        reg_form = document.getElementById('form-reg')
        reg_form.reset();
        reg_form.classList.remove('was-validated');

        $('#sign-in').show(300);
    });
}

// Register a user into the database
function register() {
    data = {}
    $('#form-reg :input').each(
        function(){  
            var input = $(this);
            data[input.attr('name')] = input.val();
        }
    );

    $.post('http://localhost:3000/auth/register',
        data,
        function(data, status) {
            alert(data);
        },
    "json");
}

// Sign an user into the system
function signin() {}

// Reset user entries
function reset(form) {}

$('document').ready(function() {
    $('#si-to-reg').bind('click', si_to_reg);
    $('#reg-to-si').bind('click', reg_to_si);

    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener(
            'submit',
            function(event) {
                event.preventDefault();
                event.stopPropagation();
                if (form.checkValidity() === true) {
                    register();
                }
                form.classList.add('was-validated');
            },
            false
        );
    });
});

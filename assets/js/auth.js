// Change from the sign-in page to register
function si_to_reg() {
    $('#sign-in').hide(300);
    $('#auth-splash').animate({"left" : "-100%", "opacity" : "toggle"}, 300, "linear", function() {
        $('#auth-splash').css('background-image', 'url(./img/reg-splash.jpg');
    });
    $('#auth-splash').animate({"left" : "0", "opacity" : "toggle"}, 200);
    $('#register').show(300);
}

// Change from the register page to sign-in
function reg_to_si() {
    $('#register').hide(300);
    $('#auth-splash').animate({"left" : "-100%", "opacity" : "toggle"}, 300, "linear", function() {
        $('#auth-splash').css('background-image', 'url(./img/signin-splash.jpeg');
    });
    $('#auth-splash').animate({"left" : "0", "opacity" : "toggle"}, 200);
    $('#sign-in').show(300);
}

// Register a user into the database
function register() {}

// Sign an user into the system
function signin() {}

$('document').ready(function() {
    $('#si-to-reg').bind('click', si_to_reg);
    $('#reg-to-si').bind('click', reg_to_si);
});

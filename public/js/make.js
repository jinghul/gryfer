function create_ad() {
    $('#form-make :input').each(
        function(){  
            var input = $(this);
            data[input.attr('name')] = input.val();
        }
    );
    console.log(data);
    $.post('http://localhost:3000/ads/',
    data,
    function(results, status) {
        display(results)
    },
"json");
}

$('document').ready(function() {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener(
            'submit',
            function(event) {
                event.preventDefault();
                event.stopPropagation();
                create_ad();
                // if (form.checkValidity() === true) {
                //     register();
                // }
                // form.classList.add('was-validated');
            },
            false
        );
    });
});
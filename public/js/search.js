function display(results) {
    $("#search-results").empty();

    // Some date parsing
    var date = new Date("2019-03-14T06:00:00.000Z");
    var dateString = date.toDateString().split(" ").slice(1, 3).join(" ");
    var timeString = date.toTimeString().split(":").slice(0, 2).join(":");

    var template = Handlebars.templates['ad'];
    results.forEach(function(res) {
        var context = {
            "from" : res.fromaddress,
            "to" : res.toaddress,
            "price" : "$" + res.minbidprice,
            "date" : dateString,
            "time" : timeString,
        }
        var item = template(context);
        $("#search-results").append(item);
    });
}

function search() {
    // Right now just return all

    // data = {}
    // $('#form-search :input').each(
    //     function(){  
    //         var input = $(this);
    //         data[input.attr('name')] = input.val();
    //     }
    // );

    $.get('http://localhost:3000/ads/',
        function(results, status) {
            console.log(results);
            display(results);
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
                search();
                // if (form.checkValidity() === true) {
                //     register();
                // }
                // form.classList.add('was-validated');
            },
            false
        );
    });
    search();
});
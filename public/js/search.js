function display(results) {
    console.log(results);
    $('.ad-result').remove();

    var template = Handlebars.templates['ad'];
    results.forEach(function(res) {
        // Some date parsing
        var date = new Date(res.departuretime);
        var dateString = date
            .toDateString()
            .split(' ')
            .slice(1, 3)
            .join(' ');
        var timeString = date
            .toTimeString()
            .split(':')
            .slice(0, 2)
            .join(':');

        var context = {
            from: res.fromaddress,
            to: res.toaddress,
            price: '$' + res.minbidprice,
            date: dateString,
            time: timeString,
        };
        var item = $(template(context));
        $('#search-results').append(item);
        item.fadeIn(300);
    });
}

function search(params, state) {
    let qurl = 'http://localhost:3000/ads/search';

    console.log(JSON.stringify(state));

    if (!params) {
        params = $('#form-search :input')
            .filter(function(index, element) {
                return $(element).val() != '';
            })
            .serialize();

        if (params !== '') {
            params = '?' + params;
        }

        window.history.pushState(
            {
                sp: params,
                fromAddress: $('#from-fr').val(),
                toAddress: $('#to-fr').val(),
                departureTime: $('#date-fr').val(),
                maxPrice: $('#price-fr').val(),
            },
            'Search',
            params
        );
    } else if (state !== undefined) {
        $('#from-fr').val(state.fromAddress);
        $('#to-fr').val(state.toAddress);
        if (state.departureTime) {
            $('#date-fr')
            .flatpickr({
                enableTime: true,
                dateFormat: 'Y-m-d H:i',
                altInput: true,
                altFormat: 'F j, Y h:i K',
                minDate: 'today',
            })
            .setDate(new Date(state.departureTime));
        }
        $('#price-fr').val(state.maxPrice);
    }

    qurl += params;
    console.log(qurl);

    $.get(
        qurl,
        function(results) {
            display(results);
        },
        'json'
    );
}

$('document').ready(function() {
    $('#date-fr').flatpickr({
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        altInput: true,
        altFormat: 'F j, Y h:i K',
        minDate: 'today',
    });

    if (window.location.search.length != 0) {
        let query = window.location.search.substring(1);
        let state = JSON.parse(
            '{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === '' ? value : decodeURIComponent(value);
            }
        );
        search(window.location.search, state);
    }

    window.onpopstate = function(e) {
        console.log('pop: ' + JSON.stringify(e.state));
        if (e.state) {
            search(e.state.sp, e.state);
        } else {
            $('.ad-result').remove();
            $('#form-search').trigger('reset');
        }
    };

    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener(
            'submit',
            function(event) {
                event.preventDefault();
                event.stopPropagation();
                search();
            },
            false
        );
    });
});

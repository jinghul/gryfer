var aid, currPrice;

function display(res) {
    currPrice = res.currprice
    $('#curr-price').html("$"+parseFloat(res.currprice).toFixed(2));
    if (res.winner) {
        $('#ad-status').html('You won the ride.');
        $('#ad-bid-price').val('');
        $('#ad-bid-price').prop('disabled', true);
        $('#ad-num-pass').prop('disabled', true);
        $('#ad-num-pass').val('');
        $('#submit-bid').prop('disabled', true);
    } else if (res.closed) {
        if (res.owner) {
            $('#ad-status').html('Bidding closed | Accepted');
        } else {
            $('#ad-status').html('Bidding closed | ' + res.numbids);
        }
        $('#ad-bid-price').val('');
        $('#ad-bid-price').prop('disabled', true);
        $('#ad-num-pass').prop('disabled', true);
        $('#ad-num-pass').val('');
        $('#submit-bid').prop('disabled', true);
        $('#accept-btn').prop('disabled', true)
    } else {
        $('#ad-status').html('Accepting Bids | ' + res.numbids + ' bids');
    }
}

function refresh() {
    $.get('http://localhost:3000/ads/' + aid, function(results) {
        display(results);
    });
}

function initMap() {
    $.get(
        'http://localhost:3000/ads/' + aid,
        function(results) {
            let res = results
            console.log(results)

            var map = $('#ad-map');
            var orig_src = map.attr('src');
            orig_src = orig_src.replace('/from_coords/', res.fromlat + ',' + res.fromlng);
            orig_src = orig_src.replace('/to_coords/', res.tolat+","+res.tolng);
            console.log(orig_src)
            map.attr('src', orig_src)
            map.show(300);

            if (res.owner) {
                $('#accept-btn').show();
            }
            
            // Some date parsing
            var date = new Date(res.departuretime);
            var dateString = date
                .toDateString()
                .split(' ')
                .slice(1, 3)
                .join(' ');
            var timeParts = date
                .toTimeString()
                .split(':')
                .slice(0, 2);
            var timeOfDay = 'AM';
            var hour = parseInt(timeParts[0]);

            if (hour >= 12) {
                timeOfDay = 'PM';
                if (hour > 12) {
                    hour = hour - 12;
                }
            } else if (hour == 0) {
                hour = 12;
            }

            var timeString =
                hour.toString() + ':' + timeParts[1] + ' ' + timeOfDay;

            var context = {
                first_style: 'style="border-top:none;"',
                from_loc: res.fromaddress,
                to_loc: res.toaddress,
                date: timeString + ' on ' + dateString
            }
            
            var template = Handlebars.templates['ad_details'];
            $('#ad-desc').append($(template(context)))

            $('#ad-driver-name').html(res.fname);
            $('#ad-driver-rating').html(res.rating);
            $('#ad-driver-rides').html("&nbsp; | &nbsp; " + res.tripsdriven + " rides");
            $('#ad-car').html(res.make + " " + res.model + " &nbsp; | &nbsp; " + res.maxpassengers + " seats")
            display(results);
        },
        'json'
    );
}

function accept() {
    $.post('http://localhost:3000/bids/accept/', function() {
        refresh()
    });
}

function bid() {
    if (parseFloat($('#ad-bid-price').val()) <= parseFloat(currPrice)) {
        $('#ad-bid-price').addClass('is-invalid');
        return;
    }

    var data = {};
    $('#bid-form :input').each(function() {
        var input = $(this);
        if (!input.is('button')) {
            data[input.attr('name')] = input.val();
        }
    });

    data.aid = aid;
    console.log(data)

    $.post('http://localhost:3000/bids/create/', data, function() {
        refresh()
    });
}

// Check empty fields
function checkEmptyFields() {
    var empty = false;
    $('#bid-form :input').each(function() {
        var input = $(this);
        if (
            input.attr('name') !== undefined &&
            !input.prop('disabled') &&
            (input.val() == undefined || input.val().length == 0)
        ) {
            input.addClass('is-invalid');
            empty = true;
        }
    });

    return !empty;
}

$('document').ready(function() {
    let comps = window.location.href.split('/');
    if (comps[comps.length-1] == '/') {
        aid = comps[comps.length - 2].slice(0,1);
    } else {
        aid = comps[comps.length - 1].slice(0,1);
    }

    initMap();

    $('#accept-btn').on('click', function() {
        accept();
    });
    
    $('input').on('keyup', function(e) {
        if (e.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();
            if (checkEmptyFields()) {
                bid();
            }
            return false;
        }
    });

    $('#bid-form').submit(function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (checkEmptyFields()) {
            bid();
        }
    });

    const typeHandler = function(e) {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $('#incorrect-creds').hide(150);
        }
    };
    $('#ad-bid-price').bind('input', typeHandler);
    $('#ad-num-pass').bind('input', typeHandler);
});

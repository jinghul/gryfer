var aid, currPrice;

function display(res) {
    currPrice = res.currprice;
    if (!currPrice) {
        currPrice = res.minbidprice;
    }
    if (!res.numbids) {
        res.numbids = 0;
        $('#accept-btn').prop('disabled', true);
    }
    $('#curr-price').html('$' + parseFloat(currPrice).toFixed(2));
    if (res.closed) {
        if (res.owner) {
            $('#ad-status').html('Bidding Closed | Accepted');
            $('#accept-btn').prop('disabled', true);
        } else if (res.winner) {
            $('#ad-status').html('You won the ride.');
            $('#ad-bid-price').val('');
            $('#ad-bid-price').prop('disabled', true);
            $('#ad-num-pass').prop('disabled', true);
            $('#ad-num-pass').val('');
            $('#submit-bid').prop('disabled', true);
        } else {
            $('#ad-status').html('Bidding Closed | ' + res.numbids + ' bids');
        }
        $('#ad-bid-price').val('');
        $('#ad-bid-price').prop('disabled', true);
        $('#ad-num-pass').prop('disabled', true);
        $('#ad-num-pass').val('');
        $('#submit-bid').prop('disabled', true);
        $('#accept-btn').prop('disabled', true);
    } else {
        $('#ad-status').html('Accepting Bids | ' + res.numbids + ' bids');
    }
}

function refresh() {
    if (!aid) {
        let comps = window.location.href.split('/');
        if (comps[comps.length - 1] == '/') {
            aid = comps[comps.length - 2];
        } else {
            aid = comps[comps.length - 1];
        }
    }
    $.get('http://localhost:3000/ads/' + aid, function(results) {
        display(results);
    }).fail(function(xhr, textStatus, errorThrown) {
        alert('Advertisement not found or deleted.');
    });
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('ad-map'), {
        zoom: 13,
        zoomControl: false,
        scaleControl: false,
        streetViewControl: false,
        mapTypeControlOptions: { mapTypeIds: [] },
    });

    var to_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
    });
    var from_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
    });

    $('#ad-map').show();

    $.get(
        'http://localhost:3000/ads/' + aid,
        function(results) {
            let res = results;
            console.log(results);

            let from_pos = new google.maps.LatLng(
                parseFloat(res.fromlat),
                parseFloat(res.fromlng)
            );
            let to_pos = new google.maps.LatLng(
                parseFloat(res.tolat),
                parseFloat(res.tolng)
            );
            let bounds = new google.maps.LatLngBounds();
            bounds.extend(from_pos);
            bounds.extend(to_pos);
            to_marker.setPosition(to_pos);
            from_marker.setPosition(from_pos);
            map.fitBounds(bounds);

            if (res.owner) {
                $('#accept-btn').show();
                $('#cancel-btn').show();
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
                date: timeString + ' on ' + dateString,
            };

            var template = Handlebars.templates['ad_details'];
            $('#ad-desc').append($(template(context)));
            $('#ad-num-pass').attr('max', res.maxpassengers);

            $('#ad-driver-name').html(res.fname);
            if (!res.rating) {
                res.rating = '- ';
            }
            if (!res.tripsdriven) {
                res.tripsdriven = 0;
            }
            $('#ad-driver-rating').html(parseFloat(res.rating).toFixed(2));
            $('#ad-driver-rides').html(
                '&nbsp; | &nbsp; ' + res.tripsdriven + ' rides'
            );
            $('#ad-car').html(
                res.make +
                    ' ' +
                    res.model +
                    ' &nbsp; | &nbsp; ' +
                    res.maxpassengers +
                    ' seats'
            );
            display(results);
        },
        'json'
    );
}

function accept() {
    $.post('http://localhost:3000/bids/accept/', { aid: aid }, function() {
        refresh();
    });
}

function cancel() {
    $.ajax({
        url: 'http://localhost:3000/ads/delete/' + aid,
        type: 'DELETE',
        success: function() {
            indow.location = 'http://localhost:3000/make';
        },
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

    $.post('http://localhost:3000/bids/create/', data, function(result) {
        refresh();
    }).fail(function() {
        refresh();
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

    var validPass = true;
    try {
        var numpass = parseInt($('#ad-num-pass').val());
        console.log(numpass, parseFloat($('#ad-num-pass').val()));
        if (
            numpass < parseFloat($('#ad-num-pass').val()) ||
            numpass > parseInt($('#ad-num-pass').attr('max')) ||
            numpass <= 0
        ) {
            $('#ad-num-pass').addClass('is-invalid');
            validPass = false;
        }
    } catch (err) {
        $('#ad-num-pass').addClass('is-invalid');
        validpass = false;
    }

    return !empty && validPass;
}

$('document').ready(function() {
    let comps = window.location.href.split('/');
    if (comps[comps.length - 1] == '/') {
        aid = comps[comps.length - 2];
    } else {
        aid = comps[comps.length - 1];
    }

    $('#accept-btn').on('click', function() {
        accept();
    });

    $('#cancel-btn').on('click', function() {
        cancel();
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

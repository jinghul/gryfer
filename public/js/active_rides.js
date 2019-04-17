var ongoing_aid = null;
var ongoing_tb_rated = null;
var currPage = (currPage = $('#ongoing-display'));
var map, to_marker, from_marker;

function initMap() {
    map = new google.maps.Map(document.getElementById('ad-map'), {
        zoom: 13,
        zoomControl: false,
        scaleControl: false,
        streetViewControl: false,
        mapTypeControlOptions: { mapTypeIds: [] },
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
    });
    from_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
    });

    if (window.location.hash == '#ongoing') {
        toOngoing();
    }
}

function toOngoing() {
    window.location.hash = '#ongoing';
    $('.nav-link').removeClass('active');
    $('#ongoing-btn').addClass('active');
    currPage.hide(200);
    currPage = $('#ongoing-display');
    $('#ongoing-display').show(200);

    $.get('http://localhost:3000/user/ads/ongoing', function(results) {
        let res = results;

        console.log(results);

        if (!res) {
            $('#no-ongoing-display').show(300);
            $('#ongoing-card').hide();
            return;
        } else {
            $('#no-ongoing-display').hide();
            $('#ongoing-card').show();
        }

        if (res.filter == 2) {
            $('#complete-btn').hide();
            if (!res.rated) {
                $('#rate-box').show();
            }
        }


        if (res.aid == ongoing_aid) {
            return;
        } else {
            ongoing_aid = res.aid;
            ongoing_tb_rated = res.uid;
        }

        let from_pos = new google.maps.LatLng(
            parseFloat(res.fromlat),
            parseFloat(res.fromlng)
        );
        let to_pos = new google.maps.LatLng(
            parseFloat(res.tolat),
            parseFloat(res.tolng)
        );
        let bounds = new google.maps.LatLngBounds();
        to_marker.setPosition(to_pos);
        from_marker.setPosition(from_pos);
        bounds.extend(to_marker.getPosition());
        bounds.extend(from_marker.getPosition());
        map.fitBounds(bounds,0);
        map.setZoom(13);

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

        var timeString = hour.toString() + ':' + timeParts[1] + ' ' + timeOfDay;

        var context = {
            from_loc: res.fromaddress,
            to_loc: res.toaddress,
            date: timeString + ' on ' + dateString,
        };

        $('#ad-driver-name').html(res.fname);
        if (!res.rating) {
            $('#ad-driver-rating').html('- ');
        } else {
            $('#ad-driver-rating').html(parseFloat(res.rating).toFixed(2));
        }

        if (!res.make) {
            $('#car-item').hide();
        } else {
            $('#car-item').show();
            $('#ad-car').html(
                res.make +
                    ' ' +
                    res.model +
                    ' &nbsp; | &nbsp; ' +
                    res.maxpassengers +
                    ' seats'
            );
        }

        var template = Handlebars.templates['ad_details'];
        $('#ad-desc').append($(template(context)));
    });
}

function complete_ride() {
    if (!ongoing_aid) {
        $('#complete-btn').prop('disabled', true);
        return;
    }
    $.post('http://localhost:3000/ads/complete/' + ongoing_aid, function() {
        $('#complete-btn').hide(200);
        $('#rate-box').show(200);
    });
}

function rate_ride() {
    if (!ongoing_tb_rated || !ongoing_aid) {
        $('#rate-btn').prop('disabled', true);
        return;
    }

    data = {
        forUid: ongoing_tb_rated,
        rating: $('#rate-ad').val(),
        aid: ongoing_aid
    };

    if ($('#complete-btn').length !== 0) {
        $.post('http://localhost:3000/ratings/passengers/', data, function() {
            $('#rate-box').hide(200);
            $('#finish-rating').show(200);
        });
    } else {
        $.post('http://localhost:3000/ratings/drivers/', data, function() {
            $('#rate-box').hide(200);
            $('#finish-rating').show(200);
        });
    }
}

function toAccepted() {
    window.location.hash = '#accepted';
    $('.nav-link').removeClass('active');
    $('#accepted-btn').addClass('active');
    currPage.hide(200);
    currPage = $('#accepted-display');
    $('#accepted-display').show(200);

    $.get('http://localhost:3000/user/ads/accepted', function(results) {
        console.log(results);
        $('#accepted-display > .ad-result').remove();

        if (!results || results.length == 0) {
            $('#no-accepted-display').show(300);
            return;
        }

        $('#no-accepted-display').hide();
        var template = Handlebars.templates['ad'];
        for (var i = 0; i < results.length; i++) {
            var res = results[i];

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
                index: i,
                from: res.fromaddress,
                to: res.toaddress,
                price: '$' + parseFloat(res.listprice).toFixed(2),
                date: dateString,
                time: timeString,
            };

            var item = $(template(context));
            $('#accepted-display').append(item);
            let id = '#search-result-' + i.toString();
            let res_id = res.aid.toString();
            console.log(id, res_id);
            $(id).on('click', function(aid) {
                return function() {
                    console.log('going to http://localhost:3000/ads/id/' + aid.toString())
                    window.open('http://localhost:3000/ads/id/' + aid.toString(), '_blank');
                }
            }(res_id));

            item.fadeIn(300);
        }
    });
}

function toBidding() {
    window.location.hash = '#bidding';
    $('.nav-link').removeClass('active');
    $('#bidding-btn').addClass('active');
    currPage.hide(200);
    currPage = $('#bidding-display');
    $('#bidding-display').show(200);

    $.get('http://localhost:3000/user/ads/bidding', function(results) {
        console.log(results);
        $('#bidding-display > .ad-result').remove();

        if (!results || results.length == 0) {
            $('#no-bidding-display').show(300);
            return;
        }

        $('#no-bidding-display').hide();
        var template = Handlebars.templates['ad'];
        for (var i = 0; i < results.length; i++) {
            var res = results[i];

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

            if (!res.listprice) {
                if (!res.bidprice) {
                    res.listprice = res.minbidprice;
                } else {
                    res.listprice = res.bidprice;
                }
            }

            var context = {
                index: i,
                from: res.fromaddress,
                to: res.toaddress,
                price: '$' + parseFloat(res.listprice).toFixed(2),
                date: dateString,
                time: timeString,
            };

            var item = $(template(context));
            $('#bidding-display').append(item);
            let id = '#search-result-' + i.toString();
            let res_id = res.aid.toString();
            console.log(id, res_id);
            $(id).on('click', function() {
                    window.open('http://localhost:3000/ads/id/' + res_id, '_blank');
                }
            );
            item.fadeIn(300);
        }
    });
}

$('document').ready(function() {
    $('#rate-ad').barrating({
        theme: 'css-stars',
    });
    $('#rate-btn').on('click', function() {
        rate_ride();
        $(this).prop('disabled', true);
        $('#rate-ad').barrating({
            theme: 'css-stars',
            readonly: true,
        });
    });

    $('#ongoing-btn').on('click', toOngoing);
    $('#accepted-btn').on('click', toAccepted);
    $('#bidding-btn').on('click', toBidding);

    $('#complete-btn').on('click', function() {
        complete_ride();
    });

    page = $('#ongoing-display');

    if (window.location.hash.length != 0) {
        let page = window.location.hash.substring(1);
        if (page == 'accepted') {
            toAccepted();
        } else if (page == 'bidding') {
            toBidding();
        } else {
            window.location.hash = '#ongoing';
            if (map !== undefined) {
                toOngoing();
            }
        }
    } else {
        window.location.hash = '#ongoing';
        if (map !== undefined) {
            toOngoing();
        }
    }
});

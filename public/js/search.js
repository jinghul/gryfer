var markers,
    map,
    from_marker,
    to_marker,
    bounds,
    autocomplete_from,
    autocomplete_to,
    path;

function initMapAndAutocomplete() {
    map = new google.maps.Map(document.getElementById('search-map'), {
        zoom: 13,
        zoomControl: false,
        scaleControl: false,
        streetViewControl: false,
        mapTypeControlOptions: { mapTypeIds: [] },
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setCenter(
                new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                )
            );
        });
    } else {
        map.setCenter(new google.maps.LatLng(1.2994266, 103.7784662));
    }

    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete_from = new google.maps.places.Autocomplete(
        document.getElementById('from-fr')
    );

    autocomplete_to = new google.maps.places.Autocomplete(
        document.getElementById('to-fr')
    );

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete_from.bindTo('bounds', map);
    autocomplete_to.bindTo('bounds', map);

    // Set the data fields to return when the user selects a place.
    autocomplete_from.setFields([
        'address_components',
        'geometry',
        'icon',
        'name',
    ]);
    autocomplete_to.setFields([
        'address_components',
        'geometry',
        'icon',
        'name',
    ]);

    from_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });
    markers = [];

    if (window.location.search.length != 0) {
        let query = window.location.search.substring(1);
        console.log('{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}')
        let state = JSON.parse(
            '{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === '' ? value : decodeURIComponent(value);
            }
        );
        search(window.location.search, state);
    } else {
        search();
    }

    $('#loading').hide();
}

function scrollToAd(ad) {
    var position = ad.position();
    $('#search-results').stop().animate({scrollTop: position.top}, 300);
    ad.addClass('outline-shadow');
    setTimeout(function() {
        ad.removeClass('outline-shadow');
    }, 500);
}

function display(results) {
    console.log(results);
    $('.ad-result').remove();

    if (results.length == 0) {
        $('#no-results').show(200);
    }

    if (!bounds) {
        bounds = new google.maps.LatLngBounds();
    }

    var template = Handlebars.templates['ad'];
    for (var i = 0; i < results.length; i++) {
        var res = results[i]

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
            index: i,
            from: res.fromaddress,
            to: res.toaddress,
            price: '$' + parseFloat(res.listprice).toFixed(2),
            date: dateString,
            time: timeString,
        };

        var item = $(template(context));
        $('#search-results').append(item);

        item.fadeIn(300);

        let from_pos = new google.maps.LatLng(parseFloat(res.fromlat), parseFloat(res.fromlng))
        let to_pos = new google.maps.LatLng(parseFloat(res.tolat), parseFloat(res.tolng))
        var res_to_marker = new google.maps.Marker({
            map: map,
            position: to_pos,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red.png',
                labelOrigin: new google.maps.Point(16, 10)
            },
            label: (i+1).toString()
        });
        var res_from_marker = new google.maps.Marker({
            map: map,
            position: from_pos,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green.png',
                labelOrigin: new google.maps.Point(16, 10)
            },
            label: (i+1).toString()
        });

        let id = "#search-result-" + i.toString()
        $(id).on('click', function() {
            window.open('http://localhost:3000/ads/id/' + res.aid, '_blank');
        })

        res_to_marker.setPosition(to_pos);
        res_from_marker.setPosition(from_pos);
        res_to_marker.addListener('click', function() {
            scrollToAd($(id));
        })
        res_from_marker.addListener('click', function() {
            scrollToAd($(id));
        })

        markers.push(res_to_marker, res_from_marker);

        bounds.extend(to_pos);
        bounds.extend(from_pos);
    }

    if (markers.length != 0) {
        map.fitBounds(bounds);
    }

    markers.push(to_marker, from_marker);
}

function search(params, state) {
    let qurl = 'http://localhost:3000/ads/search';

    console.log(JSON.stringify(state));
    $('#no-results').hide();

    if (!params) {
        params = $('#form-search :input')
            .filter(function(index, element) {
                return $(element).val() != '';
            })
            .serialize();

        if (params !== '') {
            let new_state = {
                fromAddress: $('#from-fr').val(),
                toAddress: $('#to-fr').val(),
                departureTime: $('#date-fr').val(),
                maxPrice: $('#price-fr').val(),
                maxPassengers: $('#passengers-fr').val()
            };

            if ($('#to-fr').val() != '') {
                let location = autocomplete_to.getPlace();
                if (location) {
                    params =
                        'toLat=' +
                        location.geometry.location.lat() +
                        '&toLng=' +
                        location.geometry.location.lng() + "&" + params;
                    new_state.toLat = location.geometry.location.lat();
                    new_state.toLng = location.geometry.location.lng();
                }
            }

            if ($('#from-fr').val() != '') {
                let location = autocomplete_from.getPlace();
                if (location) {
                    params =
                        'fromLat=' +
                        location.geometry.location.lat() +
                        '&fromLng=' +
                        location.geometry.location.lng() + "&" + params;
                    new_state.fromLat = location.geometry.location.lat();
                    new_state.fromLng = location.geometry.location.lng();
                }
            }

            params = "?" + params;
            new_state.params = params;
            window.history.pushState(new_state, 'Search', params);
        } else {
            window.history.pushState({}, 'Search', '/search');
        }
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
        $('#passengers-fr').val(state.maxPassengers)
    }

    qurl += params;
    console.log(qurl);

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap[null];
    }

    markers = [];

    bounds = null;

    let from_place = autocomplete_from.getPlace()
    if (from_place) {
        from_marker.setMap(map);
        from_marker.setPosition(from_place.geometry.location);
        from_marker.setVisible(true);
        bounds = new google.maps.LatLngBounds();
        bounds.extend(from_marker.getPosition());
    } else if (state && state.fromLat && state.fromLng) {
        from_marker.setMap(map);
        from_marker.setPosition(new google.maps.LatLng(state.fromLat, state.fromLng));
        from_marker.setVisible(true);
        bounds = new google.maps.LatLngBounds();
        bounds.extend(from_marker.getPosition());
    }

    let to_place = autocomplete_to.getPlace();
    if (to_place) {
        to_marker.setMap(map);
        to_marker.setPosition(to_place.geometry.location);
        to_marker.setVisible(true);
        if (!bounds) {
            bounds = new google.maps.LatLngBounds();
        }
        bounds.extend(to_marker.getPosition());
    } else if (state && state.toLat && state.toLng) {
        to_marker.setMap(map);
        to_marker.setPosition(new google.maps.LatLng(state.toLat, state.toLng));
        to_marker.setVisible(true);
        if (!bounds) {
            bounds = new google.maps.LatLngBounds();
        }
        bounds.extend(to_marker.getPosition());
    }

    if (bounds) {
        map.fitBounds(bounds);
    }

    $.get(
        qurl,
        function(results) {
            display(results);
        },
        'json'
    );
}

$('document').ready(function() {
    setTimeout(function() {
        $('#loading').hide();
    }, 20 * 1000);
    
    $('#date-fr').flatpickr({
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        altInput: true,
        altFormat: 'F j, Y h:i K',
        minDate: 'today',
    });

    $('.search-clear').hover(
        function() {
            $(this).css('display', 'inline-block');
        },
        function() {
            $(this).hide();
        }
    );

    $('input').hover(
        function() {
            if ($(this).val().length != 0) {
                $(this)
                    .parent()
                    .siblings('.search-clear')
                    .show();
            }
        },
        function() {
            $(this)
                .parent()
                .siblings('.search-clear')
                .hide();
        }
    );

    $('.search-clear').click(function() {
        $(this)
            .siblings('div')
            .children('input')
            .val('')
            .focus();
        $(this).hide();
    });

    $('input').on('keyup', function(e) {
        if (e.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();
            search();
            return false;
        }
    });

    window.onpopstate = function(e) {
        console.log('pop: ' + JSON.stringify(e.state));
        if (e.state) {
            search(e.state.sp, e.state);
        } else {
            $('.ad-result').remove();
            $('#form-search').trigger('reset');
        }
    };

    $('#form-search').submit(function(event) {
        event.preventDefault();
        event.stopPropagation();
        search();
    });
});

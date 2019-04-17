var markers,
    map,
    from_marker,
    to_marker,
    from_place,
    to_place,
    bounds,
    autocomplete_from,
    autocomplete_to,
    path;

function getFavoriteAutocomplete(input, side) {
    var inp = input;

    return function(e) {
        var a,
            b,
            i,
            val = this.value;

        closeAllLists();
        if (side === 'to') {
            to_place = null;
        } else {
            from_place = null;
        }
        if (!val) {
            return false;
        }

        $.get('http://localhost:3000/destinations/user', function(results) {
            if (!results || results.length == 0) {
                return false;
            }

            a = document.createElement('DIV');
            a.setAttribute('id', side + 'autocomplete-list');
            a.setAttribute('class', 'autocomplete-items');

            var container;
            if (side == 'to') {
                container = document.getElementsByClassName('pac-container')[1];
            } else {
                container = document.getElementsByClassName('pac-container')[0]
            }
            container.appendChild(a);

            countAdded = 0;
            /*for each item in the array...*/
            for (i = 0; i < results.length && countAdded < 5; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (
                    results[i].nickname.substr(0, val.length).toUpperCase() ==
                    val.toUpperCase()
                ) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement('DIV');
                    /*make the matching letters bold:*/
                    b.innerHTML =
                        '<span class="fas fa-heart"></span>' +
                        '<strong>' +
                        results[i].nickname.substr(0, val.length) +
                        '</strong>';
                    b.innerHTML += results[i].nickname.substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML +=
                        "<input type='hidden' value='" +
                        results[i].nickname +
                        "' lat='" +
                        results[i].lat +
                        "' lng='" +
                        results[i].lng +
                        "' address='" + results[i].address+ "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener('mousedown', function(e) {
                        /*insert the value for the autocomplete text field:*/
                        console.log('clicked');
                        var hid_inp = this.getElementsByTagName('input')[0];
                        inp.value = hid_inp.getAttribute('address');
                        if (side === 'to') {
                            to_place = new google.maps.LatLng(
                                parseFloat(hid_inp.getAttribute('lat')),
                                parseFloat(hid_inp.getAttribute('lng'))
                            );
                        } else {
                            console.log(
                                'from_place changed: ' +
                                    hid_inp.getAttribute('lat') +
                                    ' ' +
                                    hid_inp.getAttribute('lng')
                            );
                            from_place = new google.maps.LatLng(
                                parseFloat(hid_inp.getAttribute('lat')),
                                parseFloat(hid_inp.getAttribute('lng'))
                            );
                        }
                    });
                    a.appendChild(b);
                    countAdded++;
                }
            }
        });

        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName('autocomplete-items');
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
    };
}

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
    document
        .getElementById('from-fr')
        .addEventListener(
            'input',
            getFavoriteAutocomplete(document.getElementById('from-fr'), 'from')
        );
    document
        .getElementById('from-fr')
        .addEventListener(
            'focus',
            getFavoriteAutocomplete(document.getElementById('from-fr'), 'from')
        );
    document
        .getElementById('to-fr')
        .addEventListener(
            'input',
            getFavoriteAutocomplete(document.getElementById('to-fr'), 'to')
        );
    document
        .getElementById('to-fr')
        .addEventListener(
            'focus',
            getFavoriteAutocomplete(document.getElementById('to-fr'), 'to')
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

    autocomplete_from.addListener('place_changed', function() {
        var place = autocomplete_from.getPlace();
        if (place.geometry) {
            from_place = place.geometry.location;
        }
    });

    autocomplete_to.addListener('place_changed', function() {
        var place = autocomplete_to.getPlace();
        if (place.geometry) {
            to_place = place.geometry.location;
        }
        console.log('here')
    });

    from_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });
    markers = [];

    onStateChange();
    $('#loading').hide(300);
}

function onStateChange() {
    if (window.location.search.length != 0) {
        let query = window.location.search.substring(1);
        let state = JSON.parse(
            '{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === '' ? value : decodeURIComponent(value);
            }
        );
        search(state);
    } else {
        search();
    }
}

function scrollToAd(ad) {
    var position = ad.position();
    $('#search-results')
        .stop()
        .animate({ scrollTop: position.top }, 300);
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

        let from_pos = new google.maps.LatLng(
            parseFloat(res.fromlat),
            parseFloat(res.fromlng)
        );
        let to_pos = new google.maps.LatLng(
            parseFloat(res.tolat),
            parseFloat(res.tolng)
        );
        var res_to_marker = new google.maps.Marker({
            map: map,
            position: to_pos,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red.png',
                labelOrigin: new google.maps.Point(16, 10),
            },
            label: (i + 1).toString(),
        });
        var res_from_marker = new google.maps.Marker({
            map: map,
            position: from_pos,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green.png',
                labelOrigin: new google.maps.Point(16, 10),
            },
            label: (i + 1).toString(),
        });

        let id = '#search-result-' + i.toString();
        let res_id = res.aid.toString();
        $(id).on('click', function() {
            window.location = 'http://localhost:3000/ads/id/' + res_id;
        });

        res_to_marker.setPosition(to_pos);
        res_from_marker.setPosition(from_pos);
        res_to_marker.addListener('click', function() {
            scrollToAd($(id));
        });
        res_from_marker.addListener('click', function() {
            scrollToAd($(id));
        });

        markers.push(res_to_marker);
        markers.push(res_from_marker);

        bounds.extend(to_pos);
        bounds.extend(from_pos);
    }

    if (markers.length != 0) {
        map.fitBounds(bounds);
    }

    markers.push(from_marker);
    markers.push(to_marker);
}

function search(state) {
    let qurl = 'http://localhost:3000/ads/search';

    console.log(JSON.stringify(state));
    $('#no-results').hide();

    var params;
    if (!state) {
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
                maxPassengers: $('#passengers-fr').val(),
            };

            console.log(to_place)
            if ($('#to-fr').val() != '') {
                let location = to_place;
                if (location) {
                    params =
                        'toLat=' +
                        location.lat() +
                        '&toLng=' +
                        location.lng() +
                        '&' +
                        params;
                    new_state.toLat = location.lat();
                    new_state.toLng = location.lng();
                }
            }

            if ($('#from-fr').val() != '') {
                let location = from_place;
                if (location) {
                    params =
                        'fromLat=' +
                        location.lat() +
                        '&fromLng=' +
                        location.lng() +
                        '&' +
                        params;
                    new_state.fromLat = location.lat();
                    new_state.fromLng = location.lng();
                }
            }

            params = '?' + params;
            window.history.pushState(new_state, 'Search', params);
        } else {
            window.history.pushState({}, 'Search', '/search');
        }
    } else {
        $('#from-fr')
            .val(state.fromAddress)
            .change();
        $('#to-fr')
            .val(state.toAddress)
            .change();
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
        $('#passengers-fr').val(state.maxPassengers);

        if (state.fromLat && state.fromLng) {
            from_place = new google.maps.LatLng(
                parseFloat(state.fromLat),
                parseFloat(state.fromLng)
            );
        }
        if (state.toLat && state.toLng) {
            to_place = new google.maps.LatLng(
                parseFloat(state.toLat),
                parseFloat(state.toLng)
            );
        }

        params = [];
        for (var p in state)
            if (state.hasOwnProperty(p)) {
                params.push(
                    encodeURIComponent(p) + '=' + encodeURIComponent(state[p])
                );
            }
        params = '?' + params.join('&');
    }

    qurl += params;
    console.log(qurl);

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    markers = [];
    bounds = null;

    if (from_place && $('#from-fr').val().length > 0) {
        from_marker.setMap(map);
        from_marker.setPosition(from_place);
        from_marker.setVisible(true);
        bounds = new google.maps.LatLngBounds();
        bounds.extend(from_marker.getPosition());
    }

    if (to_place && $('#to-fr').val().length > 0) {
        to_marker.setMap(map);
        to_marker.setPosition(to_place);
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

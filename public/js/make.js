var markers,
    map,
    from_marker,
    to_marker,
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
                container = document.getElementsByClassName('pac-container')[0];
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
                            to_marker.setPosition(
                                new google.maps.LatLng(
                                    parseFloat(hid_inp.getAttribute('lat')),
                                    parseFloat(hid_inp.getAttribute('lng'))
                                )
                            );

                            bounds = new google.maps.LatLngBounds();
                            bounds.extend(to_marker.getPosition());

                            let from_place = from_marker.getPosition();
                            if (from_place) {
                                bounds.extend(from_place);
                            }
                            map.fitBounds(bounds);
                        } else {
                            from_marker.setPosition(
                                new google.maps.LatLng(
                                    parseFloat(hid_inp.getAttribute('lat')),
                                    parseFloat(hid_inp.getAttribute('lng'))
                                )
                            );

                            bounds = new google.maps.LatLngBounds();
                            bounds.extend(from_marker.getPosition());

                            let to_place = to_marker.getPosition();
                            if (to_place) {
                                bounds.extend(to_place);
                            }
                            map.fitBounds(bounds);
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
    map = new google.maps.Map(document.getElementById('make-map'), {
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
        document.getElementById('from-mr')
    );

    autocomplete_to = new google.maps.places.Autocomplete(
        document.getElementById('to-mr')
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
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            labelOrigin: new google.maps.Point(16, 10),
        },
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            labelOrigin: new google.maps.Point(16, 10),
        },
    });

    document
        .getElementById('from-mr')
        .addEventListener(
            'input',
            getFavoriteAutocomplete(document.getElementById('from-mr'), 'from')
        );
    document
        .getElementById('from-mr')
        .addEventListener(
            'focus',
            getFavoriteAutocomplete(document.getElementById('from-mr'), 'from')
        );
    document
        .getElementById('to-mr')
        .addEventListener(
            'input',
            getFavoriteAutocomplete(document.getElementById('to-mr'), 'to')
        );
    document
        .getElementById('to-mr')
        .addEventListener(
            'focus',
            getFavoriteAutocomplete(document.getElementById('to-mr'), 'to')
        );

    google.maps.event.addListener(
        autocomplete_from,
        'place_changed',
        function() {
            let from_place = autocomplete_from.getPlace();
            if (from_place) {
                from_marker.setPosition(from_place.geometry.location);

                bounds = new google.maps.LatLngBounds();
                bounds.extend(from_marker.getPosition());

                let to_place = to_marker.getPosition();
                if (to_place) {
                    bounds.extend(to_place);
                }
                map.fitBounds(bounds);
            }
        }
    );
    google.maps.event.addListener(autocomplete_to, 'place_changed', function() {
        let to_place = autocomplete_to.getPlace();
        if (to_place) {
            to_marker.setPosition(to_place.geometry.location);

            bounds = new google.maps.LatLngBounds();
            bounds.extend(to_marker.getPosition());

            let from_place = autocomplete_from.getPlace();
            if (from_place) {
                bounds.extend(from_place);
            }
            map.fitBounds(bounds);
        }
    });
}

function create_ad() {
    let data = {};
    $('#form-make :input').each(function() {
        var input = $(this);
        data[input.attr('name')] = input.val();
    });

    let from_place = from_marker.getPosition();
    let to_place = to_marker.getPosition();
    if (from_place) {
        data.fromlat = from_place.lat();
        data.fromlng = from_place.lng();
    }
    if (to_place) {
        data.tolat = to_place.lat();
        data.tolng = to_place.lng();
    }

    $.post(
        'http://localhost:3000/ads/',
        data,
        function(results) {
            console.log(results);
            window.location = 'http://localhost:3000/tracking#bidding';
        },
        'json'
    ).fail(function(xhr, status, error) {
        if (xhr.status == 201) {
            console.log(status);
            window.location = 'http://localhost:3000/tracking#bidding';
        }
    });
}

// Check empty fields
function checkEmptyFields() {
    var empty = false;
    $('#form-make :input').each(function() {
        var input = $(this);
        if (
            input.attr('name') !== undefined &&
            !input.prop('disabled') &&
            (input.val() == undefined || input.val().length == 0)
        ) {
            console.log(input.attr('name') + 'empty');
            input.addClass('is-invalid');
            empty = true;
        }
    });

    return !empty;
}

$('document').ready(function() {
    $('#view-creates').bind('click', function() {
        window.location = 'http://localhost:3000/tracking#bidding';
    });

    const typeHandler = function(e) {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $('.invalid-feedback').hide(150);
        }
    };

    $('#form-make :input').each(function() {
        var input = $(this);
        input.bind('input', typeHandler);
    });

    var form = document.getElementById('form-make');
    form.addEventListener(
        'submit',
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (checkEmptyFields()) {
                create_ad();
            }
        },
        false
    );
});

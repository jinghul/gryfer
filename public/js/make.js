var markers,
    map,
    from_marker,
    to_marker,
    bounds,
    autocomplete_from,
    autocomplete_to,
    path;

function initMapAndAutocomplete() {
    console.log('here')

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
            labelOrigin: new google.maps.Point(16, 10)
        },
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            labelOrigin: new google.maps.Point(16, 10)
        },
    });

    google.maps.event.addListener(
        autocomplete_from,
        'place_changed',
        function() {
            let from_place = autocomplete_from.getPlace();
            if (from_place) {
                from_marker.setPosition(from_place.geometry.location);

                bounds = new google.maps.LatLngBounds();
                bounds.extend(from_marker.getPosition());

                let to_place = autocomplete_to.getPlace();
                if (to_place) {
                    bounds.extend(to_place.geometry.location)
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
                bounds.extend(from_place.geometry.location);
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

    let from_place = autocomplete_from.getPlace();
    let to_place = autocomplete_to.getPlace();
    if (from_place) {
        data.fromlat = from_place.geometry.location.lat();
        data.fromlng = from_place.geometry.location.lng();
    }
    if (to_place) {
        data.tolat = to_place.geometry.location.lat();
        data.tolng = to_place.geometry.location.lng();
    }
    console.log(data);

    $.post(
        'http://localhost:3000/ads/',
        data,
        function(results) {
            window.location = window.location = 'http://localhost:3000/active?page=bidding';
        },
        'json'
    );
}

$('document').ready(function() {

    $('#view-creates').bind('click', function() {
        window.location = 'http://localhost:3000/active';
    })

    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener(
            'submit',
            function(event) {
                event.preventDefault();
                event.stopPropagation();
                create_ad();
            },
            false
        );
    });
});

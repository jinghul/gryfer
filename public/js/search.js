var markers, map, from_marker, to_marker, bounds, autocomplete_from, autocomplete_to;

function initMapAndAutocomplete() {
    map = new google.maps.Map(document.getElementById('search-map'), {
        zoom: 13,
        mapTypeControlOptions: { mapTypeIds: [] }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        });
    } else {
        map.setCenter(new google.maps.LatLng(1.2994266, 103.7784662));
    }

    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete_from = new google.maps.places.Autocomplete(
        document.getElementById('from-fr'),
    );

    autocomplete_to = new google.maps.places.Autocomplete(
        document.getElementById('to-fr'),
    );

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete_from.bindTo('bounds', map);
    autocomplete_to.bindTo('bounds', map);

    // Set the data fields to return when the user selects a place.
    autocomplete_from.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocomplete_to.setFields(['address_components', 'geometry', 'icon', 'name']);

    from_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });

    to_marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    markers = []
    
    if (window.location.search.length != 0) {
        let query = window.location.search.substring(1);
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
    results.forEach(function(res) {
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
            hour = 12
        }

        var timeString = hour.toString() + ":" + timeParts[1] + " " + timeOfDay;

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

        // var res_to_marker = new google.maps.Marker({
        //     map: map,
        //     label: Math.floor(markers.length / 2) + 1,
        //     icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        // });
        // var res_from_marker = new google.maps.Marker({
        //     map: map,
        //     label: Math.floor(markers.length / 2) + 1,
        //     icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        // });
        // res_to_marker.setPosition({lat: res.tolat, lng: res.tolng})
        // res_from_marker.setPosition({lat: res.fromlat, lng: res.fromlng})

        // markers.push(res_to_marker, res_from_marker);

        // bounds.extend({lat: res.tolat, lng: res.tolng});
        // bounds.extend({lat: res.fromlat, lng: res.fromlng});
    });

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
            params = '?' + params;
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
    }

    qurl += params;
    console.log(qurl);

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap[null];
    }

    markers = [];

    bounds = null
    if (autocomplete_from.getPlace()) {
        from_marker.setMap(map);
        from_marker.setPosition(autocomplete_from.getPlace().geometry.location);
        from_marker.setVisible(true);
        bounds = new google.maps.LatLngBounds();
        bounds.extend(from_marker.getPosition());
    }
    if (autocomplete_to.getPlace()) {
        to_marker.setMap(map);
        to_marker.setPosition(autocomplete_to.getPlace().geometry.location);
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
    $('#date-fr').flatpickr({
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        altInput: true,
        altFormat: 'F j, Y h:i K',
        minDate: 'today',
    });

    $('.search-clear').hover(function() {
        $(this).css('display', 'inline-block')
    }, function() {
        $(this).hide();
    })

    $('input').hover(function() {
        if ($(this).val().length != 0) {
            $(this).parent().siblings('.search-clear').show();
        }
    }, function() {
        $(this).parent().siblings('.search-clear').hide();
    })

    $('.search-clear').click(function() {
        $(this)
            .siblings('div')
            .children('input')
            .val('')
            .focus();
        $(this).hide();
    });

    $("input").on('keyup', function (e) {
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

    $('#form-search').submit(
        function(event) {
            event.preventDefault();
            event.stopPropagation();
            search();
        }
    );
});

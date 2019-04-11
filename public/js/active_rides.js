var ongoing_aid = null;

function toOngoing() {
    $.get('http://localhost:3000/ads/ongoing', function(results) {
        let res = results;

        console.log(results);

        if (!res) {
            $('#no-ads-display').show(300);
            return;
        }

        if (res.aid == ongoing_aid) {
            return;
        } else {
            ongoing_aid = res.aid;
        }

        var map = $('#ad-map');
        var orig_src = map.attr('src');
        orig_src = orig_src.replace(
            '/from_coords/',
            res.fromlat + ',' + res.fromlng
        );
        orig_src = orig_src.replace('/to_coords/', res.tolat + ',' + res.tolng);
        console.log(orig_src);
        map.attr('src', orig_src);
        map.show(300);

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
        $('#ad-driver-rating').html(res.rating);

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

        $('#ongoing-card').show(300);

        if (res.completed) {
            $('#rate-box').show();
        }
    });
}

function complete_ride() {
    
}

function rate_ride() {

}


$('document').ready(function() {

    $('#rate-ad').barrating({
        theme: 'css-stars',
    });
    $('#rate-btn').on('click', function() {
        rate_ride();
    })

    $('#complete-btn').on('click', function() {
        complete_ride();
        $(this).hide(200)
        $("#rate-box").show(200);
    })

    if (window.location.search.length != 0) {
        let query = window.location.search.substring(1);
        let state = JSON.parse(
            '{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === '' ? value : decodeURIComponent(value);
            }
        );

        let page = state.page
        if (page == 'accepted') {
            toAccepted();
        } else if (page == 'Bidding') {
            toBidding();
        } else {
            toOngoing();
        }
    } else {
        toOngoing();
    }
});

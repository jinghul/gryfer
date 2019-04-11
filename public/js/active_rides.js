var ongoing_aid = null;
var ongoing_tb_rated = null;
var currPage = null;

function toOngoing() {
    $('#title').html('Ongoing');
    currPage.hide(200);
    currPage = $('#ongoing-display');
    $('#ongoing-display').show(200);

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
            ongoing_tb_rated = res.uid;
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

        if (res.completed && !res.rated) {
            $('#rate-box').show();
        }
    });
}

function complete_ride() {
    if (!ongoing_aid) {
        $('#complete-btn').prop('disabled', true);
        return;
    }
    $.post('http://localhost:3000/complete/' + ongoing_aid, function() {
        $('#complete-btn').hide(200);
        $('#rate-box').show(200);
    });
}

function rate_ride() {
    if (!ongoing_tb_rated || !ongoing_aid) {
        $('#rate-btn').prop('disabled', true)
        return
    }

    data = {
        forUid: ongoing_tb_rated,
        rating: $('#rate-ad').val()
    }

    if ($('#complete-btn') !== undefined) {
        $.post('http://localhost:3000/ratings/drivers/', data, function() {
            $('#rate-box').hide(200);
            $('#finish-rating').show(200);
        });
    } else {
        $.post('http://localhost:3000/ratings/passengers/', data, function() {
            $('#rate-box').hide(200);
            $('#finish-rating').show(200);
        });
    }
}

function toAccepted() {
    $('#title').html('Accepted');
    currPage.hide(200);
    currPage = $('#accepted-display');
    $('#accepted-display').show(200);
}

function toBidding() {
    $('#title').html('Bidding');
    currPage.hide(200);
    currPage = $('#bidding-display');
    $('#bidding-display').show(200);
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
        let page = window.location.search.substring(1);
        if (page == 'accepted') {
            toAccepted();
        } else if (page == 'Bidding') {
            toBidding();
        } else {
            toOngoing();
        }
    } else {
        window.location.hash = '#ongoing'
        toOngoing();
    }
});

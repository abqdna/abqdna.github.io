var map = null;
var layers = {};
var cache_buster = Math.ceil(Math.random() * 1000000000);

$(function() {
    map = new GMaps({
        el: '#map',
        lat: 35.092,
        lng: -106.659,
        zoomControl : true,
        panControl : true,
        streetViewControl : true,
        mapTypeControl: true,
        overviewMapControl: false
    });

    var close = function(e) {
        e.preventDefault();
        map.hideInfoWindows();
        $('#photos').fadeOut('fast', function() {
            $('.closer').hide();
            $('#address').hide();
            $('.container').css({height: '33%'});
            $('#map').animate({height: '66%'}, function() {
                google.maps.event.trigger(map.map, 'resize');
                map.map.panTo(new google.maps.LatLng(35.092, -106.659));
                map.fitZoom();
                $('#title').fadeIn();
                $('#intro').fadeIn();
                $('.container').fadeIn();
            });
        });
    };

    $('body').on('click', '#photo .item img', function(e) {
        var img = new Image();
        img.src = this.src;
        $('#lightbox .modal-body').html(img);
        $('#lightbox').modal({
            width: Math.min(img.width, 1200),
            maxHeight: $(window).height()-200
        });
    });

    var loadAddress = function(address) {
        $('#photos').replaceWith(ich.carousel({
            photos: _.map(address.files, function(file) { return '/static/img/' + file; })
        }));
        var carousel = $('#photos');
        carousel.fadeIn('fast');
        carousel.find('.item').first().addClass('active');
        carousel.find('.carousel-indicators').children().each(function(i, e) {
            $(this).attr('data-slide-to', i);
        });
        carousel.find('.carousel-indicators').children().first().addClass('active');
        carousel.carousel({interval: false});
    };

    $.getJSON('/static/js/map.json?' + cache_buster).then(function(data) {
        addresses = data.addresses;
        map.drawPolyline({
            path: data.boundary,
            strokeColor: 'blue',
            strokeOpacity: 0.25,
            strokeWeight: 3
        });
        _.each(addresses, function(address) {
            map.addMarker({
                lat: address.coords.lat,
                lng: address.coords.lng,
                infoWindow: {
                    maxWidth: 300,
                    disableAutoPan: true,
                    content: '<p><b>' + address.address.replace(/,/, ',<br>') + '</b></p><p>' + address.name + '</p>'
                },
                click: function() {
                    var pan = function() {
                        map.map.panTo(new google.maps.LatLng(address.coords.lat + 0.001, address.coords.lng));
                    }
                    pan();
                    $('.container').fadeOut();
                    $('#map').animate({height: '33%'}, function() {
                        $('#address').text(address.address).show();
                        loadAddress(address);
                        $('.container').css({height: '66%'});
                        google.maps.event.trigger(map.map, 'resize');
                        pan();
                        $('.closer').fadeIn();
                        //$('#photos').css({top: $('#map').height() + 10, height: 'auto'});
                    });
                }
            });
        });
        map.fitZoom();
    }).fail(function(){ console.log('Error:', arguments); });

    $('.closer a.close').click(close);
});

var showPhotos = function() {
    $('body').children().remove();
    $.getJSON('/static/js/map.json?' + cache_buster).then(function(data) {
        var ads = data.addresses;
        _.each(ads, function(a) {
            _.each(a.files, function(f) {
                var div = $('<div>');
                var img = $('<img>');
                img.attr({src: '/static/img/' + f + '?' + cache_buster});
                img.css({width: 200, height: 'auto'});
                div.append(img);
                div.append($('<span>').text(f));
                $('body').append(div);
            });
        });
    })
}

function initMap() {
    // The location of Moncuq
    var Moncuq = {lat: 44.338039, lng: 1.207356};
    // The location of Rapaillou
    var Rapaillou = {lat: 44.338027, lng: 1.206919};
    // The map, centered at Moncuq
    var contenuInfoBulle = "Rapaillou" ;
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 13, center: Moncuq});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: Rapaillou, map: map});                var infoBulle = new google.maps.InfoWindow({
        content: contenuInfoBulle
    })
    google.maps.event.addListener(marker, 'click', function() {
        infoBulle.open(map, marker);
    });

    infoWindow = new google.maps.InfoWindow;

    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
    var pos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
    };

infoWindow.setPosition(pos);
infoWindow.setContent('Location found.');
infoWindow.open(map);
map.setCenter(pos);
}, function() {
handleLocationError(true, infoWindow, map.getCenter());
});
} else {
// Browser doesn't support Geolocation
handleLocationError(false, infoWindow, map.getCenter());
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(browserHasGeolocation ?
                  'Error: The Geolocation service failed.' :
                  'Error: Your browser doesn\'t support geolocation.');
infoWindow.open(map);
}
}

initMap();
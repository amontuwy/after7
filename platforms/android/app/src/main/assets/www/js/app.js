var database = null;
var map;

function initDatabase() {
  database = window.sqlitePlugin.openDatabase({ name: 'after7.db', location: 'default' });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE users (name, password)');
  });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE soiree (date, password)');
  });
  $("#map").hide();
  $("#search").hide();
  $("#creersoiree").hide();
  $("#connected").hide();
}

function showMessage(message) {
  console.log(message);
  if (window.cordova.platformId === 'osx') window.alert(message);
  else navigator.notification.alert(message);
}

function addRecordUser() {
  var username = $('#nom').val();
  var userpassword = $('#mdp').val();

  database.transaction(function (transaction) {
    transaction.executeSql('INSERT INTO users VALUES (?,?)', [username, userpassword]);
  }, function (error) {
    showMessage('INSERT error: ' + error.message);
  }, function () {
    $("#login").hide();
    reload();
    $("#map").show();
    $("#search").show();
    $("#connected").show();
  });
}

function addRecordSoiree() {
  var username = $('#city').val();
  var userpassword = $('#password').val();

  database.transaction(function (transaction) {
    transaction.executeSql('INSERT INTO users VALUES (?,?)', [username, userpassword]);
  }, function (error) {
    showMessage('INSERT error: ' + error.message);
  }, function () {
    showMessage('INSERT OK');
  });
}

function gotoCreateSoiree() {
  reload();
  $("#map").hide();
  $("#search").hide();
  $("#creersoiree").show();
}

function verify() {
  var username = $('#nom').val();
  var userpassword = $('#mdp').val();

  database.transaction(function (transaction) {
    transaction.executeSql("SELECT * FROM users where name like ('%" + username + "%) and password like ('%" + userpassword + '%)', []);
  }, function (error) {
    showMessage('Recherche impossible');
  }, function (results) {
    if (results.row.length === 1) {
      goToMap();
    }
    else {
      showMessage("Cette combinaison n'existe pas en base");
    }
  });
}

function initMap() {
  // The location of Rennes
  var Rennes = {lat: 48.117180,lng: -1.677770};
  // The location of Université
  var Univ = {lat: 48.113981, lng: -1.638361 };
  // The map, centered at Moncuq
  var contenuInfoBulle = "Vous êtes ici";
  map = new google.maps.Map(
    document.getElementById('map'), { zoom: 12, center: Rennes });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({ position: Univ, map: map }); var infoBulle = new google.maps.InfoWindow({
    content: contenuInfoBulle
  })
  google.maps.event.addListener(marker, 'click', function () {
    infoBulle.open(map, marker);
  });
  infoWindow = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function () {
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

function reload() {
    google.maps.event.trigger(map, 'resize');
}

document.addEventListener('deviceready', function () {
  $('#creercompte').click(addRecordUser);
  $('#seconnecter').click(verify);
  $('#addsoiree').click(gotoCreateSoiree);
  initDatabase();
});



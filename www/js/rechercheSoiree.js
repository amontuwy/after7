var database = null;

function initDatabase() {
  database = window.sqlitePlugin.openDatabase({name: 'after7.db', location: 'default'});
}

function showMessage(message) {
    console.log(message);
    if (window.cordova.platformId === 'osx') window.alert(message);
    else navigator.notification.alert(message);
}

function gotoRechercheSoiree() {
  hide(mapviz);
  show(rechercheSoiree);
 }

function search(){
  // Get the location researched
  var location = $('lieu').val();
  // Get the range of research around the location
  var range = $('range').val();
  // Get the optionnale date researched
  var date = $('date').val();
  // Get the optionnal type "all" "public" or "private"
  var type = $('type').val();
  // Get the optionnal theme
  var theme = $('theme').val();

  if(location == null || location == ""){
    alert("Localisation manquante");
  } else {
    if (date != null && date != "" && type != "all" && theme != null && theme != ""){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where date like ('%"+date+"%) and type like ('%"+type+"%) and theme like ('%"+theme+"%)", []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (date != null && date != "" && type != "all"){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where date like ('%"+date+"%) and type like ('%"+type+'%)', []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (date != null && date != "" && theme != null && theme != ""){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where date like ('%"+date+"%) and theme like ('%"+theme+'%)', []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (date != null && date != ""){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where date like ('%"+date+"%)", []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (type != "all" && theme != null && theme != ""){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where type like ('%"+type+"%) and theme like ('%"+theme+'%)', []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (type != "all"){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where type like ('%"+type+"%)", []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else if (theme != null && theme != ""){
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree where theme like ('%"+theme+"%)", []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    } else {
      database.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM soiree", []);
      }, function(error) {
        showMessage('Recherche impossible');
      }, function(results) {
        if (results.row.length===1){
          goToMap();
        }
        else {
          showMessage("Cette combinaison n'existe pas en base");
        }
      });
    }
  }
}

function hide(x) {
  x.style.display = "none";
}

function show(x){
  if (x===mapviz){
    initMap();
  }else{
  x.style.display = "block";
  }
}

function searchMap() {
    // The location of research
    var location = $('lieu').val();
    // The range of research
    var range = $('range').val();
    // As much infoBulle as needed
    var contenuInfoBulle = "" ;

    var map = new google.maps.Map(
        mapviz, {zoom: range, center: location});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: "position", map: map});                var infoBulle = new google.maps.InfoWindow({
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

document.addEventListener('deviceready', function() {
  var rechercheSoiree = document.getElementById("rechercheSoiree");
  $('#creercompte').click(addRecordUser);
  $('#seconnecter').click(verify);
  $('#addsoiree').click(gotoCreateSoiree);
  initDatabase();
});

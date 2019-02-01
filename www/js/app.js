var database = null;
var map;

var isBrowser = false;
var latsoiree;
var lngsoiree;

var searchinprogress = false;

var currentDateFormated = new Date().toLocaleDateString("en-GB"); // DD-MM-YYYY

function initialization() {
  
  var currentDateFormated = new Date().toISOString().split("T")[0] // MM-DD-YYYY
  var date = $('input[name=date]');
  date.attr({
    "min": currentDateFormated
  });
  date.val(currentDateFormated);

  $('input[name=range]').on('input', function (e) {
    $('input[name=prix]').val($('input[name=range]').val())
  });

  $('input[name=prix]').on('input', function (e) {
    $('input[name=range]').val($('input[name=prix]').val())
  });

  $('select').formSelect();

}

function calendar() {
  if (isBrowser) {
    var options = {
      date: new Date(),
      mode: 'date',
      minDate: + currentDate
    };

    datePicker.show(options, function (date) {
      //alert("date result " + date);     // not working
      $('input[name=date]').val(date.toLocaleDateString("en-GB"));
    });
  }
}

function onDeviceReady() {
  isBrowser = ("browser" === device.platform);
}

function initDatabase() {
  searchinprogress=false
  database = window.sqlitePlugin.openDatabase({ name: 'after7.db', location: 'default' });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE users (name, password)');
  });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE events (titre, date, lieu, geocodlat, geocodlng, descr, theme, prix, statut)');
  });

  database.transaction(function(transaction){
    transaction.executeSql('CREATE TABLE userinscription (name, password, titre, date, lieu, geocodlat, geocodlng, descr, theme, prix, statut)');
  });
  $("#map").hide();
  $("#search").hide();
  $("#creersoiree").hide();
  $("#comeback").hide();
  $("#connected").hide();
  $("#displaysoiree").hide();
}

function showMessage(message) {
  console.log(message);
  if (window.cordova.platformId === 'osx') window.alert(message);
  else navigator.notification.alert(message);
}

function addRecordUser() {
  var username = $('#nom').val();
  var userpassword = $('#mdp').val();

  if (username != "" && userpassword != "") {
    verifyuserinbase(username,userpassword);
  } else {
    showMessage('Tous les champs doivent être complétés');
  }
}

function addRecordSoiree() {
  var titresoiree = $('#titre').val();
  var datesoiree = $('#date').val();
  var lieusoiree = $('#lieu').val();
  var descrsoiree = $('#descr').val();
  var themesoiree = $('#theme').val();
  var prixsoiree = $('#prix').val();
  var statutsoiree = $('#statut').val();

  if( titresoiree == null || titresoiree == "" || lieusoiree == null || lieusoiree == "" ||
  themesoiree == null || themesoiree == "" || prixsoiree == null || prixsoiree == "" || statutsoiree == null || statutsoiree == ""){
        alert("Veuillez remplir tous les champs en rouge");
        if(titresoiree == null || titresoiree == ""){
          $('#titre').style.borderColor = "red";
        } else {
          $('#titre').style.borderColor = "green";
        }
        if(titresoiree == null || titresoiree == ""){
          $('#lieusoiree').style.borderColor = "red";
        } else {
          $('#lieusoiree').style.borderColor = "green";
        }
        if(titresoiree == null || titresoiree == ""){
          $('#descrsoiree').style.borderColor = "red";
        } else {
          $('#descrsoiree').style.borderColor = "green";
        }
        if(titresoiree == null || titresoiree == ""){
          $('#themesoiree').style.borderColor = "red";
        } else {
          $('#themesoiree').style.borderColor = "green";
        }
        if(titresoiree == null || titresoiree == ""){
          $('#prixsoiree').style.borderColor = "red";
        } else {
          $('#prixsoiree').style.borderColor = "green";
        }
        if(titresoiree == null || titresoiree == ""){
          $('#statutsoiree').style.borderColor = "red";
        } else {
          $('#statutsoiree').style.borderColor = "green";
        }
  } else {
    geocoding(lieusoiree);
    database.transaction(function (transaction) {
      transaction.executeSql('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)', [titresoiree, datesoiree, lieusoiree, latsoiree, lngsoiree, descrsoiree, themesoiree, prixsoiree, statutsoiree]);
    }, function (error) {
      showMessage('Error in soiree creation ' + error.message);
      coord=null;
    }, function () {
      showMessage('Votre soirée a bien été créée');
      latsoiree=null; //on remet la variable generale à 0
      lngsoiree=null;
      initMap();
      $("#map").show();
      $("#search").show();
      $("#creersoiree").hide();
      $('#comeback').hide();
    });
  }
}

function gotoCreateSoiree() {
  $("#map").hide();
  $("#search").hide();
  initialization();
  $("#creersoiree").show();
  $("#comeback").show();
}

function verifyuserinbase(name,password)
{
  database.transaction(function (transaction)
       {transaction.executeSql('SELECT * FROM users WHERE name=? AND password=?',
                [name, password],
                function(transaction,results)
                {
                    var len = results.rows.length;
                    if(len>0)
                    {  
                      showMessage("Erreur : le compte existe deja")
                    }
                    else{
                      database.transaction(function (transaction) {
                        transaction.executeSql('INSERT INTO users VALUES (?,?)', [name, password]);
                  
                      }, function (error) {
                        showMessage('Error in User creation: ' + error.message);
                      }, function () {
                        showMessage('Le compte a été créé avec succes');
                      });
                    }
                }, errorCB
            );
       },errorCB,successCB
   );
}

function verifyuser(name,password)
{
  database.transaction(function (transaction)
       {transaction.executeSql('SELECT * FROM users WHERE name=? AND password=?',
                [name, password],
                function(transaction,results)
                {
                    var len = results.rows.length;
                    if(len===1)
                    {  
                      $("#login").hide();
                      initMap();
                      $("#map").show();
                      $("#search").show();
                      $("#connected").show();
                    }
                    else{
                      console.log("pas de user correspondant")
                      showMessage("Ce compte n'existe pas");
                    }
                }, errorCB
            );
       },errorCB,successCB
   );

}

function successCB(){}

function errorCB(){
 
}

function verify() {
  var username = $('#nom').val();
  var userpassword = $('#mdp').val();

  if (username != "" && userpassword != "") {
    verifyuser(username,userpassword);
  }
   else {
    showMessage('Tous les champs doivent être renseignés');
  }
}


function initMap() {

  var Rennes = { lat: 48.117180, lng: -1.677770 };
  var Univ = { lat: 48.113981, lng: -1.638361 };

  map = new google.maps.Map(
    document.getElementById('map'), { zoom: 12, center: Rennes });

    if (searchinprogress === false){
      database.transaction(function (transaction)
          {transaction.executeSql('SELECT * FROM events',
              [],
              function(transaction,results)
                { var taille = results.rows.length;

                  for (let i =0;i<taille;i++){
                    console.log('latitude : '+results.rows.item(i)['geocodlat']+' longitude : '+results.rows.item(i)['geocodlng']);
                    var possoiree = new google.maps.LatLng(results.rows.item(i)['geocodlat'], results.rows.item(i)['geocodlng']);
                    var marker = new google.maps.Marker({ position: possoiree, map: map }); 
                    var infoBulle = new google.maps.InfoWindow();
                    var tabinfo = [results.rows.item(i)['titre'], results.rows.item(i)['date'], results.rows.item(i)['lieu'], results.rows.item(i)['descr'], results.rows.item(i)['prix'], results.rows.item(i)['statut']]
                    var content = "<p> Titre : "+results.rows.item(i)['titre']+"<br/> Date : "+results.rows.item(i)['date']+"<br/> <b>Click here for more information</b>"

                    google.maps.event.addListener(marker,'click', (function(marker,content,infoBulle, tabinfo){ 
                          return function() {
                              var div = document.createElement('div');
                              div.innerHTML = content;
                              div.onclick = function(){displaySoiree(tabinfo)};
                              infoBulle.setContent(div);
                              infoBulle.open(map,marker);
                          };
                      })(marker,content,infoBulle, tabinfo));      
                  }
                },errorCB,successCB
          );});
     } else 
     { //s'il y a une recherche en cours
      var lieuSearch = $('input[id=lieuSearch]').val();
      var kilometreSearch = $('input[id=distanceSearch]').val();
      var dateSearch = $('input[id=dateSearch]').val();
      var typeSearch = $('select[id=statutSearch]').val();
      var themeSearch = $('select[id=themeSearch]').val();
      var request = 'SELECT * FROM events ';
      var condition = '';
      var param = []
    
      if(lieuSearch != null && lieuSearch != ""){
    
        if(dateSearch != null && dateSearch != ""){
          if(condition != ''){
            condition += ' AND '
          }
          condition += 'date=?';
          param.push(dateSearch)
        }
    
        if(typeSearch != null && typeSearch != "" && typeSearch != "all"){
          if(condition != ''){
            condition += ' AND '
          }
          condition += 'statut=?';
          param.push(typeSearch)
        }
    
        if(themeSearch != null && themeSearch != "" && themeSearch != 0){
          if(condition != ''){
            condition += ' AND '
          }
          condition += 'theme=?';
          param.push(themeSearch)
        }
    
        if(condition != ''){
          request = request + 'WHERE ' + condition;
        }
    
        if(kilometreSearch != null && kilometreSearch != "0"){
          nativegeocoder.forwardGeocode(success, failure, lieuSearch, { useLocale: true, maxResults: 1 });
    
          function success(coordinates) {
            latsoiree = coordinates[0].latitude;
            lngsoiree = coordinates[0].longitude;
            database.transaction(function (transaction){
              transaction.executeSql(request, param, function(transaction,results){
                var len = results.rows.length;
                if(len == 0){
                  showMessage("Pas de soirées pour votre recherche");
                }
                else {
                  for(i = 0; i < results.rows.length; i++){
                    var lat = results.rows.item(i)["geocodlat"];
                    var long = results.rows.item(i)["geocodlng"];
                    var km = distanceInKmBetweenEarthCoordinates(latsoiree, lngsoiree, lat, long);
                    if(km <= kilometreSearch){
                      var possoiree = new google.maps.LatLng(results.rows.item(i)['geocodlat'], results.rows.item(i)['geocodlng']);
                      var marker = new google.maps.Marker({ position: possoiree, map: map }); 
                      var infoBulle = new google.maps.InfoWindow();
                      var tabinfo = [results.rows.item(i)['titre'], results.rows.item(i)['date'], results.rows.item(i)['lieu'], results.rows.item(i)['descr'], results.rows.item(i)['prix'], results.rows.item(i)['statut']]
                      var content = "<p> Titre : "+results.rows.item(i)['titre']+"<br/> Date : "+results.rows.item(i)['date']+"<br/> <b>Click here for more information</b>"
  
                      google.maps.event.addListener(marker,'click', (function(marker,content,infoBulle, tabinfo){ 
                            return function() {
                                var div = document.createElement('div');
                                div.innerHTML = content;
                                div.onclick = function(){displaySoiree(tabinfo)};
                                infoBulle.setContent(div);
                                infoBulle.open(map,marker);
                            };
                        })(marker,content,infoBulle, tabinfo));    
                    }
                  }
               }
             }, errorCB);
           }, errorCB,successCB);
         }
         function failure(err) {
           showMessage(err);
         }
        } else {
          database.transaction(function (transaction){
            transaction.executeSql(request, param, function(transaction,results){
              var len = results.rows.length;
              if(len == 0){
                showMessage("Erreur : Pas de soirées");
              }
              else {
                for(i = 0; i < results.rows.length; i++){
                  var possoiree = new google.maps.LatLng(results.rows.item(i)['geocodlat'], results.rows.item(i)['geocodlng']);
                      var marker = new google.maps.Marker({ position: possoiree, map: map }); 
                      var infoBulle = new google.maps.InfoWindow();
                      var tabinfo = [results.rows.item(i)['titre'], results.rows.item(i)['date'], results.rows.item(i)['lieu'], results.rows.item(i)['descr'], results.rows.item(i)['prix'], results.rows.item(i)['statut']]
                      var content = "<p> Titre : "+results.rows.item(i)['titre']+"<br/> Date : "+results.rows.item(i)['date']+"<br/> <b>Click here for more information</b>"
  
                      google.maps.event.addListener(marker,'click', (function(marker,content,infoBulle, tabinfo){ 
                            return function() {
                                var div = document.createElement('div');
                                div.innerHTML = content;
                                div.onclick = function(){displaySoiree(tabinfo)};
                                infoBulle.setContent(div);
                                infoBulle.open(map,marker);
                            };
                        })(marker,content,infoBulle, tabinfo));    
                }
             }
           }, errorCB);
         }, errorCB,successCB);
      }
    }
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
       var pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };

      map.setCenter(pos);
    }, function () {
      handleLocationError(true, map.getCenter());
    });
  }
  else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }


  function handleLocationError(browserHasGeolocation, pos) {

  }
}

function validTitre(value){
  if (value == ""){
    document.getElementById('titreLabel').innerHTML = "Titre de la soirée <b style='color:red;'>*</b>";
  } else {
    document.getElementById('titreLabel').innerHTML = "Titre de la soirée";
  }
 }

function displaySoiree(tab){
   $("#map").hide();
   $("#search").hide();
   $("#comeback").show();
   $("#displaysoiree").show();
   $("#soireeTitre").text(tab[0]);
   $("#soireeDate").text(tab[1]);
   $("#soireeLieu").text(tab[2])
   $("#soireeDescr").text(tab[3]);
   $("#soireePrix").text(tab[4] + "€");
   if (tab[5]==="on"){
      $("#soireeType").text("Soirée privée");
   } else{
      $("#soireeType").text("Soirée publique");
   }
}
 
 function validLieu(value){
  if (value == ""){
    document.getElementById('lieuLabel').innerHTML = "Lieu <b style='color:red;'>*</b>";
  } else {
    document.getElementById('lieuLabel').innerHTML = "Lieu";
  }
 }
 
 function validDate(value){
  if (value == "dd/mm/yyyy"){
    document.getElementById('dateLabel').innerHTML = "Date <b style='color:red;'>*</b>";
  } else {
    document.getElementById('dateLabel').innerHTML = "Date";
  }
 }
 
 function isFree(value){
  if (value == 0){
    document.getElementById("prix").value = "Gratuit";
    document.getElementById("prix").style = "color:Green;font-weight: bold;";
  } else {
    document.getElementById("prix").style = "color:initial;font-weight: normal;";
  }
 }
 
 function validTheme(value){
  if (value == "Choisir votre thème"){
    document.getElementById('themeLabel').innerHTML = "Thème <b style='color:red;'>*</b>";
  } else {
    document.getElementById('themeLabel').innerHTML = "Thème";
  }
 }

function retour() {
  $("#map").show();
  $("#search").show();
  $("#creersoiree").hide();
  $("#comeback").hide();
  $("#displaysoiree").hide();
 }

function geocoding(adresse){
  nativegeocoder.forwardGeocode(success, failure, adresse, { useLocale: true, maxResults: 1 });
 
  function success(coordinates) {
   latsoiree = coordinates[0].latitude;
   lngsoiree =coordinates[0].longitude;
  }
   
  function failure(err) {
    showMessage(err);
  }
}

 function gotoSearch() {
   searchinprogress=true;
   initMap();
 }


function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function geocentering(){

  function success(result) {
    var firstResult = JSON.stringify(result[0]);
    $('input[id=lieuSearch]').val(result[0]['subThoroughfare'] +" "+ result[0]['thoroughfare'] +" "+ result[0]['locality']);
  }

  function failure(err) {
   console.log(err);
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

  var pos;

  if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(
     function (position) {
       pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };
       //infoWindow.setPosition(pos);
       //infoWindow.setContent('Vous êtes ici.');
       //infoWindow.open(map);
       //map.setCenter(pos);
       nativegeocoder.reverseGeocode(success, failure, pos.lat , pos.lng , { useLocale: true, maxResults: 1 });
     }, 
     function () {
       handleLocationError(true, infoWindow, map.getCenter());
     }
   );
  }

  else {
   // Browser doesn't support Geolocation
   handleLocationError(false, infoWindow, map.getCenter());
  }
}
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
}

function inscriptionvalidee(){
  showMessage("Votre inscription a bien été enregistrée")
}

document.addEventListener('deviceready', function () {
  $('#creercompte').click(addRecordUser);
  $('#seconnecter').click(verify);
  $('#addsoiree').click(gotoCreateSoiree);
  $('#creerSoireeinDB').click(addRecordSoiree);
  $('#back').click(retour);
  $('#searchsoiree').click(gotoSearch);
  $('#locationsearch').click(geocentering);
  $('#inscription').click(inscriptionvalidee);
  initDatabase();
});
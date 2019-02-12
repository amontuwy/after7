// ficiher permettant de gérer principalement la base de données et la carte

// définition de variables globales 
var database = null;
var map;

var latsoiree;
var lngsoiree;

var searchinprogress = false;

// UTILS
// function permettant d'afficher un message dans une popup
function showMessage(message) {
  console.log(message);
  if (window.cordova.platformId === 'osx') window.alert(message);
  else navigator.notification.alert(message);
}

// gestion de l'affichage après click sur la création de soirée
function gotoCreateSoiree() {
  $("#map").hide();
  $("#search").hide();
  $("#creersoiree").show();
  $("#comeback").show();
}

// gestion de l'affichage après click sur une infowindow de la carte
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

// envoi un message à l'utilisateur quand il cherche à s'inscrire 
function inscriptionvalidee(){
  showMessage("Votre inscription a bien été enregistrée")
}

// gestion de l'affichage après click sur le bouton de retour
function retour() {
  $("#map").show();
  $("#search").show();
  $("#creersoiree").hide();
  $("#comeback").hide();
  $("#displaysoiree").hide();
 }

  //quand une recherche est lancée, recharge la carte en fonction des paramètre de l'utilisateur
  function gotoSearch() {
    searchinprogress=true;
    initMap();
  }

 // vérifie que le titre de la soirée est rempli pour pouvoir la créer, sinon change l'IHM 
function validTitre(value){
  if (value == ""){
    document.getElementById('titreLabel').innerHTML = "Titre de la soirée <b style='color:red;'>*</b>";
  } else {
    document.getElementById('titreLabel').innerHTML = "Titre de la soirée";
  }
 }
 
  // vérifie que le lieu de la soirée est rempli pour pouvoir la créer, sinon change l'IHM 
 function validLieu(value){
  if (value == ""){
    document.getElementById('lieuLabel').innerHTML = "Lieu <b style='color:red;'>*</b>";
  } else {
    document.getElementById('lieuLabel').innerHTML = "Lieu";
  }
 }
 
  // vérifie que la date de la soirée est remplie pour pouvoir la créer, sinon change l'IHM 
function validDate(value){
  if (value == "dd/mm/yyyy"){
    document.getElementById('dateLabel').innerHTML = "Date <b style='color:red;'>*</b>";
  } else {
    document.getElementById('dateLabel').innerHTML = "Date";
  }
 }
 
  // vérifie si le prix de la soirée est 0 pour pouvoir changer l'IHM en fonction 
 function isFree(value){
  if (value == 0){
    document.getElementById("prix").value = "Gratuit";
    document.getElementById("prix").style = "color:Green;font-weight: bold;";
  } else {
    document.getElementById("prix").style = "color:initial;font-weight: normal;";
  }
 }
 
   // vérifie que le theme de la soirée est rempli pour pouvoir la créer, sinon change l'IHM 
 function validTheme(value){
  if (value == "Choisir votre thème"){
    document.getElementById('themeLabel').innerHTML = "Thème <b style='color:red;'>*</b>";
  } else {
    document.getElementById('themeLabel').innerHTML = "Thème";
  }
 }


// GESTION DE LA BASE DE DONNEES
// function d'initialisation de la base de données locale. On crée les tables users, events et userinscription si elles n'existent pas déjà
function initDatabase() {
  searchinprogress = false
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

  // l'initialisation de la base étant la première action réalisée au lancement de l'application, on cache tous les modules (excepté le module de connexion)
  $("#map").hide();
  $("#search").hide();
  $("#creersoiree").hide();
  $("#comeback").hide();
  $("#connected").hide();
  $("#displaysoiree").hide();
}

// ajout d'un utilisateur en base 
function addRecordUser() {
  var username = $('#nom').val();
  var userpassword = $('#mdp').val();

  if (username != "" && userpassword != "") {
    verifyuserinbase(username,userpassword);
  } else {
    showMessage('Tous les champs doivent être complétés');
  }
}

// vérifie que les champs utilisateurs et mots de passe sont complétés avant de tenter une authetification
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

// vérifie qu'un compte n'existe pas déjà en base lorsqu'un utilisateur demande sa création
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

// vérifie que le compte utilisateur existe en base lorsque l'utilisateur essaie de se connecter
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

// ajout d'une soirée en base
function addRecordSoiree() {
  var titresoiree = $('#titre').val();
  var datesoiree = $('#date').val();
  var lieusoiree = $('#lieu').val();
  var descrsoiree = $('#descr').val();
  var themesoiree = $('#theme').val();
  var prixsoiree = $('#prix').val();
  var statutsoiree = $('#statut').val();

  // on vérifie que les champs nécessaires sont remplis avant de créer l'entree en base
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
    // si tous les champs sont remplis, on récupère les coordonnées de la soirée pour les ajouter en base
    geocoding(lieusoiree);
    database.transaction(function (transaction) {
      transaction.executeSql('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)', [titresoiree, datesoiree, lieusoiree, latsoiree, lngsoiree, descrsoiree, themesoiree, prixsoiree, statutsoiree]);
    }, function (error) {
      showMessage('Error in soiree creation ' + error.message);
      coord=null;
    }, function () {
      showMessage('Votre soirée a bien été créée');
      latsoiree=null; 
      lngsoiree=null;
      // Si la soirée a été créé avec succès, on recharge la carte pour pouvoir l'afficher avec les autres soirées en base
      initMap();
      // on cache automatiquement la page de création de soirée après le succès de la création pour revenir à la carte
      $("#map").show();
      $("#search").show();
      $("#creersoiree").hide();
      $('#comeback').hide();
    });
  }
}


// GESTION DE LA CARTE ET DE LA POSITION
// fonction qui dessine la carte, les markers et les infoswindows correspondant à la recherche de l'utilisateur.
function initMap() {

  // par défaut, en absence de géolocalisation, on centre la carte sur Rennes
  var Rennes = { lat: 48.117180, lng: -1.677770 };

  map = new google.maps.Map(
    document.getElementById('map'), { zoom: 12, center: Rennes });

    // Si on n'est pas dans le cardre d'une recherche de soirée, on affiche toutes les soirées en base
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
     { // si l'utilisateur est en train d'effectuer une recherche, on fait la requête correspondante en base et on affiche les soirées correspondantes
      var lieuSearch = $('input[id=lieuSearch]').val();
      var kilometreSearch = $('input[id=distanceSearch]').val();
      var dateSearch = $('input[id=dateSearch]').val();
      var typeSearch = $('select[id=statutSearch]').val();
      var themeSearch = $('select[id=themeSearch]').val();
      var request = 'SELECT * FROM events ';
      var condition = '';
      var param = []
    
      // Le lieu est obligatoire pour la recherche d'une soirée
      if(lieuSearch != null && lieuSearch != ""){
    
        // on ajoute aux paramètres de recherche les éléments requếtés pas l'utilisateur 
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
        
        // si l'utilisateur a précisé un rayon de recherche, on ne va afficher que les soirées dans ce rayon 
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
                    // ici on décide d'afficher la soirée uniquement si elle répond aux critères de géolocalisation
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
        } else { // si l'utilisateur n'a pas précisié de rayon de recherche, on considère un rayon infini, et on affiche donc toutes les soirées correspondant aux autres critères
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

  // On gère le centrage de la carte sur Rennes, ou sur la position de l'utilisateur si elle est disponible 
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
    // si le navigateur ne gère pas la géolocalisation
    handleLocationError(false, map.getCenter());
  }


  function handleLocationError(browserHasGeolocation, pos) {

  }
}

// fonction qui convertit une adresse en latitude / longitude 
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

// fonction de centrage de la carte sur la position de l'utilisateur quand il se géolocalise pendant la recherche d'une soirée
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
       nativegeocoder.reverseGeocode(success, failure, pos.lat , pos.lng , { useLocale: true, maxResults: 1 });
     }, 
     function () {
       handleLocationError(true, infoWindow, map.getCenter());
     }
   );
  }

  else {
   handleLocationError(false, infoWindow, map.getCenter());
  }
}

// UTILS : conversion de degrés en radian
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

// UTILS : calcule la distance entre entre deux points géographiques
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
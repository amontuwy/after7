var database = null;
var map;

var isBrowser = false;
var currentDateFormated = new Date().toLocaleDateString("en-GB"); // DD-MM-YYYY

function initialization() {
  // $(document).ready(function(){
  var currentDateFormated = new Date().toISOString().split("T")[0] // MM-DD-YYYY
  var date = $('input[name=date]');
  date.attr({
    "min": currentDateFormated
  });
  date.val(currentDateFormated);

  $('input[name=range]').on('input', function (e) {
    $('input[name=argent]').val($('input[name=range]').val())
  });

  $('input[name=argent]').on('input', function (e) {
    $('input[name=range]').val($('input[name=argent]').val())
  });

  $('select').formSelect();
  // });
  // document.addEventListener("deviceready", onDeviceReady, false);
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
  database = window.sqlitePlugin.openDatabase({ name: 'after7.db', location: 'default' });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE users (name, password)');
  });

  database.transaction(function (transaction) {
    transaction.executeSql('CREATE TABLE soirees (titre,date, lieu, descr, theme, prix, statut)');
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

  if( titresoiree == null || titresoiree == "" || lieusoiree == null || lieusoiree == "" || descrsoiree == null || descrsoiree == "" ||
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
    database.transaction(function (transaction) {
      transaction.executeSql('INSERT INTO soirees VALUES (?,?,?,?,?,?,?)', [titresoiree, datesoiree, lieusoiree, descrsoiree, themesoiree, prixsoiree, statutsoiree]);
    }, function (error) {
      showMessage('Error in soiree creation ' + error.message);
    }, function () {
      showMessage('INSERT OK');
    });
  }
}

function gotoCreateSoiree() {
  $("#map").hide();
  $("#search").hide();
  initialization();
  $("#creersoiree").show();
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
  // The location of Rennes
  var Rennes = { lat: 48.117180, lng: -1.677770 };
  // The location of Université
  var Univ = { lat: 48.113981, lng: -1.638361 };
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
  }
  else {
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

// function reload() {
//   google.maps.event.trigger(map, 'resize');
// }

document.addEventListener('deviceready', function () {
  $('#creercompte').click(addRecordUser);
  $('#seconnecter').click(verify);
  $('#addsoiree').click(gotoCreateSoiree);
  $('#creerSoireeinDB').click(addRecordSoiree);
  initDatabase();
});



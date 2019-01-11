var database = null;

function initDatabase() {
  database = window.sqlitePlugin.openDatabase({name: 'after7.db', location: 'default'});

  database.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE users (name, password)');
  });

  database.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE soiree (date, password)');
  });
  }

function showMessage(message) {
    console.log(message);
    if (window.cordova.platformId === 'osx') window.alert(message);
    else navigator.notification.alert(message);
}

function addRecordUser() {
  var username = $('nom').val() ;
  var userpassword = $('mdp').val();

  database.transaction(function(transaction) {
    transaction.executeSql('INSERT INTO users VALUES (?,?)', [username, userpassword]);
  }, function(error) {
    showMessage('INSERT error: ' + error.message);
  }, function() {
    goToMap();
  });
}

function addRecordSoiree() {
  var username = $('city').val() ;
  var userpassword = $('password').val();

  database.transaction(function(transaction) {
    transaction.executeSql('INSERT INTO users VALUES (?,?)', [username, userpassword]);
  }, function(error) {
    showMessage('INSERT error: ' + error.message);
  }, function() {
    showMessage('INSERT OK');
  });
}

function goToMap() {
   window.location = "map.html";
}

function gotoCreateSoiree() {
  window.location = "creerSoiree.html";
}

function verify(){
  var username = $('nom').val();
  var userpassword = $('mdp').val();

  database.transaction(function(transaction) {
    transaction.executeSql("SELECT * FROM users where name like ('%"+username+"%) and password like ('%"+userpassword+'%)', []);
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

document.addEventListener('deviceready', function() {
  $('#creercompte').click(addRecordUser);
  $('#seconnecter').click(verify);
  $('addsoiree').click(gotoCreateSoiree);

  initDatabase();
});



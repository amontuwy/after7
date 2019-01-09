var database = null;

function initDatabase() {
  database = window.sqlitePlugin.openDatabase({name: 'users.db', location: 'default'});

  database.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE users (name, password)');
  });
  }

function showMessage(message) {
    console.log(message);
    if (window.cordova.platformId === 'osx') window.alert(message);
    else navigator.notification.alert(message);
}
// function stringTest1() {
//   database.transaction(function(transaction) {
//     transaction.executeSql("SELECT upper('Test string') AS upperText", [], function(ignored, resultSet) {
//       showMessage('Got upperText result (ALL CAPS): ' + resultSet.rows.item(0).upperText);
//     });
//   }, function(error) {
//     showMessage('SELECT count error: ' + error.message);
//   });
// }

// function showCount() {
//   database.transaction(function(transaction) {
//     transaction.executeSql('SELECT count(*) AS recordCount FROM SampleTable', [], function(ignored, resultSet) {
//       showMessage('RECORD COUNT: ' + resultSet.rows.item(0).recordCount);
//     });
//   }, function(error) {
//     showMessage('SELECT count error: ' + error.message);
//   });
// }

function addRecord() {
  var username = $('city').val() ;
  var userpassword = $('password').val();

  $('input').val();
  database.transaction(function(transaction) {
    transaction.executeSql('INSERT INTO users VALUES (?,?)', [username, userpassword]);
  }, function(error) {
    showMessage('INSERT error: ' + error.message);
  }, function() {
    showMessage('INSERT OK');
  });
}

// function deleteRecords() {
//   database.transaction(function(transaction) {
//     transaction.executeSql('DELETE FROM SampleTable');
//   }, function(error) {
//     showMessage('DELETE error: ' + error.message);
//   }, function() {
//     showMessage('DELETE OK');
//     ++nextUser;
//   });
// }

// function alertTest() {
//   showMessage('Alert test message');
// }

// function goToPage2() {
//   window.location = "page2.html";
// }

document.addEventListener('deviceready', function() {
  $('#creercompte').click(addRecord);

  initDatabase();
});



var isBrowser = false;
var currentDateFormated = new Date().toLocaleDateString("en-GB"); // DD-MM-YYYY

function initialization() {
  $(document).ready(function(){
    var currentDateFormated = new Date().toISOString().split("T")[0] // MM-DD-YYYY
    var date = $('input[name=date]');
    date.attr({
      "min" : currentDateFormated
    });
    date.val(currentDateFormated);

    $('input[name=range]').on('input',function(e){
      $('input[name=prix]').val($('input[name=range]').val())
    });

    $('input[name=prix]').on('input',function(e){
      $('input[name=range]').val($('input[name=prix]').val())
    });

    $('select').formSelect();
  });
  document.addEventListener("deviceready", onDeviceReady, false);
}


function calendar(){
  if(isBrowser){
    var options = {
      date: new Date(),
      mode: 'date',
      minDate: + currentDate
    };

    datePicker.show(options, function(date){
     //alert("date result " + date);     // not working
     $('input[name=date]').val(date.toLocaleDateString("en-GB"));
    });
  }
}

function onDeviceReady() {
  isBrowser = ("browser" === device.platform);
}

initialization();
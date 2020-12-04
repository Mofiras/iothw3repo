var geocoder = L.esri.Geocoding.geocodeService();
      
var map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


geocoder.geocode().text('Dubai').run(function (error, response) 
{
  if (error) {
    return;
  }

  map.fitBounds(response.results[0].bounds);
});
var current_latitude,current_longitude,destination,launchpoint,currlat,currlong,newlat,newlong;

navigator.geolocation.getCurrentPosition(success);

function success(pos) {

 current_latitude= pos.coords.latitude;
 current_longitude=pos.coords.longitude;

 L.marker([current_latitude,current_longitude]).addTo(map).bindPopup("You are here").openPopup();
  
    }

var theMarker = {};

map.on('click', function(e) 
{       
destination=e.latlng;

if (theMarker != undefined) {
  map.removeLayer(theMarker);
}


theMarker =L.marker([destination.lat,destination.lng]).addTo(map).bindPopup("Your chosen destination").openPopup();  

   
L.Routing.control({
waypoints: [
L.latLng(current_latitude, current_longitude),
L.latLng(destination)
]

}).addTo(map);

posttoserver(current_latitude,current_longitude,destination.lat,destination.lng);

  
});



function isuserloggedin(){
  $.get("/checklogin", function(data){
      //console.log(data);
      if(!data.loggedin){
          window.location.href = "/plslogin.html";
      }else{
         console.log("user logged in");
         username=data.username;
         $(".appendusername").append('<a href= "">'+data.msg+'</a>' );
      }
  });
}


function posttoserver(x1,y1,x2,y2){

  data=JSON.stringify({'current_latitude':x1,'current_longitude':y1,'destinationlat':x2, 'destinationlong':y2,'username':username });

  console.log(data);
  message = new Paho.MQTT.Message(data);
  message.destinationName = "hw3/coordinates";
  client.send(message); //send()


}


//var wsbroker = "broker.hivemq.com";  //mqtt websocket enabled broker
//var wsport = 8000; // port for above

var wsbroker= "localhost"; //mqttwebsocketenabled broker
var wsport= 9001// port for above

var client = new Paho.MQTT.Client(wsbroker, wsport,
    "myclientid_" + parseInt(Math.random() * 100, 10));
client.onConnectionLost = function (responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
};

var options = {
    timeout: 3,
    onSuccess: function () {
        console.log("mqtt connected");
      

    },
    onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
    }
};

function init() {
    client.connect(options);
}

init();



//var wsbroker = "broker.hivemq.com";  //mqtt websocket enabled broker
//var wsport = 8000 // port for above
var wsbroker= "localhost"; //mqttwebsocketenabled broker
var wsport= 9001// port for above

var client = new Paho.MQTT.Client(wsbroker, wsport,
    "myclientid_" + parseInt(Math.random() * 100, 10));
client.onConnectionLost = function (responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
};

client.onMessageArrived = function (data) {

  data=JSON.parse(data.payloadString);
  console.log(data);


    currlat=data.current_latitude;
    currlong=data.current_longitude;
    newlat=data.destinationlat;
    newlong=data.destinationlong;
       
    var angle=Math.atan2(newlong - currlong, newlat - currlat) * 180 / Math.PI;
    console.log(angle);
    var rotation=-90+angle; //because arrow pic starts at -90 degreee so im rotating it wrt to its initial position
   
    $(".top").css('transform', 'rotate('+rotation+'deg)' ); 
   
   /* loginformat.updateOne({ username: "jrod" }, {currentLat:currlat,currentLong:currlong,destLat:newlat,destLong:newlong  }, function (err, user) {
      if (err) {
          console.log('Failure');
      }
      else {
          console.log("Location Updated");
          
      }
  }); */


}; 
var options = {
    timeout: 3,
    onSuccess: function () {
        console.log("mqtt connected");
        // Connection succeeded; subscribe to our topic, you can add multile lines of these
        client.subscribe("hw3/coordinates", { qos: 1 });

        //use the below if you want to publish to a topic on connect
        //message = new Paho.MQTT.Message("Hello from the browser");
        //message.destinationName = "coe457/hello";
        //client.send(message);

    },
    onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
    }
};

function init() {
    client.connect(options);
}
init();

function isuserloggedin(){
  $.get("/checklogin", function(data){
      console.log(data);

      if(!data.loggedin){
          window.location.href = "/plslogin.html";
      }else{
         console.log("user logged in");
      }
      
  });
}
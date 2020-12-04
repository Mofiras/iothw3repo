
var net = require('net');

var location=null;

var server = net.createServer(function(socket) {
    
    socket.on('data', function(data) {
        console.log('Received: ' + data);
        var r = data.toString();
        console.log(r.substring(0,4));
        
        if(r.substring(0,4)=="POST")
            {
                console.log("coordinates posted");
            
                var from= r.indexOf('{');
                
                var fulldata=r.substring(from,r.length);
                location=JSON.parse(fulldata);
            }
          
        else if(r.substring(0,3)=="GET")
        {
            // Server is not checking to make sure that the client 
            // actually sent a well-formed header.

            //socket.write("OK");
            socket.write("HTTP/1.1 200 OK\n");
            socket.write("Access-Control-Allow-Origin: *\n");
                   
                content=JSON.stringify(location);
                console.log(content);
                socket.write("Content-Length:"+content.length);
                socket.write("\n\n"); // two carriage returns
                socket.write(content);
        
        }
         
            
    
    });  
    socket.on('close', function() {
        console.log('Connection closed');
    });
    socket.on('end', function() {
        console.log('client disconnected');
     });

    socket.on('error', function() {
        console.log('client disconnected');
     });
});
server.listen(8080, function() { 
    console.log('server is listening on port 8080');
});



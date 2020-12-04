var express = require('express');
var app = express();
var fs= require('fs'); 
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mqtt = require('mqtt');
const bcrypt = require("bcrypt");


const mongoose = require('mongoose');

app.set('port',process.env.PORT||3000);
app.use(express.static(__dirname + '/public'));

// app.use(express.static(__dirname));
var bodyParser = require('body-parser');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


mongoose.connect('mongodb://localhost:27017/login', {useNewUrlParser: true, useUnifiedTopology: true});

// we create a scheme first 
const loginSchema = new mongoose.Schema({
    email:String,
    username: String,
    password:String,
    currentLat:{},
    currentLong:{},
    destLat:{},
    destLong:{},
    lastused: Date
})

const loginformat = mongoose.model("loginQ",loginSchema);
//________________________________________________________________________________________________


//____________________________________________________________________________________________________
/* app.post('/register',urlencodedParser, (req, res)=> {

    theemail=req.body.email;
    theusername=req.body.username;
    thepassword=req.body.password;
    
    const user = new loginformat({
    
    email:theemail,
    username: theusername,
    password:thepassword,
    currentLat:{},
    currentLong:{},
    destLat:{},
    destLong:{},
    lastused: Date

        });
user.save(function(){
    console.log(user)
    });

res.redirect('/app1newtry.html');


}); */
//____________________________________________________________________________________________________
/*app.get('/signin',urlencodedParser, function(req, res) 
{

    theusername=req.query.username;

        //NEED TO TEST LOGIN !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    
    
        loginformat.findOne({username: theusername },function (err, items){  
        if (err){ 

            console.log('error:'+err);
        } 
        else{ 
            res.redirect('/app1newtry.html');
            
        }
    }).then(result => {
        if(result) {
          console.log(`Successful user login`);
          res.redirect('/app1newtry.html');
        } else {
          console.log("No document matches the provided query.");
          res.redirect('loginform.html');
        }
      }) 


});

*/

app.use(session({
    name : 'goofycookie',
    secret : 'we all love coe457',
    resave :true, // have to do with saving session under various conditions
    saveUninitialized: true, // just leave them as is
    cookie : {
            maxAge:(1000 * 30 * 24 * 60 * 60)
    }      
}));

app.use(cookieParser());

 

app.get("/login", function (req, res) {
    req.session.destroy();
    res.redirect("/loginform.html");
});

app.get("/register", function (req, res) {
    req.session.destroy();
    res.redirect("/signupform.html");
});

 app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/loginform.html'); //res.redirect('/login');
})

app.get("/checklogin", function (req, res) {
    
    if (req.session.userid) 
    {   var msg;
        
        str = {};
        //res.send(json.parse(str));

        str.loggedin = true;
        str.username = req.session.username;
        
        str.id = req.session.userid;
        
        
      

        if (req.session.first) 
        {
            msg = "Welcome " + req.session.username;
        }
         else 
        {
            msg = "Welcome back " + req.session.username + "-> Last logged in at : " + req.session.lastused;
          
        }
        
        str.msg =  msg;
        res.json(str);

    }else{
       
        str = {};
        str.loggedin = false;
        res.json(str);

    }

    
});



app.post("/login", urlencodedParser, async function (req, res) {
    
    loginformat.findOne({ username: req.body.username },  function (erro, user) {
        if (erro) {
            console.log('Failure'+erro);
        }
        else {
          
            console.log("form username: "+req.body.username);
            console.log("form password: "+req.body.password);
            const samepass = bcrypt.compare(req.body.password,user.password);
            console.log(samepass);
            if (samepass) {
            
                        req.session.userid = user._id;
                        req.session.username = user.username;
                        req.session.lastused = user.lastused;
                        user.lastused = new Date();
                        user.save();
            
                        if (!req.body.remember) {
                            req.session.cookie.expires = false;
                        }
                        res.redirect("/app1newtry.html");
                        return;
                    }
                }
        
});

    res.redirect("/loginform.html");
});

app.post("/register", urlencodedParser, async function (req, res) {

    let user = await loginformat.findOne({ username: req.body.username });
    if (user) {
        console.log("Oops..User already exists!");
        res.redirect("/loginform.html");

    } else {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
       
        theemail=req.body.email;
        theusername=req.body.username;
        thepassword=req.body.password;
        
        
        user = new loginformat({
            email:theemail,
            username: theusername,
            password: thepassword,
        });

        await user.save();
        

        
        req.session.userid = user._id;
        req.session.username = user.username;
        
        
        req.session.first = true;


        res.redirect("/app1newtry.html");
    }
});

// app.get("/motoapp.html", urlencodedParser, function (req, res) {
// $.ajax({
//     type: "GET",
//     dataType: 'JSON',
//     url: "/public/motoapp.html",
// }).done(function(response) {
//     console.log("use:"+req.session.username);
    
//         loginformat.updateOne({ username: req.session.username }, {currentLat:currlat,currentLong:currlong,destLat:newlat,destLong:newlong  }, function (err, user) {
//             if (err) {
//                 console.log('Error:'+ err);
//             }
//             else {
//                 console.log("Coordinates Updated");
                
//             }
//         }); 
   
//     })

// })



var client  = mqtt.connect('ws://localhost:9001');

client.on('connect', function () {
    
  client.subscribe('hw3/coordinates', function (err) {
    if (!err) {
        client.on('message', function (topic, message){
                data=JSON.parse(message.toString());
                console.log(data);

                updateusername=data.username;
               // updateusername2=updateusername.toString();
                currlat=data.current_latitude;
                currlong=data.current_longitude;
                newlat=data.destinationlat;
                newlong=data.destinationlong;
                
            
            
            loginformat.updateOne({ username: updateusername }, {currentLat:currlat,currentLong:currlong,destLat:newlat,destLong:newlong  }, function (erro, user) {
                if (erro) {
                    console.log('Failure'+erro);
                }
                else {
                   // console.log(updateusername);
                    console.log("Location Updated");
                    //console.log(loginqs);
                }
        });
        })
        
    }
  })
});



app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// custom 500 page 
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});



app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
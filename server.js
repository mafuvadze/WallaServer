var express = require('express'); //npm install express --save
var firebase = require('firebase'); //npm install firebase --save
var admin = require('firebase-admin'); //npm install firebase-admin --save

//***************CONSTANTS*************//

const secondsinhr = 3600; //used to filter activities with last X hours
const port  = 8080;

const requestsuccess = 200;
const requestforbidden = 403;
const requestbad = 400;
const requestnotfound = 404;

//***************INITIALIZATION*************//

var app = express();
  
//create a listener for the server
app.listen(port, function(){
    console.log('listening on port ' + port);
});

//all the stored variables
var domains = {};
var minversion = {};



//***************AUTHENTICATION*************//

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDly8Ewgiyhb14hHbHiSnLcu6zUOvEbuF0",
    authDomain: "walla-launch.firebaseapp.com",
    databaseURL: "https://walla-launch.firebaseio.com",
    storageBucket: "walla-launch.appspot.com",
    messagingSenderId: "261500518113"
};

var defaultApp = admin.initializeApp({
  credential: admin.credential.cert("admin/serviceAccountKey.json"),
  databaseURL: "https://walla-launch.firebaseio.com"
});

var defaultAuth = defaultApp.auth();
var database = defaultApp.database();
var databaseref = database.ref();

function authenticateToken(token){
    //add authentication later. rn just return true
    return true;
}


//***************LISTENERS*************//

//listener for allowed domains
const ad = databaseref.child('allowedDomains');
ad.on('value', snapshot => domains = snapshot.val());

//listener for minimum version
const mv = databaseref.child('minimumVersion');
mv.on('value', snapshot => minversion = snapshot.val());


//***************GET REQUEST HANDLERS*************//

app.get('/api/domains', function(req, res){
    var token = req.query.token;
    if(!authenticateToken(token)){
        res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    res.send(domains)
    
});

//.../api/min_version?platform=android
app.get('/api/min_version', function(req, res){
    var token = req.query.token;
    if(!authenticateToken(token)){
        res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var platform = req.query.platform;
    
    if(platform == undefined){
        res.status(requestbad).send("invalid parameters")
        return;
    }
    
    switch(platform.toLowerCase()){
        case 'android': res.send({'min_version': minversion.Android});
            break;
        case 'ios': res.send({'min_version': minversion.iOS});
            break;
        default: res.status(requestbad).send("invalid parameters");
    }
        
});

//get activities posted 
app.get('/api/activities', function(req, res){
    var token = req.query.token;
    if(!authenticateToken(token)){
        res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var school = req.query.domain;
    if(!school){
        res.status(requestbad).send("invalid parameters");
        return;
    }
    
    if(!domainAllowed(school)){
        res.status(requestbad).send("domain '" + school + "' is not allowed");
        return;
    }
    
    var now = new Date().getTime / 1000;
    var day = 24 * secondsinhr;
    var postsinlastday = now - day;
    
    var activities = [];
    
    databaseref.child(school).child('activities')
        .once('value').then(function(snapshot){
            activities = snapshot.val();
        })
        .then(() => res.status(requestsuccess).send(activities))
        .catch(function(error){
            res.status(400).send(error);
            console.log(error);
    });
    
});

//get user information from a uid.  ex: .../api/user_info?uid=udfan48thbg84t48
app.get('/api/user_info', function(req, res){
    var token = req.query.token;
    if(!authenticateToken(token)){
        res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var uid = req.query.uid;
    if(!uid){
        res.status(requestbad).send("invalid parameters: no uid");
        return;
    }
    
    var school = req.query.domain;
    if(!school){
        res.status(requestbad).send("invalid parameters: no domain");
        return;
    }
    
    if(!domainAllowed(school)){
        res.status(requestbad).send("domain '" + school + "' is not allowed");
        return;
    }
    
    var user = {};
    
    databaseref.child(school).child('users/' + uid).once('value').then(function(snapshot){
        user = snapshot.val();
    }).then(function(){
        if(user == undefined) res.status(requestnotfound).send("user not found");
        else res.status(requestsuccess).send(user);
    }).catch(function(error){
        res.status(400).send(error);
        console.log(error);
    })
});


//***************HELPER FUNCTIONS*************//

function domainAllowed(domain){
    for(key in domains){
        if(key == domain) return true;
    }
    
    return false;
}
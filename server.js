var express = require('express'); //npm install express --save
var firebase = require('firebase'); //npm install firebase --save
var admin = require('firebase-admin'); //npm install firebase-admin --save

//***************CONSTANTS*************//

const secondsinhr = 3600; //used to filter activities with last X hours
const port  = 8080;

const requestsuccess = 200;
const requestforbidden = 403;
const requestbad = 400;

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

app.get('/api/user', function(req, res){
    var token = req.query.token;
    if(!authenticateToken(token)){
        res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var uid = req.query.uid;
    if(uid == undefined){
        res.status(requestbad).send("invalid parameters");
    }
    
    databaseref.child('users/' + uid).once('value').then(function(snapshot){
        console.log(snapshot.val());
    }).catch(function(error){
        console.log(error);
    })
});

databaseref.child('activities').once('value').then(function(snapshot){
    snapshot.forEach(person => console.log(person.val()));
}).catch(function(error){
        console.log(error);
});

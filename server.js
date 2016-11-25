var express = require('express'); //npm install express --save
var firebase = require('firebase'); //npm install firebase --save

//***************CONSTANTS*************//

const secondsinhr = 3600; //used to filter activities with last X hours
const port  = 8080;

//***************INITIALIZATION*************//

var app = express();

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDly8Ewgiyhb14hHbHiSnLcu6zUOvEbuF0",
    authDomain: "walla-launch.firebaseapp.com",
    databaseURL: "https://walla-launch.firebaseio.com",
    storageBucket: "walla-launch.appspot.com",
    messagingSenderId: "261500518113"
};
  
firebase.initializeApp(config);

// Get a reference to the storage service, which is used to create references in your storage bucket
var database = firebase.database();
var databaseref = database.ref();


//create a listener for the server
app.listen(port, function(){
    console.log('listening on port ' + port);
});

//all the stored variables
var domains = {};
var minversion = {};


//***************LISTENERS*************//

//listener for allowed domains
const ad = databaseref.child('allowedDomains');
ad.on('value', snapshot => domains = snapshot.val());

//listener for minimum version
const mv = databaseref.child('minimumVersion');
mv.on('value', snapshot => minversion = snapshot.val());


//***************GET REQUEST HANDLERS*************//

app.get('/api/domains', function(req, res){
    res.send(domains);
});

//.../api/min_version?platform=android
app.get('/api/min_version', function(req, res){
    var platform = req.query.platform;
    switch(platform.toLowerCase()){
        case 'android': res.send({'min_version': minversion.Android});
            break;
        case 'ios': res.send({'min_version': minversion.iOS});
            break;
        default: res.send({'min_version': "wrong parameters"});
    }
        
});

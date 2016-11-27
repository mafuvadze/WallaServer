var express = require('express'); //npm install express --save
var firebase = require('firebase'); //npm install firebase --save
var admin = require('firebase-admin'); //npm install firebase-admin --save
var TokenGenerator = require( 'token-generator' )({
        salt: 'the key to success is to be successful, but only sometimes',
        timestampMap: 'N-2md4X-F8', // 10 chars array for obfuscation proposes 
});
var nodemailer = require('nodemailer'); //npm install nodemailer --save

//***************CONSTANTS*************//

const secondsinhr = 3600; //used to filter activities with last X hours
const port  = 8080;

const requestsuccess = 200;
const requestforbidden = 403;
const requestbad = 400;
const requestnotfound = 404;

const level1 = 1; //read
const level2 = 2; //write
const level3 = 4; //delete
const level4 = 8; //admin

//***************INITIALIZATION*************//

var app = express();
  
//create a listener for the server
app.listen(port, function(){
    console.log('listening on port ' + port);
});

//setup for email
var transporter = nodemailer.createTransport({
        service: 'Aol',
        auth: {
            user: 'wallaapitesting@aol.com', // Your email id
            pass: 'nodemailer' // Your password
        }
});

//all the stored variables
var domains = {};
var minversion = {};

var readpriv = []; 
var writepriv = [];
var deletepriv = [];
var adminpriv = [];



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
    var auth;
    
    if(!token){
        auth = 0;
    }else{
        auth = getAuth(token);
    }
    
    return {'read': auth & level1,
                'write': auth & level2,
                'delete': auth & level3,
                'admin': auth & level4};   
}


//***************LISTENERS*************//

//listener for allowed domains
const ad = databaseref.child('allowedDomains');
ad.on('value', snapshot => domains = snapshot.val());

//listener for minimum version
const mv = databaseref.child('minimumVersion');
mv.on('value', snapshot => minversion = snapshot.val());

const at = databaseref.child('api');
at.on('value', snapshot => {
    var auth = snapshot.val();
    
    readpriv = [];
    writepriv = [];
    deletepriv = [];
    adminpriv = [];
    
    for(key in auth){
        if(auth[key].auth & level1) readpriv.push(key);
        if(auth[key].auth & level2) writepriv.push(key);
        if(auth[key].auth & level3) deletepriv.push(key);
        if(auth[key].auth & level4) adminpriv.push(key);
    }
})


//***************GET REQUEST HANDLERS*************//

//0001 - requires read rights
app.get('/api/domains', function(req, res){
    var token = req.query.token;
    
    var auth = authenticateToken(token);
    if(!auth.read && !auth.admin){
         res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    res.send(domains)
    
});

//.../api/min_version?platform=android
//0001 - requires read rights
app.get('/api/min_version', function(req, res){
    var token = req.query.token;
    
    var auth = authenticateToken(token);
    if(!auth.read && !auth.admin){
         res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var platform = req.query.platform;
    
    if(platform == undefined){
        res.status(requestbad).send("invalid parameters")
        return;
    }
    
    incrementTokenCalls(token);
    
    switch(platform.toLowerCase()){
        case 'android': res.send({'min_version': minversion.Android});
            break;
        case 'ios': res.send({'min_version': minversion.iOS});
            break;
        default: res.status(requestbad).send("invalid parameters");
    }
        
});

//get activities posted 
//0001 - requires read rights
app.get('/api/activities', function(req, res){
    var token = req.query.token;
    
    var auth = authenticateToken(token);
    if(!auth.read && !auth.admin){
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
    incrementTokenCalls(token);
    
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
//0001 - requires read rights 
app.get('/api/user_info', function(req, res){
    var token = req.query.token;
    
    var auth = authenticateToken(token);
    if(!auth.read && !auth.admin){
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
    incrementTokenCalls(token);
    
    databaseref.child(school).child('users/' + uid).once('value').then(function(snapshot){
        user = snapshot.val();
        if(!user || user == {}) res.status(requestnotfound).send("user not found");
        else res.status(requestsuccess).send(user);
    }).catch(function(error){
        return;
    })

});

app.post('/api/generate_token', function(req, res){
    var token = req.query.token;
    
    var auth = authenticateToken(token);
    if(!auth.admin){
         res.status(requestforbidden).send("token could not be authenticated");
        return;
    }
    
    var owner = req.query.owner;
    var email = req.query.email;
    
    if(!owner){
        res.status(requestbad).send("invalid parameters: no owner");
        return;
    }
    
    if(!email){
        res.status(requestbad).send("invalid parameters: no email");
        return;
    }
    
    var r = req.query.r;
    var w = req.query.w;
    var d = req.query.d;
    var a = req.query.a;
    
    if(!r || !w || !d || !a){
        res.status(requestbad).send("invalid parameters");
        return;
    }
    
    var auth = 0;
    auth = r == 0 ? auth : auth | level1;
    auth = w == 0 ? auth : auth | level2;
    auth = d == 0 ? auth : auth | level3;
    auth = a == 0 ? auth : auth | level4;
    
    incrementTokenCalls(token);
    
    var token = TokenGenerator.generate();
    
    var authobj = {};
    authobj[token] = {owner: owner,
                      email: email,
                      auth: auth,
                      calls: 0,
                     };
    
    databaseref.child('api').update(authobj);
    
    var permissions = [];
    if(auth & level1) permissions.push('read');
    if(auth & level2) permissions.push('write');
    if(auth & level3) permissions.push('delete');
    if(auth & level4) permissions.push('admin');
        
    
    sendTokenViaEmail(token, email, owner, permissions);
    res.status(requestsuccess).send("email sent");
    
});


//***************HELPER FUNCTIONS*************//

function domainAllowed(domain){
    for(key in domains){
        if(key == domain) return true;
    }
    
    return false;
}

function getAuth(token){
    var auth = 0;
    if(readpriv.indexOf(token) >= 0){
        auth = auth | level1;
    }
    
    if(writepriv.indexOf(token) >= 0){
        auth = auth | level2;
    }
    
    if(deletepriv.indexOf(token) >= 0){
        auth = auth | level3;
    }
    
    if(adminpriv.indexOf(token) >= 0){
        auth = auth | level4;
    }
    
    return auth;
}

function getUserInfo(uid, domain){
    if(!domainAllowed(domain)){
        res.status(requestbad).send("domain '" + school + "' is not allowed");
        return;
    }
    
    var user = {};
    
    databaseref.child(domain).child('users/' + uid).once('value').then(function(snapshot){
        user = snapshot.val();
    }).then(function(){
        return user;
    }).catch(function(error){
        return {};
    })
}

function incrementTokenCalls(token){
    databaseref.child('api/' + token).child('calls').transaction(function(snapshot) {
            if (snapshot) {
                snapshot = snapshot + 1;
            }
            return snapshot;
    });
}

function sendTokenViaEmail(token, email, name, auth){
    var mailOptions = {
        from: '"Walla API" <wallaapitesting@aol.com>', // sender address
        to: email, // list of receivers
        subject: 'Walla API', // Subject line
        text: 'Hello', // plaintext body
        html: '<b>' + 'Hello ' + name + '. Your API key is ' + token + '\n Permissions: ' + auth + '</b>' // html body
    };
    
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
}

                                                                 

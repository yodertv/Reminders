/* Fully working Todo demonstration application using mongo, angular, and express. */

// Build properties used by todoServer.js
var nodeDesc = "Todo Server v@VERSION@";
var nodeURL = "@NODEURL@";        // URL of the deployed server.
var apiPath = '/' + "@APIPATH@";  // The path to the XHR API
var logDate = @LOGDATE@;          // true or false. E.g. On jitsu date is logged for us.

'use strict';

var os = require("os");
var url = require("url");
var http = require("http");
const mongojs = require("mongojs");
const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
var passport = require('passport');
var logger = require('./logger.js');
var userList = require("./user-list");
var cookieSession = require('cookie-session');
var validSchema = require('./remindersSchema.js')
var bunyanMiddleware = require('bunyan-middleware')
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var Validator = require('jsonschema').Validator
var v = new Validator();
v.addSchema(validSchema.itemSchema, '/itemSchema');

var log = logger.log;
var bunyan = logger.bunyan; // For the global defs.

var nodeProd = ( process.env.NODE_ENV === 'production');
var nodeEnv = nodeProd ? 'PROD' : 'DEV'; //Anything but production is DEV.
var logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";

log.level(logLevel);
log.trace("Logging level set to", log.level());

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var userOptions = {
  'dbUrl' : '@USERDBNAME@',
  'collectionName' : 'userList',
  'nodeEnv' : nodeEnv
}

userList.loadUserList(userOptions);

var dbs = [] // Array of db connections
var match = nodeURL.search('[0-9]{4}/$');
var port = match && nodeURL.slice(match, nodeURL.length-1) || 80;

var reObjectify = function (key, value) {

  if ( key == "_id") {
    return mongojs.ObjectId(value);
  }
  return value;
}

var localUsers = [
    { username: 'bob', password: 'secret', email: 'bob@example.com'}
  , { username: 'mike', password: 'secret', email: 'yoderm01@gmail.com'}
  , { username: 'test', password: 'secret', email: 'test@example.com'}
  , { username: 'code', password: 'secret', email: 'yodercode@gmail.com'}
  , { username: 'junk', password: 'secret', email: 'junk@gmail.com'}
  , { username: 'frank', password: 'secret', email: 'frank@example.com'}
  , { username: 'ted', password: 'secret', email: 'ted@example.com'}
  , { username: 'john', password: 'secret', email: 'john@example.com'}
];

function findByUsername(username, fn) {
  for (var i = 0, len = localUsers.length; i < len; i++) {
    var user = localUsers[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

function safelyParseJSON (json, reviver) {
  var parsed
  try {
    parsed = JSON.parse(json, reviver)
  } catch (e) {
    // Oh well, whatever...
  }
  return parsed // Could be undefined!
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  log.trace({ user: user}, "Serializing user:");
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  user.views = (user.views || 0) + 1; // Yes, counting views here.
  log.trace({ user: user}, "Deserializing user:");

  userList.findByEmail(user.email, function (err, dbUser) {
        if (err) { return done(err); }
        if (dbUser != null) { dbUser.views = user.views }; // Update view count in the user list.
        return ( dbUser );
  })
  done(null, user);
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

if (!nodeProd) {
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        
        // Now search the userList for their registered DB, if not found allocate one.        
        user = userList.findByEmail(user.email, function (err, dbUser) {
          if (err) { return done(err); }
          if (!dbUser) {
            var newUser = userList.assignDb(user.email);
            if (!newUser) { // Unable to assugn DB.   
              var brokenUser = {};
              brokenUser.email = user.email;
              brokenUser.db = 'Sorry, no available databases.'; // a hack to return the error message to the client.
              log.error('Sorry, no available databases for user ' + user.email );
              return ( brokenUser ); // No DB available.
            }
            return ( newUser ); // Just assigned.
          }
          return ( dbUser ); // Previously assinged.
        });
        user.env = nodeEnv;
        user.views = 0;
        // Consider counting and remembering logins here.
        log.trace({"user" : user }, "Local Auth");
        return done(null, user);
      })
    });
  }
));
} else {
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: nodeURL + "auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      log.trace("GoogleStrategy", profile);
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.

      // Here's where we can detect a new user. They won't be found in the user list below

      var user = userList.findByEmail(profile._json.email, function(err, dbUser) {
        if (err) { return done(err); }
        if (!dbUser) { // Not found
          var newUser = userList.assignDb(profile._json.email);
          if (!newUser) { // Unable to assugn DB.
              var brokenUser = {};
              brokenUser.email = profile._json.email;
              brokenUser.db = 'Sorry, no available databases.'; // A hack to return the error message to the client.
              log.error('Sorry, no available databases for user ' + profile._json.email );
              return ( brokenUser );
            }
            return ( newUser ); // Just assigned.
          }
          return ( dbUser ); // Previously assinged.
      });

      user.env = nodeEnv;
      user.views = 0;
      log.trace({"user" : user }, "Google Auth");
      return done(null, user);
    });
  }
));    
}

const app = express();
/*
express.logger.token('user', function(req, res)
  { 
    if (req.user == undefined) return ('undefined')
    else return req.user.email; 
  });

// configure Express
app.configure(function() {
*/
// At INFO level or higher surpress logging the static file server by using it before the logger
if (log.level() >= bunyan.INFO) { app.use(express.static(__dirname + '/static'))};

app.use(bunyanMiddleware(
  { headerName: 'X-Request-Id'
  , propertyName: 'reqId'
  , logName: 'req_id'
  , level: 'info'
  , obscureHeaders: ['cookie']
  , logger: log
  , requestStart: log.level() < bunyan.INFO ? true : false  // Only log the request start when log level is less than INFO
  , additionalRequestFinishData: function(req, res) {
    if (req.user != undefined) {
      return { user: req.user.email };
    }
    else {
      return {};
    }
  }
}));

// While tracing cause static files to be logged by using the static server after the logger middleware.
if (log.level() < bunyan.INFO) { app.use(express.static(__dirname + '/static')) };

/*
if (logDate) { // date in logger output?
  app.use(express.logger(':date [:user@:remote-addr]:method :url :status :res[content-length] :response-time ms'));
} else {
  app.use(express.logger('[:user@:remote-addr]:method :url :status :res[content-length] :response-time ms'));
}
*/
app.use(cookieParser());
//app.use(express.methodOverride());  

app.use(cookieSession(
  { name: 'cookie-session'
  , secret: 'keyboard cat'
  , maxAge: 2.592e+8       // 72 hours 
  })
);

// Initialize Passport.
app.use(passport.initialize());
app.use(passport.session());
//  app.use(app.router);

// POST /login for local auth
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://localhost:8080/auth/local
if (!nodeProd) { // Never use this route in production.
  app.post('/auth/local', bodyParser(),
    passport.authenticate('local', { failureRedirect: '/#authfailed' }),
    function(req, res) {
      req.log.trace(req.user.email);
      setTimeout(listSessions,1000); // Print sessions in one sec.
      res.redirect('/#list/:Reminders');
    }
  );
}

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback.
//   This route won't work on localnet or localhost because of security on the apis.
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
});

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    req.log.trace(req.user.email);
    setTimeout(listSessions,1000); // Print sessions in one sec.
    res.redirect('/#list/:Reminders'); 
});

app.get('/logout', ensureAuthRedirect, function(req, res){
  req.log.trace({user:req.user}, "Logout:")
  delete dbs[req.user.db];
  req.logout();
  res.redirect('/#welcome');
});

app.get('/account', function(req, res){
  var userObj = {};
  if (req.isAuthenticated()) {
    userObj = { email : req.user.email, db : req.user.db, env : nodeEnv, views : req.user.views } ;
    var user = userList.findByEmail(req.user.email, function (err, dbUser) {
        if (err) { return done(err); }
        if (dbUser != null) { dbUser.views = req.user.views; }
        return ( dbUser );
    })
  }
  else {
    userObj = {env : nodeEnv};
  }
  req.log.trace({"userObj" : userObj});
  res.send(userObj);
});

app.get(['/welcome', '/authfailed'], function(req, res){
  // Redirect welcome route. Allows reload and sharing of welcome URL.
  req.log.trace("Redirect /welcome or /authfailed.");
  res.writeHead(302, { 'location' : '/#welcome' });
  res.end();
});

app.get('/list', ensureAuthRedirect, function(req, res) { 
  // Redirect list route. Allows reload and sharing of list URL.
  req.log.trace("Redirect /list", {user : req.user } );
  res.writeHead(302, { 'location' : '/#list' });
  res.end();
});

// this match will need to be unconstrained.
app.get('/list/:*', ensureAuthRedirect, function(req, res) {
  // Redirect list route. Allows reload and sharing of list URL.
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var collectionName = uri.slice(uri.lastIndexOf('/') + 1);
  req.log.trace("Redirect /list/:*", uri);
  res.writeHead(302, { 'location' : "/#list/" + collectionName });
  res.end();
});

/* Angular resource mapping from docs:
{ 'get':    {method:'GET'},
'save':   {method:'POST'},
'query':  {method:'GET', isArray:true},
'remove': {method:'DELETE'},
'delete': {method:'DELETE'} }; */
app.get(apiPath, ensureAuth401, function(req, res) {
  // Get archiveList: no collection name in URI, so get all the collection names.
  // Form of request: http://127.0.0.1/apiPath/

  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;

  // Use authentication when MONGO_USER has a value.
  var dbUrl = process.env.MONGO_USER ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // The client may start with reading the collection names. Open db here.
  if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, "via GET archiveList");
    dbs[dbName].on('error',function(err) {
       return err;
    });
  }

  dbs[dbName].getCollectionNames( function( err, myColls ){
    if (err != null) {
        req.log.error("DB_GETCOLLECTIONNAMES_ERR:" + err);
        res.writeHead(500, "DB_GETCOLLECTIONNAME_ERR", {'Content-Type': 'text/html'});
        res.end(err.toString());
    }
    else {
      req.log.trace({"myColls" : myColls}, "GET COLLECTIONS:");
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.write(JSON.stringify(myColls))
      res.end();
    }
  })
});

app.all(apiPath + '*/[A-Fa-f0-9]{24}$', ensureAuth401, function(req, response){
  // GET, PUT, and DELETE item by id.
  // Form of URL: http://127.0.0.1/{apiPath}/{*}/54bbaee8e4b08851f12dfbf5
  var reqUrl = url.parse(req.url, false); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove /api/1/databases/
  var dbName = req.user.db;
  var match = dbPart.search("[A-Fa-f0-9]{24}$"); // Object ID in URI
  var objID = "";

  if (match>0) {
    objID = dbPart.slice(match);
    dbPart = dbPart.slice(0, match-1); // Remove /objID 
    req.log.trace("Object Action :", "match =", match, " objID =", objID);
  }

  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);  
  req.log.trace("Object Action : uri=%s, dbPart=%s, collectionName=%s, objID=%s", uri, dbPart, collectionName, objID);

  // The client may start with an object action, so open db here.
  if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, "via DB_Object_Action");
    dbs[dbName].on('error',function(err) {
        return err;
    });
  }

  if ( dbPart != collectionName || reqUrl.query != null ) { // This excludes resource names that are paths or URLs with query strings.
    var msg = "Object Action: Invalid Path";
    req.log.error(msg);
    response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
    response.end(msg);
    return;
  }

  switch (req.method) {

    case 'GET':  
    // We don't use this API call in the current implementation. 
    // It can be tested by finding an object ID and hand crafting the URL.
    // Get a single document by specific id
    // E.g.: http://mikes-air.local:8080/api/todos/Reminders/5a1a5b5850c6058f5cf63e16
    
      dbs[dbName].collection(collectionName).findOne({
        _id:mongojs.ObjectId(objID)
      }, function(err, doc) {
        if (err != null) {
          req.log.error(err, "DB_FINDONE_ERR:");
          response.writeHead(500, "DB_FINDONE_ERR", {'Content-Type': 'text/html'});
          response.end(err.toString());
          return(err);
        }
        if ( doc == null) {
          var msg = "GET Object Action: Failed - No such document found."
          req.log.error(msg);
          response.writeHead(404, msg, {'Content-Type': 'text/html'});
          response.end(msg);
          return(err);
        }
        else {
          req.log.trace({"doc": doc}, "GET Object Action:");
          response.writeHead(200, "OK-FINDONE", {'Content-Type': 'text/html'});
          response.write(JSON.stringify(doc));
          response.end();
        }
      });          
    break;
    
    case 'PUT':
      // Replace the document specified by id
      // E.g.: http://mikes-air.local:8080/api/todos/Reminders/5a1a5b5850c6058f5cf63e16
      var fullBody = '';
      req.log.trace('PUT Object Action: ', uri);
      
      req.on('data', function(chunk) {

        fullBody += chunk.toString();
        req.log.trace({ "chunk" : chunk.toString() }, "Received body data: ");
      });
      req.on('end', function() {
        req.log.trace("PUT Received : ", fullBody);
        var instance = safelyParseJSON(fullBody);    
        if (instance == undefined ) {
          var msg = "PUT Object Action: ParseError not JSON";
          req.log.error(msg);
          response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
          response.end(msg);
        }
        else {
          var result = v.validate(instance, validSchema.itemSchema);
          if (!result.valid) {
            req.log.error({"validationError" : result}, "PUT Object Action");
            response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
            response.end(JSON.stringify(result));
          }
          else {
            dbs[dbName].collection(collectionName).update({ _id:mongojs.ObjectId(objID) }, { $set : instance }, { upsert: true }, function(err, doc) {
              if (err != null) {
                req.log.error(err, "DB_UPDATE_ERR:");
                response.writeHead(500, "DB_UPDATE_ERR", {'Content-Type': 'text/html'});
                response.end(err.toString());
              }
              else { 
                req.log.trace({ 'doc' : doc}, "PUT Object Action");
                response.writeHead(200, "OK-PUT", {'Content-Type': 'text/html'});
                response.write(JSON.stringify(doc));
                response.end();
              }
            });
          }
        }
      });

    break;

    case 'DELETE':              
      // Delete object
      dbs[dbName].collection(collectionName).remove({
        _id:mongojs.ObjectId(objID)
      }, true, function(err, doc) {
        if (err != null) {
          req.log.error(err, "DB_REMOVE_ERR:");
          response.writeHead(500, "DB_REMOVE_ERR", {'Content-Type': 'text/html'});
          response.end(err.toString());
        }
        else { 
          req.log.trace("Delete Object Action : " +  objID);
          response.writeHead(200, "OK-DELETE", {'Content-Type': 'text/html'});
          response.end();
        }
      });
    break;
    
    default:
      var msg = "Object Action Error : Method not supported."
      req.log.error(msg);
      response.writeHead(405, msg, {'Content-Type': 'text/html'});
      response.end('<html><body><h1>405 - ' + msg + '</h1></body></html>');
  }
});

app.get(apiPath + '*', ensureAuth401, function(req, res) {      
  // Get all documents from a specified collection
  // Form of URL: http://host/apiPath/CollectionName
  // todo: Check against actual collections and reply with not found
  
  var reqUrl = url.parse(req.url, false); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;
  var dbPart = uri.slice(apiPath.length); // Remove apiPath
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1); // Get collection name from URI
  
  // The client may start with reading the documents from the collection. Open db here.
  if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, "via DB_FIND");
    dbs[dbName].on('error',function(err) {
        return err;
    });
  }

  req.log.trace('GET_DOCS: dbPart=%s collectionName=%s', dbPart, collectionName);

  if ( dbPart != collectionName || reqUrl.query != null ) { // This excludes resource names that are paths or URLs with query strings.
    var msg = "GET_DOCS: Invalid Path";
    req.log.error(msg);
    res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
    res.end(msg);
  }
  else {
    dbs[dbName].collection(collectionName).find( function( err, myDocs ){
      if (err != null) {
        req.log.error("DB_FIND_ERR:" + err);
      }
      else {
        res.writeHead(200, "OK-FIND", {'Content-Type': 'text/html'});
        res.write(JSON.stringify(myDocs));
        res.end();  
      }
    });
  }
});

app.del(apiPath + '*', ensureAuth401, function(req, res) {
  // Delete list (collection) using mongojs.
  // Form of DEL request http://127.0.0.1/apiPath/Reminders

  var reqUrl = url.parse(req.url, false); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;
  var dbPart = uri.slice(apiPath.length); // Remove apiPath
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1); // Get collection name from URI
  
  req.log.trace("DEL_COLLECTION: uri=%s, dbPart=%s, collectionName=%s", uri, dbPart, collectionName);

  // The client may start with deleting a collection. Open db here.
  if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, "via DB_DROP_COLLECTION");
    dbs[dbName].on('error',function(err) {
        return err;
    });
  }

  if ( dbPart != collectionName || reqUrl.query != null ) { // This excludes resource names that are paths or URLs with query strings.
    var msg = "DEL_COLLECTION: Invalid Path";
    req.log.error(msg);
    res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
    res.end(msg);
  }
  else {
    dbs[dbName].collection(collectionName).drop( function(err) {
      if (err != null) {
        req.log.error(err, "DB_DROP_COLLECTION_ERR:");
        res.writeHead(500, "DB_DROP_COLLECTION_ERR", {'Content-Type': 'text/html'});
        res.end(err.toString());
      }
      else { // Send a success response.
        res.writeHead(200, "OK-DEL-COLL", {'Content-Type': 'text/html'});
        res.end();        
      }
    });
  } 
});

app.put(apiPath + '*', ensureAuth401, function(req, res) {
  // REPLACE_COLLECTION: Drop existing documents from the collection and replace with an 
  // insert of the entire json array from body data.

  var reqUrl = url.parse(req.url, false);
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove apiPath
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
  var dbName = req.user.db;
  var fullBody = '';

  req.log.trace('REPLACE_COLLECTION: uri=%s dbPart=%s collectionName=%s', uri, dbPart, collectionName);

  // The client may start with storing a collection. Open db here.
    if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, "via DB_REPLACE_COLLECTION");
    dbs[dbName].on('error',function(err) {
       return err;
    });
  }

  if ( dbPart != collectionName || reqUrl.query != null ) { // This excludes resource names that are paths or URLs with query strings.
    var msg = "REPLACE_COLLECTION: Invalid Path";
    req.log.error({"reqUrl" : reqUrl}, msg);
    res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
    res.end(msg);
    return;
  }

  req.on('data', function(chunk) {

    fullBody += chunk.toString();
    req.log.trace({ "chunk" : chunk.toString() }, "Received body data: ");
  });
  req.on('end', function() {
    req.log.trace("PUT Collection Received : ", fullBody.length);
    // Suspect race condition when the insert below beats the key cleanup of the drop cause 
    // a duplicate key error and loss of data. Attempt to fix that by putting the insert into the return function.
    // As of 12.29.2017 the fix seems to have solved the problem.
    
    if (fullBody.length > 2) { // A stringified empty collection has "[]"
      var instance = safelyParseJSON(fullBody, reObjectify);    
      if (instance == undefined ) {
        var msg = "REPLACE_COLLECTION: ParseError not JSON";
        req.log.error(msg);
        res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
        res.end(msg);
      }
      else {
        // req.log.trace({ "obj" : instance}, "REPLACE_COLLECTION", {"schema" : validSchema.itemListSchema});
        var result = v.validate(instance, validSchema.itemListSchema);
        if (!result.valid) {
          req.log.error({"validationError" : result}, "REPLACE_COLLECTION");
          res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
          res.end(JSON.stringify(result));
        }
        else {
          dbs[dbName].collection(collectionName).drop( function(err) {
            if (err != null) { // Only error seems to be dropping an non-exisiting namespace.
              req.log.error(err, "DB_REPLACE_COLLECTION_ERR:");
              res.writeHead(500, "DB_REPLACE_COLLECTION_ERR", {'Content-Type': 'text/html'});
              res.end(err.toString());
            }
            else {
              dbs[dbName].collection(collectionName).insert( instance, function(err, doc) {
                if (err != null) {
                  req.log.error(err, "DB_REPLACE_COLLECTION_ERR:");
                  res.writeHead(500, "DB_REPLACE_COLLECTION_ERR", {'Content-Type': 'text/html'});
                  res.end(err.toString());
                }
                else { 
                  req.log.trace({docs: doc}, "REPLACE_COLLECTION:");
                  res.writeHead(200, "OK-REPLACE", {'Content-Type': 'text/html'});
                  res.write(JSON.stringify(doc));
                  res.end();
                }
              });
            }
          });
        }
      }
    }
    else { // Avoid the empty collection error from DB by skipping the insert above.
      res.writeHead(200, "OK-REPLACE", {'Content-Type': 'text/html'});
      res.end();          
    }
  }); 
});

app.post(apiPath + '*', ensureAuth401, function(req, response) {
  // Insert a new doc into collectionName
  // URL: mikes-air.local:8080/apiPath/Reminders

  var reqUrl = url.parse(req.url, false); // don't parse the query string.
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove apiPath
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
  var dbName = req.user.db; 
  var fullBody = '';

  req.log.trace('In POST_DOC (insert) new doc into collection: uri=%s, dbPart=%s, collectionName=%s', uri, dbPart, collectionName);

  req.on('data', function(chunk) {

    fullBody += chunk.toString();
      req.log.trace("Received body data : ", chunk.toString());
  });
  req.on('end', function() {
    if ( dbPart != collectionName || reqUrl.query != null ) { // This excludes resource names that are paths or URLs with query strings.
      var msg = "POST_DOC: Invalid Path";
      req.log.error({"reqUrl" : reqUrl}, msg);
      response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
      response.end(msg);
    }
    else {
      req.log.trace("POST_DOC Received : ", fullBody);
      var instance = safelyParseJSON(fullBody);    
      if (instance == undefined ) {
          var msg = "POST_DOC: ParseError not JSON";
          req.log.error(msg);
          response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
          response.end(msg);
      }
      else {
        req.log.trace({ "obj" : instance}, "POST_DOC", {"schema" : validSchema.itemSchema});
        var result = v.validate(instance, validSchema.itemSchema);
        if (!result.valid) {
          req.log.error({"validationError" : result}, "POST_DOC");
          response.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
          response.end(JSON.stringify(result));
        }
        else {
          // The client may start with posting a new item. Open db here.
          if (dbs[dbName] == undefined) {
            dbs[dbName] = userList.openDB(req.user.db, req.log, "via via DB_POST_DOC");
            dbs[dbName].on('error',function(err) {
              return err;
            });
          }

          dbs[dbName].collection(collectionName).insert( instance, function(err, doc) {
            if (err != null) {
              req.log.error(err, "DB_INSERT_ERR:");
              response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
              response.end(err.message);
            }
            else { 
              req.log.trace("Inserted doc:\n", doc);
              response.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
              response.write(JSON.stringify(doc));
              response.end();
            }
          });
        }
      }
    }
  });   
});

app.all('*', function(req, res) {
  req.log.trace("Redirecting to Welcome Page.");
  res.redirect("/#welcome");
});

http.createServer(app).listen(process.env.PORT || parseInt(port, 10));

log.info(nodeDesc + " running on " + os.hostname() + ":" + port + ". Node environment = " + nodeEnv + "." );
log.info("User store = " + userOptions.dbUrl + "[" + userOptions.collectionName +"]" );
log.info("Use URL " + nodeURL.slice(0, nodeURL.length-1) + ". CTRL + C to shutdown." );

if (log.level() < bunyan.INFO) {
  log.trace("Turing on periodic output of server state.");
  interval_example(); // Turn this on to observe the session table leak.
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthRedirect(req, res, next) { // Use this for routes called by the browser.
  if (req.isAuthenticated()) { return next(); }
  // setTimeout(listSessions,1000); // Print sessions in one sec.
  res.redirect('/#welcome')
}

function ensureAuth401(req, res, next) {  // Use this for routes consumed by XHR.
  if (req.isAuthenticated()) { return next(); }
  // setTimeout(listSessions,1000); // Print sessions in one sec.
  res.send(401);
}

// interval example - 5x output every 2secs using setInterval
function interval_example() {
  var start_time = new Date();
  log.trace("Starting 30 second interval, stopping after 25 times.");
  var count = 1;
  var interval = setInterval(function() {
    if (count == 25) clearInterval(this);
    var end_time = new Date();
    var difference = end_time.getTime() - start_time.getTime();

    log.trace("Tick no. " + count + " after " + Math.round(difference/1000) + " seconds");
    count++;
    listSessions();
  }, 30000);
}

// Log the current sessions. Called periodically by interval_example.
function listSessions() {
  userList.logUserList();
}

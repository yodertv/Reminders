/* Fully working Todo demonstration application using mongo, angular, and express. */

'use strict';

// Build properties used by todoServer.js
var nodeDesc = "Todo Server v@VERSION@";
var nodeURL = "@NODEURL@";        // URL of the deployed server.
var apiPath = '/' + "@APIPATH@";  // The path to the XHR API

var os = require("os");
var url = require("url");
var http = require("http");
const path = require('path');
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
log.trace("Logging level set to", log.level(), ".");

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var userOptions = {
  'dbUrl' : process.env.MONGO_USER_DB_NAME,
  'collectionName' : 'userList',
  'nodeEnv' : nodeEnv
}

// Handle initialization errors
if (!userOptions.dbUrl) {
  const errorMsg = "MONGO_USER_DB_NAME environment variable not found.";
  log.error(errorMsg);
  throw new Error(errorMsg);
} else {
  userList.initUserDbOptions(userOptions);
};

var dbs = [] // Array of db connections
var match = nodeURL.search('[0-9]{4}/$');
var port = match && nodeURL.slice(match, nodeURL.length-1) || 80;

var reObjectify = function (key, value) {

  if ( key == "_id") {
    return mongojs.ObjectId(value);
  }
  return value;
}

// bob is now the only user that matters in the localStrategy.
var localUsers = [
    { username: 'bob', password: 'secret', email: 'bob@example.com'}
  , { username: 'mike', password: 'secret', email: 'yoderm01@gmail.com'}
  , { username: 'test', password: 'secret', email: 'test@example.com'}
  , { username: 'code', password: 'secret', email: 'yodercode@gmail.com'}
  , { username: 'junk', password: 'secret', email: 'junk@gmail.com'}
  , { username: 'frank', password: 'secret', email: 'frank@example.com'}
  , { username: 'ted', password: 'secret', email: 'ted@example.com'}
  , { username: 'john', password: 'secret', email: 'john@example.com'}
  , { username: 'george', password: 'secret', email: 'george@example.com'}
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function canonicalizeEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Invalid input: email must be a string');
  }

  // Convert the email to lowercase and trim whitespace
  return email.trim().toLowerCase();
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

passport.deserializeUser( async function(user, done) {
  user.views = (user.views || 0) + 1; // Yes, counting views here.
  log.trace({user}, "Deserializing user:");
  var dbUser = {};
  try {
    dbUser = await userList.findByEmail(user.email);
    // dbUser.views = user.views ; // Update view count.
    log.trace({dbUser}, "Found user:");
    done(null, dbUser);
  } catch (error) {
    log.error('findByEmail error in deserializeUser():', JSON.stringify(error));
    return done(error, dbUser);
  } finally {
    log.trace("In Finally{} of deserializeUser()");
  }
});

if (!nodeProd) {
// Use the LocalStrategy within Passport only when not in production.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this might query a database for a public passkey;
//   however, in this example we are accepting any valid email if the operatore knows the "secret".
//   Todo: Validate email address structure.

passport.use(new LocalStrategy(
  async function(emailRaw, password, done) {
    // Find the user by bob.  If we don't find bob or the password is not correct,
    // set the user to `false` to indicate failure and set a flash message.  Otherwise, return the
    // authenticated `user` made from only the email address.
    log.trace({ "emailRaw" : emailRaw }, "Enter LocalStrategy with:")

    if (!isValidEmail(emailRaw)) {
      log.error({"email" : emailRaw, "pwd" : password}, "Invalid email.");
      return done(null, false, { message: 'Invalid email.' });
    }
    const email = canonicalizeEmail(emailRaw);

    findByUsername('bob', function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Unknown user ' + 'bob' }); }
      if (user.password != password) { return done(null, false, { message: 'Invalid password.' }); }
    });

    // Now search the userList by email for the user's account, if not found, call assignDb.
    var dbUser;
    try {
      log.trace({ "email" : email }, "Enter try with:");
      dbUser = await userList.findByEmail(email);
      dbUser.env = nodeEnv;
      log.trace("findByEmail results: " + JSON.stringify(dbUser));
      // Todo: Consider counting and remembering logins here.
      done(null, dbUser);
    } catch (err) {
      log.error({ "error" : JSON.stringify(err) }, 'findByEmail error in LocalStrategy():');
      // if error is because this email isn't found if (!dbUser) { // Not found
      // Todo: Determine how to check.
      if (true) {
        dbUser = userList.assignDb(email);
        if (!dbUser) { // Unable to assignDb. This is fatal for the client.
          var brokenUser = {};
          brokenUser.email = user.email;
          brokenUser.db = 'Sorry, assignDb failed.'; // a hack to return the error message to the client.
          log.error('assignDb failed for ', { "email" : email }, 'in LocalStrategy.');
          return done(null, brokenUser); // assignDb failed.
        } else {  // Just assigned.
          dbUser.views = 0;
          dbUser.env = nodeEnv;
          log.trace("Local Auth assigned dbUser:", { "dbUser" : dbUser });
          return done(null, dbUser);
        }
      } else { // Database error.
        return done(error, dbUser);
      };
    } finally {
      log.trace("In Finally{} of LocalStrategy()");
    }
  }));
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
  async function(accessToken, refreshToken, profile, done) {
    log.trace({ "profile" : profile }, "Enter GoogleStrategy with:");
    const email = profile._json.email
    var dbUser;
    try {
      log.trace({ "profile" : profile }, "Enter GoogleStrategy try with:");
      dbUser = await userList.findByEmail(email);
      dbUser.env = nodeEnv;
      log.trace("GoogleStrategy findByEmail results: " + JSON.stringify(dbUser));
      // Todo: Consider counting and remembering logins here.
      done(null, dbUser);
    } catch (err) {
      log.error({ "error" : JSON.stringify(err) }, 'findByEmail error in LocalStrategy():');
      if (true) {
        dbUser = userList.assignDb(email);
        if (!dbUser) { // Unable to assignDb. This is fatal for the client.
          var brokenUser = {};
          brokenUser.email = user.email;
          brokenUser.db = 'Sorry, assignDb failed.'; // a hack to return the error message to the client.
          log.error('assignDb failed for ', { "email" : email }, 'in LocalStrategy.');
          return done(null, brokenUser); // assignDb failed.
        } else {  // Just assigned.
          dbUser.views = 0;
          dbUser.env = nodeEnv;
          log.trace("Google Auth assigned dbUser:", { "dbUser" : dbUser });
          return done(null, dbUser);
        }
      } else { // Database error.
        return done(error, dbUser);
      };
    } finally {
      log.trace("In Finally{} of GoogleStrategy()");
    }
  }));
};

const app = express();

// Export the app
module.exports = app;

// At INFO level or higher surpress logging the static file server by using it before the logger.
// Serve static files from the "static" directory.
if (log.level() >= bunyan.INFO) { app.use(express.static(path.join(__dirname, '../public'))) };
 
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
if (log.level() < bunyan.INFO) { app.use(express.static(path.join(__dirname, '../public'))) };

//app.use(cookieParser());

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
      req.log.trace("/auth/local: ", req.user);
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
    req.log.trace("/account: ", JSON.stringify(req.user));
    userObj = { email : req.user.email, db : req.user.db, env : nodeEnv, views : req.user.views } ;
    var dbUser = userList.findByEmail(req.user.email);
    if (dbUser != null) { 
      dbUser.views = req.user.views; 
    } else {
      userObj = {env : nodeEnv};
    }
  } else {
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
app.get(apiPath, ensureAuth401, async function(req, res) {
  // GET_COLLECTIONS: no collection name in URI, so get all the collection names.
  // Form of request: http://127.0.0.1/apiPath/

  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;

  // Use authentication when MONGO_USER has a value.
  var dbUrl = process.env.MONGO_USER ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  req.log.trace('Entering GET_COLLECTIONS: isAuthenticated? %s, user=%s.', req.isAuthenticated(), JSON.stringify(req.user));

  // The client may start with reading the collection names. Open db here.
  if (dbs[dbName] == undefined) {
    dbs[dbName] = userList.openDB(req.user.db, req.log, " via GET_COLLECTIONS ");
    dbs[dbName].on('error',function(err) {
       return err;
    });
  }
  try {
    await new Promise((resolve, reject) => {
      dbs[dbName].getCollectionNames( function( err, myColls ){
        if (err) {
          req.log.error("GET_COLLECTIONS_ERR:" + err);
          reject(err);
        } else {
          req.log.trace({"myColls" : myColls}, "GET_COLLECTIONS:");
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'X-Custom-Status-Message': 'OK-GET_COLLECTIONS'
          });
          res.write(JSON.stringify(myColls))
          res.end();
          resolve(myColls);
        }
      });
    });
  } catch (err) {
    throw new Error('Database collection fetch failed');
  }
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
    dbs[dbName] = userList.openDB(req.user.db, req.log, " via DB_Object_Action ");
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

app.get(apiPath + '*', ensureAuth401, async function(req, res) {
  // Get all documents from a specified collection
  // Form of URL: http://host/apiPath/CollectionName
  // todo: Check against actual collections and reply with not found
  
  var reqUrl = url.parse(req.url, false); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;
  var dbPart = uri.slice(apiPath.length); // Remove apiPath
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1); // Get collection name from URI
  
  req.log.trace('GET_DOCS: dbPart=%s collectionName=%s, isAuthenticated? %s, user=%s.', dbPart, collectionName, req.isAuthenticated(), JSON.stringify(req.user));

  if ( dbPart != collectionName ) { // This excludes resource names that are paths or URLs with query strings.
    var msg = "GET_DOCS: Invalid Path";
    req.log.error(msg);
    res.writeHead(422, "Unprocessable Entity", {'Content-Type': 'text/html'});
    res.end(msg);
  }
  else {
    // The client may start with reading the documents from the collection. Open db here.
    if (dbs[dbName] == undefined) {
      dbs[dbName] = userList.openDB(req.user.db, req.log, " via GET_DOCS ");
      dbs[dbName].on('error',function(err) {
          return err;
      });
    }
    try {
      await new Promise((resolve, reject) => {
        dbs[dbName].collection(collectionName).find( function( err, myDocs ) {
          if (err) {
            req.log.error("DB_FIND_ERR:" + err);
            reject(err);
          } else {
            req.log.trace('GET_DOCS: Result=%s.', JSON.stringify(myDocs));
            res.writeHead(200, {
              'Content-Type': 'text/html',
              'X-Custom-Status-Message': 'OK-FIND'
            });
            res.write(JSON.stringify(myDocs));
            res.end();
            resolve(myDocs);
          }
        });
      });
    } catch (err) {
      throw new Error('Database fetch failed');
    }
  }
});

app.delete(apiPath + '*', ensureAuth401, function(req, res) {
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
    dbs[dbName] = userList.openDB(req.user.db, req.log, " via DB_DROP_COLLECTION ");
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
    dbs[dbName] = userList.openDB(req.user.db, req.log, " via DB_REPLACE_COLLECTION ");
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
            dbs[dbName] = userList.openDB(req.user.db, req.log, " via via DB_POST_DOC ");
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

// This is replaced by main.js and vercel's serverless deployment.
// http.createServer(app).listen(process.env.PORT || parseInt(port, 10));

log.info(nodeDesc + " running on " + os.hostname() + ":" + port + ". Node environment = " + nodeEnv + "." );
log.info("User store = " + userOptions.dbUrl + "[" + userOptions.collectionName +"]" );
log.info("Use URL " + nodeURL.slice(0, nodeURL.length-1) + ". CTRL + C to shutdown." );

/*
if (log.level() < bunyan.INFO) {
  log.trace("Turing on periodic output of server state.");
  interval_example(); // Turn this on to observe the session table leak.
}
*/

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
  res.sendStatus(401);
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

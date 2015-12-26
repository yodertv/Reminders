/* Fully working Todo demonstration application using mongo, angular, and express. */

// Build properties used by todoServer.js
var nodeDesc = "Todo Server v@VERSION@";
var nodeURL = "@NODEURL@";        // URL of the deployed server.
var apiPath = '/' + "@APIPATH@";  // The path to the XHR API
var logDate = @LOGDATE@;          // true or false. E.g. On jitsu date is logged for us.
var DBKey = "50a2a0e3e4b0cd0bfc12435d";

'use strict';

var os = require("os");
var url = require("url");
var http = require("http");
var mongojs = require("mongojs");
var express = require("express");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var userList = require("./user-list");

var nodeProd = ( process.env.NODE_ENV === 'production');

var userOptions = {
  'dbUrl' : '@USERDBNAME@',
  'collectionName' : 'userList'
}

userList.getUserList(userOptions);

// This list should be replaced with my user db and seperated into it own module.
/*
var dblist = {
  //'test-todo' : 'yodertv:sugmag@ds045907.mongolab.com:45907/test-todo',
  'test-todo-macbook' : 'Katrinas-Macbook-Air.local:27017/test-todo', // Used to test mongo db v2.6.5
  'test-todo' : 'localhost:27017/test-todo',
  'test-todo-1' : 'localhost:27017/test-todo-1',
  'todo_new_test' : 'localhost:27017/todo_new_test',
  'bobs_local' : 'localhost:27017/bobstodos',
  'bobstodos' : 'yodertv:sugmag@ds049467.mongolab.com:49467/bobstodos',
  'frankstodos' : 'yodertv:sugmag@ds047057.mongolab.com:47057/frankstodos',
  'yodertvtodo' : 'yodertv:sugmag@ds043047.mongolab.com:43047/yodertvtodo' // my production db
}
*/

var dbs = []; // Array of db connections

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
  , { username: 'bobby', password: 'secret', email: 'bobby@example.com'}
  , { username: 'frank', password: 'secret', email: 'frank@example.com'}
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

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
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
        return done(null, {"email" : user.email, "db" : userList.findByEmail(user.email, function (err, user) {
          return ( user.db );
        })});
      })
    });
  }
));

var sessionStore = new express.session.MemoryStore();
var app = express();
express.logger.token('user', function(req, res)
  { 
    if (req.user == undefined) return ('undefined')
    else return req.user.email; 
  });

// configure Express
app.configure(function() {

  app.use(express.static(__dirname + '/static'));

  if (logDate) { // date in logger output?
    app.use(express.logger(':date [:user@:remote-addr]:method :url :status :res[content-length] :response-time ms'));
  } else {
    app.use(express.logger('[:user@:remote-addr]:method :url :status :res[content-length] :response-time ms'));
  }
  app.use(express.static(__dirname + '/static'));
  app.use(express.cookieParser());
  app.use(express.methodOverride());  
  app.use(express.session({ secret: 'keyboard cat', store: sessionStore, resave: false, saveUninitialized: false }));

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://localhost:8080/auth/local
app.post('/auth/local', express.bodyParser(),
  passport.authenticate('local', { failureRedirect: '/#authfailed' }),
  function(req, res) {
    res.redirect('/#todo');
  });
  
app.get('/logout', ensureAuthRedirect, function(req, res){
  req.logout();
  res.redirect('/#welcome');
});

app.get('/account', ensureAuthRedirect, function(req, res){
  // console.log(req.user);
  var userObj = { email: req.user.email, db: req.user.db } ;
  res.send(userObj);
});

app.get(['/welcome', '/authfailed'], function(req, res){
  // Redirect welcome route. Allows reload and sharing of welcome URL.
  // console.log("Redirect /welcome.")
  res.writeHead(302, { 'location' : '/#welcome' });
  res.end();
});

app.get('/todo', ensureAuthRedirect, function(req, res){
  // Redirect todo route. Allows reload and sharing of todo URL.
  console.log("Redirect /todo.")
  res.writeHead(302, { 'location' : '/#todo' });
  res.end();
});

app.get('/history', ensureAuthRedirect, function(req, res) { 
  // Redirect history route. Allows reload and sharing of history URL.
  console.log("Redirect /history.")
  res.writeHead(302, { 'location' : '/#history' });
  res.end();
});

app.get('/list/:todo*', ensureAuthRedirect, function(req, res) {
  // Redirect list route. Allows reload and sharing of list URL.
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var collectionName = uri.slice(uri.lastIndexOf('/') + 1);
  console.log("Redirect ", uri);
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

  // Assume produciton has db authenitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = nodeProd ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // The client may start with reading the collection names. Open db here.
  if (dbs[dbName] == undefined) {
    console.log("Opening DB " + dbName + " via DB_GETCOLLECTIONNAMES");
    dbs[dbName] = new mongojs(dbUrl, [], {authMechanism: 'ScramSHA1'});
    dbs[dbName].on('error',function(err) {
      console.log('database error', err);
      throw err;
    });
  }

  dbs[dbName].getCollectionNames( function( err, myColls ){
    if (err != null) {
        var errString = err.toString();
        console.log("DB_GETCOLLECTIONNAMES_ERR:", errString);
        res.writeHead(500, "DB_GETCOLLECTIONNAME_ERR", {'Content-Type': 'text/html'});
        res.end(errString);
    }
    else {
      // console.log("GET COLLECTIONS:\n", myColls);
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.write(JSON.stringify(myColls))
      res.end();
    }
  })
});

app.get(apiPath + '*', ensureAuth401, function(req, res) {      
  // console.log('GET DOCS:', uri);
  // Get all documents from a specified collection
  // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo
  // Where todo* is the collection name.
  
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;

  // Assume produciton has db authenitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = nodeProd ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // The client may start with reading the documents from the collection. Open db here.
  if (dbs[dbName] == undefined) {
    console.log("Opening DB " + dbName + " via DB_FIND");
    dbs[dbName] = new mongojs(dbUrl, [], {authMechanism: 'ScramSHA1'});
    dbs[dbName].on('error',function(err) {
      console.log('database error', err);
      throw err;
    });
  }

  var collectionName = uri.slice(apiPath.length); // Remove apiPath
  dbs[dbName].collection(collectionName).find( function( err, myDocs ){
    if (err != null) {
      console.log("DB_FIND_ERR:", err);
    }
    else {
      res.writeHead(200, "OK-FIND", {'Content-Type': 'text/html'});
      res.write(JSON.stringify(myDocs));
      res.end();
    }
  });
});

app.all(apiPath + '*/[A-Fa-f0-9]{24}$', ensureAuth401, function(req, response){
  // Form of URL: http://127.0.0.1/{apiPath}/{*}/54bbaee8e4b08851f12dfbf5
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove /api/1/databases/
  var dbName = req.user.db;
  var match = dbPart.search("[A-Fa-f0-9]{24}$"); // Object ID in URI
  var objID = "";

  if (match>0) {
    objID = dbPart.slice(match);
    dbPart = dbPart.slice(0, match-1); // Remove /objID 
    // console.log("match =", match, "\n objID =", objID);
  }

  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
  var dbUrl = dbName;
  
  /*
  console.log("\nuri =", uri,
    "\ndbPart =", dbPart, 
    "\ndbName =", dbName,
    "\ncollectionName =", collectionName,
    "\nobjID = ", objID,
    "\ndbUrl =", dbUrl
  );
  */

  switch (req.method) {

    case 'GET':  // don't believe we use this API call in the current implementation. Which means it's not tested.
      // Get a single document by specific id
      // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
      // Where todo* is the collection name.
      // find a document using a native ObjectId
    
      dbs[dbName].collection(collectionName).findOne({
        _id:mongojs.ObjectId(objID)
      }, function(err, doc) {
        if (err != null) {
          var errString = err.toString();
          console.log("DB_FINDONE_ERR:", errString);
          response.writeHead(500, "DB_FINDONE_ERR", {'Content-Type': 'text/html'});
          response.end(errString);
          return;
        }
        else { 
          console.log("GET doc:\n" +  JSON.stringify(doc));
          response.writeHead(200, "OK-FINDONE", {'Content-Type': 'text/html'});
          response.write(JSON.stringify(doc));
          response.end();
        }
      });          
    break;
    
    case 'PUT':
      // console.log('UPDATE DOC: ', uri);
      // Save/replace todos here
      var fullBody = '';
      req.on('data', function(chunk) {

        fullBody += chunk.toString();
        // console.log("Received body data : ");
        // console.log(chunk.toString());
      });
      req.on('end', function() {
        // console.log("PUT Received : ", fullBody);
        // Replace the document specified by id
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
        // Where todo* is the collection name.
      
        dbs[dbName].collection(collectionName).update({
          _id:mongojs.ObjectId(objID)
        }, JSON.parse(fullBody), { upsert: true }, function(err, doc) {
          if (err != null) {
            var errString = err.toString();
            console.log("DB_UPDATE_ERR:", errString);
            response.writeHead(500, "DB_UPDATE_ERR", {'Content-Type': 'text/html'});
            response.end(errString);
          }
          else { 
            // console.log("Updated doc:\n" +  JSON.stringify(doc));
            response.writeHead(200, "OK-PUT", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(doc));
            response.end();
          }
        });
      });   
    break;

    case 'DELETE':              
      // Delete object
      dbs[dbName].collection(collectionName).remove({
        _id:mongojs.ObjectId(objID)
      }, true, function(err, doc) {
        if (err != null) {
          var errString = err.toString();
          console.log("DB_DELETE_ERR:", errString);
          response.writeHead(500, "DB_DELET_ERR", {'Content-Type': 'text/html'});
          response.end(errString);
        }
        else { 
          // console.log("Deleted : " +  objID);
          response.writeHead(200, "OK-DELETE", {'Content-Type': 'text/html'});
          response.write(JSON.stringify(doc));
          response.end();
         // db.close();
        }
      });
    break;
    
    default:
      console.log("OBJ_ERR:", err);
      response.writeHead(405, "Method not supported.", {'Content-Type': 'text/html'});
      response.end('<html><head><title>405 - Method not supported.</title></head><body><h1>Method not supported.</h1></body></html>');
  }
});

app.del(apiPath + 'todo*', ensureAuth401, function(req, res) {
  // Old Form of request: http://127.0.0.1/todoSat-Apr-06-2013/?mongoDB=test-todo
  // Form of DEL request http://127.0.0.1/apiPath/todoSat-Apr-06-2013
  // Delete archived collection using mongojs.
  // Todo: Consider refactoring to match the form of the other API calls. This got this way because the original 
  // mongolab rest API didn't support delete collection.  
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbName = req.user.db;
  var collectionName = uri.slice(apiPath.length); // Get collection name from URI
  // console.log("dbUrl=", dbUrl, "collectionName=", collectionName);

  dbs[dbName].collection(collectionName).drop( function(err) {
    if (err != null) {
      var errString = err.toString();
      console.log("DB_DROP_COLLECTION_ERR:", errString);
      res.writeHead(500, "DB_DROP_COLLECTION_ERR", {'Content-Type': 'text/html'});
      res.end(errString);
    }
    else { // Send a success response.
      res.writeHead(200, "OK-DEL-COLL", {'Content-Type': 'text/html'});
      res.end();        
    }
  });
});

app.put(apiPath + 'todo*', ensureAuth401, function(req, res) {
  // console.log('PUT NEW COLLECTION:', uri);
  // Drop existing documents and replace with
  // Insert of the entire array into collection.
  // Makes a new collection if it doesn't exist.

  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove /api/1/databases/
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
  var dbName = req.user.db;
  var dbUrl = dbName;
  var fullBody = '';

  req.on('data', function(chunk) {

    fullBody += chunk.toString();
    // console.log("Received body data : ");
    // console.log(chunk.toString());
  });
  req.on('end', function() {
    // console.log("PUT Collection Received : ", fullBody.length);
    // Replace the document specified by id
    // Form of URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todoThu-Jan-29-2015/
    // Where todo* is the collection name.
 
    // Suspect race condition when the insert below beats the key cleanup of the drop cause a duplicate key error and loss of data.
    // attempted to fix by putting the insert into the return function
    // dbs[dbName].collection(collectionName).drop();
    
    dbs[dbName].collection(collectionName).drop( function(err) {
      /*if (err != null) { // Only error seems to be dropping an non-exisiting namespace.
        var errString = err.toString();
        console.log("DB_PUT_DROP_COLLECTION_ERR:", errString);
        res.writeHead(500, "DB_PUT_DROP_COLLECTION_ERR", {'Content-Type': 'text/html'});
        res.end(errString);
      }
      else */
      if (fullBody.length > 2) { // A stringified empty collection has "[]"
        dbs[dbName].collection(collectionName).insert( JSON.parse(fullBody, reObjectify), function(err, doc) {
          if (err != null) {
            var errString = err.toString();
            console.log("DB_INSERT_ERR:", errString);
            res.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
            res.end(errString);
          }
          else { 
            // console.log("docs:\n" +  JSON.stringify(doc));
            res.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
            res.write(JSON.stringify(doc));
            res.end();
          }
        });
      }
      else { // Avoid the empty collection error from DB by skipping the insert above.
        res.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
        res.end();          
      }
    });
  }); 
});

app.post(apiPath + '*', ensureAuth401, function(req, response) {
  // Insert a new doc into collectionName
  // console.log('In POST (insert) new doc into collection:', uri);
  // Insert and new doc into collection.

  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var dbPart = uri.slice(apiPath.length); // Remove /api/1/databases/
  //var dbName = dbPart.slice(0,dbPart.indexOf('/'));
  var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
  var dbName = req.user.db; 
  var dbUrl = dbName;

  var fullBody = '';
  req.on('data', function(chunk) {

    fullBody += chunk.toString();
    // console.log("Received body data : ");
    // console.log(chunk.toString());
  });
  req.on('end', function() {
    // 
    // console.log("POST NEW DOC Received : ", fullBody);
    // Replace the document specified by id
    // Form of URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todoThu-Jan-29-2015/
    // Where todo* is the collection name.
  
    dbs[dbName].collection(collectionName).insert( JSON.parse(fullBody), function(err, doc) {
      if (err != null) {
        var errString = err.toString();
        console.log("DB_INSERT_ERR:", errString);
        response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
        response.end(errString);
      }
      else { 
        // console.log("Inserted doc:\n", doc);
        response.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
        response.write(JSON.stringify(doc));
        response.end();
      }
    });
  });   
});

// console.log("process.env.PORT=", process.env.PORT);

http.createServer(app).listen(process.env.PORT || parseInt(port, 10));

console.log(nodeDesc + " running on " + os.hostname() + " at port " + port);
console.log("Use " + nodeURL.slice(0, nodeURL.length-1) + "\nCTRL + C to shutdown");

// interval_example(); // Turn this on to look see the session leak.

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthRedirect(req, res, next) { // Use this for routes called by the browser.
  if (req.isAuthenticated()) { return next(); }
  setTimeout(listSessions,1000); // Print sessions in one sec.
  res.redirect('/#welcome')
}

function ensureAuth401(req, res, next) {  // Use this for routes consumed by XHR.
  if (req.isAuthenticated()) { return next(); }
  setTimeout(listSessions,1000); // Print sessions in one sec.
  res.send(401);
}

// interval example - 5x output every 2secs using setInterval
function interval_example() {
  var start_time = new Date();
  console.log("\nStarting 30 second interval, stopping after 25 times.");
  var count = 1;
  var interval = setInterval(function() {
    if (count == 25) clearInterval(this);
    var end_time = new Date();
    var difference = end_time.getTime() - start_time.getTime();
    console.log("Tick no. " + count + " after " + Math.round(difference/1000) + " seconds");
    count++;

    listSessions();
    
  }, 30000);
}

// Log the current sessions. Called periodically by interval_example
function listSessions() {

  sessionStore.all(function(n, s) {
    for (var i = 0, c = 0; i < s.length; i++) {
      var result = JSON.parse(s[i]);
      if (result.passport.user !== undefined) {
        c++;
        console.log("["+i+"] "+result.passport.user.email);
      }
      // console.log(typeof result);
      // sessionStore.destroy(s[i], function(){console.log("Destroying:", i)});
    }
    console.log(i + " Sessions, " + c + " Users.");
  });
}

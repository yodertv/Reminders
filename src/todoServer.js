// TodoServer.js 2.1
//
'use strict';

/*
    https = require("https");
    path = require("path");
    fs = require("fs");
    sys  = require('sys');
*/

var os = require("os");
var url = require("url");
var http = require("http");
var nStatic = require('node-static');
var mongojs = require("mongojs");
var express = require("express");

// dbUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", 
// E.g. "username:password@example.com/mydb"

// This list should be baked by build depending on the environment.

var dblist = {//'test-todo' : 'yodertv:sugmag@ds045907.mongolab.com:45907/test-todo',
              'test-todo' : 'localhost:27017/test-todo',
              'todo_new_test' : 'localhost:27017/todo_new_test',
              'bobstodos' : 'yodertv:sugmag@ds049467.mongolab.com:49467/bobstodos',
              'frankstodos' : 'yodertv:sugmag@ds047057.mongolab.com:47057/frankstodos',
              'yodertvtodo' : 'yodertv:sugmag@ds043047.mongolab.com:43047/yodertvtodo'}

var dbs = []; // Array of connections

var nodeURL = "@NODEURL@";
//var port = process.argv[2] || 80;

var match = nodeURL.search('[0-9]{4}/$');
var port = match && nodeURL.slice(match, nodeURL.length-1) || 80;

var restUrl = "/api/1/databases/";
var restHost = "api.mongolab.com";
// var restPort = 443;
var DBKey = "50a2a0e3e4b0cd0bfc12435d";

var reObjectify = function (key, value) {

  if ( key == "_id") {
    return mongojs.ObjectId(value);
  }
  return value;
}

var app = express();
// configure Express
app.use(express.logger());
app.use(express.cookieParser());
// app.use(express.session({ secret: DBKey }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.static(__dirname + '/static'));

//http.createServer(/* httpsOptions, */ function(req, response) {

app.get('/history', function(req, res)
{ // Redirect history route. Allows reload and sharing of history URL.
    console.log("Redirect /history.")
    res.writeHead(302, { 'location' : '/#history' });
    res.end();
});

app.get('/list/todo*', function(req, res)
{ // Redirect list url to list route. Allows reload and sharing of history URL.
    var reqUrl = url.parse(req.url, true); // true parses the query string.
    var uri = reqUrl.pathname;
    var collectionName = uri.slice(uri.lastIndexOf('/') + 1);
    res.writeHead(302, { 'location' : "/#list/" + collectionName });
    res.end();
});

app.all('/api/1/databases/*', function(req, response) {
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  // var fileServer = new nStatic.Server('./static');
  // var fileServer = new nStatic.Server();
  
  // console.log(req.connection.remoteAddress + ": " + req.method + " " + req.url);
  
  // console.log(reqUrl);

  /*
  { 'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'} };
  */

/* Moved to app.get()
  if (uri == '/history') { // Redirect history route. Allows reload and sharing of history URL.
    console.log("Redirect /history.")
    response.writeHead(302, { 'location' : '/#history' });
    response.end();
  }
  if (uri.indexOf('/list/') == 0) {
    console.log("Redirect ", uri);
    var collectionName = uri.slice(uri.lastIndexOf('/') + 1);
    response.writeHead(302, { 'location' : "/#list/" + collectionName });
    response.end();
    return;
  }
*/

  
  if (uri.indexOf(restUrl) == 0) { // /api/1/databases/

    var dbPart = uri.slice(restUrl.length); // Remove /api/1/databases/
    var dbName = dbPart.slice(0,dbPart.indexOf('/'));
    var match = dbPart.search("[A-Fa-f0-9]{24}$"); // Object ID in URI
    var objID = "";

    if (match>0) {
      objID = dbPart.slice(match);
      dbPart = dbPart.slice(0, match-1); // Remove /objID 
      // console.log("match =", match, "\n objID =", objID);
    }

    var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
    var dbUrl = dblist[dbName];

    /* 
    console.log("\nuri =", uri,
      "\ndbPart =", dbPart, 
      "\ndbName =", dbName,
      "\ncollectionName =", collectionName,
      "\nobjID = ", objID,
      "\ndbUrl =", dbUrl
    );
    */

    if (dbs[dbName] == undefined) {
      dbs[dbName] = new mongojs(dbUrl);
    }

    // var db = mongojs(dbUrl, [collectionName]);

    dbs[dbName].on('error',function(err) {
      console.log('database error', err);
      throw err;
    });
    
    /* Todo: Learn how to add collections.
    if (dbs[dbName][collectionName] == undefined) {
      dbs[dbName].Collection(collectionName);
    }
    */

    if (objID) {  // Basic object REST. GET, PUT, DELETE

      switch (req.method) {

        case 'GET':  // don't believe we use this path
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
              // console.log("GET doc:\n" +  JSON.stringify(doc));
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
    } // End if (ObjID)
    else if (req.method == 'GET') {
      if(collectionName == '') { // Get the collection names
        // No collection name in URI
        // Form of request: http://127.0.0.1/api/1/databases/test-todo/collections/
        // Get archiveList 

        // console.log('GET COLLECTION NAMES: ', uri);

        dbs[dbName].getCollectionNames( function( err, myColls ){
          if (err != null) {
              var errString = err.toString();
              console.log("DB_GETCOLLECTIONNAMES_ERR:", errString);
              response.writeHead(500, "DB_GETCOLLECTIONNAME_ERR", {'Content-Type': 'text/html'});
              response.end(errString);
          }
          else {
            // console.log("GET COLLECTIONS:\n", myColls);
            response.writeHead(200, "OK", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myColls))
            response.end();
          }
        })
      }
      else {
        // console.log('GET DOCS:', uri);

        // Get all documents from a specified collection
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo
        // Where todo* is the collection name.
        
        dbs[dbName].collection(collectionName).find( function( err, myDocs ){
          if (err != null) {
            console.log("DB_FIND_ERR:", err);
          }
          else {
            // console.log("GET DOCS:\n", myDocs);
            response.writeHead(200, "OK-FIND", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myDocs));
            // response.write(myDocs);
            response.end();
          }
          // db.close();
        });
      }
    } // End 'GET'
    else if (req.method == 'POST') {     // Insert a new doc into collectionName
      // console.log('POST NEW DOC:', uri);
      // Insert and new doc into collection.

      var fullBody = '';
      req.on('data', function(chunk) {

        fullBody += chunk.toString();
        // console.log("Received body data : ");
        // console.log(chunk.toString());
      });
      req.on('end', function() {
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
    }
    else if (req.method == 'PUT') {
      // console.log('PUT NEW COLLECTION:', uri);

      // Drop existing documents and replace with
      // Insert of the entire array into collection.
      // Makes a new collection if it doesn't exist.

      var fullBody = '';
      req.on('data', function(chunk) {

        fullBody += chunk.toString();
        // console.log("Received body data : ");
        // console.log(chunk.toString());
      });
      req.on('end', function() {
        // console.log("PUT Collection Received : ", fullBody);
        // Replace the document specified by id
        // Form of URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todoThu-Jan-29-2015/
        // Where todo* is the collection name.
        dbs[dbName].collection(collectionName).drop();
        dbs[dbName].collection(collectionName).insert( JSON.parse(fullBody, reObjectify), function(err, doc) {
          if (err != null) {
            var errString = err.toString();
            console.log("DB_INSERT_ERR:", errString);
            response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
            response.end(errString);
          }
          else { 
            // console.log("docs:\n" +  JSON.stringify(doc));
            response.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(doc));
            response.end();
          }
        });
      });
    }
  }
  else if (req.method == 'DELETE') { // Delete archived collection using mongojs.
    
    // Form of request: http://127.0.0.1/todoSat-Apr-06-2013/?mongoDB=test-todo
      
    var dbName = reqUrl.query['mongoDB'];
    // var dbUrl = dblist[dbName];

    // var dbUrl = dblist[reqUrl.query['mongoDB']];
    var collectionName = uri.substr(1, uri.length-2); // Get collection name from URI
    // console.log("dbUrl=", dbUrl, "collectionName=", collectionName);

    // var db = mongojs(dbUrl, [collectionName]);
    
    dbs[dbName].collection(collectionName).drop( function(err) {
      if (err != null) {
        var errString = err.toString();
        console.log("DB_DROP_COLLECTION_ERR:", errString);
        response.writeHead(500, "DB_DROP_COLLECTION_ERR", {'Content-Type': 'text/html'});
        response.end(errString);
      }
      else { // Send a success response.
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end();        
      }
    });
  }
  else {  // default static file server for html and script files in the ./static folder.
    console.log("Unexpected request: " + req.connection.remoteAddress + ": " + req.method + " " + req.url);
    response.redirect('/');

    // used to handle files here. Replaced by express static.
    //fileServer.serve(req, response);
  }
});

//}).listen(parseInt(port, 10));

http.createServer(app).listen(parseInt(port, 10));

console.log("Todo Server running on " + os.hostname() + " at port " + port);
console.log("Use " + nodeURL.slice(0, nodeURL.length-1) + "\nCTRL + C to shutdown");

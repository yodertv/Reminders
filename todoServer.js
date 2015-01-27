// TodoServer.js 2.1
//
'use strict';

var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    os = require("os"),
    sys  = require('sys'),
    nStatic = require('node-static'),
    mongojs = require("mongojs");

    // dbUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", 
    // E.g. "username:password@example.com/mydb"

// This list should be baked by build depending on the environment.

var dblist = {//'test-todo' : 'yodertv:sugmag@ds045907.mongolab.com:45907/test-todo',
              'test-todo' : 'localhost:27017/test-todo',
              'bobstodos' : 'yodertv:sugmag@ds049467.mongolab.com:49467/bobstodos',
              'frankstodos' : 'yodertv:sugmag@ds047057.mongolab.com:47057/frankstodos',
              'yodertvtodo' : 'yodertv:sugmag@ds043047.mongolab.com:43047/yodertvtodo'}

var port = process.argv[2] || 80,
    restUrl = "/api/1/databases/",
    restHost = "api.mongolab.com",
    restPort = 443,
    DBKey = "50a2a0e3e4b0cd0bfc12435d";
 
http.createServer(/* httpsOptions, */ function(req, response) {
  var reqUrl = url.parse(req.url, true); // true parses the query string.
  var uri = reqUrl.pathname;
  var fileServer = new nStatic.Server();
  
  console.log(req.connection.remoteAddress + ": " + req.method + " " + req.url);
  
  // console.log(reqUrl);

  /*
  { 'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'} };
  */

  if (uri == '/history') { // Handle the reloading of the history route. Still doesn't solve the reloading.
    response.writeHead(302, { 'location' : '/index.html' });
    response.end();
  }
  else if (uri.indexOf(restUrl) == 0) { // /api/1/databases/

    var dbPart = uri.slice(restUrl.length); // Remove /api/1/databases/
    var dbName = dbPart.slice(0,dbPart.indexOf('/'));
    var match = dbPart.search("[A-Fa-f0-9]{24}$"); // Object ID in URI
    var objID = "";


    if (match>0) {
      objID = dbPart.slice(match);
      dbPart = dbPart.slice(0, match-1); // Remove /objID 
      console.log("match =", match, "\n objID =", objID);
    }

    var collectionName = dbPart.slice(dbPart.lastIndexOf('/') + 1);
    var dbUrl = dblist[dbName];
    var db = mongojs(dbUrl, [collectionName]);
    /*
    req.on('end', function() {
      // Is this supposed to be the catch-all?
      // empty 200 OK response for now
      console.log("In req.on(\'end\')");
      response.writeHead(200, "OK via on end", {'Content-Type': 'text/html'});
      response.end();
    });
    */
    console.log("\nuri =", uri,
      "\ndbPart =", dbPart, 
      "\ndbName =", dbName,
      "\ncollectionName =", collectionName,
      "\nobjID = ", objID,
      "\ndbUrl =", dbUrl
    );

    if (req.method == 'GET') { // Query DB with mongolab style REST API
      if(collectionName == '') {
        // No collection name in URI
        // Form of request: http://127.0.0.1/api/1/databases/test-todo/collections/
        // Get archiveList 

        console.log('GET COLLECTION NAMES: ', uri);


        db.getCollectionNames( function( err, myColls ){
          if (err != null) {
            console.log("DB_GETCOLLECTIONNAMES_ERR:", err);
          }
          else {
            // console.log("myDocs:\n" +  JSON.stringify(myDocs));
            response.writeHead(200, "OK", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myColls))
            response.end();
          }
          db.close();
        })
      }
      else if (uri.search("/collections/todo*$")) {
        // Get all documents from a specified collection
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo
        // Where todo* is the collection name.

        console.log('GET DOCUMENTS FROM COLLECTION: ', uri);
        
        db[collectionName].find( function( err, myDocs ){
          if (err != null) {
            console.log("DB_FIND_ERR:", err);
          }
          else {
            console.log("myDocs:\n" +  JSON.stringify(myDocs));
            response.writeHead(200, "OK-FIND", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myDocs));
            response.end();
          }
          db.close();
        })

//        response.writeHead(200, "OK for todo", {'Content-Type': 'text/html'});
  //      response.end();
      }
      else if (objID) {
      
        // Get a single document by specific id
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
        // Where todo* is the collection name.
        // find a document using a native ObjectId
      
        db[collectionName].findOne({
          _id:mongojs.ObjectId(objID)
        }, function(err, doc) {
          if (err != null) {
            console.log("DB_FINDONE_ERR:", err);
          }
          else { 
            // doc._id.toString() === '523209c4561c640000000001'
            console.log("doc:\n" +  JSON.stringify(doc));
            response.writeHead(200, "OK-FINDONE", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(doc));
            response.end();
          }
        });
      }
    }

    else if (req.method == 'PUT') {
      
      console.log('PUT : ', uri);
      // Save/replace todos here
      var fullBody = '';
      //var doc2Update = undefined;

      req.on('data', function(chunk) {

        fullBody += chunk.toString();

        // console.log("Received body data : ");
        // console.log(chunk.toString());
      });
      
      req.on('end', function() {
        console.log("Received : ", fullBody);

        if (objID) {
        
          // Replace the document specified by id
          // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
          // Where todo* is the collection name.
        
          db[collectionName].update({
            _id:mongojs.ObjectId(objID)
          }, JSON.parse(fullBody), function(err, doc) {
            if (err != null) {
              console.log("DB_UPDATE_ERR:", err);
              response.writeHead(405, "Method not supported without object ID.", {'Content-Type': 'text/html'});
              response.end('<html><head><title>405 - Method not supported without Object ID.</title></head><body><h1>Method not supported without object ID.</h1></body></html>');
            }
            else { 
              // doc._id.toString() === '523209c4561c640000000001'
              console.log("doc:\n" +  JSON.stringify(doc));
              response.writeHead(200, "OK-PUT", {'Content-Type': 'text/html'});
              response.write(JSON.stringify(doc));
              response.end();
            }
          });
        } else { 
          console.log("[405] " + req.method + " to " + req.url);
          response.writeHead(405, "Method not supported without object ID.", {'Content-Type': 'text/html'});
          response.end('<html><head><title>405 - Method not supported without Object ID.</title></head><body><h1>Method not supported.</h1></body></html>');
        }
      }); 
    }
  }
  else if (req.method == 'DELETE') { // Delete archived collection using mongojs.
    
    // Form of request: http://127.0.0.1/todoSat-Apr-06-2013/?mongoDB=test-todo
      
    var dbUrl = dblist[reqUrl.query['mongoDB']];
    var collectionName = uri.substr(1, uri.length-2); // Get collection name from URI
    console.log("dbUrl=", dbUrl, "collectionName=", collectionName);

    var db = mongojs(dbUrl, [collectionName]);
    
    // var toDelete = db.collection(name);
   
    //toDelete.drop(); 
    db[collectionName].drop( function(err) {
      if (err != null) {
        console.log("DB_DROP_ERR:", err);
        // Should write an error response here
      }
      else { // Send a success response.
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end();        
      }
    });
  }
  else {  // default static file server for html and script files.
    fileServer.serve(req, response);
  }
}).listen(parseInt(port, 10));
console.log("todo Server running at http://" + os.hostname() + ":" + port + "/\nCTRL + C to shutdown");

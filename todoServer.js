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
              'todo_new_test' : 'localhost:27017/todo_new_test',
              'bobstodos' : 'yodertv:sugmag@ds049467.mongolab.com:49467/bobstodos',
              'frankstodos' : 'yodertv:sugmag@ds047057.mongolab.com:47057/frankstodos',
              'yodertvtodo' : 'yodertv:sugmag@ds043047.mongolab.com:43047/yodertvtodo'}

var port = process.argv[2] || 80,
    restUrl = "/api/1/databases/",
    restHost = "api.mongolab.com",
    restPort = 443,
    DBKey = "50a2a0e3e4b0cd0bfc12435d";

var reObjectify = function (key, value) {

  if ( key == "_id") {
    return mongojs.ObjectId(value);
  }
  return value;
}

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
/*
  if (uri == '/history') { // Handle the reloading of the history route. Still doesn't solve the reloading.
    response.writeHead(302, { 'location' : '/index.html' });
    response.end();
  }
  else 
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

    console.log("\nuri =", uri,
      "\ndbPart =", dbPart, 
      "\ndbName =", dbName,
      "\ncollectionName =", collectionName,
      "\nobjID = ", objID,
      "\ndbUrl =", dbUrl
    );


    var db = mongojs(dbUrl, [collectionName]);

    db.on('error',function(err) {
      console.log('database error', err);
    });

    
    /*
    req.on('end', function() {
      // Is this supposed to be the catch-all?
      // empty 200 OK response for now
      console.log("In req.on(\'end\')");
      response.writeHead(200, "OK via on end", {'Content-Type': 'text/html'});
      response.end();
    });
    */
    
    
    if (objID) {  // Basic object REST. GET, PUT, DELETE

      switch (req.method) {

        case 'GET':  // don't believe we use this path
          // Get a single document by specific id
          // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
          // Where todo* is the collection name.
          // find a document using a native ObjectId
        
          db[collectionName].findOne({
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
          console.log('UPDATE DOC: ', uri);
          // Save/replace todos here
          var fullBody = '';
          req.on('data', function(chunk) {

            fullBody += chunk.toString();
            // console.log("Received body data : ");
            // console.log(chunk.toString());
          });
          req.on('end', function() {
            console.log("PUT Received : ", fullBody);
            // Replace the document specified by id
            // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo/54bbaee8e4b08851f12dfbf5
            // Where todo* is the collection name.
          
            db[collectionName].update({
              _id:mongojs.ObjectId(objID)
            }, JSON.parse(fullBody), { upsert: true }, function(err, doc) {
              if (err != null) {
                var errString = err.toString();
                console.log("DB_UPDATE_ERR:", errString);
                response.writeHead(500, "DB_UPDATE_ERR", {'Content-Type': 'text/html'});
                response.end(errString);
              }
              else { 
                // doc._id.toString() === '523209c4561c640000000001'
                console.log("Updated doc:\n" +  JSON.stringify(doc));
                response.writeHead(200, "OK-PUT", {'Content-Type': 'text/html'});
                response.write(JSON.stringify(doc));
                response.end();
              }
            });
          });   
        break;
/*
        case 'POST': // I don't think this ever happens.
          console.log('POST DOC: ', uri);
          // From 127.0.0.1: POST /api/1/databases/test-todo/collections/todo
          // URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todo
          // Insert new todo here
          var fullBody = '';
          req.on('data', function(chunk) {  // Read uploaded data

            fullBody += chunk.toString();
            // console.log("Received body data : ");
            // console.log(chunk.toString());
          });
          req.on('end', function() {
            console.log("POST Received : ", fullBody);
          
            db[collectionName].insert( JSON.parse(fullBody), function(err, doc) {
              if (err != null) {
                var errString = err.toString();
                console.log("DB_INSERT_ERR:", errString);
                response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
                response.end(errString);
              }
              else { 
                console.log("Inserted doc:\n" +  JSON.stringify(doc));
                response.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
                response.write(JSON.stringify(doc));
                response.end();
              }
            });   
          });
        break;
*/          
        case 'DELETE':              
          // Delete object
          db[collectionName].remove({
            _id:mongojs.ObjectId(objID)
          }, true, function(err, doc) {
            if (err != null) {
              var errString = err.toString();
              console.log("DB_DELETE_ERR:", errString);
              response.writeHead(500, "DB_DELET_ERR", {'Content-Type': 'text/html'});
              response.end(errString);
            }
            else { 
              // doc._id.toString() === '523209c4561c640000000001'
              console.log("Deleted : " +  objID);
              response.writeHead(200, "OK-DELETE", {'Content-Type': 'text/html'});
              response.write(JSON.stringify(doc));
              response.end();
              db.close();
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

        console.log('GET COLLECTION NAMES: ', uri);

        db.getCollectionNames( function( err, myColls ){
          if (err != null) {
              var errString = err.toString();
              console.log("DB_GETCOLLECTIONNAMES_ERR:", errString);
              response.writeHead(500, "DB_GETCOLLECTIONNAME_ERR", {'Content-Type': 'text/html'});
              response.end(errString);
          }
          else {
            console.log("GET COLLECTIONS:\n", myColls);
            response.writeHead(200, "OK", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myColls))
            response.end();
          }
          db.close();
        })
      }
      else {
        console.log('GET DOCS:', uri);

        // Get all documents from a specified collection
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo
        // Where todo* is the collection name.
        
        db[collectionName].find( function( err, myDocs ){
          if (err != null) {
            console.log("DB_FIND_ERR:", err);
          }
          else {
            console.log("GET DOCS:\n", myDocs);
            response.writeHead(200, "OK-FIND", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myDocs));
            // response.write(myDocs);
            response.end();
          }
          db.close();
        });
      }
    } // End 'GET'
    else if (req.method == 'POST') {     // Insert a new doc into collectionName
      console.log('POST NEW DOC:', uri);

      // Insert and new doc into collection.

      var fullBody = '';
      req.on('data', function(chunk) {

        fullBody += chunk.toString();
        // console.log("Received body data : ");
        // console.log(chunk.toString());
      });
      req.on('end', function() {
        console.log("POST NEW DOC Received : ", fullBody);
        // Replace the document specified by id
        // Form of URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todoThu-Jan-29-2015/
        // Where todo* is the collection name.
      
        db[collectionName].insert( JSON.parse(fullBody), function(err, doc) {
          if (err != null) {
            var errString = err.toString();
            console.log("DB_INSERT_ERR:", errString);
            response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
            response.end(errString);
          }
          else { 
            console.log("Inserted doc:\n", doc);
            response.writeHead(200, "OK-INSERT", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(doc));
            response.end();
          }
        });
      });   
    }
    else if (req.method == 'PUT') {
      console.log('PUT NEW COLLECTION:', uri);

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
        console.log("PUT Collection Received : ", fullBody);
        // Replace the document specified by id
        // Form of URL: http://127.0.0.1:8080/api/1/databases/test-todo/collections/todoThu-Jan-29-2015/
        // Where todo* is the collection name.
        db[collectionName].drop();
        db[collectionName].insert( JSON.parse(fullBody, reObjectify), function(err, doc) {
          if (err != null) {
            var errString = err.toString();
            console.log("DB_INSERT_ERR:", errString);
            response.writeHead(500, "DB_INSERT_ERR", {'Content-Type': 'text/html'});
            response.end(errString);
          }
          else { 
            console.log("docs:\n" +  JSON.stringify(doc));
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
    // console.log('fileServer :', uri);
    fileServer.serve(req, response);
  }
}).listen(parseInt(port, 10));
console.log("todo Server running at http://" + os.hostname() + ":" + port + "/\nCTRL + C to shutdown");


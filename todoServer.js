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
  var reqUrl = url.parse(req.url, true), // true parses the query string.
      uri = reqUrl.pathname,
      fileServer = new nStatic.Server();
  
  /* Used by proxy rest API version 
  function respHandler(res) {
    if (res.statusCode == 302) { // redirected by who?
      var u = url.parse(res.headers.location);
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      console.log(u);
    }
    proxy.on('error', function(e) {
        console.log("Error:", e);
    });
    res.on('data', function(chunk) {
      // sys.log(chunk);
      response.write(chunk, 'binary');
    });
    res.on('end', function() {
      // sys.log("End");
      response.end();
    });
    response.writeHead(res.statusCode, res.headers);
  }
  */

  console.log(req.connection.remoteAddress + ": " + req.method + " " + req.url);
  
  // console.log(reqUrl);

  /* This is proxy version ("/api/1/databases")
  if (uri.indexOf(restUrl) >= 0) { // Proxy API calls to Mongolab's REST API
    var options = {
      hostname: restHost,
      port: reqUrl.port || restPort,
      path: req.url + '/?apiKey=' + DBKey,
      method: req.method,
      //"Content-Type": req.Content-Type
      rejectUnauthorized: false,
      headers: req.headers
    };
    
    var proxy = https.request( options, respHandler);

    req.on('data', function(chunk) {
      proxy.write(chunk, 'binary');
    });
    req.on('end', function() {
      // sys.log('Proxy end')
      proxy.end();
    });
  } 
  */

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
  if (uri.indexOf(restUrl) >= 0) { // /api/1/databases
    if (req.method == 'GET') { // Query DB with mongolab style REST API

      //var dbUrl = dblist[reqUrl.query['mongoDB']];
      var dbUrl = dblist["test-todo"]
      var name = "test-todo";
      console.log("dbUrl=", dbUrl, "name=", name);

      if(uri.search("collections/$")) {
        // Form of request: http://127.0.0.1/api/1/databases/test-todo/collections/
        // Get archiveList 

        var db = mongojs(dbUrl, [name]);
        db.getCollectionNames( function( err, myDocs ){
          if (err != null) {
            console.log("DB_GETCOLLECTIONNAMES_ERR:", err);
          }
          else {
            // console.log("myDocs:\n" +  JSON.stringify(myDocs));
            response.writeHead(200, "OK", {'Content-Type': 'text/html'});
            response.write(JSON.stringify(myDocs))
            response.end();
          }
          db.close();
        })
      }
      else if (uri.search("collections/todo*$")) {
        console.log('GET : ', uri);
        response.writeHead(200, "OK for todo", {'Content-Type': 'text/html'});
        response.end();
        // Get documents from a specific collection 
        // Form of URL: http://127.0.0.1/api/1/databases/test-todo/collections/todo
        // Where todo is the collection name.
      }
    }

    else if (req.method == 'POST') {
        console.log('POST : ', uri);
      // Save/replace todos here
    }
    else if (req.method == 'DELETE') { // Delete archived collection using mongojs.
      
      // Form of request: http://127.0.0.1/todoSat-Apr-06-2013/?mongoDB=test-todo

      // dbUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", 
      // E.g. "username:password@example.com/mydb"
      
      //var dbUrl = dblist['bobstodos'];
      
      var dbUrl = dblist[reqUrl.query['mongoDB']];
      var name = uri.substr(1, uri.length-2); // Get collection name from URI
      console.log("dbUrl=", dbUrl, "name=", name);

      var db = mongojs(dbUrl, [name]);
      
      // var toDelete = db.collection(name);
     
      //toDelete.drop(); 
      db[name].drop( function(err) {
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
    req.on('end', function() {
      // Is this supposed to be the catch-all?
      // empty 200 OK response for now
      console.log("In req.on(\'end\')");
      response.writeHead(200, "OK", {'Content-Type': 'text/html'});
      response.end();
    });
  }
  else {  // default static file server for html and script files.
    fileServer.serve(req, response);
  }
}).listen(parseInt(port, 10));
console.log("todo Server running at http://" + os.hostname() + ":" + port + "/\nCTRL + C to shutdown");

// TodoServer.js 2.0
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

var port = process.argv[2] || 80,
    restUrl = "/api/1/databases/",
    restHost = "api.mongolab.com",
    restPort = 443,
    DBKey = "50a2a0e3e4b0cd0bfc12435d",
    dbUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", // "username:password@example.com/mydb"
    db = mongojs.connect(dbUrl);

http.createServer(/* httpsOptions, */ function(req, response) {
  var reqUrl = url.parse(req.url),
      uri = reqUrl.pathname,
      fileServer = new nStatic.Server();
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
  
  console.log(req.connection.remoteAddress + ": " + req.method + " " + req.url);
  // console.log(reqUrl);
  if (uri.indexOf(restUrl) >= 0) { // Proxy API calls to Mongolab
    var options = {
      hostname: restHost,
      port: reqUrl.port || restPort,
      path: req.url + '/?apiKey=' + DBKey,
      method: req.method,
      //"Content-Type": req.Content-Type

      headers: req.headers,
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
  else if (req.method == 'DELETE') { // Delete archive collection using mongojs.
    var name = uri.substr(1, uri.length);
    var toDelete = db.collection(name);
    toDelete.drop(); 
    req.on('end', function() {
      // empty 200 OK response for now
      response.writeHead(200, "OK", {'Content-Type': 'text/html'});
      response.end();
    });
    // console.log(req.method +" to " + name);
  } 
  else {  // default static file server for html and script files.
    fileServer.serve(req, response);
  }
}).listen(parseInt(port, 10));
console.log("todo Server running at https://" + os.hostname() + ":" + port + "/\nCTRL + C to shutdown");
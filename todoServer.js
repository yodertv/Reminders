// TodoServer.js 2.0
'use strict';

var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    os = require("os"),
    sys  = require('sys'),
    // crypto = require('crypto'),
    mongojs = require("mongojs");

var port = process.argv[2] || 8000,
    restUrl = "/api/1/databases/",
    restHost = "api.mongolab.com",
    restPort = 443,
    dbUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", // "username:password@example.com/mydb"
    db = mongojs.connect(dbUrl);

// var privateKey = fs.readFileSync('privatekey.pem').toString();
// var certificate = fs.readFileSync('certificate.pem').toString();

/*
var httpsOptions = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
}
*/

// console.log(httpsOptions);

http.createServer(/* httpsOptions, */ function(req, response) {
  var reqUrl = url.parse(req.url),
      uri = reqUrl.pathname;

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
      path: req.url,
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
    console.log(req.method +" to " + name);
  } 
  else {  // default static file server for html and script files.
    var filename = path.join(process.cwd(), uri);      
    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
      }
      if (fs.statSync(filename).isDirectory()) filename += '/index.html';
      fs.readFile(filename, "binary", function(err, file) {
        if(err) {        
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }
        response.writeHead(200);
        response.write(file, "binary");
        response.end();
      });
    });
  }
}).listen(parseInt(port, 10));
console.log("todo Server running at https://" + os.hostname() + ":" + port + "/\nCTRL + C to shutdown");
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 443;

// from MongoApp.js
var databaseUrl = "yodertv:sugmag@ds045907.mongolab.com:45907/test-todo", // "username:password@example.com/mydb"
    // collections = ["todo"],
    // collections = [],
    mongojs = require("mongojs"),
    db = mongojs.connect(databaseUrl);

// console.log(db);

http.createServer(function(req, response) {

  var urlObj = url.parse(req.url);
  var uri = urlObj.pathname;
  var filename = path.join(process.cwd(), uri);

 switch(req.method) {
    case 'DELETE':

      var name = uri.substr(1, uri.length);
      var toDelete = db.collection(name);
/*
      // example of get all documents from the collection.
      toDelete.find({}, function(err, todos) {
        console.log('find() returned.')
        if( err || !todos ) console.log("No todos found", "err=", err);
        else todos.forEach( function(each) {
          console.log(each);
        } );
      });
*/
      toDelete.drop();

      req.on('end', function() {
        // empty 200 OK response for now
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end();
      });
      
      console.log(req.method +" to " + name);
      
      break;

      default: // Static file server

      //    console.log(urlObj);
      
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

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
Todos Bug List
==============

##Open Bugs -- Next: (Bug#34)

###(Bug#33) Menu fails on iPhone in Todos. Works for on iPhone for html-todos.

###(Bug#32) No handling of XHR auth failures.
- intercepter code from html-todos causes angular modulerr:
http://errors.angularjs.org/1.3.9/$injector/modulerr?p0=todo&p1=Error%3A%20…20d%20(http%3A%2F%2Fkats-air.local%3A8080%2Fjs%2Fangular.min.js%3A17%3A350
```
Failed to instantiate module TodoServices due to:
TypeError: Cannot read property 'push' of undefined
    at http://kats-air.local:8080/TodoServices.js:111:37
    at Object.e [as invoke] (http://kats-air.local:8080/js/angular.min.js:37:96)
    at d (http://kats-air.local:8080/js/angular.min.js:35:301)
    at http://kats-air.local:8080/js/angular.min.js:35:425
    at s (http://kats-air.local:8080/js/angular.min.js:7:302)
    at g (http://kats-air.local:8080/js/angular.min.js:35:202)
    at http://kats-air.local:8080/js/angular.min.js:35:371
    at s (http://kats-air.local:8080/js/angular.min.js:7:302)
    at g (http://kats-air.local:8080/js/angular.min.js:35:202)
    at Ob (http://kats-air.local:8080/js/angular.min.js:38:435
```

###(Bug#27) Server silently sends the client crap when not able to connect to db.

##Closed Bugs
### (Bug#31) Deep linking fails for lists.
```
Cannot GET /list/:todoFri-Dec-18-2015.
Cannot GET /todo
Cannot GET /authfailed
```
### (Bug#30) GET /account sends password to client.

### (Bug#29) Unexpected concatenation of routes...
```
http://localhost:8080/welcome#%2Ftodo
```
### (Bug#28) dbName undefined.
```
Wed, 16 Dec 2015 02:00:18 GMT [::1]POST /auth/local 302 46 3 ms
Opening DB bobstodos via DB_FIND
TypeError: Cannot read property '_dbname' of undefined
    at new Database (/usr/local/lib/node_modules/mongojs/lib/database.js:25:38)
    at new module.exports (/usr/local/lib/node_modules/mongojs/index.js:6:12)
    at /Users/mike/src/Todos/build/todoServer.js:253:19
    at callbacks (/usr/local/lib/node_modules/express/lib/router/index.js:161:37)
    at multipart (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/multipart.js:64:37)
    at /usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/bodyParser.js:57:9
    at urlencoded (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/urlencoded.js:51:37)
    at /usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/bodyParser.js:55:7
    at json (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/json.js:53:37)
    at bodyParser (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/bodyParser.js:53:5)
Wed, 16 Dec 2015 02:00:18 GMT [::1]GET /api/todos/todo 500 979 4 ms
Opening DB bobstodos via DB_GETCOLLECTIONNAMES
Wed, 16 Dec 2015 02:00:19 GMT [::1]GET /api/todos/ 200 - 682 ms
Wed, 16 Dec 2015 02:00:26 GMT [::1]GET /api/todos/todo 200 - 26 ms
Wed, 16 Dec 2015 02:00:26 GMT [::1]GET /api/todos/ 200 - 33 ms
```
###(Bug#26) Opening via get collections failed because of undefined dbUrl variable.

###(Bug#25) Lable/button for the todos list doesn't include the year when it is different from current year.

###(Bug#24) Invalid date on occasion when navigaing the history.
Likey be a race condition. Not consistantly repeatable.

###(Bug#21) Wake from sleep issue.
When the todoServer host has been asleep for sometime the DB connection to Mongolab are broken and this failure below occurs. It seems to clear up on the 2nd try.
```
DB_FIND_ERR: [Error: failed to connect to [ds043047-a.mongolab.com:43047]]
DB_GETCOLLECTIONNAMES_ERR: Error: failed to connect to [ds043047-a.mongolab.com:43047]
Tue, 07 Apr 2015 11:45:33 GMT [::ffff:192.168.0.11]GET /api/1/databases/yodertvtodo/collections/ 500 - 36553 ms
```
###(Bug#17) Server crashes when on localnet with multiple clients:
```
database error [Error: connection closed]
	192.168.0.2: PUT /api/1/databases/test-todo/collections/todo database error [Error: connection closed]
    /usr/local/lib/node_modules/mongojs/node_modules/mongodb/lib/mongodb/mongo_client.js:409
	          throw err
	                ^
	Error: connection closed
	    at null.<anonymous> (/usr/local/lib/node_modules/mongojs/node_modules/mongodb/lib/mongodb/connection/server.js:601:24)
	    at emit (events.js:92:17)
	    at null.<anonymous> (/usr/local/lib/node_modules/mongojs/node_modules/mongodb/lib/mongodb/connection/connection_pool.js:165:15)
	    at emit (events.js:98:17)
	    at Socket.<anonymous> (/usr/local/lib/node_modules/mongojs/node_modules/mongodb/lib/mongodb/connection/connection.js:549:12)
	    at Socket.emit (events.js:95:17)
	    at TCP.close (net.js:465:12)
	kitchen-mac:Todos kat$
```
###(Bug#12) Connection Failure no handled.
Connection to the DB doesn't have a fail check and crashes the server when things aren't right.

###(Bug#6) Invalid date on history page in IE9.

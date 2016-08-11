Todos Bug List
==============

##Open Bugs -- Next: (Bug#37)

###(Bug#36) -- On 8/6/16 Erik failed to login using Google Auth

###(Bug#35) Todo server doesn't handle timeout when.
Condition is after being idle over night.
```
Fri, 15 Jan 2016 10:49:19 GMT [yodercode@gmail.com@::ffff:192.168.0.5]POST /auth/local 302 56 1 ms
DB_FIND_ERR: { [MongoError: server ds045907-a.mongolab.com:45907 received an error {"name":"MongoError","message":"read ETIMEDOUT"}]
  name: 'MongoError',
  message: 'server ds045907-a.mongolab.com:45907 received an error {"name":"MongoError","message":"read ETIMEDOUT"}' }
DB_GETCOLLECTIONNAMES_ERR: MongoError: server ds045907-a.mongolab.com:45907 received an error {"name":"MongoError","message":"read ETIMEDOUT"}
```

###(Bug#27) Server silently sends the client crap when not able to connect to db.

##Closed Bugs

###(Bug#34) Modulus deployment works for yodercode, but not for yoderm01 users. Main differnece is the size number of collections in yoderm01 and their entries in the userList. Thee latter was the problem.
Closed 12.26.2015

###(Bug#33) Menu fails on iPhone Safari in Todos. 
Works for on iPhone for html-todos.
Need to run safari under the iOS simulator and test there.
Also fails on nook. Will try hashtag in menu hrefs. That's what html-todos has. Didn't work.
Next I'll check the bootstrap version. Those are the same. Best hypothysis is that HTML5 routing broke this. Hence the difference between html-todos and Todos. Need to upgrade bootstrap. Done. Menu working on iPhone and nook.
Closed 12.25.2015 (972f1f1)

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
Closed 12.22.2015 (f32006b)

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

###(Bug#23) ???

###(Bug#22) Auth failures with mongolab using mongojs. 
Todos fails to connects using "mongojs": "0.18.0", and new mongojs(dbUrl); Works correctly on localhost.
```
mongojs: Unable to connect to any application instances.
```
Solved by suggestion from mongolabs support:

Upgraded to mongojs v1.4.1 and used options:
// connect using SCRAM-SHA-1 mechanism 
var db = mongojs('username:password@example.com/mydb', ['mycollection'], {authMechanism: 'ScramSHA1'})

###(Bug#21) Wake from sleep issue.
When the todoServer host has been asleep for sometime the DB connection to Mongolab are broken and this failure below occurs. It seems to clear up on the 2nd try.
```
DB_FIND_ERR: [Error: failed to connect to [ds043047-a.mongolab.com:43047]]
DB_GETCOLLECTIONNAMES_ERR: Error: failed to connect to [ds043047-a.mongolab.com:43047]
Tue, 07 Apr 2015 11:45:33 GMT [::ffff:192.168.0.11]GET /api/1/databases/yodertvtodo/collections/ 500 - 36553 ms
```
###(Bug#20) DB_INSERT_ERR: MongoError: Invalid Operation, No operations in bulk.
```
DB_INSERT_ERR: MongoError: Invalid Operation, No operations in bulk
```
Not critical. The failure doesn't affect the expected behavior. Only shows in log. Could be better by not making the call.

###(Bug#19) Event emitter leak.
```
(node) warning: possible EventEmitter memory leak detected. 11 listeners added. Use emitter.setMaxListeners() to increase limit.
Trace
    at addListener (events.js:160:15)
    at /Users/kat/src/Todos/build/todoServer.js:154:17
    at callbacks (/usr/local/lib/node_modules/express/lib/router/index.js:161:37)
    at param (/usr/local/lib/node_modules/express/lib/router/index.js:135:11)
    at pass (/usr/local/lib/node_modules/express/lib/router/index.js:142:5)
    at Router._dispatch (/usr/local/lib/node_modules/express/lib/router/index.js:170:5)
    at Object.router (/usr/local/lib/node_modules/express/lib/router/index.js:33:10)
    at next (/usr/local/lib/node_modules/express/node_modules/connect/lib/proto.js:199:15)
    at resume (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/static.js:60:7)
    at SendStream.error (/usr/local/lib/node_modules/express/node_modules/connect/lib/middleware/static.js:73:37)
```

###(Bug#18) Duplicate objectID error.
Happens on first archive of the day when the current todos are recreated:
	Save error: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: test-todo.todo.$_id_  dup key: { : ObjectId('519992d1e4b0ea5d049be645') }","op":{"_id":"519992d1e4b0ea5d049be645","text":"asd","done":false}})
 	Happend in old test-todo db.

 	Happend again on yodertvtodo 3.26.15 on kitchen-mac.
 	DB_INSERT_ERR: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: yodertvtodo.todo.$_id_  dup key: { : ObjectId('54701f6fe4b0d8aa33853ba3') }","op":{"_id":"54701f6fe4b0d8aa33853ba3","text":"Amazon account switch","done":false}})
	Fri, 27 Mar 2015 03:08:06 GMT [::ffff:192.168.0.11]-PUT /api/1/databases/yodertvtodo/collections/todo 500 - 48 ms

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
###(Bug#16) Update of existing todos in history list.
Marking a task done in a historical list fails to communicate w/ the server.

###(Bug#15) The inserted data from the client doesn't preserve the mongo ObjectID.
Corrected with a reObjectify function that cleans up the data during the JSON.parse().

###(Bug#14) This bug is not found.

###(Bug#13) Inserting an array to a collection doesn't have the expected behavior of replacing the collection. 
Instead they are added back in. I depend on this in the archive to remove the completed items for the current list. 
Fixed by dropping the collection first.

###(Bug#12) Connection Failure no handled.
Connection to the DB doesn't have a fail check and crashes the server when things aren't right.

###(Bug#11) Update to task fails.
Server shows:
```
    uri = /api/1/databases/test-todo/collections/todo/5179feafe4b0494c6ed82de2 
	dbPart = test-todo/collections/todo 
	dbName = test-todo 
	collectionName = todo 
	objID =  5179feafe4b0494c6ed82de2 
	dbUrl = localhost:27017/test-todo
	UPDATE DOC:  /api/1/databases/test-todo/collections/todo/5179feafe4b0494c6ed82de2
	Received :  {"text":"iii","done":true}
	doc:
	{"ok":true,"n":0,"updatedExisting":true}
	But doc in db is not changed:
	{ "_id" : "5179feafe4b0494c6ed82de2", "text" : "iii", "done" : false }
```
Not Related to (Bug#10). Fixed by setting upsert option.

###(Bug#10) two _id forms in db.
```
{ "_id" : ObjectId("519992d7e4b0601363034fef"), "text" : "fasd", "done" : true }
	{ "_id" : "5179feafe4b0494c6ed82de2", "text" : "iii", "done" : false }
```
Fixed by reObjectify() function as in (Bug#15).

###(Bug#9) New route version doesn't route reloading. History and list pages fail. Adds list to (Bug#7)

###(Bug#8) Drop collection fails to return (HTTP Pending). 
Collection is succesfully dropped, though.

###(Bug#7) With new angular and locationProvider fails to reload history page. Solved by redirecting to /#history and /#list.

###(Bug#6) Invalid date on history page in IE9.

###(Bug#5) This bug is not found.

###(Bug#4) Nodejitsu hosted version fails the CSS on my BB bold. 
I believe I'm using the same style sheets as the working version. No way to debug it yet. Overcome by no longer having a BB.

###(Bug#3) Archive forward button isn't pointing to next older archive.
When archive creates a new file the forward button still points to the previous archive. Should be updated on the save.

###(Bug#2) Doesn't work on IE or Nook, likely due to lack of CORS support. 
Need to consider JSONP. Changes hosting requirements. Solved by using a nodejs proxy so there is only a single origin as far as the browser is concerned.

###(Bug#1) Archive steps on previous archive data. 
Has been fixed by merging any newly completed tasks into the archive for the same day if it exists.


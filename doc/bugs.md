Reminders Bug List
==================

##Open Bugs -- Next: (Bug#59)

###(Bug#57) -- Mystery 10sec delay in loading new user as seen here:
```
01:25:14.805Z  INFO todo: request start GET /api/todos/Reminders, req.ip=::1
01:25:14.805Z TRACE todo: Deserializing user: user: {
  "_id": "6700b5a62948d9324399255a",
  "email": "frank@example.com",
  "db": "mongodb://localhost.local:27017/frankstodos",
  "env": "DEV",
  "views": 6
}
01:25:14.805Z  INFO todo: openDB() mongodb://localhost.local:27017/frankstodos via DB_FIND
01:25:14.805Z TRACE todo: openDB() with credentials mongodb://localhost.local:27017/frankstodos via DB_FIND
01:25:14.805Z TRACE todo: GET_DOCS: dbPart=Reminders collectionName=Reminders
01:25:14.810Z  INFO todo: request start GET /api/todos/, req.ip=::1
01:25:14.810Z TRACE todo: Deserializing user: user: {
  "_id": "6700b5a62948d9324399255a",
  "email": "frank@example.com",
  "db": "mongodb://localhost.local:27017/frankstodos",
  "env": "DEV",
  "views": 6
}
01:25:15.637Z  INFO todo: Log User List: module=user-list, user-list-spfd: 
Idx  Email                     DB Name                                            Views 
---  -----                     -------                                            ----- 
0    yodercode@gmail.com       ds049467.mongolab.com:49467/bobstodos              0     
1    nyoder@hudsonsailing.org  ds045137.mongolab.com:45137/todo-000               0     
2    henrikgruett@gmail.com    ds047095.mongolab.com:47095/todos-001              0     
3    murtaza478@gmail.com      ds051980.mongolab.com:51980/todo-002               0     
4    yoderm01@gmail.com        mongodb://localhost:27017/yoderm01                 0     
5    bob@example.com           mongodb://localhost:27017/bobstodos                0     
6    test@example.com          mongodb://localhost:27017/test-todo                0     
7    junk@gmail.com            cluster0.4swbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/bobstodos 0     
8    frank@example.com         mongodb://localhost.local:27017/frankstodos        6     
9    george@example.com        mongodb://localhost.local:27017/george_example_com 0     
10   joe@example.com           mongodb://localhost.local:27017/joe_example_com    0     
11   jim@example.com           mongodb://localhost.local:27017/jim_example_com    0     
12   kat@example.com           mongodb://localhost.local:27017/kat_example_com    0     
13   frank@complete.com        mongodb://localhost.local:27017/frank_complete_com 7     

mike@Michaels-MacBook-Air Todos % 01:25:24.822Z TRACE todo: GET COLLECTIONS: myColls: [
  "Reminders",
  "test",
  "fixit",
  "King%20Kong"
]
01:25:24.823Z  INFO todo: request finish 200 OK 10013.992208ms, user=frank@example.com
01:25:24.823Z  WARN todo: request socket closed GET /api/todos/, 200 OK 10014.106083ms, req.ip=::1
01:25:24.826Z  INFO todo: request finish 200 OK 10021.811291ms, user=frank@example.com
01:25:24.826Z  WARN todo: request socket closed GET /api/todos/Reminders, 200 OK 10021.935375ms, req.ip=::1
```
Here's an example of a different user login that completes in the expected time:
```
01:49:51.322Z  INFO todo: request start GET /api/todos/Reminders, req.ip=::1
01:49:51.323Z TRACE todo: Deserializing user: user: {
  "_id": "5f753871d31cf68a606309d6",
  "email": "test@example.com",
  "db": "mongodb://localhost:27017/test-todo",
  "env": "DEV",
  "views": 1
}
01:49:51.323Z  INFO todo: openDB() mongodb://localhost:27017/test-todo via DB_FIND
01:49:51.323Z TRACE todo: openDB() with credentials mongodb://localhost:27017/test-todo via DB_FIND
01:49:51.323Z TRACE todo: GET_DOCS: dbPart=Reminders collectionName=Reminders
01:49:51.328Z  INFO todo: request start GET /api/todos/, req.ip=::1
01:49:51.330Z TRACE todo: Deserializing user: user: {
  "_id": "5f753871d31cf68a606309d6",
  "email": "test@example.com",
  "db": "mongodb://localhost:27017/test-todo",
  "env": "DEV",
  "views": 1
}
01:49:51.336Z  INFO todo: request finish 200 OK 14.104542ms, user=test@example.com
01:49:51.337Z  WARN todo: request socket closed GET /api/todos/Reminders, 200 OK 14.201542ms, req.ip=::1
01:49:51.337Z TRACE todo: GET COLLECTIONS: myColls: [
  "Garden",
  "Reminders"
]
01:49:51.337Z  INFO todo: request finish 200 OK 9.699625ms, user=test@example.com
01:49:51.338Z  WARN todo: request socket closed GET /api/todos/, 200 OK 9.770167ms, req.ip=::1
```
###(Bug#54) -- Unexpexed Mongo error on list collections and other actions.
```
[2018-01-01T13:29:25.205-05:00] ERROR: todo/231 on iaz6pypy0cii8w63abfp6ywe: DB_GETCOLLECTIONNAMES_ERR: (req_id=b1ae7850-ef21-11e7-9fbe-8f77dbb7a775)
    MongoError: Topology was destroyed
        at nextFunction (/home/nowuser/src/node_modules/mongodb-core/lib/cursor.js:545:27)
        at CommandCursor.Cursor.next [as _next] (/home/nowuser/src/node_modules/mongodb-core/lib/cursor.js:699:3)
        at fetchDocs (/home/nowuser/src/node_modules/mongodb/lib/cursor.js:857:10)
        at toArray (/home/nowuser/src/node_modules/mongodb/lib/cursor.js:884:3)
        at CommandCursor.Cursor.toArray (/home/nowuser/src/node_modules/mongodb/lib/cursor.js:837:44)
        at /home/nowuser/src/node_modules/mongojs/lib/database.js:111:34
        at apply (/home/nowuser/src/node_modules/thunky/index.js:16:28)
        at Proxy.<anonymous> (/home/nowuser/src/node_modules/thunky/index.js:27:3)
        at Proxy.Database.listCollections (/home/nowuser/src/node_modules/mongojs/lib/database.js:108:8)
        at Proxy.Database.getCollectionNames (/home/nowuser/src/node_modules/mongojs/lib/database.js:119:8)
[2018-01-01T13:29:25.206-05:00]  INFO: todo/231 on iaz6pypy0cii8w63abfp6ywe: request finish (req_id=b1ae7850-ef21-11e7-9fbe-8f77dbb7a775, user=yodercode@gmail.com, req.ip=74.66.16.180)
    GET /api/todos/ HTTP/1.1
    host: reminders.now.sh
    x-forwarded-host: reminders.now.sh
    x-real-ip: 74.66.16.180
    x-forwarded-for: 74.66.16.180
    x-forwarded-proto: https
    x-now-log-id: Qsfbo0jqujhGmoVOCDWziuIo
    x-zeit-co-forwarded-for: 74.66.16.180
    connection: close
    accept: application/json, text/plain, */*
    referer: https://reminders.now.sh/list/:Reminders
    dnt: 1
    user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7
    accept-language: en-us
    accept-encoding: br, gzip, deflate
    cookie: null
    --
    HTTP/1.1 500 Internal Server Error
```

###(Bug#53) -- Slashes in new list input should be handled more gracefully.
Example from the client console:
```
todo.js:128 addNewList called with new name:  dododby/due
```
When such an archive name is provided the client side routeprovider fails to match and redirects to the welcome page. No error message is provided to help understand what's wrong.

###(Bug#44) -- Insert point in list is obscured when list is long.

###(Bug#43) -- Got this result somehow with 0.5.0 on my production db yodertvtodo on mLab.

```
s-ds043047:PRIMARY> db.Reminders.find()
{ "_id" : ObjectId("57fc6d4f06ed8e00f1ec4d02"), "done" : false, "text" : "...loading...", "showInView" : true }
{ "_id" : ObjectId("57fc6d4f06ed8e00f1ec4d01"), "done" : false, "text" : "...loading...", "showInView" : true }
{ "_id" : ObjectId("57fc6db006ed8e00f1ec4d03"), "text" : "New test", "done" : false, "showInView" : true }
rs-ds043047:PRIMARY> 
```

###(Bug#40) -- todoServer doesn't handle DB Connection is destroyed error on modulus using mlab db for my big yodertvtodo db.
```
✓] Log streaming started (ctrl-c to exit)...
Sat, 27 Aug 2016 12:46:10 GMT [yoderm01@gmail.com@::ffff:52.73.230.93]GET /account 200 90 - ms
DB_FIND_ERR: { [MongoError: connection to host ds043047.mongolab.com:43047 was destroyed]
  name: 'MongoError',
  message: 'connection to host ds043047.mongolab.com:43047 was destroyed' }
DB_GETCOLLECTIONNAMES_ERR: MongoError: connection to host ds043047.mongolab.com:43047 was destroyed
Sat, 27 Aug 2016 12:46:32 GMT [yoderm01@gmail.com@::ffff:52.73.230.93]GET /api/todos/ 500 - 1 ms
Sat, 27 Aug 2016 12:46:32 GMT [yoderm01@gmail.com@::ffff:52.73.230.93]GET /account 200 90 1 ms
DB_FIND_ERR: { [MongoError: connection to host ds043047.mongolab.com:43047 was destroyed]
  name: 'MongoError',
  message: 'connection to host ds043047.mongolab.com:43047 was destroyed' } 
```

###(Bug#39) -- Users with unassigned DBs cause bogus mongo errors. Should have better handling of unassigned case. 
```
Fri, 12 Aug 2016 06:11:48 GMT [undefined@::1]GET /account 200 18 1 ms
Assinging db...
Sorry, no available databases for user frank
Fri, 12 Aug 2016 06:12:06 GMT [frank@::1]POST /auth/local 302 56 2 ms
Opening DB Sorry, no available databases. via DB_FIND
DB_FIND_ERR: { [MongoError: Invalid ns [Sorry, no available databases..todo]]
  name: 'MongoError',
  message: 'Invalid ns [Sorry, no available databases..todo]',
  '$err': 'Invalid ns [Sorry, no available databases..todo]',
  code: 16256 }
DB_GETCOLLECTIONNAMES_ERR: MongoError: Invalid ns [Sorry, no available databases..system.namespaces]
Fri, 12 Aug 2016 06:12:06 GMT [frank@::1]GET /api/todos/ 500 - 9 ms
Fri, 12 Aug 2016 06:12
```

###(Bug#37) -- When load userlist fails, e.g. when no mongod is running. todoServer exits. Should have a helpful error message.
- Looks like the solution is to upgrade to mongojs 2.0
```
mikes-air:Todos mike$ cd ./build ; node ./todoServer.js ; cd ..
Todo Server v0.4.2
Running on mikes-air.local:8080
Node environment = DEV
User store = localhost:27017/users[userList]
Use http://localhost:8080
CTRL + C to shutdown
    Fri, 12 Aug 2016 04:37:01 GMT [undefined@::1]GET /account 200 18 7 ms
/Users/mike/src/Todos/build/user-list.js:39
  for (var i = 0, len = exports.ul.length; i < len; i++) {
                                  ^

TypeError: Cannot read property 'length' of undefined
    at Object.exports.findByEmail (/Users/mike/src/Todos/build/user-list.js:39:35)
    at /Users/mike/src/Todos/build/todoServer.js:103:25
    at findByUsername (/Users/mike/src/Todos/build/todoServer.js:64:14)
    at /Users/mike/src/Todos/build/todoServer.js:97:7
    at doNTCallback0 (node.js:419:9)
    at process._tickCallback (node.js:348:13)
mikes-air:Todos mike$ 

```

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

###(Bug#58) -- Vercel dev adds query string.
Closed on 12.14.24 by removing the check for a clean url.
It looks like this in node and below the same client call has the ?path... query string. The code tests for this to avoid garbage queries.
```
01:07:06.180Z  WARN todo: request socket closed GET /api/todos/Reminders, 200 OK 49.744875ms, req.ip=::1
```
```
00:45:47.666Z TRACE todo: GET_DOCS: dbPart=Reminders collectionName=Reminders, isAuthenticated? true, user={"_id":"5f75378e529724d45a4877ae","email":"bob@example.com","db":"mongodb://localhost:27017/bobstodos"}.
00:45:47.666Z  INFO todo: openDB() mongodb://localhost:27017/bobstodos  via GET_DOCS
00:45:47.666Z TRACE todo: openDB() with credentials mongodb://localhost:27017/bobstodos  via GET_DOCS
00:45:47.666Z ERROR todo: GET_DOCS: Invalid Path
00:45:47.667Z TRACE todo: In Finally{} of deserializeUser()
00:45:47.668Z  INFO todo: request finish 422 Unprocessable Entity 21.4395ms, user=bob@example.com
00:45:47.668Z  WARN todo: request socket closed GET /api/todos/Reminders?path=api%2Ftodos%2FReminders, 422 Unprocessable Entity 21.520625ms, req.ip=::1
```

###(Bug#55) -- Race condition on start-up: First authentication processed before use rlist is read.
Closed on 
```
01/08 08:49 AM  npm start
01/08 08:50 AM  
                > Reminders@0.6.2 start /home/nowuser/src
                > node ./todoServer.js
08:50:02.412  INFO todo: Todo Server v0.6.2 running on sl1uvepjvtqk7jyid45jjx8u:80. Node environment = PROD.
08:50:02.413  INFO todo: User store = ds043972.mongolab.com:43972/users[userList]
08:50:02.413  INFO todo: Use URL https://reminders.now.sh. CTRL + C to shutdown.
01/08 08:50 AM  TypeError: Cannot read property 'length' of undefined
                    at Object.exports.findByEmail (/home/nowuser/src/user-list.js:57:35)
                    at /home/nowuser/src/todoServer.js:105:12
                    at pass (/home/nowuser/src/node_modules/passport/lib/authenticator.js:353:9)
                    at Authenticator.deserializeUser (/home/nowuser/src/node_modules/passport/lib/authenticator.js:358:5)
                    at SessionStrategy.authenticate (/home/nowuser/src/node_modules/passport/lib/strategies/session.js:49:28)
                    at attempt (/home/nowuser/src/node_modules/passport/lib/middleware/authenticate.js:341:16)
                    at Object.authenticate [as handle] (/home/nowuser/src/node_modules/passport/lib/middleware/authenticate.js:342:7)
                    at next (/home/nowuser/src/node_modules/connect/lib/proto.js:199:15)
                    at Object.initialize [as handle] (/home/nowuser/src/node_modules/passport/lib/middleware/initialize.js:62:5)
                    at next (/home/nowuser/src/node_modules/connect/lib/proto.js:199:15)
08:50:02.883  INFO todo: request finish GET /list/:Reminders, 500 Internal Server Error 8.349042ms, req.ip=74.66.16.180
08:50:02.985  INFO todo: Log User List: module=user-list, user-list-spfd: 

```
###(Bug#56) -- In new mongo, update document requires atomic operators.
```
mikes-air:Todos mike$ /Users/mike/src/Todos/node_modules/mongodb/lib/operations/update_one.js:12
      throw new TypeError('Update document requires atomic operators');
      ^

TypeError: Update document requires atomic operators
    at new UpdateOneOperation (/Users/mike/src/Todos/node_modules/mongodb/lib/operations/update_one.js:12:13)
    at Collection.updateOne (/Users/mike/src/Todos/node_modules/mongodb/lib/collection.js:758:5)
    at /Users/mike/src/Todos/node_modules/mongojs/lib/collection.js:145:16
    at /Users/mike/src/Todos/node_modules/mongojs/lib/collection.js:20:7
    at apply (/Users/mike/src/Todos/node_modules/thunky/index.js:44:12)
    at processTicksAndRejections (internal/process/task_queues.js:84:21)

[1]+  Exit 1                  node ./todoServer.js > node.out  (wd: ~/src/Todos/build)
(wd now: ~/src/Todos)
```

###(Bug#52) -- app.all(apiPath) fails to open DB and crashes
```
22:33:40.242  INFO todo: request start PUT /api/todos/junky, req.ip=::ffff:192.168.0.13
22:33:40.251 TRACE todo: Deserializing user: user: {
  "_id": "5a1a5a97b17ca07db9826051",
  "email": "ted@example.com",
  "db": "localhost:27017/todos01",
  "views": 6,
  "env": "DEV"
}
22:33:40.252 TRACE todo: PUT NEW COLLECTION: undefined
22:33:40.253 TRACE todo: Received body data : 
22:33:40.253 TRACE todo: []
22:33:40.254 TRACE todo: PUT Collection Received :  2
/Users/mike/src/Todos/build/todoServer.js:602
    dbs[dbName].collection(collectionName).drop( function(err) {
               ^

TypeError: Cannot read property 'collection' of undefined
    at IncomingMessage.<anonymous> (/Users/mike/src/Todos/build/todoServer.js:602:16)
    at emitNone (events.js:105:13)
    at IncomingMessage.emit (events.js:207:7)
    at endReadableNT (_stream_readable.js:1045:12)
    at _combinedTickCallback (internal/process/next_tick.js:138:11)
    at process._tickCallback (internal/process/next_tick.js:180:9)
    
[2]+  Exit 1                  nohup node todoServer.js  (wd: ~/src/Todos/build)
```
Closed 12.29.2017 by checking for the DB being open. Added backlog item to test all APIs.

###(Bug#38) -- No proper error when no more databases are found.
```
mikes-air:Todos mike$ cd ./build ; node ./todoServer.js ; cd ..
Get User List opening DB: localhost:27017/users
Todo Server v0.4.2
Running on mikes-air.local:8080
Node environment = DEV
User store = localhost:27017/users[userList]
Use http://localhost:8080
CTRL + C to shutdown
i  email          db
0 bob@example.com   localhost:27017/bobstodos
1 yoderm01@gmail.com    localhost:27017/todo_new_test
2 test@example.com  localhost:27017/test-todo
Fri, 12 Aug 2016 05:21:10 GMT [undefined@::1]GET /account 200 18 9 ms
Assinging db...
/Users/mike/src/Todos/build/user-list.js:33
  user.email = email; 
             ^

TypeError: Cannot set property 'email' of null
    at Object.exports.assignDb (/Users/mike/src/Todos/build/user-list.js:33:14)
    at /Users/mike/src/Todos/build/todoServer.js:106:29
    at Object.exports.findByEmail (/Users/mike/src/Todos/build/user-list.js:45:10)
    at /Users/mike/src/Todos/build/todoServer.js:103:25
    at findByUsername (/Users/mike/src/Todos/build/todoServer.js:64:14)
    at /Users/mike/src/Todos/build/todoServer.js:97:7
    at doNTCallback0 (node.js:419:9)
    at process._tickCallback (node.js:348:13)
mikes-air:Todos mike$ git status
```
Closed 12.28.2017 as duplicate to (Bug#49)

###(Bug#46) -- Protect this function from unopened db.
```
/Users/mike/src/Todos/build/todoServer.js:464
        dbs[dbName].collection(collectionName).update({
                   ^

TypeError: Cannot read property 'collection' of undefined
    at IncomingMessage.<anonymous> (/Users/mike/src/Todos/build/todoServer.js:464:20)
    at emitNone (events.js:67:13)
    at IncomingMessage.emit (events.js:166:7)
    at endReadableNT (_stream_readable.js:905:12)
    at doNTCallback2 (node.js:441:9)
    at process._tickCallback (node.js:355:17)
```
Closed and fixed 12.27.2017 by checking for DB being opened.

###(Bug#51) -- Object GET function defeated by the wild card GET.

The below GET (not used by the app) returns an empty [] array.
```
http://mikes-air.local:8080/api/todos/Reminders/5a1a5b5850c6058f5cf63e16
```
Closed 12.27.2017 by reordering my express router.

###(Bug#47) -- Bunyan middleware logging reuses the same ```req_id``` in all request logging even with different users from different browsers on different IP addresses. This appears to have been a mistake. Even the trace below actually has unique values.
```
mikes-air:Todos mike$ cd ./build ; node ./todoServer.js | ../node_modules/.bin/bunyan ; cd ..
[2017-05-13T14:17:53.764Z]  INFO: todoServer/6866 on mikes-air.local: Todo Server v0.5.7 running on mikes-air.local:8080. Node environment = DEV.
[2017-05-13T14:17:53.766Z]  INFO: todoServer/6866 on mikes-air.local: User store = localhost:27017/users[userList]
[2017-05-13T14:17:53.766Z]  INFO: todoServer/6866 on mikes-air.local: Use URL http://localhost:8080. CTRL + C to shutdown.
[2017-05-13T14:17:53.821Z]  INFO: todoServer/6866 on mikes-air.local: Log User List: (module=user-list)
    user-list-spfd: 
    Idx  Email                     DB Name                                            Views 
    ---  -----                     -------                                            ----- 
    0    bob@example.com           localhost:27017/bobstodos                          0     
    1    test@example.com          localhost:27017/test-todo                          0     
    2    frank@example.com         localhost:27017/todos-for-frank                    0     
    3    yoderm01@gmail.com        localhost:27017/yodertvtodo                        0     
    4    yodercode@gmail.com       localhost:27017/todo_new_test                      0     
[2017-05-13T14:22:33.844Z]  INFO: todoServer/6866 on mikes-air.local: Opening DB localhost:27017/bobstodos via DB_FIND (req_id=9b2b78e0-37e7-11e7-b764-978aea49c2b6)
[2017-05-13T14:22:33.869Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=9b2d74b0-37e7-11e7-b764-978aea49c2b6, duration=17.470032, status=200, req.user=bob@example.com)
    GET /api/todos/ HTTP/1.1
[2017-05-13T14:22:33.871Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=9b2b78e0-37e7-11e7-b764-978aea49c2b6, duration=32.745667, status=200, req.user=bob@example.com)
    GET /api/todos/Reminders HTTP/1.1
[2017-05-13T14:23:27.571Z]  INFO: todoServer/6866 on mikes-air.local: Opening DB localhost:27017/test-todo via DB_FIND (req_id=bb325320-37e7-11e7-b764-978aea49c2b6)
[2017-05-13T14:23:27.584Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=bb325320-37e7-11e7-b764-978aea49c2b6, duration=13.978187, status=200, req.user=test@example.com)
    GET /api/todos/Reminders HTTP/1.1
[2017-05-13T14:23:27.589Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=bb338ba0-37e7-11e7-b764-978aea49c2b6, duration=10.98632, status=200, req.user=test@example.com)
    GET /api/todos/ HTTP/1.1
[2017-05-13T14:23:36.358Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=c06e32f0-37e7-11e7-b764-978aea49c2b6, duration=6.503004, status=200, req.user=test@example.com)
    GET /api/todos/ HTTP/1.1
[2017-05-13T14:23:39.109Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=c2126d10-37e7-11e7-b764-978aea49c2b6, duration=3.460762, status=200, req.user=test@example.com)
    GET /api/todos/ HTTP/1.1
[2017-05-13T14:23:39.115Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=c2124600-37e7-11e7-b764-978aea49c2b6, duration=10.854809, status=200, req.user=test@example.com)
    GET /api/todos/todoMon-Jan-14-2013 HTTP/1.1
[2017-05-13T14:23:45.556Z]  INFO: todoServer/6866 on mikes-air.local: request finish (req_id=c5e6f4b0-37e7-11e7-b764-978aea49c2b6, duration=25.322129999999998, status=200, req.user=test@example.com)
    PUT /api/todos/todoMon-Jan-14-2013 HTTP/1.1
```
Closed 12.25.2017 as mistaken report.

###(Bug#48) -- Source IP address is not printed in ziet logs.
```
05/15 11:16 PM  Tue, 16 May 2017 03:16:11 GMT [yoderm01@gmail.com@::1]GET /list/:Reminders 302 - 5 ms
``` 
Closed 12.25.2017

###(Bug#50) -- User list is printed twice.

```
08:08:44.861  INFO todo: request finish GET /list/:Reminders, 302 Found 33.424879ms, req.ip=::1
08:08:46.167  INFO todo: request finish GET /account, 200 OK 6.035089ms, req.ip=::1
08:08:49.286  INFO todo: request finish GET /auth/google, 302 Found 14.477818ms
08:09:02.271  INFO todo: Log User List: module=user-list, user-list-spfd: 
Idx  Email                     DB Name                                            Views 
---  -----                     -------                                            ----- 
0    yoderm01@gmail.com        ds031647.mlab.com:31647/yoderm01                   0     
1    bob@example.com           localhost:27017/bobstodos                          0     
2    test@example.com          localhost:27017/test-todo                          0     
3    junk@gmail.com            ds039007.mongolab.com:39007/2ndnewishdn            0     
4    frank@example.com         ds047057.mongolab.com:47057/frankstodos            0     
5    yodercode@gmail.com       ds049467.mongolab.com:49467/bobstodos              6     
6    nyoder@hudsonsailing.org  ds045137.mongolab.com:45137/todo-000               0     
7    henrikgruett@gmail.com    ds047095.mongolab.com:47095/todos-001              0     
8    UNASSIGNED_DB             ds051980.mongolab.com:51980/todo-002               0     
9    UNASSIGNED_DB             ds037165.mongolab.com:37165/todos-003              0     
10   UNASSIGNED_DB             ds045907.mlab.com:45907/test-todo                  0     
08:09:02.279  INFO todo: request finish GET /auth/google/callback?code=4/AAAhvirPxRHjE_9OoQsXCQ-XqN4cIdIXr0LUZ2d6qB1JbBmqKBsGvmWki9lNjbZiOjVFuleGdxxZWoCO8REbMG0, 302 Found 327.472997ms, user=yoderm01@gmail.com, req.ip=::1
08:09:03.273  INFO todo: Log User List: module=user-list, user-list-spfd: 
Idx  Email                     DB Name                                            Views 
---  -----                     -------                                            ----- 
0    yoderm01@gmail.com        ds031647.mlab.com:31647/yoderm01                   0     
1    bob@example.com           localhost:27017/bobstodos                          0     
2    test@example.com          localhost:27017/test-todo                          0     
3    junk@gmail.com            ds039007.mongolab.com:39007/2ndnewishdn            0     
4    frank@example.com         ds047057.mongolab.com:47057/frankstodos            0     
5    yodercode@gmail.com       ds049467.mongolab.com:49467/bobstodos              6     
6    nyoder@hudsonsailing.org  ds045137.mongolab.com:45137/todo-000               0     
7    henrikgruett@gmail.com    ds047095.mongolab.com:47095/todos-001              0     
8    UNASSIGNED_DB             ds051980.mongolab.com:51980/todo-002               0     
9    UNASSIGNED_DB             ds037165.mongolab.com:37165/todos-003              0     
10   UNASSIGNED_DB             ds045907.mlab.com:45907/test-todo                  0     
08:09:03.535  INFO todo: request finish GET /api/todos/Reminders, 200 OK 95.449711ms, user=yoderm01@gmail.com
08:09:03.779  INFO todo: request finish GET /api/todos/, 200 OK 337.279833ms, user=yoderm01@gmail.com
10:38:39.916  INFO todo: request finish GET /list/:Reminders, 302 Found 5.203817ms, user=yoderm01@gmail.com
10:38:40.885  INFO todo: request finish GET /api/todos/, 200 OK 81.52386ms, user=yoderm01@gmail.com

```

###(Bug#49) -- Handling no availalbe DB doesn't inform user as expected.
- Protected the code from null return objects when DB User wasn't found.

```
23:54:36.323  INFO todo: request start GET /account fe80::417:74e5:b5d5:dbe4
23:54:36.325 TRACE todo: {
  "env": "DEV"
}
23:54:36.327  INFO todo: request finish 200 OK 3.288212ms
23:54:36.390  INFO todo: request start GET /fonts/glyphicons-halflings-regular.woff2 fe80::417:74e5:b5d5:dbe4
23:54:36.390  INFO todo: request finish 304 Not Modified 0.742995ms
23:54:53.895  INFO todo: request start POST /auth/local fe80::417:74e5:b5d5:dbe4
23:54:53.900  INFO todo: Assinging db...user-list
23:54:53.901 ERROR todo: Sorry, no available databases for user junk
23:54:53.902  INFO todo: Log User List:user-list 
Idx  Email                     DB Name                                            Views 
---  -----                     -------                                            ----- 
0    bob@example.com           localhost:27017/bobstodos                          69    
1    test@example.com          localhost:27017/test-todo                          0     
2    frank@example.com         localhost:27017/todos-for-frank                    0     
3    yoderm01@gmail.com        localhost:27017/yodertvtodo                        0     
4    yodercode@gmail.com       localhost:27017/todo_new_test                      14    
23:54:53.903 TRACE todo: Serializing user:{
  "email": "junk",
  "db": "Sorry, no available databases.",
  "env": "DEV",
  "views": 0
}
23:54:53.906  INFO todo: request finish 302 Found 10.933273ms junk
23:54:53.938  INFO todo: request start GET / fe80::417:74e5:b5d5:dbe4
23:54:53.940  INFO todo: request finish 200 OK 1.435689ms
23:54:53.993  INFO todo: request start GET /css/bootstrap-theme.min.css fe80::417:74e5:b5d5:dbe4
23:54:53.994  INFO todo: request finish 304 Not Modified 0.996854ms
23:54:54.030  INFO todo: request start GET /css/bootstrap-responsive.min.css fe80::417:74e5:b5d5:dbe4
23:54:54.031  INFO todo: request finish 304 Not Modified 0.96876ms
23:54:54.038  INFO todo: request start GET /css/bootstrap.min.css fe80::417:74e5:b5d5:dbe4
23:54:54.040  INFO todo: request finish 304 Not Modified 1.48969ms
23:54:54.041  INFO todo: request start GET /js/bootstrap.min.js fe80::417:74e5:b5d5:dbe4
23:54:54.042  INFO todo: request finish 304 Not Modified 1.428366ms
23:54:54.053  INFO todo: request start GET /js/angular-resource.min.js fe80::417:74e5:b5d5:dbe4
23:54:54.054  INFO todo: request finish 304 Not Modified 0.727658ms
23:54:54.055  INFO todo: request start GET /todo.css fe80::417:74e5:b5d5:dbe4
23:54:54.055  INFO todo: request start GET /js/angular-route.min.js fe80::417:74e5:b5d5:dbe4
23:54:54.056  INFO todo: request start GET /js/jquery-1.11.3.min.js fe80::417:74e5:b5d5:dbe4
23:54:54.057  INFO todo: request finish 304 Not Modified 1.777198ms
23:54:54.057  INFO todo: request finish 304 Not Modified 1.535685ms
23:54:54.057  INFO todo: request finish 304 Not Modified 1.3963ms
23:54:54.060  INFO todo: request start GET /todo.js fe80::417:74e5:b5d5:dbe4
23:54:54.060  INFO todo: request finish 304 Not Modified 0.613447ms
23:54:54.063  INFO todo: request start GET /TodoServices.js fe80::417:74e5:b5d5:dbe4
23:54:54.064  INFO todo: request start GET /js/angular.min.js fe80::417:74e5:b5d5:dbe4
23:54:54.065  INFO todo: request finish 304 Not Modified 1.359823ms
23:54:54.065  INFO todo: request finish 304 Not Modified 1.156978ms
23:54:54.157  INFO todo: request start GET /todo.html fe80::417:74e5:b5d5:dbe4
23:54:54.161  INFO todo: request finish 200 OK 3.614034ms
23:54:54.199  INFO todo: request start GET /img/favicon.ico fe80::417:74e5:b5d5:dbe4
23:54:54.201  INFO todo: request finish 304 Not Modified 1.94656ms
23:54:54.254  INFO todo: request start GET /api/todos/Reminders fe80::417:74e5:b5d5:dbe4
23:54:54.255 TRACE todo: Deserializing user:{
  "email": "junk",
  "db": "Sorry, no available databases.",
  "env": "DEV",
  "views": 1
}
TypeError: Cannot set property 'views' of null
    at /Users/mike/src/Todos/build/todoServer.js:94:22
    at Object.exports.findByEmail (/Users/mike/src/Todos/build/user-list.js:63:10)
    at /Users/mike/src/Todos/build/todoServer.js:92:12
    at pass (/Users/mike/src/Todos/node_modules/passport/lib/authenticator.js:353:9)
    at Authenticator.deserializeUser (/Users/mike/src/Todos/node_modules/passport/lib/authenticator.js:358:5)
    at SessionStrategy.authenticate (/Users/mike/src/Todos/node_modules/passport/lib/strategies/session.js:49:28)
    at attempt (/Users/mike/src/Todos/node_modules/passport/lib/middleware/authenticate.js:341:16)
    at Object.authenticate [as handle] (/Users/mike/src/Todos/node_modules/passport/lib/middleware/authenticate.js:342:7)
    at next (/usr/local/lib/node_modules/express/node_modules/connect/lib/proto.js:199:15)
    at Object.initialize [as handle] (/Users/mike/src/Todos/node_modules/passport/lib/middleware/initialize.js:62:5)
23:54:54.258  INFO todo: request finish 500 Internal Server Error 4.256763ms
```
Closed 12.2.2017
commit d21e17f526040b6bf4fb536c2c3669fba329fcb8

###(Bug#45) -- Made for iPhone 6 plus. Doesn't adjust to iPhone 6 and likely iPhone 5.
- Used javascript to set the initial scale and width.

###(Bug#42) -- Entering a new task on iPhone obscures the entry point of the text for the new task.
- Partially fixed. Solved for cases where the list is smaller then the view port.
Closed 8.28.2016 (46ae13a)

###(Bug#41) -- Lists with the archive name structure like todoSat-Aug-27-2016 don't load or save.
- Now that I merged TodoCtrl w ListCtrl the todo's with dates in the name fail to work.
- Basically I'm not done merging yet
Closed 10.8.2016 (d5315f2)

###(Bug#36) -- On 8/6/16 Erik failed to login using Google Auth. Fixed in GoogleAuth handler to use user-list.assignDb().
Closed 8.23.2016 (d103d63) 

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
```
	Save error: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: test-todo.todo.$_id_  dup key: { : ObjectId('519992d1e4b0ea5d049be645') }","op":{"_id":"519992d1e4b0ea5d049be645","text":"asd","done":false}})
```
Happend in old test-todo db.
Happend again on yodertvtodo 3.26.15 on kitchen-mac.
``` 	
  DB_INSERT_ERR: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: yodertvtodo.todo.$_id_  dup key: { : ObjectId('54701f6fe4b0d8aa33853ba3') }","op":{"_id":"54701f6fe4b0d8aa33853ba3","text":"Amazon account switch","done":false}})
	Fri, 27 Mar 2015 03:08:06 GMT [::ffff:192.168.0.11]-PUT /api/1/databases/yodertvtodo/collections/todo 500 - 48 ms
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

###(Bug#10) two ```_id``` forms in db.
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


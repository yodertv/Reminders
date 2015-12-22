Todos v0.3.4
============
#Objective:
Replace the weekly task list that I keep on paper.

#Curently demonstrates the following key features:
- Manages a list of Todos (aka tasks).
- Persists Todo data on mongodb using angular's ngResource, $http service and mongojs.
- Archive - Save's list after removing items where done:true. When current day's archive exists add the done items to it.
- Add - Adds a new task to the list with done:false; Saves the new task to the DB.
- Checkbox - When checked: done:true; Item's text is displayed as strike-through; Saves the updated item to the DB.
- History - Presents the list of archives and allows you to view them.
- Delete icon - Deletes a task from the list. Delete icon and complete checkbox are hidden or shown based on (edit==true).
- Displays total and remaing task counts.
- Welcome page for login and current user info.
- Tested on: nook browser, iTouch, Safari, iPhone, chrome on Mac, chrome on widows, and IE.
- Responsive to three device sizes. Uses pills for navigation and a small menu.
- Has a conditional forward button that takes you to the next older archive if it exists.
- Routing supports browser back and deep linking to archives and any page. 
- Editing and deleting items in an archive.
- Editing and deleting archives.
- ImplRest apiPath is configurable.
- Login to /auth/local, with failure notification
- Logs user name using a custom token of express (connect) logger.

#Deployments:
- TodoServer can be hosted on localhost, localnet and Modulus.
- Mongodb can be hosted on localhost, localnet, and MongoLab.
- All deployment knowledge is in make.js and build_props_files.

#Dependancies:
- Client depends on bootstrap, angular, and jquery.
- Server depends on express, passport, http, and mongojs.
- DB depends on MongoLab for production and local mongodb for dev.

### Version 0.3.4 (12.22.15)
- Testing on localnet with multiple devices.
- Added logging user name.
- Fixed (Bug#25).
- Updated README.

### Version 0.3.3 (12.19.15)
- Documented and fixed (Bug#30) Don't send password to client.
- Added failure message on welcome page when login fails.
- Documented and fixed (Bug#29)
- Documented and fixed (Bug#28).
- Add user list and lookup database by user.
- Add welcome and login screens by merging html-todos with Todos.
- Fixed global replacement in make.js sed commands for BAKING in variables.

### Version 0.3.2 (12.14.15)
- Moved db knowledge to server and updated apiPath.
- Documented (Bug#27) -- Server silently sends the client crap when not able to connect to db.
- Added session monitor interval function.

### Version 0.3.1 (12.13.15)
- Merge finally working for local auth. But can't add tasks. Found body parser was consuming form data before the URL handler. Fixed.
- Merge multi-user and multi-auth from html-todos and Auth projects.
- Noted (Bug#25) that button/title doesn't show year when it is different from current year.
- Documented and fixed (Bug#26) : Opening via get collections failed because of no dbUrl variable.

### Version 0.3.0 (12.2.2015)
- Fixing build and tagging v0.3.0. Major release because of all the dependancies that were upgrades.
- Server running 5.1.1.
- Rolled the devEnvironment back to node v4.2.2 and npm 2.14.7.
- Build the node_modules dependancies. Use npm install.
- Upgraded node and npm to the latest 5.1.0 and 3.3.12 respectively.
- Solved (Bug#22)
- Deployed to nodjitsu, while modulus fails to connect to mongolab dbs with auth failures. (Bug#22)
- Tested at merchants wifi. Worked from iPhone on AK's local area net.
- Made an attempt to fix (Bug#18). Hard to reproduce. Put the insert in the callback of the drop(), but noticed that dropping an empty collection resulted in an error so ignoring drop errors.
- Then completed the refatoring.
- Refactored to use express with minimal changes.
- Added "logDate" build prop to make bake step.
- Formated the logger output.
- Tested w/ Mongodb v3.0.1. Worked with upgraded mongjs.
- Added db to list for old version of mongo installed on katrinas-macbook-air.

### Bugs fixed:

#####Documented and corrected (Bug#22)
Auth failures with mongolab using mongojs. Todos fails to connects using "mongojs": "0.18.0", and new mongojs(dbUrl); Works correctly on localhost.
```
mongojs: Unable to connect to any application instances.
```
Solved by suggestion from mongolabs support:

Upgraded to mongojs v1.4.1 and used options:
// connect using SCRAM-SHA-1 mechanism 
var db = mongojs('username:password@example.com/mydb', ['mycollection'], {authMechanism: 'ScramSHA1'})

#####Documented and corrected (Bug#18) Duplicate objectID error. Happens on first archive of the day when the current todos are recreated:
	Save error: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: test-todo.todo.$_id_  dup key: { : ObjectId('519992d1e4b0ea5d049be645') }","op":{"_id":"519992d1e4b0ea5d049be645","text":"asd","done":false}})
 	Happend in old test-todo db.

 	Happend again on yodertvtodo 3.26.15 on kitchen-mac.
 	DB_INSERT_ERR: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: yodertvtodo.todo.$_id_  dup key: { : ObjectId('54701f6fe4b0d8aa33853ba3') }","op":{"_id":"54701f6fe4b0d8aa33853ba3","text":"Amazon account switch","done":false}})
	Fri, 27 Mar 2015 03:08:06 GMT [::ffff:192.168.0.11]-PUT /api/1/databases/yodertvtodo/collections/todo 500 - 48 ms

#####Documented and corrected(Bug#20)
```
DB_INSERT_ERR: MongoError: Invalid Operation, No operations in bulk
```
	Not critical. The failure doesn't affect the expected behavior. Only shows in log. Could be better by not making the call.

#####Documented and corrected Event emitter leak(Bug#19)
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

#Work done in previous releases
###2.5
- Tested quite a bit on Linda's local net. Did not encounter (Bug#17) did git dublicate ID (Bug#18) once.
- Solved:
	(Bug#9) New route version doesn't route reloading. History and list pages fail. Adds list to (Bug#7)
	(Bug#7) With new angular and locationProvider fails to reload history page. Solved by redirecting to /#history and /#list.

###2.4
- Tested localnet build and run on kitchen-mac. Tested iPad, iTouch, IE 9 on windows, Chrome on windows, Chrome on Nook.
- Enhanced server to start based on nodeURL for port. No longer takes port argument.
- Server creates hundreds of connections. Fixed by making a global array. Working.
- Unable to duplicate the two DB bugs on local host in the car to WVA (2.13.15).
- Changed local host build from 127.0.0.1 to localhost.

###2.3
- Fixed update of existing todos in history list -- (Bug#16) Marking a task done in a historical list fails to communicate w/ the server.
- Limit file server to only static files. Static server does NOT serve up the server files or the package.json file.
- Enhanced make.js to support the new file structure.

###2.2
- Merged with original 2.2 which added full editing mode in the history.

###2.1.3
- Use shelljs.sed to "bake" variables into the scripts. Keeping @ANT@ format.
- Newest bootstrap version 3.3.1. Didn't work. Went back.
- Further testing found two bugs (8 and 9)
- Work off-line better with local mongodb.
- Got getCollectionMames() and collection.drop() working on local host. Curious about the number of collections opening. That must be the mongojs library. I added close() to the method I tested.
- Interesting behavoir with the new route, reloading doesn't get "routed".
- Objective to leave ngResource unchanged (i.e. reproduce the REST API)
- Fixed (Bug#8) Drop collection fails to return (HTTP Pending). Collection is succesfully dropped.
- Fixed (Bug13) Inserting an array to a collection doesn't have the expected behavior of replacing the collection. Instead they are added back in. I depend on this in the archive to remove the completed items for the current list. Fixed by dropping the collection first.
- Fixed(Bug#11) Server shows:
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
- Not Related to (Bug#10). Fixed by setting upsert option.
- Fixed (Bug#15) The inserted data from the client doesn't preserve the mongo ObjectID. Corrected with a reObjectify function that cleans up the data during the JSON.parse().
- FIxed (Bug#10) two _id forms in db:
```
{ "_id" : ObjectId("519992d7e4b0601363034fef"), "text" : "fasd", "done" : true }
	{ "_id" : "5179feafe4b0494c6ed82de2", "text" : "iii", "done" : false }
	fixed by reObjectify() function as in (Bug#15).
```

###2.1.2
- Use $locationProvider.html5Mode(true) to eliminate # in my URLs.
- Had this error https://docs.angularjs.org/error/$location/nobase and fixed it.
- Refactored module comand for better readability following tutorial examples.
- Removed extraneous ":" from URLs href'ed by history.html and todo.html.
- Deployed as yodertst.nodejitsu.com with active snapshot: "0.2.1-7 Sunday, January 11, 2015 15:17:32"

###2.1.1
- Explored using node as build script. Using commander and shelljs.
- Created clean, prep, build, install commands framework. See DevNotes for more info.
- Use package.json file for my two configuration items, src_dir, build_dir and lib_dir
- Changed bake to prep and added node_module dependancy check.
- Upgraded angular to solve :port issue with ngResource. Version 1.3.8
- Still one bug. Today page is blank when routed to from History. -- Fixed by adding '/' after #.

###2.1
- Use node-static to serve up my static files.
- Load css files before scripts fixed BB bug. Found with Chrome audit feature.
- (Bug#4-Fixed) Nodejitsu hosted version fails the CSS on my BB bold. I believe I'm using the same style sheets as the working version. No way to debug it yet.
- Move DB key back to server and off the client.
- Client sets DB. Query string for archive delete method to pass in the DB name.
- (Bug#5-Fixed) Still failing on IE 9. IE dev tools don't help with this security error, but google did. Found the trick was to start the app w/ the /#/ version of the URL.

###2.0
- Enhanced todoServer.js to proxy mongo's REST api and allow non-CORS compliant browsers to access the data. Still need a place to host todoServer.js on Node. ie 9 can view the data, but it still broken from a style sheet prespective.
- (Bug#2) Doesn't work on IE or Nook, likely due to lack of CORS support. Need to consider JSONP. Changes hosting requirements. Implemented with a nodejs proxy so there is only a single origin as var as the browser is concerned.
- Enhanced ro remove archives from the archive list. I delete collections with mongojs.
- Discovered the Puffin browser for nook. Works with Todos 1.4. Now only IE fails. I don't think I care.
- Deployed to nodjitsu to some success. Proxy bug sent me a erant re-direct.
- Mongolab support fixed thier proxy bug.
- Adding https before deploying nodejitsu. Here's how:
	- openssl genrsa -out privatekey.pem 1024 
	- openssl req -new -key privatekey.pem -out certrequest.csr 
	- openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
- Nodejitsu handles the SSL in their proxy. No need to deploy the above. So it works locally, not in the cloud.
- Deployed using jitsu deploy. jitsu list, and jitsu logs.

###1.5
- Merge Node v0.4 MongoApp drop collection code into StaticServer and rename as todoServer
- Change mongolab.js to add a dropArchive function.
- (Bug#3) When archive creates a new file the forward button still points to the previous archive. Should be updated on the save.
- This release can't go to production because I need a place to host my node drop function.
- StaticServer is deco'd

###1.4:
- Deleting tasks in archives now works
- Hosted in node.js StaticServer.js @ http://desk-pc
- Refactored getArchiveList into it's own function and moved into service, mongolab.js.
- buildArchiveList used three times so it's now a function shared by three controllers.
- Refactor all DB access into the mongolab module.
- (Bug#1) Archive has been fixed by merging any newly completed tasks into the archive for the same day if it exists.
- Tweaked html views with some &nbsp; to make the view a little nicer.

#Future Enhancements (backlog)
- Display mongodb host as wells as registered DB on welcome screen.
- Rename default collection "todo" to "today".
- Add unit testing.
- Upgrade Bootstrap.
- Consider making the build manifest in JSON notation rather than string.
- Minimize trips to server. Keep data cached between pages.
- Test preserving some global data so that it doesn't all get blown away and refreshed with ```$scope```.
- Print a digest from the History page.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Support addvertisments.
- Dynamically provision new users.
- Add a print feature.

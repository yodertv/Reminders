// Read Me
// Todos v2.2

Objective: Replace the weekly task list that I keep on paper.

// Curent features

- Manages a list of Todos (aka tasks).
- Persists Todo data mongodb using angular's ngResource, $http service and mongojs 
- Implements a REST API.
- Archive - Save's list after removing items where done:true. When current day's archive exists add the done items to it.
- Add - Adds a new task to the list with done:false; Saves the new task to the DB.
- Checkbox - When checked: done:true; Item's text is displayed as strike-through; Saves the updated item to the DB.
- History - Presents the list of archives and allows you to view them.
- Delete icon - Deletes a task from the list. Delete icon and complete checkbox are hidden or shown based on (edit==true).
- Displays total and remaing task counts.
- Hosted at http://192.168.1.11 with node StaticServer http server.
- Host the service on the web so I can use it at work. (yodertv.com)
- Tested on nook browser, iTouch, Safari, chrome on Mac, chrome on widows, and IE (fails because it requires CORS).
- Depends on bootstrap, angular, and jQuerry.
- Has a custom favicon.
- Responsive to three device sizes.
- Lists are displayed in tables.
- Uses pills for navigation replaces href strings in earlier versions with buttons.
- Has a forward button that takes you to the next older archive. Use the browser back command to return to the previous archive. Button disappears when displaying the last archive.
- Deleting items in an archive is now supported.
- Deleting archives is now supported in the nodejs server version.
- All deployment knowledge is in mongolab.js.

// Work done in previous releases
1.4
- Deleting tasks in archives now works
- Hosted in node.js StaticServer.js @ http://desk-pc
- Refactored getArchiveList into it's own function and moved into service, mongolab.js.
- buildArchiveList used three times so it's now a function shared by three controllers.
- Refactor all DB access into the mongolab module.
- (Bug#1) Archive has been fixed by merging any newly completed tasks into the archive for the same day if it exists.
- Tweaked html views with some &nbsp; to make the view a little nicer.

1.5
- Merge Node v0.4 MongoApp drop collection code into StaticServer and rename as todoServer
- Change mongolab.js to add a dropArchive function.
- (Bug#3) When archive creates a new file the forward button still points to the previous archive. Should be updated on the save.
- This release can't go to production because I need a place to host my node drop function.
- StaticServer is deco'd

2.0
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

2.1
- Use node-static to serve up my static files.
- Load css files before scripts fixed BB bug. Found with Chrome audit feature.
- (Bug#4-Fixed) Nodejitsu hosted version fails the CSS on my BB bold. I believe I'm using the same style sheets as the working version. No way to debug it yet.
- Move DB key back to server and off the client.
- Client sets DB. Query string for archive delete method to pass in the DB name.
- (Bug#5-Fixed) Still failing on IE 9. IE dev tools don't help with this security error, but google did. Found the trick was to start the app w/ the /#/ version of the URL.

2.1.1
- Explored using node as build script. Using commander and shelljs.
- Created clean, prep, build, install commands framework. See DevNotes for more info.
- Use package.json file for my two configuration items, src_dir, build_dir and lib_dir
- Changed bake to prep and added node_module dependancy check.
- Upgraded angular to solve :port issue with ngResource. Version 1.3.8
- Still one bug. Today page is blank when routed to from History. -- Fixed by adding '/' after #.	

2.1.2
- Use $locationProvider.html5Mode(true) to eliminate # in my URLs.
- Had this error https://docs.angularjs.org/error/$location/nobase and fixed it.
- Refactored module comand for better readability following tutorial examples.
- Removed extraneous ":" from URLs href'ed by history.html and todo.html.
- Deployed as yodertst.nodejitsu.com with active snapshot: "0.2.1-7 Sunday, January 11, 2015 15:17:32"

2.1.3
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
Not Related to (Bug#10). Fixed by setting upsert option.
-Fixed (Bug#15) The inserted data from the client doesn't preserve the mongo ObjectID. Corrected with a reObjectify function that cleans up the data during the JSON.parse().
- FIxed (Bug#10) two _id forms in db:
	{ "_id" : ObjectId("519992d7e4b0601363034fef"), "text" : "fasd", "done" : true }
	{ "_id" : "5179feafe4b0494c6ed82de2", "text" : "iii", "done" : false }
	fixed by reObjectify() function as in (Bug#15).

2.2
- Merged with original 2.2 which added full editing mode in the history.

2.3
- Fixed update of existing todos in history list -- (Bug#16) Marking a task done in a historical list fails to communicate w/ the server.
- Limit file server to only static files. Static server does NOT serve up the server files or the package.json file.
- Enhanced make.js to support the new file structure.

// Work in this release (2.4)
- Tested localnet build and run on kitchen-mac. Tested iPad, iTouch, IE 9 on windows, Chrome on windows, Chrome on Nook.
- Enhanced server to start based on nodeURL for port

// Known bugs next Bug#19


(Bug#18) Duplicate objectID error. Happens on first archive of the day when the current todos are recreated:
 	Save error: WriteError({"code":11000,"index":0,"errmsg":"insertDocument :: caused by :: 11000 E11000 duplicate key error index: test-todo.todo.$_id_  dup key: { : ObjectId('519992d1e4b0ea5d049be645') }","op":{"_id":"519992d1e4b0ea5d049be645","text":"asd","done":false}})
 	Happend in old test-todo db.

(Bug#17) Server crashes when on localnet with multiple clients: database error [Error: connection closed]
	192.168.0.2: PUT /api/1/databases/test-todo/collections/todo
	database error [Error: connection closed]

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

(Bug#12) connection to the DB doesn't have a fail check and crashes the server when things aren't right.
(Bug#9) New route version doesn't route reloading. History and list pages fail. Adds list to (Bug#7)
(Bug#7) With new angular and locationProvider fails to reload history page. Not solved by redirect to history.html.
(Bug#6) Invalid date on history page in IE9.

// Future enhancements

- Add a print feature.
- Upgrade Bootstrap.
- Consider making the build manifest in JSON notation rather than string.
- Build the node_modules dependancies.
- Test preserving some global data so that it doesn't all get blown away and refreshed with $scope.
- Add unit testing. 
- Support Nook and other CORS defective browsers.
- Print a digest from the History page.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Minimize trips to server. Keep data cached between pages.
- Support authentication.
- Support multiple users.
- Support addvertisments.
- Dynamically provision new users.

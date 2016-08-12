Todos v0.4.2
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
- Dynamically assigns new users from a pool of pre-allocated DBs.
- Tested on: nook browser, iTouch, Safari, iPhone, chrome on Mac, chrome on widows, and IE.
- Responsive to three device sizes. Uses pills for navigation and a small menu.
- Has a conditional forward button that takes you to the next older archive if it exists.
- Routing supports browser back and deep linking to archives and any page. 
- Editing and deleting items in an archive.
- Editing and deleting archives.
- Rest apiPath is configurable.
- Login to /auth/local, with failure notification.
- Logs user name using a custom token of express (connect) logger.
- Displays a helpful message on empty todo or history lists.
- Displays a ```...loading...``` message while fetching data. 

#Deployments:
- TodoServer can be hosted on localhost, localnet and Modulus.
- Mongodb can be hosted on localhost, localnet, and MongoLab.
- All deployment knowledge is in make.js and build_props_files.

#Dependancies:
- Client depends on glyphicons, bootstrap, angular, and jquery.
- Server depends on express, passport, http, and mongojs.
- DB depends on MongoLab and modulus for production and local mongodb for dev.

#Backlog:
- Rename default collection "todo" to "today".
- Add unit testing.
- Upgrade to mongojs 2.0
- Consider making the build manifest in JSON notation rather than string.
- Minimize trips to server. Keep data cached between pages.
- Test preserving some global data so that it doesn't all get blown away and refreshed with ```$scope```.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Support addvertisments.
- Add a print feature.
- Print a digest from the History page.

### Version 0.4.2 Under Construction (1.13.2016)
- Added '...loading...' message while todo lists, and history load.
- Remove day of week from last year's archives.
- Documented (Bug#35) Todo server doesn't handle timeout.

### Version 0.4.1 (1.1.2016)
- Add google auth for production.
- Externalize GOOGLE api credentials.
- Tested Auth switching between environments.
- Added build for 127.0.0.1 to support local testing with google auth.
- Sends server environment to the client with the /acount method.
- Cleaned-up cosole log messages.
- Testing new DBs on modulus.

### Version 0.4.0 (12.26.2015)
- Seperated bugs and resolution info into bugs.md
- Fixed intercept function for auth failure in XHR calls.
- Added user-list.js module for managing use registration. Retires internal list.
- Deployed userList collection to mongoLab and externalized userDbName.
- Display mongodb host as wells as registered DB on welcome screen.
- Require DB authentication in production.
- Tested registering a db that doesn't exist. Works only with no auth.
- Fixed (Bug#33) by upgrading to bootstrap to 3.3.6.
- Deployed to modulus.

### Version 0.3.4 (12.22.15)
- Testing on localnet with multiple devices.
- Added logging user name.
- Fixed (Bug#25).
- Updated README.

### Version 0.3.3 (12.19.15)
- Documented and fixed (Bug#30) Don't send password to client.
- Added failure message on welcome page when login fails.
- Documented and fixed (Bug#29) Unexpected concatenation of routes.
- Documented and fixed (Bug#28) dbName undefined.
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
- Documented and fixed (Bug#26) Opening via get collections failed because of no dbUrl variable.

### Version 0.3.0 (12.2.2015)
- Fixing build and tagging v0.3.0. Major release because of all the dependancies that were upgrades.
- Server running 5.1.1.
- Rolled the devEnvironment back to node v4.2.2 and npm 2.14.7.
- Build the node_modules dependancies. Use npm install.
- Upgraded node and npm to the latest 5.1.0 and 3.3.12 respectively.
- Documented and corrected (Bug#22) Auth failures with mongolab using mongojs.
- Documented and corrected(Bug#20) DB_INSERT_ERR: MongoError: Invalid Operation, No operations in bulk.
- Documented and corrected (Bug#19) Event emitter leak.
- Documented and corrected (Bug#18) Duplicate objectID error.
- Deployed to nodjitsu
- Tested at merchants wifi. Worked from iPhone on AK's local area net.
- Made an attempt to fix (Bug#18). Hard to reproduce. Put the insert in the callback of the drop(), but noticed that dropping an empty collection resulted in an error so ignoring drop errors.
- Then completed the refatoring.
- Refactored to use express with minimal changes.
- Added "logDate" build prop to make bake step.
- Formated the logger output.
- Tested w/ Mongodb v3.0.1. Worked with upgraded mongjs.
- Added db to list for old version of mongo installed on katrinas-macbook-air.

###2.5
- Tested quite a bit on Linda's local net. Did not encounter (Bug#17) did git dublicate ID (Bug#18) once.
- Fixed (Bug#9) New route version doesn't route reloading. History and list pages fail. Adds list to (Bug#7)
- Fixed (Bug#7) With new angular and locationProvider fails to reload history page. Solved by redirecting to /#history and /#list.

###2.4
- Tested localnet build and run on kitchen-mac. Tested iPad, iTouch, IE 9 on windows, Chrome on windows, Chrome on Nook.
- Enhanced server to start based on nodeURL for port. No longer takes port argument.
- Server creates hundreds of connections. Fixed by making a global array. Working.
- Unable to duplicate the two DB bugs on local host in the car to WVA (2.13.15).
- Changed local host build from 127.0.0.1 to localhost.

###2.3
- Fixed (Bug#16) Update of existing todos in history list.
- Limit file server to only static files. Static server does NOT serve up the server files or the package.json file.
- Enhanced make.js to support the new file structure.

###2.2
- Merged with original 2.2 which added full editing mode in the history.

###2.1.3
- Use shelljs.sed to "bake" variables into the scripts. Keeping @ANT@ format.
- Newest bootstrap version 3.3.1. Didn't work. Went back.
- Further testing found two bugs (Bug#8) and (Bug#9)
- Work off-line better with local mongodb.
- Got getCollectionNames() and collection.drop() working on local host. Curious about the number of collections opening. That must be the mongojs library. I added close() to the method I tested.
- Interesting behavoir with the new route, reloading doesn't get "routed".
- Objective to leave ngResource unchanged (i.e. reproduce the REST API)
- Fixed (Bug#8) Drop collection fails to return (HTTP Pending).
- Fixed (Bug#13) Inserting an array to a collection doesn't have the expected behavior of replacing the collection.
- Fixed (Bug#11) Update to task fails.
- Fixed (Bug#15) The inserted data from the client doesn't preserve the mongo ObjectID.
- FIxed (Bug#10) two _id forms in db.

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
- Still one bug (Big#??). Today page is blank when routed to from History. -- Fixed by adding '/' after #.

###2.1
- Use node-static to serve up my static files.
- Load css files before scripts fixed BB bug. Found with Chrome audit feature.
- (Bug#4-Fixed) Nodejitsu hosted version fails the CSS on my BB bold. I believe I'm using the same style sheets as the working version. No way to debug it yet.
- Move DB key back to server and off the client.
- Client sets DB. Query string for archive delete method to pass in the DB name.
- (Bug#5-Fixed) Still failing on IE 9. IE dev tools don't help with this security error, but google did. Found the trick was to start the app w/ the /#/ version of the URL.

###2.0
- Enhanced todoServer.js to proxy mongo's REST api and allow non-CORS compliant browsers to access the data. Still need a place to host todoServer.js on Node. ie 9 can view the data, but it still broken from a style sheet prespective.
- Fixed (Bug#2) Doesn't work on IE or Nook, likely due to lack of CORS support. 
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
- Fixed (Bug#3) Archive forward button isn't pointing to next older archive.
- This release can't go to production because I need a place to host my node drop function.
- StaticServer is deco'd

###1.4:
- Deleting tasks in archives now works
- Hosted in node.js StaticServer.js @ http://desk-pc
- Refactored getArchiveList into it's own function and moved into service, mongolab.js.
- buildArchiveList used three times so it's now a function shared by three controllers.
- Refactor all DB access into the mongolab module.
- Fixed (Bug#1) Archive steps on previous archive data. 
- Tweaked html views with some &nbsp; to make the view a little nicer.

// Read Me
// Todos v1.5

Objective: Replace the weekly task list that I keep on paper.

// Curent features

- Manages a list of Todos (aka tasks).
- Persists Todo data in the cloud (mongolabs.com) using angular's $http service and mongolabs REST APIs.
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

// Work done in previous release

- Deleting tasks in archives now works
- Hosted in node.js StaticServer.js @ http://desk-pc
- Refactored getArchiveList into it's own function and moved into service, mongolab.js.
- buildArchiveList used three times so it's now a function shared by three controllers.
- Refactor all DB access into the mongolab module.
- (Bug#1) Archive has been fixed by merging any newly completed tasks into the archive for the same day if it exists.
- Tweaked html views with some &nbsp; to make the view a little nicer.

// Work done in this release

- Merge Node v0.4 MongoApp drop collection code into StaticServer and rename as todoServer
- Change mongolab.js to add a dropArchive function.
- (Bug#3) When archive creates a new file the forward button still points to the previous archive. Should be updated on the save.
- This release can't go to production because I need a place to host my node drop function.
- StaticServer is deco'd
- 

// Known bugs next Bug#4

- (Bug#2)Doesn't work on IE or Nook, likely due to lack of CORS support. Need to consider JSONP. Changes hosting requirements.

// Future enhancements

- Test preserving some global data so that it doesn't all get blown away and refreshed with $scope.
- Remove archives from the archive list. I can empty a collection w/ MonogRest api but not delete it.
- Add unit testing.
- Support Nook and other CORS defective browsers.
- Print a digest from the History page.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Minimize trips to server. Keep data cached between pages.
- Work off-line better.
- Support authentication.
- Support multiple users.
- Support addvertisments.

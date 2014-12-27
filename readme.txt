// Read Me
// Todos v1.2

Objective: Replace the weekly task list that I keep on paper.

// Curent features

- List of Todos.
- Persist data in the cloud (mongolabs.com) using angular's $http service and mongolabs REST APIs.
- Archive - Save's list after removing items where done:true. Saves at most one Archive per day based on the date. Has the annoying affect of forgetting all the taskes that were completed and archived that day.
- Add - Adds a new task to the list with done:false; Saves the new task to the DB.
- Checkbox - When checked: done:true; Item's text is displayed as strike-through; Saves the item to the DB.
- History - Is lets you review old items from the archive.
- Delete icon - Deletes a task from the list. Delete icon and complete checkbox are hidden or shown based on (edit==true).
- Hosted at http://192.168.1.11 with tinywed http server.
- Host the service on the web so I can use it at work. (yodertv.com)
- Tested on nook browser, iTouch, Safari, chrome on Mac, chrome on widows, and IE (fails because it requires CORS). Worked once on Nook.
- Depends on bootstrap, angular, and jQuerry.
- Has a custom icon.
- 

// Bugs fixed
- History list is invalid date because of date constructer defect in non-chrome browsers.
- Date constructor with "-" (dashes) only works on Chrome. History display has invalid date.
- Free site only allows three pages. Removed list.html and reused todos.html with multiple controllers.
- Save - Save's list replacing the existing list on the server. No longer needed because each edit is saved.

// Known bugs

- Archive has the annoying affect of forgetting all the tasks that were completed and archived that day. This should be fixed by merging any new tasks into the current archive for the same day if it exists.
- Doesn't work on IE or Nook, likely due to lack of CORS support.

// Future enhancements

- Set width when in browser so the date isn't so far to the right on a large screen
- Support Nook.
- Remove Save button. Items are now saved as they are changed.
- Print a digest from the History page.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Support authentication.
- Support multiple users.
- Support addvertisments.
- Fix archive bug: Such that tasks completed since archiving on the same day will be added to the current archive without deleting the existing completed items

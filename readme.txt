// Read Me
// Todos v1.3

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
- Has a custom favicon.
- 

// Bugs fixed in this release
- (Bug#3) Fixed error completing or deleting a newly entered text by getting the return object from the POST.

// Enhancements made in this release
- Handle screen widths better.
- Uses tables for better looking list displays.
- Use pills for navigation istead of buttons.
- Moved remaining count to bottom by the add new task input.
- Removed the "Add" button. Enter key causes submit.
- Added forward button takes you to the next older archive. Use back arrow to return to the previous archive. Button disappears when display the last archive.

// Known bugs

- (Bug#1) Archive has the annoying affect of forgetting all the tasks that were completed and archived that day. This should be fixed by merging any new tasks into the current archive for the same day if it exists.
- (Bug#2)Doesn't work on IE or Nook, likely due to lack of CORS support. Need to consider JSONP. Changes hosting requirements.
- (Bug#3)Deleting a task immediately after entering it doesn't work, because the OID isn't retrived from the DB after it has been entered. The work around is to delete it again after refreshing the list. Now it has the OID so the delete function works. Presumably marking a task completed will also fail. Fixed in this release

// Future enhancements

- Set width when in browser so the date isn't so far to the right on a large screen. Decided to remove the date instead.
- Support Nook.
- Print a digest from the History page.
- Keep common tasks. These should be replenished everytime the list is archived.
- Give the user a way to edit the list of repeating tasks.
- Support authentication.
- Support multiple users.
- Support addvertisments.

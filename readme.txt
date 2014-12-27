// Read Me
// Todos v1

Objective: Replace the weekly task list that I keep on paper.

// Curent features
First version from Angular with my on mongolabs DB.

// Bugs

- History list is invalid date because of date constructer defect in non-chrome browsers.
- Date constructor with "-" (dashes) only works on Chrome. History display has invalid date.
- Free site only allows three pages. Removed list.html and reused todos.html with multiple controllers.
- Save - Save's list replacing the existing list on the server. No longer needed because each edit is saved.

// Known bugs

- Archive has the annoying affect of forgetting all the tasks that were completed and archived that day. This should be fixed by merging any new tasks into the current archive for the same day if it exists.
- Doesn't work on IE or Nook, likely due to lack of CORS support.

// Future enhancements

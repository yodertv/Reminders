Test Cases Client Side
======================

- Logon
- Logon with registration
	- Available DBs
	- No DBs available
	- Registered db doesn't exist
- Welcome/About page logged in
	- local auth
	- google auth
- Welcome/About page logged out
	- local auth
	- google auth
- Menu: Welcome, Reminders, Lists, Logout
- Logout:
	- local auth
	- google auth
	- Logout from Google too
	- Logout from each page menu and each logout button
- Auth/local test login and login failure
- Add task:
 	- text input stays below last added until reaching the bottom of the screen
 	- It should stay there after that
- Complete task checkbox and strike-through decoration
- Show Completed / Hide Completed
- Edit / Delete tasks for list items
- Delete lists
- Next list navication button ">"
- Next list button wraps around and continues through each list again
- Deep linking to lists and welcome page

Test Cases API
==============

|  API Method | Path | Auth Redirect |     Description |
|--|--|--|--|
|app.get | '/auth/google' | None | |
|app.get | '/auth/google/callback' | None | |
|app.get | '/logout' | ensureAuthRedirect | |
|app.get | '/account' | None | |
|app.get | '/welcome' | None | |
|app.get | '/authfailed' | None | |
|app.get | '/list' | ensureAuthRedirect | |
|app.get | '/list/:*'| ensureAuthRedirect | |
|app.get | apiPath | ensureAuth401 | |
|app.get | apiPath + '*' | ensureAuth401 | |
|app.put | apiPath + '*' | ensureAuth401 | Drop and replace an existing collection with json array in body|
|app.post |'/auth/local' | None | Check username and password from form data |
|app.post | apiPath + '*' | ensureAuth401 | Inserts a validated list item (todo) parsed from req data into the collection |
|app.del | apiPath + '*' | ensureAuth401 | |
|app.all | apiPath + '*/[A-Fa-f0-9]{24}$' | ensureAuth401 | |
|app.all | '*' | None | |


```

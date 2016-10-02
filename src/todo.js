/* todos.js @VERSION@ /*
/* Controllers */
'use strict';

// angular 1.3 splits route 
var todo = angular.module('todo', [
	'ngRoute', 
	'TodoServices'
]);	

todo.config(['$routeProvider',
	function($routeProvider) {
    	$routeProvider.
  	  		when('/list/:archiveName', 	{templateUrl: 'todo.html', controller: TodoCtrl}).
      		when('/history',           	{templateUrl: 'history.html', controller: HistoryCtrl}).
      		when('/welcome',           	{templateUrl: 'welcome.html', controller: WelcomeCtrl}).
      		when('/authfailed',		   	{templateUrl: 'welcome.html', controller: WelcomeCtrl}).
      		when('/',            		{redirectTo:  '/list/:todo'}).
      		otherwise(				   	{redirectTo:  '/welcome'});
	}]);

todo.config(function($locationProvider){ $locationProvider.html5Mode(true) });

function WelcomeCtrl($scope, $location, UserService) {

	$scope.logout = function() {
  		// Print this archive list.
  		console.log("Logout called. Logoutfromgoogle?",$scope.logoutfromgoogle, ".");
  		UserService.logout($scope.logoutfromgoogle, function(){
  			// Clear user data w/o depending on another call to /account.
  			$scope.authenticated = false;
  			$scope.user = undefined;
  			$scope.failedCount = 0;
  		});
  	}

	// console.log("location=", $location.path());
	$scope.production = true;
	$scope.logoutfromgoogle = false;
	$scope.authenticated = false;
	$scope.registered = false;
	if ($location.path() == '/authfailed') {
		$scope.authFailed = true;
		$scope.authFailedMsg = "User ID or password incorect. Try again."
	 };

	$scope.user = UserService.get( function(user){
		// console.log(user);
		$scope.authenticated = (user.email != undefined);
		$scope.registered = (user.db != undefined);
		$scope.production = (user.env != "DEV")
		// console.log("authenticated=", $scope.authenticated);
		// console.log("registered=", $scope.registered);
		// console.log("failedCount=", $scope.failedCount);
	});
}

function buildArchiveList(data, $scope, name) { 

    // Builds the sorted list of $scope.archives, sets nextArchiveName and showNext view element 
    // from the set of collections in DBString that start with "todo" for the scope passed in and the current name.
    // When no name is included set nextArchiveName to the first archive. Intended to be used in the callback 
    // function for getArchiveList();

	var today = new Date();
	var d = new Date(); // Does putting this constructor out of the loop below have any benefit?
	var currArchive = {};

	// The data has all collections in the DB. So we filter out the collections that start w/ "system" using regex.
	// Zero out the current array of archives in scope.
	$scope.archives=[];
	angular.forEach(data, function(item) {
		if (/^system./.test(item)) {
			return;
		} else {
			$scope.archives.push({
			  "archiveName" : item,
			  "displayName" : item,
			  "date" : d
			});
		}
	});	
	
	// console.log($scope.archives);
	// Now that the default list is part of the archive need to point to the next one. 
	var nextIndex = $scope.archives.indexOf(currArchive) + 2; // Handily, the indexOf an undefined object is -1. 

	if (nextIndex >= $scope.archives.length) {
		// console.log("Hide Next.");
		$scope.showNext="hidden" // Hide the next button on the last archive
	} 
	else {
		$scope.nextArchiveName = $scope.archives[nextIndex].archiveName;
		$scope.showNext="visible";
	};
}

function HistoryCtrl($scope, $location, Todo) {  
	// Uses history.html.

	$scope.print = function() {
  		// Print this archive list.
  		console.log("Print called.")
  	}
	
	$scope.homeClick = function() {
		$location.path('/');
	};

	$scope.editClick = function() {
		// Edit button toggles between edit and not.
		if (!$scope.showDelete) { // If not in edit mode switch to it.
			$scope.showDelete = true;
		}
		else {
			$scope.showDelete = false;
		}
	};

	$scope.delete = function() {
  		// Delete this archive.
  		var index = $scope.archives.indexOf(this.item);
  		var arch = this.item.archiveName;
  		// console.log("In HistoryCtrl delete method. Deleting:", arch);
  		$scope.archives.splice(index,1); // Remove it from the model.
  		Todo.dropArchive(arch, function() {
  			// console.log("dropArchive returned");
  		}); // Remove it from the DB
  		if ( index == 0 ) { // We deleted the one our next pointer was pointing too.
  			if ($scope.archives.length > 0) {
	  			$scope.nextArchiveName = $scope.archives[0].archiveName;
  			} else { 
  			    $scope.nextArchiveName == undefined;
  				$scope.showNext="hidden";
  			}
  		}
  	}
	$scope.showNext="hidden";
	$scope.showDelete = false;
	$scope.activeHistory = "active";
	$scope.archives=[];
	$scope.archives[0] = { archiveName : "", displayName : "..loading.." } ; 
	Todo.getArchiveList(function(data) {
  		buildArchiveList(data, $scope); // These are displayed in HistoryCtrl
	});
}

function TodoCtrl($scope, $routeParams, Todo) {
	// Uses todo.html
	// This is the home page. Show current Todos. Hide other stuff	

	$scope.addTodo = function() {
		var obj = { text:$scope.todoText, done:false, showInView:true };
		$scope.todoText = ''; // clear text field for next todo
		Todo.save({todo:"todo"}, obj,  function(returnObj, httpHeader) {
			// console.log(returnObj);		
			$scope.todos.splice($scope.addIndex++, 0, {	
				"text" : returnObj.text, 
				"done" : returnObj.done, 
				"showInView" : returnObj.showInView, 
				"_id" : returnObj._id
			});
    	});
	};	
		
	$scope.delete = function() {
		var index = $scope.todos.indexOf(this.todo);
		//	console.log(index)
		$scope.todos.splice(index,1); // remove from memory
		// Todo.remove({todo: "todo", id: this.todo._id.$oid}); // remove from db line had to be changed.
		Todo.remove({todo : $scope.archiveName, id : this.todo._id}); // remove from db
		// Leave edit mode when no more todos.
		if ( $scope.todos.length == 0 ) { $scope.showDelete = false };

	};

	$scope.update = function() {
		// console.log("Update", this.todo);
		// Call update for this object ID, after removing the _id from my object using extend. ID will be in the URL.
		Todo.update({todo : $scope.archiveName, id : this.todo._id}, angular.extend({}, this.todo, {_id:undefined}));
	};

	$scope.showTaskItem = function(item) {
		// Logic to show and hide items in the view.
		if ( $scope.showCompleted ) {
			return true;
		} else {
			return item.showInView;
		}	
	};

	$scope.editClick = function() {
		// Edit button toggles between "Edit" and "Done".
		if (!$scope.showDelete) { // If not in edit mode switch to it.
			$scope.showDelete = true;
			$scope.editMode = "active"
		}
		else {
			$scope.showDelete = false; 
			$scope.editMode = "default" // not active
		}
	};
	
	$scope.togleShowCompleted = function() {
		// Change the flag, and 
		$scope.showCompleted = !$scope.showCompleted;
		// Clear any completed tasks from view and move them to the end when we turn showCompleted off.
		if (!$scope.showCompleted) {		
			var oldTodos = $scope.todos;
			$scope.addIndex = 0;
			$scope.todos = [];
			$scope.showCompletedLabel = "Show Completed";
			angular.forEach(oldTodos, function(todo) {
				todo.showInView = !todo.done;
				if (!todo.done) {
					$scope.todos.splice($scope.addIndex++, 0, todo);
				} else {
					$scope.todos.push(todo);
				}
			});

			// Write the this new list back to the server.
			Todo.saveTodos($scope.todos);
		}
		else {
			$scope.showCompletedLabel = "Hide Completed";
		}
	};

	$scope.homeClick = function() {
		// Switch Delete mode when going between edit and home.
		if ($scope.showDelete) { 
			$scope.showDelete = false;
		}
	};
	
	$scope.remaining = function() {
		var count = 0;
//		var index = 0;
		angular.forEach($scope.todos, function(todo) {
//			index++;
			if ( todo.done == false ) {
				count++;
//				$scope.addIndex = index; // Set the addTodo insert point at the last uncompleted task in the list.
			}
		});
		return count;
	};
 

 // Need to rewrite as the create new list.

	$scope.archive = function() {
		if ($scope.todos.length == 0) return;  	
 		var today = new Date();  
 		var archiveName = "todo" + today.toDateString().replace(/ /g, "-"); // Build an archive name from today's date.
		var oldTodos = $scope.todos;

		if ($scope.nextArchiveName == archiveName) { // Today's archive already exists.
			//merge done items into nextArchive;
			angular.forEach(oldTodos, function(todo) {
	      		if (todo.done) {
	      			// Call update for this object ID, after removing the _id from my object using extend. ID will be in the URL.
					// Todo.update({todo: archiveName, id: todo._id.$oid}, angular.extend({}, todo, {_id:undefined}));
	      			Todo.update({todo : archiveName, id : todo._id}, angular.extend({}, todo, {_id : undefined}));
      			}
	      	})
      	}
		else {  // Create a new archive.

			Todo.saveTodos($scope.todos, archiveName);
			$scope.archives.unshift({
				"archiveName" : archiveName,
				"displayName" : today.toDateString().replace(today.getFullYear(), ""),
				"date" : today
			})
			$scope.nextArchiveName = archiveName; // Update nextArchiveName to be this new one.
			$scope.showNext = "visible"; // Force the next button to be visible.
		}	
		
		// Remove the completed tasks by erasing the list of todos and copying only the not done tasks from oldTodos.
    	
    	$scope.todos = [];
    	angular.forEach(oldTodos, function(todo) {
      		if (!todo.done) $scope.todos.push(todo);
    	});

    	// Here's where I might add back in the default items.
		
		Todo.saveTodos($scope.todos);	 // Overwrite the todos list with the new lists.
  	} 
	// Initialize scope variables
	$scope.activeHome = "default";
	$scope.showNewTask = true;
 	$scope.showDelete = false;
 	$scope.editMode = "default"
 	$scope.showCompleted = false;
 	$scope.showCompletedLabel = "Show Completed";
 	$scope.addIndex = 0;
 	
 	$scope.todos = [];
 	$scope.todos[0] = { done : false, text : "...loading..." };
 	$scope.label = "Reminders";

 	var name = "todo"; // Defualt reminder list name.

 	if ($routeParams.archiveName) {
	 	name = $routeParams.archiveName.replace(/:/,""); // Didn't expect the ":"
	}
	$scope.archiveName = name;
	$scope.label = name;

 	$scope.showNext="hidden";

	Todo.getTodos(name, function(data){
		$scope.todos = [];
		$scope.addIndex = 0;

		angular.forEach(data, function(todo) {
			if (todo.showInView) {
				$scope.todos.splice($scope.addIndex++, 0, todo);
			} else {
				$scope.todos.push(todo);
			}
		});	
	})

	Todo.getArchiveList(function(data) {
		buildArchiveList(data, $scope); // Needed to support the next button.
	});
}
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
      		when('/todo',              {templateUrl: 'todo.html', controller: TodoCtrl}).
  	  		when('/list/:archiveName', {templateUrl: 'list.html', controller: ListCtrl}).
      		when('/history',           {templateUrl: 'history.html', controller: HistoryCtrl}).
      		when('/welcome',           {templateUrl: 'welcome.html', controller: WelcomeCtrl}).
      		otherwise(				   {redirectTo:  '/welcome'});
	}]);

todo.config(function($locationProvider){ $locationProvider.html5Mode(true) });

function WelcomeCtrl($scope, UserService) {

	$scope.logout = function() {
  		// Print this archive list.
  		console.log("Logout called. Logoutfromgoogle?",$scope.logoutfromgoogle, ".");
  		UserService.logout($scope.logoutfromgoogle, function(){
  			// Clear user data w/o depending on another call to /account.
  			$scope.authenticated = false;
  			$scope.user = undefined;
  		});
  	}

	$scope.user = UserService.get( function(user){
		// console.log(user);
		$scope.authenticated = (user.id != undefined);
		$scope.registered = (user.mongoDB != undefined);
		
		// console.log("authenticated=", $scope.authenticated);
	});
	$scope.logoutfromgoogle = false;

//    $scope.lastname = UserService.lastname;
}

function buildArchiveList(data, scope, name) { 

    // Builds the sorted list of $scope.archives, sets nextArchiveName and showNext view element 
    // from the set of collections in DBString that start with "todo" for the scope passed in and the current name.
    // When no name is included set nextArchiveName to the first archive. Intended to be used in the callback 
    // function for getArchiveList();

	var today = new Date();
	var d = new Date(); 		// Does putting this constructor out of the loop below have any benefit?
	var currArchive = {};

	// The data has all collections in the DB. So we filter for only the collections that start w/ todo using regex.
	var archs = data.filter(function(item){ return /^todo[SMTWF]/.test(item) });

	scope.archives=[]; // Zero out the current array of archives in scope.

	for (var i=0;i<archs.length;i++) {
		var archstr = archs[i].replace("todo", ""); 

		// Only Chrome grocks dashes in date constructor. E.g. Sun-3-dec-2012 fails in most other browsers.
		d = new Date(archstr.replace(/-/," ")); 

		scope.archives[i] = {
		  "archiveName" : archs[i],
		  "displayName" : d.toDateString().replace(today.getFullYear(), ""),
		  "date" : d
		};
		if (name===archs[i]) { currArchive = scope.archives[i]}; // Find the one we're listing. Name may be undefined.
	}
	// Sort by reverse date
	scope.archives.sort( function(a,b){return b.date - a.date} );

	var nextIndex = scope.archives.indexOf(currArchive) + 1; // Handily, the indexOf an undefined object is -1

	if (nextIndex >= scope.archives.length) {
		scope.showNext="show-false" // Hide the next button on the last archive
	} 
	else {
		scope.nextArchiveName = scope.archives[nextIndex].archiveName;
		scope.showNext="show-true";
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
  		console.log("In HistoryCtrl delete method. Deleting:", arch);
  		$scope.archives.splice(index,1); // Remove it from the model.
  		Todo.dropArchive(arch, function() {
  			// console.log("dropArchive returned");
  		}); // Remove it from the DB
  		if ( index == 0 ) { // We deleted the one our next pointer was pointing too.
  			if ($scope.archives.length > 0) {
	  			$scope.nextArchiveName = $scope.archives[0].archiveName;
  			} else { 
  			    $scope.nextArchiveName == undefined;
  				$scope.showNext="show-false";
  			}
  		}
  	}
	$scope.showNext="show-false";
	$scope.showDelete = false;
	Todo.getArchiveList(function(data) {
  		buildArchiveList(data, $scope); // These are displayed in HistoryCtrl
	});
}

function ListCtrl($scope, $location, $routeParams, Todo) {  
	// Uses list.html

 	$scope.print = function() {
  		// Print this archive list.
  		console.log("Print called.")
  	}
	
	$scope.getList = function(name) {
 		if(name == null) { return name; };
 		$scope.todos = Todo.getList(name);
 		$scope.archiveName = name;
		var d = new Date(name.replace(/todo/,"").replace(/-/," "));
		$scope.label = d.toDateString().replace(d.getFullYear(), "");
	}

	$scope.delete = function() {
		var index = $scope.todos.indexOf(this.todo);
		$scope.todos.splice(index,1);
		// Todo.remove({todo: $scope.archiveName, id: this.todo._id.$oid});
		Todo.remove({todo: $scope.archiveName, id: this.todo._id});
	};

	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};

	$scope.update = function() {
		// console.log("Update", this.todo);
		// Call update for this object ID, after removing the _id from my object using extend. ID will be in the URL.
		Todo.update({todo: $scope.archiveName, 	id: this.todo._id}, angular.extend({}, this.todo, {_id:undefined}));
	};

	$scope.homeClick = function() {
		$location.path('/todo');
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

  	var name = $routeParams.archiveName.replace(/:/,""); // Didn't expect the ":"
	
	$scope.getList(name);

	// $scope.getArchives(name);
	Todo.getArchiveList(function(data) {
		buildArchiveList(data, $scope, name);
	});

	$scope.showDelete = false; // Put us in delete mode so we remove items from history. Shouldn't change that it's done.
	$scope.showList = true;
	$scope.activeHome = ""; 
	$scope.activeList = "active";
	$scope.activeHistory = "show-false";
	$scope.showNewTask = false;
}

function TodoCtrl($scope, Todo) {
	// Uses todo.html
	// This is the home page. Show current Todos. Hide other stuff	

	$scope.addTodo = function() {
		var obj = {text:$scope.todoText, done:false};
		$scope.todoText = ''; // clear text field for next todo
		Todo.save({todo:"todo"}, obj,  function(returnObj, httpHeader) {
			// console.log(returnObj);		
			$scope.todos.push({"text" : returnObj.text, "done" : returnObj.done, "_id" : returnObj._id});
    	});
	};	
		
	$scope.delete = function() {
		var index = $scope.todos.indexOf(this.todo);
		//	console.log(index)
		$scope.todos.splice(index,1); // remove from memory
		// Todo.remove({todo: "todo", id: this.todo._id.$oid}); // remove from db line had to be changed.
		Todo.remove({todo: "todo", id: this.todo._id}); // remove from db
	};

	$scope.update = function() {
		// console.log("Update :", this.todo);
		// Call update for this object ID, after removing the _id from my object using extend. ID will be in the URL.
		Todo.update({todo: "todo", 	id: this.todo._id}, angular.extend({}, this.todo, {_id:undefined}));
	};

	$scope.editClick = function() {
		// Edit button toggles between Home (Today) and edit.
		if (!$scope.showDelete) { // If not in edit mode switch to it.
			$scope.showDelete = true;
		}
		else {
			$scope.showDelete = false; 
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
		angular.forEach($scope.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};
 
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
	      			Todo.update({todo: archiveName, id: todo._id}, angular.extend({}, todo, {_id:undefined}));
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
			$scope.showNext = "show-true"; // Force on the next button.
		}	
		
		// Remove the completed tasks by erasing the list of todos and copying only the not done tasks from oldTodos.
    	
    	$scope.todos = [];
    	angular.forEach(oldTodos, function(todo) {
      		if (!todo.done) $scope.todos.push(todo);
    	});

    	// Here's where I'll add back in the default items.
		
		Todo.saveTodos($scope.todos);	 // Overwrite the todos list with the new lists.
  	} 
	
	$scope.activeList = "show-false";
	$scope.activeHome = "active";
	$scope.showNewTask = true;
 	$scope.showDelete = false;
 	$scope.todos = Todo.getList();
 	$scope.showNext="show-false";

	Todo.getArchiveList(function(data) {
		buildArchiveList(data, $scope); // Needed to support the next button.
	});
}
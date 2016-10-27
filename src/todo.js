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
  	  		when('/', 					{templateUrl: 'todo.html', controller: TodoCtrl}).
      		when('/list',           	{templateUrl: 'list.html', controller: ListCtrl}).
      		when('/welcome',           	{templateUrl: 'welcome.html', controller: WelcomeCtrl}).
      		when('/authfailed',		   	{templateUrl: 'welcome.html', controller: WelcomeCtrl}).
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
  			$scope.registered = false;
  			$scope.user = undefined;
  			$scope.failedCount = 0;
  		});
  	}

	// console.log("location=", $location.path());
	$scope.footerSize = 'short';
	$scope.production = true;
	$scope.logoutfromgoogle = false;
	$scope.authenticated = false;
	$scope.registered = false;
	$scope.noOfLists = 5; // Need to get collections here and count them for this to be correct.
	if ($location.path() == '/authfailed') {
		$scope.authFailed = true;
		$scope.authFailedMsg = "User ID or password incorect."
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

function buildArchiveList(data, $scope) { 
    // Builds the set of lists the user has create and stores them in $scope.archives, sets nextArchiveName and showNext view element 
    // from the set of collections in DBString for the scope passed in and the current name.
    // When no name is included set nextArchiveName to the first archive. Intended to be used in the callback 
    // function for getArchiveList();
	// The data has all collections in the DB. So we filter out the collections that start w/ "system" using regex.
	var	nextIndex = 0;
	$scope.archives=[]; 	// Zero out the current array of archives in scope.
	
	angular.forEach(data, function(item) {
		if (/^system./.test(item) || /^objectlabs./.test(item)) {
			return;
		} else {
			$scope.archives.push(decodeURI(item));
		}
	});	
	
	// console.log($scope.archives);
	if ($scope.archives.length <= 1) { 
		$scope.showNext="hidden" 
	}		
	else {
		var nextIndex = $scope.archives.indexOf($scope.archiveName) + 1;
		if (nextIndex >= $scope.archives.length) { // Wrap back to the begining.
			nextIndex = 0;				
		} 
		$scope.nextArchiveName = $scope.archives[nextIndex];
		$scope.showNext="visible";
	};
}

function ListCtrl($scope, $location, Todo, $document) {  
	// Uses list.html.

	$scope.searchTodos = function() {
		console.log("searchTodos called with search string: ", $scope.todoSearchText);
	};

	$scope.addNewList = function() {
		console.log("addNewList called with new name: ", $scope.newListText);
		$location.path( '/list/:' + $scope.newListText); // Navigate to the todos page for this list.
		$scope.newListText = ""; // Clear the imput field.
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

	$scope.deleteList = function($document) {
  		// Delete this archive.
  		var index = $scope.archives.indexOf(this.item);
  		var arch = this.item;
  		// console.log("In ListCtrl delete method. Deleting:", arch);
  		$scope.archives.splice(index,1); // Remove it from the model.
  		Todo.dropArchive(arch, function() {
  			// console.log("dropArchive returned");
  		}); // Remove it from the DB
  		if ( index == 0 ) { // We deleted the one our next pointer was pointing too.
  			if ($scope.archives.length > 0) {
	  			$scope.nextArchiveName = $scope.archives[0];
  			} else { 
  			    $scope.nextArchiveName == undefined;
  				$scope.showNext="hidden";
  			}
  		}
  		if ($scope.archives.length < $scope.tableSize) {
  			$scope.footerSize = "short";
			$timeout(function() {
				//console.log('Setting focus short.');
				angular.element($document[0].querySelector('#focusShort')).focus();
	  		});
  		} else {
  			$scope.footerSize = "tall";
			$timeout(function() {
				//console.log('Setting focus tall.');
				angular.element($document[0].querySelector('#focusTall')).focus();
			});
  		}
  	}

	$scope.footerSize = 'short';
	$scope.showNext="hidden";
	$scope.showDelete = false;
	$scope.archives=[];
	$scope.newListText = "";
	$scope.todoSearchText = "";
	$scope.archives[0] = "..loading..";
 	$scope.tableSize = Math.trunc(($document.height() - 108) / 48);
 	console.log("tableSize=", $scope.tableSize);

	Todo.getArchiveList(function(data) {
  		buildArchiveList(data, $scope); // These are displayed in ListCtrl
		if ($scope.archives.length < $scope.tableSize) {
			$scope.footerSize = "short";
			$timeout(function() {
				//console.log('Setting focus short.');
				angular.element($document[0].querySelector('#focusShort')).focus();
	  		});
		} else {
			$scope.footerSize = "tall";
			$timeout(function() {
				//console.log('Setting focus tall.');
				angular.element($document[0].querySelector('#focusTall')).focus();
			});
		}
	});
}

function TodoCtrl($scope, $routeParams, Todo, $timeout, $document) {
	// Uses todo.html
	// This is the home page. Show current Todos. Hide other stuff	
	$scope.addTodo = function() {
		var obj = { text:$scope.todoText, done:false, showInView:true };
		$scope.todoText = ''; // clear text field for next todo
		Todo.save({todo: $scope.archiveName }, obj,  function(returnObj, httpHeader) {
			// 	console.log(returnObj);		
			$scope.todos.splice($scope.addIndex++, 0, {	
				"text" : returnObj.text, 
				"done" : returnObj.done, 
				"showInView" : returnObj.showInView, 
				"_id" : returnObj._id
			});
			if ($scope.addIndex < $scope.tableSize) {
				$scope.footerSize = "short";
				$timeout(function() {
					//console.log('Setting focus short.');
					angular.element($document[0].querySelector('#focusShort')).focus();
		  		});
			} else {
				$scope.footerSize = "tall";
				$timeout(function() {
					//console.log('Setting focus tall.');
					angular.element($document[0].querySelector('#focusTall')).focus();
				});
			}
    	});
	};
		
	$scope.delete = function() {
		var index = $scope.todos.indexOf(this.todo);
		if (index <= $scope.addIndex) { $scope.addIndex-- };
		// console.log($scope.addIndex);
		$scope.todos.splice(index,1); // remove from memory
		Todo.remove({todo : $scope.archiveName, id : this.todo._id}); // remove from db
		// Leave edit mode when no more todos.
		if ( $scope.todos.length == 0 ) { $scope.showDelete = false };
		if ($scope.addIndex < $scope.tableSize) {
			$scope.footerSize = "short";
			$timeout(function() {
				//console.log('Setting focus short.');
				angular.element($document[0].querySelector('#focusShort')).focus();
	  		});
		} else {
			$scope.footerSize = "tall";
			$timeout(function() {
				//console.log('Setting focus tall.');
				angular.element($document[0].querySelector('#focusTall')).focus();
			});
		}
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
			var count = 0;
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
			Todo.saveTodos($scope.todos, $scope.archiveName);
			// Set footer toggle
			if ( $scope.addIndex < $scope.tableSize) {
				$scope.footerSize = "short";
				$timeout(function() {
					//console.log('Setting focus short.');
					angular.element($document[0].querySelector('#focusShort')).focus();
		  		});
			} else {
				$scope.footerSize = "tall";
				$timeout(function() {
					//console.log('Setting focus tall.');
					angular.element($document[0].querySelector('#focusTall')).focus();
				});
			}
		}
		else {
			$scope.showCompletedLabel = "Hide Completed";
			if ( $scope.todos.length < $scope.tableSize) {
				$scope.footerSize = "short";
				$timeout(function() {
					//console.log('Setting focus short.');
					angular.element($document[0].querySelector('#focusShort')).focus();
		  		});
			} else {
				$scope.footerSize = "tall";
				$timeout(function() {
					//console.log('Setting focus tall.');
					angular.element($document[0].querySelector('#focusTall')).focus();
				});
			}
		
		}
	};

	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.todos, function(todo) {
			if ( todo.done == false ) {
				count++;
			}
		});
		return count;
	};
 
	// Initialize scope variables
	$scope.activeHome = "default";
	$scope.showNewTask = true;
 	$scope.showDelete = false;
 	$scope.editMode = "default"
 	$scope.showCompleted = false;
 	$scope.showCompletedLabel = "Show Completed";
 	$scope.addIndex = 0;
 	$scope.footerSize = "short";
 	$scope.tableSize = Math.trunc(($document.height() - 108) / 48);

 	console.log("tableSize=", $scope.tableSize);

 	$scope.todos = [];
 	$scope.todos[0] = { done : false, text : "...loading..." };

 	var name = "todo"; // Defualt reminder list name.

 	if ($routeParams.archiveName) {
	 	name = $routeParams.archiveName.replace(/:/,""); // Didn't expect the ":"
	}
	$scope.archiveName = name;
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
		if ($scope.addIndex < $scope.tableSize) {
			$scope.footerSize = "short";
			$timeout(function() {
				//console.log('Setting focus short.');
				angular.element($document[0].querySelector('#focusShort')).focus();
	  		});
		} else {
			$scope.footerSize = "tall";
			$timeout(function() {
				//console.log('Setting focus tall.');
				angular.element($document[0].querySelector('#focusTall')).focus();
			});
		}
	});

	Todo.getArchiveList(function(data) {
		buildArchiveList(data, $scope); // Needed to support the next button.
	});
}
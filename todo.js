/* Todos.js v1.3
/* Controllers */
'use strict';

angular.module('todo', ['mongolab']).config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:TodoCtrl, templateUrl:'todo.html'}).
  	  when('/list/:archiveName', {controller:ListCtrl, templateUrl:'todo.html'}).
      when('/history', {controller:HistoryCtrl, templateUrl:'history.html'}).
      otherwise({redirectTo:'/'});
  });

function excludeHash(key, value) {
    if (key === "$$hashKey") {
    	return undefined
    }
    return value;
}

function HistoryCtrl($scope, $http) {  
	// Uses hitory.html.
	var today = new Date();

	$scope.getArchives = function() {
  	$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data) {
		
			// filter for only the collections that start w/ todo using regex.
			var archs = data.filter(function(item){ return /^todo[SMTWF]/.test(item) });
			$scope.archives = [];
			var d = new Date();
			for (var i=0;i<archs.length;i++) {
				var archstr = archs[i].replace("todo", ""); 

				// Only Chrome grocks dashes in date constructor. E.g. Sun-3-dec-2012 fails.
				d = new Date(archstr.replace(/-/," ")); 
				$scope.archives[i] = {
					"archiveName" : archs[i],
					"displayName" : d.toDateString().replace(today.getFullYear(), ""),
					"date" : d
				};
			}

			// Sort by reverse date
			$scope.archives.sort( function(a,b){return b.date - a.date} );
			$scope.nextArchiveName = $scope.archives[0].archiveName;
		});
  }
	$scope.activeList = "show-false";
	$scope.getArchives();
}

function ListCtrl($scope, $location, $routeParams, $http) {  
	//console.log("Entering ListCntrl");
	var today = new Date();
	$scope.getArchives = function(name) {
  	$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data) {
					// filter for only the collections that start w/ todo using regex.
			var archs = data.filter(function(item){ return /^todo[SMTWF]/.test(item) });
			$scope.archives=[];
			var d = new Date();
			var currArchive = {};

			for (var i=0;i<archs.length;i++) {
				var archstr = archs[i].replace("todo", ""); 

				// Only Chrome grocks dashes in date constructor. E.g. Sun-3-dec-2012 fails.
				d = new Date(archstr.replace(/-/," ")); 


				$scope.archives[i] = {
					"archiveName" : archs[i],
					"displayName" : d.toDateString().replace(today.getFullYear(), ""),
					"date" : d
				};
				if (name===archs[i]) { currArchive = $scope.archives[i]}; // find the one we're listing.
			}
			// Sort by reverse date
			$scope.archives.sort( function(a,b){return b.date - a.date} );
			
			var nextIndex = $scope.archives.indexOf(currArchive) + 1;

			if (nextIndex >= $scope.archives.length) {
				$scope.showNext="show-false" 
			} 
			else {
				$scope.nextArchiveName = $scope.archives[nextIndex].archiveName;
				$scope.showNext="show-true";
			};
		});
  }

  $scope.getList = function(name) {
  	if(name == null) { return name; };
  		$http.get('https://api.mongolab.com/api/1/databases' +
			'/yodertvtodo/collections/' + name + '/' +
			'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data){
			$scope.todos = data; 
			$scope.archiveName = name;
			var d = new Date(name.replace(/todo/,"").replace(/-/," "));
			$scope.label = d.toDateString().replace(d.getFullYear(), "");
		});
  }

  var name = $routeParams.archiveName.replace(/:/,""); // Didn't expect the ":"
	$scope.getList(name);
	$scope.getArchives(name);

	$scope.showDelete = true; // Put us in delete mode so we remove items from history. Shouldn't change that it's done.
	$scope.showList = true;
	$scope.activeHome = ""; 
	$scope.activeList = "active";
	$scope.activeHistory = "show-false";
	$scope.showNewTask = false;


	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};

	$scope.homeClick = function() {
		$location.path('/');
	};
}

function TodoCtrl($scope, $http, Todo) {  
	// This is the home page. Show current Todos. Hide other stuff	
	var today = new Date();

	$scope.getTodos = function() {
		$scope.todos = Todo.query();
  }

	$scope.getArchives = function() {
  	$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data) {
		
			// filter for only the collections that start w/ todo using regex.
			var archs = data.filter(function(item){ return /^todo[SMTWF]/.test(item) });
			$scope.archives=[];
			var d = new Date();
			var currArchive = {};
			for (var i=0;i<archs.length;i++) {
				var archstr = archs[i].replace("todo", ""); 

				// Only Chrome grocks dashes in date constructor. E.g. Sun-3-dec-2012 fails.
				d = new Date(archstr.replace(/-/," ")); 


				$scope.archives[i] = {
					"archiveName" : archs[i],
					"displayName" : d.toDateString().replace(today.getFullYear(), ""),
					"date" : d
				};
				if (name===archs[i]) { currArch = archives[i]}; // find the one we're listing.
			}
			// Sort by reverse date
			$scope.archives.sort( function(a,b){return b.date - a.date} );
			var currIndex = $scope.archives.indexOf(currArchive);
			$scope.nextArchiveName = $scope.archives[currIndex + 1].archiveName;
			if ($scope.nextArchiveName==undefined) { $scope.showNext="show-false" } else {
					$scope.showNext="show-true";
			};
		});
  }

	$scope.activeList = "show-false";
	$scope.activeHome = "active";
	$scope.showNewTask = true;
  $scope.showDelete = false;

  $scope.getTodos();
  $scope.getArchives(); // to support the next button.


	$scope.saveTodos = function(name) {
	 	if(name == null) { name = 'todo'; }; 	  	
	  $http.put('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' + name + '/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d', JSON.stringify($scope.todos, excludeHash)).success(function(data){
			$scope.putresult=data;
		});
	}

	$scope.addTodo = function() {
		var obj = {text:$scope.todoText, done:false};

		$scope.todoText = '';
		Todo.save(obj,  function(returnObj) {
			$scope.todos.push(returnObj);
    });
	};
		
	$scope.delete = function() {
		var index = $scope.todos.indexOf(this.todo);
	//	console.log(index)
		$scope.todos.splice(index,1);
		Todo.remove({id: this.todo._id.$oid});
	};

	$scope.update = function() {
		console.log("Update", this.todo);
		// Call update for this object ID, after removing the _id from my object using extend. ID will be in the URL.
		Todo.update({id: this.todo._id.$oid}, angular.extend({}, this.todo, {_id:undefined}));
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
 		var today = new Date();  
 		var archiveName = "todo" + today.toDateString().replace(/ /g, "-");
		var oldTodos = $scope.todos;
		var d = new Date(archiveName.replace("todo",""));
		console.log(d);
			
		$scope.saveTodos(archiveName);
		
		// Remove the completed items
    	
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });

    // Here's where I'll add back in the default times.
		
		$scope.saveTodos();		
  } 

}
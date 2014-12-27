'use strict';

/* Controllers */
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
	//console.log("Entering HistoryCntrl");

	$scope.getArchives = function() {
  		$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data){
			// filter for only the collections that start w/ todo using regex.
			var archs = data.filter(function(item){ return /^todo[SMTWF]/.test(item) });
			// archs.sort();
			$scope.archives = []; // 
			// set display value
			var d = new Date();
			for (var i=0;i<archs.length;i++) {
				var archstr = archs[i].replace("todo", ""); 
				// Some browers don't grock Sun-3-dec-2012
				d = new Date(archstr.replace(/-/," ")); 
				$scope.archives[i] = { 
					"archiveName" : archs[i], 
					"displayName" : d.toDateString(),
					"date" : d
				 };
			}
			// Sort by reverse date
			$scope.archives.sort( function(a,b){return b.date - a.date} ) 
		});
  	}
  	$scope.getArchives();
}

function ListCtrl($scope, $location, $routeParams, $http) {  
	//console.log("Entering ListCntrl");
	
	$scope.getList = function(name) {
  		if(name == null) { return name; };

  		$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' + name + '/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data){
			$scope.todos = data; 
			$scope.archiveName = name;
			var d = new Date(name.replace(/todo/,"").replace(/-/," "));
			$scope.label = d.toDateString();		
			//console.log("Sucess in getList for " + name + "=" + data);
		});
  	}
	$scope.getList($routeParams.archiveName.replace(/:/,""));
	$scope.edit = true; // Put us in edit mode so we can delete items from history. Can't change that it's done.
	$scope.notEdit = !$scope.edit;

	$scope.editClick = function() { // In listCtrl this is back to home
		$location.path('/history');
	};

	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};
}

function TodoCtrl($scope, $http, Todo) {  
	var today = new Date();
 	
 	$scope.label = today.toDateString().replace(today.getFullYear(), "");
 	// console.log("In TodoCntrl - " + $scope.label);

	$scope.getTodos = function() {
  	/*	var name = 'todo';
  		$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/' + name + '/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data){
			$scope.todos = data;
			// else { $scope.archiveTodos = data; $scope.archiveName = name}			
			//console.log("Sucess in getTodos for " + name + "=" + data);
		});*/
		$scope.todos = Todo.query();
  	}

  	$scope.getTodos();	

 	//console.log("In TodoCtrl 2nd " + $scope.todos);
  	$scope.edit = false;
	$scope.notEdit = !$scope.edit;

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
		$scope.todos.push(obj);
		$scope.todoText = '';
		Todo.save(obj);
		// $scope.saveTodos(); 
	};
		
	$scope.delete = function() {
		// console.log("Delete", this.todo);
		var index = $scope.todos.indexOf(this.todo);
		console.log(index)
		$scope.todos.splice(index,1);
		Todo.remove({id: this.todo._id.$oid});
	};

	$scope.update = function() {
		console.log("Update", this.todo);
		// Call update for this object ID, after removing the _id from my object using extend
		Todo.update({id: this.todo._id.$oid}, angular.extend({}, this.todo, {_id:undefined}));
	};

	$scope.editClick = function() {
		if ($scope.edit)
			{ $scope.edit = false; $scope.notEdit = true }
		else
			{ $scope.edit = true; $scope.notEdit = false }
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
		
		// console.log(archiveName);
		// console.log(archiveName.replace("todo",""));

		var d = new Date(archiveName.replace("todo",""));
		console.log(d);
		
		/* 		
 		var archive = $scope.getTodos(archiveName);
		console.log(archive);
		*/
		
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
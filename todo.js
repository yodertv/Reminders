'use strict';

/* Controllers */
angular.module('todo', ['ngResource']).config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:TodoCtrl, templateUrl:'list.html'}).
//      when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
//      when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
      otherwise({redirectTo:'/'});
  });

function excludeHash(key, value) {
    if (key === "$$hashKey") {
    	return undefined
    }
    return value;
}

function TodoCtrl($scope, $http) {  
	var today = new Date();
 	$scope.label = today.getMonth() + "." + 
 		today.getDate() + "." +
 		today.getFullYear();
  	console.log("In TodoCntrl" + $scope.label);

	$scope.getTodos = function() {
  		$http.get('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/todo/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d').success(function(data){
//			console.log(data);
			$scope.todos = data;
		});
  	}
  	$scope.getTodos();

  	$scope.saveTodos = function() {
  		$http.put('https://api.mongolab.com/api/1/databases' +
		'/yodertvtodo/collections/todo/' +
		'?apiKey=50a2a0e3e4b0cd0bfc12435d', JSON.stringify($scope.todos, excludeHash)).success(function(data){
			$scope.putresult=data;
		});
  	}

	$scope.addTodo = function() {
		var obj = {text:$scope.todoText, done:false};
		$scope.todos.push(obj);
		$scope.todoText = '';
		$scope.saveTodos();
	};
	
	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};
 
	$scope.archive = function() {
 		//console.log($scope.todos);    	
		var oldTodos = $scope.todos;
    	$scope.todos = [];
    	angular.forEach(oldTodos, function(todo) {
      		if (!todo.done) $scope.todos.push(todo);
    	});
		$scope.saveTodos();		
  	} 

}
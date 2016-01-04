// This is a module for todo's persistance.
// It uses the todoServer.js REST api.
//
// TodoServices.js v@VERSION@
//
// Deployment knowledge goes here: nodeUrl and apiPath must be defined in the build_props.

'use strict';

var nodeURL = "@NODEURL@";
var apiPath = "@APIPATH@";

var resURL = nodeURL + apiPath;

var myMod = new angular.module('TodoServices', ['ngResource']);

function excludeHash(key, value) {
    if (key === "$$hashKey") {
      return undefined
    }
    return value;
}

myMod.factory('UserService', function($window, $resource, $http, $location) {  
  
  var UserService = $resource(nodeURL + 'account', null, null);
  
  // console.log("In UserService"); 
  // We use the get() me
  
  UserService.logout = function(logOutFromGoogle, cb) {
    if(logOutFromGoogle) { 
      // example from oauth demo
      // https://accounts.google.com/Logout?continue=https%3A%2F%2Fmail.googlecom%2Fmail%2F&il=true&zx=xln7tckfoh8r
      $http.get('/logout').success(function(){ // logout from my server
        // When that finishes then logout from google. Can only seem to get this to work from the browser.
        // $window.location.replace('https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://127.0.0.1');
        $window.location.replace('https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=' + nodeURL);
        // "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://www.mysite.com"
        // $http.get('http://accounts.google.com/Logout'); // Can't call from the script. Doesn't support CORS so it fails on the OPTIONS call to google.
      });
    } else // Just logout from my app server and leave google logged in.
      $http.get('/logout').success(cb);
  }
  
  return UserService;
});

myMod.factory('Todo', function($resource, $http, $log) {
    // $log.info("TodoServices.js: ", nodeURL, resURL);
    var Todo = $resource(resURL + ':todo/:id', null,
      {
        update: { method: 'PUT' }
      }
    );

    /* A reminder. These methods are provided by $resource.
    Todo.remove = function(){};
    Todo.save = function(){};
    Todo.update = function(){};
    Todo.query = function(){}; // returns an array
    Todo.get = function(){};
    */

    Todo.getList = function(name) {
      // console.log("query", name)
      if(name == null) { name = 'todo'; };
      return Todo.query({todo : name, id : undefined});
    }

    Todo.getTodos = function(name, cb) {
      console.log("getTodos ", name)
      http.get(resURL + name).success(cb);
    }

    Todo.saveTodos = function(todos, name) {
      if(name == null) { name = 'todo'; };      
      // console.log("saveTodos :\n", todos);
      $http.put(resURL + name, JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("saveTodos error:", data);
      });
    }

    Todo.getArchiveList = function(cb) {
      $http.get(resURL).success(cb);
    }

    Todo.dropArchive = function(name, cb) {
      $http.delete(resURL + name).success(cb);;
    }

  return Todo;
});

myMod.factory('authInterceptor', ['$q', '$location', function($q, $location) {
  return {
    response: function(response) {
      // console.log('Successful response: ' + response.status);
      return response || $q.when(response);
    },
    responseError: function(rejection) { // Expect a 401 when Unauthorized.
      var status = rejection.status;
      // console.log('Rejection status: ' + status + '. ' + JSON.stringify(rejection) + ' ' + $location.path());
      if ($location.path() != '/welcome') {
        $location.path('/welcome');
      }
      return $q.reject(rejection);
    }
  }
}]);

myMod.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);

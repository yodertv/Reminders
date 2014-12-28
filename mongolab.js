// This is a module for cloud persistance in mongolab - https://mongolab.com
'use strict';

// Test DB connect info
// var nodeURL = window.location.href.replace(/#\//,""),  // Take #/ off the end of my URL
var nodeURL = document.getElementById ('home-root').href;
    // var nodeURL = "http://192.168.1.10/";
    // var resURL = "http://192.168.1.10/api/1/databases/test-todo/collections/",
var resURL = nodeURL + "api/1/databases/test-todo/collections/";

  // console.log("Mongolabjs: window href ", window.location.href);
  // console.log("Mongolabjs: nodeURL ", nodeURL);
  // console.log("Mongolabjs: resURL ", resURL);

var myMod = new angular.module('mongolab', ['ngResource']);

function excludeHash(key, value) {
    if (key === "$$hashKey") {
      return undefined
    }
    return value;
}

myMod.factory('Todo', function($resource, $http) {
    console.log("Mongolabjs: ", nodeURL, resURL);
    var Todo = $resource(resURL + ':todo/:id', null,
      {
        update: { method: 'PUT' }
      }
    );
    
    // console.log("Mongolabjs: ", window.location.href);
    /* These methods come from $resource.
    Todo.remove = function(){};
    Todo.save = function(){};
    Todo.update = function(){};
    Todo.query = function(){};
    */

    Todo.getList = function(name) {
      // console.log("query", name)
      if(name == null) { name = 'todo'; };
      return Todo.query({todo:name, id:undefined});
    }

    Todo.saveTodos = function(todos, name) {
      if(name == null) { name = 'todo'; };      
      // console.log(todos);
      /*
      $http.put(resURL + name + '/?apiKey=' + DBKey, JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("Save error:", data);
      });
      */
      $http.put(resURL + name + '/', JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("Save error:", data);
      });



    }

    Todo.getArchiveList = function(cb) {
      // $http.get(resURL + '?apiKey=' + DBKey).success(cb);
      $http.get(resURL).success(cb);
    }

    Todo.dropArchive = function(name, cb) {
      $http.delete(nodeURL + name).success(cb);
    }

  return Todo;
});
// This is a module for cloud persistance in mongolab - https://mongolab.com
//
// mongolab.js v@VERSION@
//
// Deployment knowledge goes here: nodeUrl and apiPath must be defined in the build_props.

'use strict';

var nodeURL = "@NODEURL@";
var apiPath = "@APIPATH@";

var resURL = nodeURL + apiPath;

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
      // console.log("saveTodo :\n", todos);
      $http.put(resURL + name, JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("Save error:", data);
      });
    }

    Todo.getArchiveList = function(cb) {
      $http.get(resURL).success(cb);
    }

    Todo.dropArchive = function(name, cb) {
      $http.delete(resURL + name).success(cb);
    }

  return Todo;
});
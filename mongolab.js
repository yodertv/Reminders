// This is a module for cloud persistance in mongolab - https://mongolab.com
'use strict';

// Test DB connect info
var DBString = "https://api.mongolab.com/api/1/databases/test-todo/collections/",
    nodeString = "http://192.168.1.10:80/"

// Prod DB connect info (comment out the unchoosen.)
// var DBString = "https://api.mongolab.com/api/1/databases/yodertvtodo/collections/";

// The key is account wide
var DBKey = "50a2a0e3e4b0cd0bfc12435d";

var myMod = new angular.module('mongolab', ['ngResource']);

function excludeHash(key, value) {
    if (key === "$$hashKey") {
      return undefined
    }
    return value;
}

myMod.factory('Todo', function($resource, $http) {
    var Todo = $resource(DBString + ':todo/:id',
      { apiKey: DBKey }, {
        update: { method: 'PUT' }
      }
    );

    Todo.getList = function(name) {
      // console.log("query", name)
      if(name == null) { name = 'todo'; };
      return Todo.query({todo:name, id:undefined});
    }

    Todo.saveTodos = function(todos, name) {
      if(name == null) { name = 'todo'; };      
      // console.log(todos);
      $http.put(DBString + name + '/?apiKey=' + DBKey, JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("Save error:", data);
      });
    }

    Todo.getArchiveList = function(cb) {
      $http.get(DBString + '?apiKey=' + DBKey).success(cb);
    }

    Todo.dropArchive = function(name, cb) {
      $http.delete(nodeString + name).success(cb);
    }

  return Todo;
});
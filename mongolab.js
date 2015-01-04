// This is a module for cloud persistance in mongolab - https://mongolab.com
//
// Mongolab.js v2.1
//
// Deployment knowledge goes here URL and DB must be edited based on where it runs 
// and what DB to use.

'use strict';

// var nodeURL = "http://yodertv.jit.su/"; // Production site
// var nodeURL = "http://192.168.1.13/";  // desk-pc @ home.
var nodeURL = "http://127.0.0.1/";  // localhost.

var mongoDB = "test-todo";
// var mongoDB = "bobstodos";
// var mongoDB = "yodertvtodo"; // Production DB
// var mongoDB = "frankstodos";

var resURL = nodeURL + "api/1/databases/" + mongoDB + "/collections/";

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
      $http.put(resURL + name + '/', JSON.stringify(todos, excludeHash)).error(function(data){
          console.log("Save error:", data);
      });
    }

    Todo.getArchiveList = function(cb) {
      $http.get(resURL).success(cb);
    }

    Todo.dropArchive = function(name, cb) {
      $http.delete(nodeURL + name + '/?mongoDB=' + mongoDB).success(cb);
    }

  return Todo;
});
// This is a module for cloud persistance in mongolab - https://mongolab.com
angular.module('mongolab', ['ngResource']).
    factory('Todo', function($resource) {
 var Todo = $resource('https://api.mongolab.com/api/1/databases' +
          '/yodertvtodo/collections/todo/:id',
          { apiKey: '50a2a0e3e4b0cd0bfc12435d' }, {
            update: { method: 'PUT' } 
          }
      );
      return Todo;
    });
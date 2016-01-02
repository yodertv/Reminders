// user-list.js
//
'use strict';

var mongojs = require('mongojs');

var userauths = 0;
var userDb = undefined;
exports.ul = undefined;
exports.userauths = userauths;

exports.logUserList = function () {
  console.log('\nUser List:\n', JSON.stringify(exports.ul));
};

exports.closeUserList = function () {
  userDb.close();
};

exports.findByEmail = function(email, fn) {
  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

exports.getUserList = function (options) {

  // Get user list objects from users collection of users DB. Using mongojs api and the options
  // specifying the dbUrl and collectionName. 

  var nodeProd = ( process.env.NODE_ENV === 'production' );
  var dbName = options.dbUrl;

  // Assume produciton has db authernitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = nodeProd ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // var dbUrl = process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + options.dbUrl;
  var collectionName = options.collectionName;
  
  // console.log("Get User List opening DB: " + options.dbUrl);
  userDb = new mongojs(dbUrl, [collectionName], {authMechanism: 'ScramSHA1'});
  userDb.on('error',function(err) {
    console.log('userDb database error', err);
    throw err;
  });

  userDb.collection(collectionName).find( function( err, myDocs ){
    if (err != null) {
      console.log("USER_DB_ERR:", err);
    }
    else {
      exports.ul = myDocs;
    }
  });
};

// user-list.js
//
'use strict';

var mongojs = require('mongojs');

var userauths = 0;
var userDb = undefined;
var unassignedValue ="UNASSIGNED_DB";

exports.ul = undefined;
exports.userauths = userauths;

exports.logUserList = function () {
  // console.log('\nUser List:\n', JSON.stringify(exports.ul));
  console.log('i  email     \t  db')
  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    console.log(i + ' ' + user.email + '\t' + user.db);
  }
};

exports.closeUserList = function () {
  userDb.close();
  userDb = undefined;
};

exports.assignDb = function (email) {
  // Set the email value of an UNASSIGNED one and store it back for the future.
  console.log("Assinging db...");
  var user = exports.findByEmail("UNASSIGNED_DB", function c(err, user) {return user});
  user.email = email; 
  //storeUserList();
  return (user); 
}

exports.findByEmail = function(email, fn) {
  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

exports.loadUserList = function (options) {

  // Get user list objects from users collection of users DB. Using mongojs api and the options
  // specifying the dbUrl and collectionName. 

  var dbName = options.dbUrl;

  // Assume produciton has db authernitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = process.env.MONGO_USER ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // var dbUrl = process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + options.dbUrl;
  var collectionName = options.collectionName;
  
  // console.log("Get User List opening DB: " + options.dbUrl);
  if (userDb == null) {
    userDb = new mongojs(dbUrl, [collectionName], {authMechanism: 'ScramSHA1'});
    userDb.on('error',function(err) {
      console.log('userDb database error', err);
      throw err;
    });
  }
  
  userDb.collection(collectionName).find( function( err, myDocs ){
    if (err != null) {
      console.log("USER_DB_ERR:", err);
    }
    else {
      exports.ul = myDocs;
      exports.logUserList();
    }
  });
};

exports.storeUserList = function (options, arrayToStore) {

  // Store (replace) user list objects in the named collection of the DB identified by the dbURL option. 
  // Uses mongojs api and the options specifying the dbUrl and collectionName.

  var dbName = options.dbUrl;

  // Assume produciton has db authernitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = process.env.MONGO_USER ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // var dbUrl = process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + options.dbUrl;
  var collectionName = options.collectionName;
  
  // console.log("Get User List opening DB: " + options.dbUrl);
  userDb = new mongojs(dbUrl, [collectionName], {authMechanism: 'ScramSHA1'});
  userDb.on('error',function(err) {
    console.log('userDb database error', err);
    throw err;
  });

  // Need to write the code to store users back to db.

 };

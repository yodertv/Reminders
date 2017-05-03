// user-list.js
//
'use strict';

var log = require('./logger.js').log;

var mongojs = require('mongojs');

var userauths = 0;
var userDb = undefined;
var userCol = undefined;
var unassignedValue ="UNASSIGNED_DB";

exports.ul = undefined;
exports.userauths = userauths;

exports.logUserList = function () {

  var ulString =        'Index\tEmail       \t\t\t\tDB Name\n';
  ulString = ulString + '-----\t-----       \t\t\t\t-------\n';

  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    ulString = ulString + i + '\t\t' + user.email + '  \t\t\t' + user.db + '\n';
  }
  log.info('User Table:\n' + ulString);
  log.trace({"user-list" : exports.ul});
};

exports.closeUserList = function () {
  userDb.close();
  userDb = undefined;
};

exports.assignDb = function (email) {
  // Set the email value of an UNASSIGNED one and store it back for the future.
  log.info("Assinging db...");
  var user = exports.findByEmail("UNASSIGNED_DB", function c(err, user) {
    if (err) { return 0 } // Not found
      else {    return user }
  });
  if (user) { 
    user.email = email; 
    storeUser(user);
  }
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
  userCol = options.collectionName;
  
  log.trace("Get User List opening DB: " + options.dbUrl);
  if (userDb == null) {
    // userDb = new mongojs(dbUrl, [userCol], {authMechanism: 'SCRAM-SHA-1'});
    userDb = new mongojs(dbUrl, [userCol]);
    userDb.on('error',function(err) {
      // This never runs. Bug#37
      log.error(err, 'userDb database error');
      throw err;
    });
  }
  
  userDb.collection(userCol).find( function( err, myDocs ){
    if (err != null) {
      log.fatal(err, "USER_DB_ERR: Failed to load users.");
      throw(err);
    }
    else {
      exports.ul = myDocs;
      exports.logUserList();
    }
  });
};

var storeUser = function (userToStore) {
  // Store (replace) user object in the named collection of the DB identified by the dbURL option. 
  // Assuem usee db is opened for use by loadUserList.
  log.info("User to store:", userToStore);
  userDb.collection(userCol).update({ _id : mongojs.ObjectId(userToStore._id) }, userToStore, { upsert: false }, function(err, doc) {
    if (err != null) {
      // var errString = err.toString();
      log.error(err, "USER_UPDATE_ERR faild to store %s", userToStore);
    }
  });
};

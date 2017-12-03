// user-list.js
//
'use strict';

var log = require('./logger.js').log.child({module:'user-list'});

log.trace("log Level set to %d.", log.level())

var sprintf = require('sprintf-js').sprintf;
var mongojs = require('mongojs');

var userauths = 0;
var userDb = undefined;
var userCol = undefined;
var unassignedValue ="UNASSIGNED_DB";

exports.ul = undefined;
exports.userauths = userauths;

exports.logUserList = function () {

  var ulString = 
    sprintf('\n%-4s %-25s %-50s %-6s', 'Idx', 'Email', 'DB Name', 'Views');

  ulString = ulString + 
    sprintf('\n%-4s %-25s %-50s %-6s', '---', '-----', '-------', '-----');
  
  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    ulString = ulString + sprintf('\n%-4d %-25s %-50s %-6d', i, user.email, user.db, user.views || 0);
  }
  
  log.info({"user-list-spfd":ulString}, "Log User List:");
  log.trace({"user-list": exports.ul }, "Log User List:");
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
  log.error("findByEmail failed to find dbUser " + email);
  return fn(null, null);
}

exports.loadUserList = function (options) {

  // Get user list objects from options.collectionName of options.dbUrl DB. Using mongojs api and the options
  // specifying the dbUrl and collectionName. 

  var dbName = options.dbUrl;

  // Assume produciton has db authernitcation on. Has desirable side effect of failing to connect
  // on DBs without authentication enabled.
  var dbUrl = process.env.MONGO_USER ? process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + dbName : dbName;

  // var dbUrl = process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + options.dbUrl;
  userCol = options.collectionName;
  
  log.trace("Get User List opening DB: %s.", options.dbUrl);
  if (userDb == null) {
    userDb = new mongojs(dbUrl, [userCol]);
    userDb.on('error',function(err) {
      // This never runs. Bug#37
      log.fatal(err, 'USER_DB_OPEN_ERR: Failed to open database %s.', dbName);
      throw err;
    });
  }
  
  userDb.collection(userCol).find( function( err, myDocs ){
    if (err != null) {
      log.fatal(err, "USER_DB_FIND_ERR: Failed to loadUserList.");
      throw err;
    }
    else {
      exports.ul = myDocs;
      exports.logUserList();
    }
  });
};

var storeUser = function (userToStore) {
  // Store (replace) user object in the named collection of the DB identified by the dbURL option. 
  // Assume user db is opened for use by loadUserList.
  log.info("User to store: %s.", userToStore);
  userDb.collection(userCol).update({ _id : mongojs.ObjectId(userToStore._id) }, userToStore, { upsert: false }, function(err, doc) {
    if (err != null) {
      log.error(err, "USER_DB_UPDATE_ERR failed to store %s.", userToStore);
    }
  });
};

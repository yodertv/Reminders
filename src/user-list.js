// user-list.js
//
'use strict';

var log = require('./logger.js').log.child({module:'user-list'});

log.trace("log Level set to %d.", log.level())

var sprintf = require('sprintf-js').sprintf;
const mongojs = require('mongojs');

var userauths = 0;
var userDb = undefined;
var userCol = undefined;
var dbServerPath = undefined
var dbUrl = undefined;
var nodeEnv = undefined;

exports.ul = undefined;
exports.userauths = userauths;

function makeDbName(email) {
  // Remove special characters and use underscores instead
  return email.replace(/[^a-zA-Z0-9]/g, "_");
}

exports.openDB = function(dbName, log, msg) {
  if (dbName === undefined) {
    var err = new Error("In openDB(), dbName can not be undefined" + msg);
    log.error("openDB()" + msg + err);
    const dbs = new mongojs(""); // Intentionally broken to create a return value of type mongjs.
    dbs.emit('error', err);
    return dbs;
  } else {
    var protoString = dbName.split("//")[0] + "//";
    var hostString = dbName.split("//")[1];

    // If we have a MONGO_USER environment variable, assume authenticated connection and rewrite the url.
    var dbUrl = process.env.MONGO_USER ? protoString  + process.env.MONGO_USER + ":" + process.env.MONGO_USER_SECRET + "@" + hostString : dbName;

    log.info("openDB() " + dbName + " " + msg);
    log.trace("openDB() with credentials " + dbUrl + " " + msg);
    const dbs = new mongojs(dbUrl);
    dbs.on('error',function(err) {
      log.error('openDB() Error:' + dbUrl + " " + msg + ", error:" + err);
      return dbs;
    });
    return dbs;
  };
}

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
  // Set the db value and createUser. 
  // Caller must check valid email address is not found in the ul before calling assignDb.
  log.trace("assignDb...", email);
  var dbUser = {};
  dbUser.email = email;
  dbUser.db = dbServerPath + "/" + makeDbName(email);
  createUser(dbUser); // Create user in the user database.
  exports.ul.push(dbUser) // Push the user into the memory user list.
  return (dbUser);
}

/*
exports.findByEmail = function(email) {
  // Search the in memory user list for a pointer to the user's record. Return null for not found.
  if (exports.ul === null ) { // exports.ul is loaded asynchronously so it may still be null.
    log.trace("findByEmail: user list undefined", email);
    return null 
  }
  for (var i = 0, len = exports.ul.length; i < len; i++) {
    var user = exports.ul[i];
    if (user.email === email) {
      return user;
    }
  }
  log.trace("findByEmail: Not found", email, exports.ul);
  return null;
}
*/

// Database call to find by email in the user list
exports.findByEmail = async function(email) {
  if (userDb == undefined) {
    userDb = exports.openDB(dbUrl, log, "via findByEmail.");
    userDb.on('error',function(err) {
       return err;
    });
  }
  try {
    const doc = await new Promise((resolve, reject) => {
      userDb.userList.findOne({ email: email }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
    return doc;
  } catch (err) {
    // throw new Error('Database fetch failed');
    log.trace( "findByEmail:", {"email" : email, "dbServerPath" : dbUrl } )
  } finally {
    userDb.close();
  }
}

exports.loadUserList = async function (options) {

  // Get user list objects from options.collectionName of options.dbUrl DB. Using mongojs api and the options
  // specifying the dbUrl and collectionName. 

  dbUrl = options.dbUrl;
  nodeEnv = options.nodeEnv;
  dbServerPath = dbUrl.substring(0, dbUrl.lastIndexOf('/'));

  log.trace( "loadUserList:", {"opts" : options, "dbServerPath" : dbServerPath } )

  userCol = options.collectionName;

  if (userDb == undefined) {
    userDb = exports.openDB(dbUrl, log, "via loadUserList");
    userDb.on('error',function(err) {
       return err;
    });
  }
  try {
    const docs = await new Promise((resolve, reject) => {
      userDb.collection(userCol).find( function( err, myDocs ) {
        if (err != null) {
          log.error(err, "loadUserList: Failed to load user list.");
          reject(err);
        } else {
          exports.ul = myDocs;
          exports.logUserList();
          resolve(myDocs);
        }
      });
    });
  } catch (err) {
    throw new Error('loadUserList failed.');
  } finally {
    userDb.close();
  }
}

var updateUser = function (userToUpdate) {
  // Stores (replaces) user object in the named collection of the DB identified by the dbURL option. 
  // Assume user db is opened for use by loadUserList.
  log.info("updateUser: %s.", userToUpdate);
  userDb.collection(userCol).update({ _id : mongojs.ObjectId(userToUpdate._id) }, userToUpdate, { upsert: false }, function(err, doc) {
    if (err != null) {
      log.error(err, "USER_DB_UPDATE_ERR failed to update %s.", userToUpdate);
    }
  });
};

var createUser = function (userToCreate) {
  // Create (insert) user object in the named collection of the DB identified by the dbURL option. 
  // Assume user db is opened for use by loadUserList.
  log.info("createUser: %s.", userToCreate);
  userDb.collection(userCol).insert(userToCreate, { upsert: false }, function(err, doc) {
    if (err != null) {
      log.error(err, "USER_DB_CREATE_ERR failed to create %s.", userToCreate);
    }
  });
};

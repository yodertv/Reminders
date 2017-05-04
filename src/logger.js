// logger.js

var bunyan = require('bunyan');
var obj = {};

if( !obj.log ){
	obj.log = bunyan.createLogger({name : "todoServer"});
}
if( !obj.bunyan ) {
	obj.bunyan = bunyan;
}
module.exports = obj;
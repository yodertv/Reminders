// logger.js

var bunyan = require('bunyan');
var obj = {};

function reqSerializer(req) {
	var userEmail = req.user == undefined ? "undefined" : req.user.email;
	return { user: userEmail
		, method: req.method
		, url: req.url
		, ip: req.ip
		, headers: req.headers };
};

function resSerializer(res) {
	// return {};
    return  
    	{ statusCode: res.statusCode }
}

if( !obj.log ){
	obj.log = bunyan.createLogger(
		{ name: "todo"
		, serializers : 
			{ req: reqSerializer
			, res: resSerializer }
		})
}

if( !obj.bunyan ) {
	obj.bunyan = bunyan
}
module.exports = obj
// logger.js

var bunyan = require('bunyan')
var obj = {}

function reqSerializer(req) {
	return { method: req.method
		, url: req.url
		, ip: req.ip
		, headers: req.headers }
}

function resSerializer(res) {
	// return {};
    return { statusCode: res.statusCode
    	, method: res.method }
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
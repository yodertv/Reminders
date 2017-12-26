// logger.js

var bunyan = require('bunyan')
var obj = {}

function reqSerializer(req) {
	var source_ip; 
	if (req.headers['x-real-ip'] != null) { source_ip = req.headers['x-real-ip'] } // Where zeit now keeps the source ip.
		else { source_ip = req.ip }
	return { method: req.method
		, url: req.url
		, ip: source_ip
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
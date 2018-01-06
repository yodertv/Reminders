// remindersSchema.js

var Validator = require('jsonschema').Validator
var v = new Validator();

exports.itemSchema = {
	"id": "/itemSchema",
	"type": "object",
	"properties": {
		"text": { "type": "string"},
		"done": { "type": "boolean"},
		"showInView": {"type": "boolean"},
		"_id": {"type": "string"}
	},
	"required": ["text", "done"]
}

exports.itemListSchema = {
	"type": "array",
	"items": {"$ref": "/itemSchema"}
}

//exports.validate = v.validate



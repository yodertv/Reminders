// remindersSchema.js

exports.itemSchema = {
	"id": "/itemSchema",
	"type": "object",
	"properties": {
		"text": { "type": "string"},
		"done": { "type": "boolean"},
		"showInView": {"type": "boolean"},
		"_id": {"type": "objectid"}
	},
	"required": ["text", "done"]
}

exports.itemListSchema = {
	"id": "/itemListSchema",
	"type": "array",
	"items": {"$ref": "/itemSchema"}
}

{
	"all": {
		"map": "function(doc) {\n  if(doc.type === 'show') {\n    emit(doc.name, doc);\n  }\n}"
	},
	"classes": {
		"map": "function(doc) {\n if(doc.type === 'class') {\n    emit(doc.showID, doc);\n  }\n}"
	}
}

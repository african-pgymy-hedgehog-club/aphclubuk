{
	"all": {
		"map": "function(doc) {\n  if(doc.type === 'class') {\n    emit(doc.name, doc);\n  }\n}"
	},
	"entries": {
		"map": "function(doc) {\n if(doc.type === 'entry') {\n    emit(doc.classID, doc);\n  }\n}"
	}
}

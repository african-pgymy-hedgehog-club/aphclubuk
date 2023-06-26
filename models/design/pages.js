{
   "active": {
       "map": "function(doc) {\n  if(doc.type === 'page' && doc.active === true) {\n    emit(doc.order, doc);\n  }\n}"
   },
   "active_names": {
       "map": "function(doc) {\n    if(doc.type === 'page' && doc.active === true) {\n        var subNavs = [];\n\n        if(doc.subNavs) {\n            doc.subNavs.forEach(function(subNav) {\n                if(subNav.active) {\n                    subNavs.push(subNav);\n                }\n            });  \n        }\n       \n        emit(doc.order, {\n\t    name: doc.name,\n            subNavs: subNavs\n        });\n    }\n}"
   },
   "content": {
       "map": "function(doc) {\n  if(doc.type === 'page') {\n    emit(doc.name, doc.content);\n  }\n}"
   },
   "all": {
       "map": "function(doc) {\n  if(doc.type === 'page') {\n    emit(doc.order, doc);\n  }\n}"
   },
   "subnav_content": {
       "map": "function(doc) {\n    if(doc.type == 'page' && doc.subNavs && doc.subNavs.length > 0) {\n        doc.subNavs.forEach(function(subNav) {\n            emit(subNav.name, subNav.content);\n        });\n    }\n}"
   }
}

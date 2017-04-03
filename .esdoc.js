"use strict";

module.exports = {
	"title": "mep-core",
	"index": "./README.md",
	"package": "./package.json",
	"source": "./src",
	"destination": "./doc/api",
	"includes": ["\\.js$"],
	"includeSource": true,
	"access": ["public", "protected"],
	"autoPrivate": true,
	"unexportIdentifier": false,
	"undocumentIdentifier": true,
	"builtinExternal": true,
	"coverage": true,
	"includeSource": true,
	"lint": true,
	"test": {
    	"type": "mocha",
    	"source": "./test"
  	},
	"manual": {
    	"About": ["./docs/About.md"],
		"Creating_Driver": ["./docs/Creating_Driver.md"]
	}
}

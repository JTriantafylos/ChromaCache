module.exports = 
{
	"env": 
	{
		"browser": true,
		"jquery": true,
		"commonjs": true,
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"globals": 
	{
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": 
	{
		"ecmaVersion": 2018
	},
	"rules": 
	{
		"indent": 
		[
			"error",
			4
		],
		"linebreak-style": 
		[
			"error",
			"windows"
		],
		"quotes": 
		[
			"error",
			"single"
		],
		"semi": 
		[
			"error",
			"always"
		],
		"brace-style":
		[
			"error",
			"1tbs"
		],
		"no-console":
		[
			"warn", 
			{ allow: ["warn", "error"] }
		]
	}
};
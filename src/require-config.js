/*
The use of a global variable is required for launching tests with intern
(see /tests/test-config.js)
*/
var loaderConfig = {
	packages: [
		'dojo',
		{ name: 'compose', location: 'compose', main: 'compose' },
		{ name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
		{ name: 'bacon', location: 'bacon.js/dist', main: 'Bacon' },
		{ name: 'lodash', location: 'lodash-amd/modern'}
	]
};
// require call for apps willing to use this config
require(loaderConfig);
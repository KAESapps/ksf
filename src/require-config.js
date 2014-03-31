require.config({
	paths: {
		lodash: 'lodash-amd/modern',
		text: 'requirejs-text/text',
	},
	packages: [
		{ name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
	],
	map: {
		'*': {
			compose: 'ksf/utils/compose'
		}
	}
});

if (typeof document !== "undefined") {
	define([], function() {});
}
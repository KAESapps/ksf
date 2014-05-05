require.config({
	paths: {
		lodash: 'lodash-amd/modern',
		text: 'requirejs-text/text',
	},
	packages: [
		{ name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
		{ name: 'Absurd', location: 'absurd/client-side/build', main: 'absurd.min' }
	],
	map: {
		'ksf': {
			compose: 'ksf/utils/compose'
		}
	}
});

if (typeof document !== "undefined") {
	define([], function() {});
}
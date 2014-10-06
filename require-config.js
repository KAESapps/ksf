require.config({
	paths: {
		lodash: null,
		text: 'requirejs-text/text',
	},
	packages: [
		{ name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
		{ name: 'Absurd', location: 'absurd/client-side/build', main: 'absurd.min' }
	],
});

if (typeof document !== "undefined") {
	define([], function() {});
}
require.config({
	packages: [
		{ name: 'lodash-node', location: 'lodash-amd', main: 'main' },
	],
});

if (typeof document !== "undefined") {
	define([], function() {});
}
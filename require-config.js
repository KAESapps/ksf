require.config({
	packages: [
		{ name: 'when', location: 'when', main: 'when' },
		{ name: 'lodash-node', location: 'lodash-amd', main: 'main' },
	],
});

if (typeof document !== "undefined") {
	define([], function() {});
}
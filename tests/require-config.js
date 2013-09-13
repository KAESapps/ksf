define({
	paths: {
		ksf: '..',
		collections: "collections-amd",
		bacon: '../utils/Bacon'
	},
	packages: [
		{ name: 'compose', location: 'compose', main: 'compose' },
		{ name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
		{ name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
	]
});
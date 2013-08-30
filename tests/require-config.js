define({
	paths: {
		ksf: '..',
		collections: "collections-amd",
		frb: "frb-amd",
		bacon: '../utils/Bacon',
	},
	packages: [
		{ name: 'compose', location: 'compose', main: 'compose' },
		{ name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
	]
});
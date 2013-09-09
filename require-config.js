require({
	paths: {
		collections: "collections-amd",
		bacon: 'ksf/utils/Bacon'
	},
	packages: [
		{ name: 'compose', location: 'compose', main: 'compose' },
		{ name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
	]
});
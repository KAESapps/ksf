define([
	'intern!object',
	'intern/chai!assert',
	'../Store',
	'../PropertyObject',
	'../Value',
], function(
	registerSuite,
	assert,
	Store,
	PropertyObject,
	Value
){

	var siteStore = new Store(new PropertyObject({
		nom: new Value(),
		description: new Array(),
	}));

	registerSuite({
		name: 'store',

		'patch one site': function() {
			var initValue = {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'site 2', description: "Description du site 2"},
				2: {nom: 'site 3', description: "Description du site 3"},
			};
			var changeArg = {
				change: {
					1: {
						change: {
							nom: {
								value: 'nouveau nom du site 2',
							}
						}
					}
				}
			};

			var value = siteStore.computeValue(changeArg, initValue);
			assert.deepEqual(value, {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'nouveau nom du site 2', description: "Description du site 2"},
				2: {nom: 'site 3', description: "Description du site 3"},
			});
		},
		'insert one site': function() {
			var initValue = {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'site 2', description: "Description du site 2"},
				2: {nom: 'site 3', description: "Description du site 3"},
			};
			var changeArg = {
				add: {
					3: {nom: 'site 4', description: "Description du site 4"},
				}
			};

			var value = siteStore.computeValue(changeArg, initValue);
			assert.deepEqual(value, {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'site 2', description: "Description du site 2"},
				2: {nom: 'site 3', description: "Description du site 3"},
				3: {nom: 'site 4', description: "Description du site 4"},
			});
		},
		'remove one site': function() {
			var initValue = {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'site 2', description: "Description du site 2"},
				2: {nom: 'site 3', description: "Description du site 3"},
			};
			var changeArg = {
				remove: {
					2: true,
				}
			};

			var value = siteStore.computeValue(changeArg, initValue);
			assert.deepEqual(value, {
				0: {nom: 'site 1', description: "Description du site 1"},
				1: {nom: 'site 2', description: "Description du site 2"},
			});
		},

	});
});


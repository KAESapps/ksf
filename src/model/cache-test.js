define([
	'intern!object',
	'intern/chai!assert',
	'./TuppleStore',
	'./Cache',
	'./PouchDb',
], function(
	registerSuite,
	assert,
	TuppleStore,
	Cache,
	PouchDb
){

	var db, tuppleStore, store;
	registerSuite({
		name: 'tupples store with cache',
		setup: function() {
			return new PouchDb('test').destroy().then(function() {
				db = window.db = new PouchDb('test');
				tuppleStore = new TuppleStore(db);
				store = new Cache(tuppleStore);
				return store.ready;
			});
		},
		'first value': function() {
			return store.change(['syv', "Sylvain"]).then(function(change) {
				assert.deepEqual(change, ['syv', "Sylvain"]);
				assert.deepEqual(store.value(), {'syv': "Sylvain"});
			});
		},
		'add second value': function() {
			return store.change(['ket', "Quentin"]).then(function(change) {
				assert.deepEqual(change, ['ket', "Quentin"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain",
					'ket': "Quentin",
				});
			});
		},
		'add nested value': function() {
			return store.change(['ant', 'name', "Antonin"]).then(function(change) {
				assert.deepEqual(change, ['ant', 'name', "Antonin"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin",
					}
				});
			});
		},
		'change value': function() {
			return store.change(['syv', "Sylvain Vuilliot"]).then(function(change) {
				assert.deepEqual(change, ['syv', "Sylvain Vuilliot"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin",
					}
				});
			});
		},
		'change deep value': function() {
			return store.change(['ant', 'name', "Antonin Vuilliot"]).then(function(change) {
				assert.deepEqual(change, ['ant', 'name', "Antonin Vuilliot"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin Vuilliot",
					}
				});
			});
		},
		'remove deep value': function() {
			return store.change(['ant', 'name', null]).then(function(change) {
				assert.deepEqual(change, ['ant', 'name', null]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
				});
			});
		},
		'create very deep value': function() {
			return store.change(['aur', 'address', 'city', 'postalCode', "94600"]).then(function(change) {
				assert.deepEqual(change, ['aur', 'address', 'city', 'postalCode', "94600"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'aur': {
						'address': {
							'city': {
								'postalCode': "94600",
							}
						}
					}
				});
			});
		},
		'remove very deep value': function() {
			return store.change(['aur', 'address', 'city', 'postalCode', null]).then(function(change) {
				assert.deepEqual(change, ['aur', 'address', 'city', 'postalCode', null]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
				});
			});
		},
	});


});
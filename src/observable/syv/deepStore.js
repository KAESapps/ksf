define([

], function(

){
	var store = new PouchDbDeepStore('mydb');
	var store = new MemoryDeepStore();

	registerSuite({
		name: 'read, write',
		"read empty db": function() {
			assert.equal(store.value(), null);
		},
		"store unitary value": function() {
			store.change('toto');
			assert.equal(store.value(), 'toto');
		},
		"store composite value": function() {
			store.change({name: 'toto'});
			assert.deepEqual(store.value(), {name: 'toto'});
			nameStore = new SubStore(store, "name");
			assert.equal(nameStore.value(), 'toto');
			nameStore.change('titi');
			assert.equal(nameStore.value(), 'titi');
			assert.deepEqual(store.value(), {name: 'titi'});
		},
		"add key in composite value": function() {
			store.change({age: 30});
			assert.deepEqual(store.value(), {
				name: 'titi',
				age: 30,
			});
		},
		"remove key in composite value": function() {
			store.change({name: null});
			assert.deepEqual(store.value(), {
				age: 30,
			});
		},
		"create deep path": function() {
			store.change({
				children: {
					ant: {
						age: 3,
						name: 'Antonin',
					},
				},
			});
			assert.deepEqual(store.value(), {
				age: 30,
				children: {
					ant: {
						age: 3,
						name: 'Antonin',
					},
				},
			});
		},
		"remove deep path": function() {
			store.change({
				children: {
					ant: {
						age: null,
						name: null,
					},
				},
			});
			assert.deepEqual(store.value(), {
				age: 30,
			});
		},
	});
	registerSuite({
		name: 'observe change',
		"read empty db": function() {
			assert.equal(store.value(), null);
		},
		"store unitary value": function() {
			store.change('toto');
			assert.deepEqual(storeChanges, [
				'toto',
			]);
		},
		"store composite value": function() {
			store.change({name: 'toto'});
			nameStore = new SubStore(store, "name");
			nameStore.change('titi');
			assert.deepEqual(storeChanges, [
				{name: 'toto'},
				{name: 'titi'},
			]);
			assert.deepEqual(nameStoreChanges, [
				'toto',
				'titi',
			]);
		},
		"add key in composite value": function() {
			store.change({age: 30});
			assert.deepEqual(storeChanges, [
				{age: 30},
			]);
			assert.deepEqual(nameStoreChanges, [
			]);
		},
		"remove key in composite value": function() {
			store.change({name: null});
			assert.deepEqual(storeChanges, {
				name: null,
			});
			assert.deepEqual(nameStoreChanges, [
				null,
			]);
		},
		"create deep path": function() {
			store.change({
				children: {
					ant: {
						age: 3,
						name: 'Antonin',
					},
				},
			});
			assert.deepEqual(storeChanges, {
				children: {
					ant: {
						age: 3,
						name: 'Antonin',
					},
				},
			});
		},
		"remove deep path": function() {
			store.change({
				children: {
					ant: {
						age: null,
						name: null,
					},
				},
			});
			assert.deepEqual(storeChanges, {
				children: null,
			});
		},
	});
});
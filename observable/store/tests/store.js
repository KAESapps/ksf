define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../propertyObject/PropertyAccessor',
	'../DocumentStore'
], function(
	registerSuite,
	assert,
	compose,
	PropertyAccessor,
	DocumentStore
){
	var StringProperty = compose({
		computer: {
			computeValueFromSet: function(arg) {
				return typeof(arg) === 'string' ? arg : '';
			}
		},
		accessorFactory: PropertyAccessor
	});
	var IntegerProperty = compose({
		computer: {
			computeValueFromSet: function(arg) {
				return typeof(arg) === 'number' ? arg : null;
			}
		},
		accessorFactory: PropertyAccessor
	});

	var store;
	registerSuite({
		name: 'filter',

		'getValue': function() {
			store = new DocumentStore({
				properties: {
					name: new StringProperty(),
					age: new IntegerProperty()
				}
			});
			return store.setValue({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			}).then(function() {
				var filteredStore = store.filter(function(item) {
					return item.age > 30;
				});

				return filteredStore.getValue().then(function(value) {
					assert.deepEqual(value, {
						"1": {name: "Sylvain", age: 32},
						"3": {name: "Aurélie", age: 31},
					});

				});

			});
		},
	});
	
	var ascendingAge = function(a, b) {
		return a.age - b.age;
	};

	var initialisedStore;
	registerSuite({
		name: 'sorted',
		beforeEach: function() {
			store = new DocumentStore({
				properties: {
					name: new StringProperty(),
					age: new IntegerProperty()
				}
			});
			initialisedStore = store.setValue({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});

		},
		'getValue': function() {
			return initialisedStore.then(function() {
				var sorted = store.sort(ascendingAge);
				return sorted.getValue().then(function(value) {
					assert.deepEqual(value, [
						{name: "Quentin", age: 28},
						{name: "Aurélie", age: 31},
						{name: "Sylvain", age: 32},
					]);
				});
			});
		},
		'add value': function() {
			return initialisedStore.then(function() {
				var sorted = store.sort(ascendingAge);
				return sorted.add({name: "Léonie", age: 1}, "4").then(function() { // si aucun id n'est précisé, il est généré
					return sorted.getValue().then(function(value) {
						assert.deepEqual(value, [
							{name: "Léonie", age: 1},
							{name: "Quentin", age: 28},
							{name: "Aurélie", age: 31},
							{name: "Sylvain", age: 32},
						]);

						store.getValue().then(function(value) {
							assert.deepEqual(value, {
								"1": {name: "Sylvain", age: 32},
								"2": {name: "Quentin", age: 28},
								"3": {name: "Aurélie", age: 31},
								"4": {name: "Léonie", age: 1},
							});
						});
					});
				});
			});
		},
		"item accessor": function() {
			return initialisedStore.then(function() {
				var sorted = store.sort(ascendingAge);
				return sorted.getKeys().then(function(keys) {
					var ketAccessor = sorted.getItemByKey(keys[0]);
					return ketAccessor.getValue().then(function(value) {
						assert.deepEqual(value, {name: "Quentin", age: 28});
					});
				});
			});
		},
		"change item age": function() {
			return initialisedStore.then(function() {
				var sorted = store.sort(ascendingAge);
				return sorted.getItemByKey("3").getPropertyAccessor('age').setValue(33).then(function() {
					return sorted.getValue().then(function(value) {
						assert.deepEqual(value, [
							{name: "Quentin", age: 28},
							{name: "Sylvain", age: 32},
							{name: "Aurélie", age: 33},
						]);
					});
				});
			});
		},
		"range accessor": function() {
			return initialisedStore.then(function() {
				var sorted = store.sort(ascendingAge);
				return sorted.range(0, 2).getValue().then(function(value) {
					assert.deepEqual(value, [
						{name: "Quentin", age: 28},
						{name: "Aurélie", age: 31},
					]);
				}).then(function() {
					return sorted.range(0, 2).getKeys().then(function(value) {
						assert.deepEqual(value, [
							'2',
							'3'
						]);
					});
				});
			});
		},
	});

});
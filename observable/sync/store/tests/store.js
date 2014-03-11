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
			store.setValue({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});
			var filteredStore = store.filter(function(item) {
				return item.age > 30;
			});

			var value = filteredStore.getValue();
			assert.deepEqual(value, {
				"1": {name: "Sylvain", age: 32},
				"3": {name: "Aurélie", age: 31},
			});
		},
	});
	
	var ascendingAge = function(a, b) {
		return a.age - b.age;
	};

	registerSuite({
		name: 'sorted',
		beforeEach: function() {
			store = new DocumentStore({
				properties: {
					name: new StringProperty(),
					age: new IntegerProperty()
				}
			});
			store.setValue({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});

		},
		'getValue': function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted.getValue();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
				{name: "Sylvain", age: 32},
			]);
		},
		'add value': function() {
			var sorted = store.sort(ascendingAge);
			sorted.add({name: "Léonie", age: 1}, "4"); // si aucun id n'est précisé, il est généré
			var value = sorted.getValue();
			assert.deepEqual(value, [
				{name: "Léonie", age: 1},
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
				{name: "Sylvain", age: 32},
			]);

			value =	store.getValue();
			assert.deepEqual(value, {
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
				"4": {name: "Léonie", age: 1},
			});
		},
		"item accessor": function() {
			var sorted = store.sort(ascendingAge);
			var keys = sorted.getKeys();
			var ketAccessor = sorted.getItemByKey(keys[0]);
			var value = ketAccessor.getValue();
			assert.deepEqual(value, {name: "Quentin", age: 28});
		},
		"change item age": function() {
			var sorted = store.sort(ascendingAge);
			sorted.getItemByKey("3").getPropertyAccessor('age').setValue(33);
			var value = sorted.getValue();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Sylvain", age: 32},
				{name: "Aurélie", age: 33},
			]);
		},
		"range accessor": function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted.range(0, 2).getValue();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
			]);
			value = sorted.range(0, 2).getKeys();
			assert.deepEqual(value, [
				'2',
				'3'
			]);
		},
	});

});
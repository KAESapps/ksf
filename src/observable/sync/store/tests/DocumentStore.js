define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../DocumentStore'
], function(
	registerSuite,
	assert,
	compose,
	DocumentStore
){
	var store;
	registerSuite({
		name: 'filter',

		'get': function() {
			store = new DocumentStore({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});
			var filteredStore = store.filter(function(item) {
				return item.age > 30;
			});

			var value = filteredStore.value();
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
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});

		},
		'get': function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted.value();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
				{name: "Sylvain", age: 32},
			]);
		},
		'add value': function() {
			var sorted = store.sort(ascendingAge);
			sorted.add({name: "Léonie", age: 1}, "4"); // si aucun id n'est précisé, il est généré
			var value = sorted.value();
			assert.deepEqual(value, [
				{name: "Léonie", age: 1},
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
				{name: "Sylvain", age: 32},
			]);

			value =	store.value();
			assert.deepEqual(value, {
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
				"4": {name: "Léonie", age: 1},
			});
		},
		"item accessor": function() {
			var sorted = store.sort(ascendingAge);
			var keys = sorted.keys();
			var ketAccessor = sorted.item(keys[0]);
			var value = ketAccessor.value();
			assert.deepEqual(value, {name: "Quentin", age: 28});
		},
		"change item age": function() {
			var sorted = store.sort(ascendingAge);
			sorted.item("3").prop('age').value(33);
			var value = sorted.value();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Sylvain", age: 32},
				{name: "Aurélie", age: 33},
			]);
		},
		"range accessor": function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted.range(0, 2).value();
			assert.deepEqual(value, [
				{name: "Quentin", age: 28},
				{name: "Aurélie", age: 31},
			]);
			value = sorted.range(0, 2).keys();
			assert.deepEqual(value, [
				'2',
				'3'
			]);
		},
		"observe item changes": function() {
			var observedChanges = [];
			var sorted = store.sort(ascendingAge);
			sorted.on('itemChanges', function(changes) {
				observedChanges.push(changes);
			});
			sorted.item("3").prop('age').value(33);

			assert.deepEqual(observedChanges, [
				[{
					type: 'move',
					from: 2,
					to: 1,
				}],
			]);
		},
	});

});
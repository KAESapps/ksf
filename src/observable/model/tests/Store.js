define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../StatefulFactory',
	'../Store',
	'../Value',
	'../BasicPropertyObject',

], function(
	registerSuite,
	assert,
	compose,
	StatefulFactory,
	Store,
	Value,
	BasicPropertyObject
){

	var PersonStore = new StatefulFactory(new Store(new BasicPropertyObject({
		name: new Value(),
		age: new Value(),
	}))).ctr;

	var store;

	registerSuite({
		name: 'filter',
		beforeEach: function() {
			store = new PersonStore({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});

		},

		'get': function() {
			var filteredStore = store.filter(function(item) {
				return item.age > 30;
			});

			var value = filteredStore._getValue();
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
		name: 'sort',
		beforeEach: function() {
			store = new PersonStore({
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
			});

		},
		'get': function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted._getValue();
			assert.deepEqual(value, [
				"2",
				"3",
				"1"
			]);
		},
		'add value': function() {
			var sorted = store.sort(ascendingAge);
			store.add({name: "Léonie", age: 1}, "4"); // si aucun id n'est précisé, il est généré
			var value = sorted._getValue();
			assert.deepEqual(value, [
				"4",
				"2",
				"3",
				"1"
			]);

			value =	store._getValue();
			assert.deepEqual(value, {
				"1": {name: "Sylvain", age: 32},
				"2": {name: "Quentin", age: 28},
				"3": {name: "Aurélie", age: 31},
				"4": {name: "Léonie", age: 1},
			});
		},
		"item accessor": function() {
			var sorted = store.sort(ascendingAge);
			var ketAccessor = sorted.items()[0];
			var value = ketAccessor.value();
			assert.deepEqual(value, {name: "Quentin", age: 28});
		},
		"change item age": function() {
			var sorted = store.sort(ascendingAge);
			store.item("3").prop('age').value(33);
			var value = sorted._getValue();
			assert.deepEqual(value, [
				"2",
				"1",
				"3",
			]);
		},
		"range accessor": function() {
			var sorted = store.sort(ascendingAge);
			var value = sorted.range(0, 2)._getValue();
			assert.deepEqual(value, [
				'2',
				'3'
			]);
		},
		"observe item changes": function() {
			var observedChanges = [];
			var sorted = store.sort(ascendingAge);
			sorted.onItemChanges(function(changes) {
				observedChanges.push(changes);
			});
			store.item("3").prop('age').value(33);

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
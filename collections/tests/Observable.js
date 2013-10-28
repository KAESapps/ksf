define([
	'intern!object',
	'intern/chai!assert',
	'../ObservableObject',
	'../OrderableSet',
	'../Set',
], function(
	registerSuite,
	assert,
	ObservableObject,
	OrderableSet,
	Set
){
	var collection;
	var cbCalledCount, cb2CalledCount;
	var cancelerCalledCount, canceler2CalledCount;
	var cmp1, cmp2, cmp3;
	var cbArgs, cbFirstArg;

	registerSuite({
		name: "getEachR",
		beforeEach: function(){
			collection = new ObservableObject();
			cbCalledCount = cb2CalledCount = 0;
			cancelerCalledCount = canceler2CalledCount = 0;
			cbArgs = undefined;
			cbFirstArg = undefined;
			cmp1 = {name: "cmp1"};
			cmp2 = {name: "cmp2"};
			cmp3 = {name: "cmp3"};
		},
		"one property": function(){
			collection.getEachR('cmp1').onValue(function(cmps) {
				cbFirstArg = cmps;
			});
			assert.deepEqual(cbFirstArg, [undefined]);
			cbFirstArg = undefined;
			collection.set('cmp1', cmp1);
			assert.deepEqual(cbFirstArg, [cmp1]);

		},
		"three properties": function(){
			collection.getEachR('cmp1', 'cmp2', 'cmp3').onValue(function(cmps) {
				cbFirstArg = cmps;
			});
			assert.deepEqual(cbFirstArg, [undefined, undefined, undefined]);
			cbFirstArg = undefined;
			collection.set('cmp1', cmp1);
			assert.deepEqual(cbFirstArg, [cmp1, undefined, undefined]);
			cbFirstArg = undefined;
			collection.set('cmp3', cmp3);
			assert.deepEqual(cbFirstArg, [cmp1, undefined, cmp3]);
		},
		"not called when another property is changed": function() {
			collection.set('cmp1', cmp1);
			collection.getEachR('cmp1', 'cmp2', 'cmp3').onValue(function(cmps) {
				cbCalledCount++;
				cbFirstArg = cmps;
			});
			assert.equal(cbCalledCount, 1);
			collection.set('cmp8', cmp1);
			assert.equal(cbCalledCount, 1);
		},
		"called only once when 2 properties are changed": function() {
			collection.set('cmp1', cmp1);
			collection.getEachR('cmp1', 'cmp2', 'cmp3').onValue(function(cmps) {
				cbCalledCount++;
				cbFirstArg = cmps;
			});
			assert.equal(cbCalledCount, 1);
			assert.deepEqual(cbFirstArg, [cmp1, undefined, undefined]);
			collection.setEach({
				'cmp2': cmp2,
				'cmp3': cmp3,
			});
			assert.equal(cbCalledCount, 2);
			assert.deepEqual(cbFirstArg, [cmp1, cmp2, cmp3]);
		},
	});

	var assertChangesEqual = function(actual, expected) {
		assert.equal(actual.length, expected.length);
		expected.forEach(function(expectedChange, changeIndex) {
			assert.equal(expectedChange.type, actual[changeIndex].type);
			assert.equal(expectedChange.value, actual[changeIndex].value);
			assert.equal(expectedChange.index, actual[changeIndex].index);
			assert.equal(expectedChange.key, actual[changeIndex].key);
		});
	};

	registerSuite({
		name: 'getChangesStream',
		'basic': function() {
			var o = new ObservableObject();
			o.set('collection', new OrderableSet(["un", "deux"]));
			var lastChanges;
			o.getChangesStream('collection').onValue(function(changes) {
				lastChanges = changes;
			});
			assertChangesEqual(lastChanges, [
				{type: 'add', value: 'un', index: 0},
				{type: 'add', value: 'deux', index: 1},
			]);
			o.get('collection').add('trois');
			assertChangesEqual(lastChanges, [
				{type: 'add', value: 'trois', index: 2},
			]);
			o.set('collection', new OrderableSet(["quatre", "cinq"]));
			assertChangesEqual(lastChanges, [
				{type: 'remove', value: 'un', index: 0},
				{type: 'remove', value: 'deux', index: 0},
				{type: 'remove', value: 'trois', index: 0},
				{type: 'add', value: 'quatre', index: 0},
				{type: 'add', value: 'cinq', index: 1},
			]);
		},
		'many subscribers': function() {
			var o = new ObservableObject();
			o.set('collection', new OrderableSet(["un", "deux"]));
			var lastChanges;
			o.getChangesStream('collection').onValue(function(changes) {
				lastChanges = changes;
			});
			assertChangesEqual(lastChanges, [
				{type: 'add', value: 'un', index: 0},
				{type: 'add', value: 'deux', index: 1},
			]);
			o.get('collection').add('trois');
			var lastChanges2;
			o.getChangesStream('collection').onValue(function(changes) {
				lastChanges2 = changes;
			});
			assertChangesEqual(lastChanges, [
				{type: 'add', value: 'trois', index: 2},
			]);
			assertChangesEqual(lastChanges2, [
				{type: 'add', value: 'un', index: 0},
				{type: 'add', value: 'deux', index: 1},
				{type: 'add', value: 'trois', index: 2},
			]);
		},
		'non collection value': function() {
			var o = new ObservableObject();
			var lastChanges;
			var changesCount = 0;
			o.getChangesStream('collection').onValue(function(changes) {
				lastChanges = changes;
				changesCount++;
			});
			assert.equal(changesCount, 0);
			o.set('collection', new OrderableSet(["un", "deux"]));
			assertChangesEqual(lastChanges, [
				{type: 'add', value: 'un', index: 0},
				{type: 'add', value: 'deux', index: 1},
			]);
			assert.equal(changesCount, 1);
			o.set('collection', 'toto');
			assert.equal(changesCount, 2);
			assertChangesEqual(lastChanges, [
				{type: 'remove', value: 'un', index: 0},
				{type: 'remove', value: 'deux', index: 0},
			]);
		},
		// don't know if it is very useful
		'list and map collections': function() {
			var o = new ObservableObject();
			o.set('collection', new OrderableSet(["un", "deux"]));
			var lastChanges;
			var changesCount = 0;
			o.getChangesStream('collection').onValue(function(changes) {
				lastChanges = changes;
			});
			var map = new Set([3]);
			o.set('collection', map);
			assertChangesEqual(lastChanges, [
				{type: 'remove', value: 'un', index: 0},
				{type: 'remove', value: 'deux', index: 0},
				{type: 'add', value: 3, key: 3},
			]);
		},
	});


});
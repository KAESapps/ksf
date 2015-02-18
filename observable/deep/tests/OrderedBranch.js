define([
	'tape',
	'../Store',
	'../OrderedBranch',
], function(
	test,
	Store,
	OrderedBranch
) {
	var store = new Store({
		'/el1': true,
		'/el1/name': 'el1',
		'/el1/priority': 8,
		'/el2': true,
		'/el2/name': 'el2',
		'/el2/priority': 4,
		'/el3': true,
		'/el3/name': 'el3',
		'/el3/priority': 6,
	});
	var orderedBranch = new OrderedBranch(store, '', 'priority');
	var events = [];
	orderedBranch.onKeyAdded(function(ev) {
		ev.type = 'add';
		events.push(ev);
	});
	orderedBranch.onKeyRemoved(function(ev) {
		ev.type = 'remove';
		events.push(ev);
	});
	orderedBranch.onKeyMoved(function(ev) {
		ev.type = 'move';
		events.push(ev);
	});

	test('init', function(t) {
		t.deepEqual(orderedBranch.keys(), ['el2', 'el3', 'el1']);

		t.end();
	});

	test('add element', function(t) {
		orderedBranch.change('el4/priority', 7);
		t.deepEqual(orderedBranch.keys(), ['el2', 'el3', 'el4', 'el1']);
		t.deepEqual(events, [
			{type: 'add', key: 'el4', beforeKey: 'el1'},
		]);
		t.end();
	});

	test('remove element', function(t) {
		events = [];
		orderedBranch.removeKey('el2');
		t.deepEqual(orderedBranch.keys(), ['el3', 'el4', 'el1']);
		t.deepEqual(events, [
			{type: 'remove', key: 'el2'},
		]);
		t.end();
	});

	test('move element to the end', function(t) {
		events = [];
		orderedBranch.change('el3/priority', 10);
		t.deepEqual(orderedBranch.keys(), ['el4', 'el1', 'el3']);
		t.deepEqual(events, [
			{type: 'move', key: 'el3', beforeKey: undefined},
		]);
		t.end();
	});
	test('move element to the start', function(t) {
		events = [];
		orderedBranch.change('el1/priority', 0);
		t.deepEqual(orderedBranch.keys(), ['el1', 'el4', 'el3']);
		t.deepEqual(events, [
			{type: 'move', key: 'el1', beforeKey: 'el4'},
		]);
		t.end();
	});
	test('change element without move', function(t) {
		events = [];
		orderedBranch.change('el1/priority', 1);
		t.deepEqual(orderedBranch.keys(), ['el1', 'el4', 'el3']);
		t.deepEqual(events, [
		]);
		t.end();
	});
	test('change element other property', function(t) {
		events = [];
		orderedBranch.change('el1/test', 1);
		t.deepEqual(orderedBranch.keys(), ['el1', 'el4', 'el3']);
		t.deepEqual(events, [
		]);
		t.end();
	});

});

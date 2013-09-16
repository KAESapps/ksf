define([
	'intern!object',
	'intern/chai!assert',
	'../Set',
], function(
	registerSuite,
	assert,
	Set
) {
	var set;
	function changesHistoryEqual (exp) {
		assert.equal(changesHistory.length, exp.length);
		exp.forEach(function(expChanges, changesIndex) {
			var changes = changesHistory[changesIndex];
			assert.equal(changes.length, expChanges.length);
			expChanges.forEach(function(expChange, changeIndex) {
				assert.equal(changes[changeIndex].type, expChange.type);
				assert.equal(changes[changeIndex].value, expChange.value);
				assert.equal(changes[changeIndex].key, expChange.key);
			});
		});
	}

	var changesHistory;
	var un, deux, zero;

	registerSuite({
		name: "add method",
		beforeEach: function(){
			zero = {value: 0};
			un = {value: 1};
			deux = {value: 2};
			set = new Set();
			changesHistory = [];
			set.asStream("changes").onValue(changesHistory, "push");
		},
		"basic": function(){
			set.add(un);
			assert(set.has(un));
			assert.equal(set.length, 1);
			changesHistoryEqual([
				[
					{type: "add", value: un, key: un},
				]
			]);
		},
		"addEach with native array": function() {
			set.addEach([
				zero,
				un,
			]);
			assert(set.has(zero));
			assert(set.has(un));
			assert.equal(set.length, 2);
			changesHistoryEqual([
				[
					{type: "add", value: zero, key: zero},
					{type: "add", value: un, key: un},
				]
			]);
		},

	});

	registerSuite({
		name: "remove method",
		beforeEach: function(){
			zero = {value: 0};
			un = {value: 1};
			deux = {value: 2};
			set = new Set();
			changesHistory = [];
			set.asStream("changes").onValue(changesHistory, "push");
		},
		"remove": function(){
			set.add(un);
			set.remove(un);
			assert.equal(set.has(un), false);
			assert.equal(set.length, 0);
			changesHistoryEqual([
				[
					{type: "add", value: un, key: un},
				],
				[
					{type: "remove", value: un, key: un},
				]

			]);
		},
		"removeEach": function(){
			set.addEach([zero, un]);
			changesHistory.splice(0); // clear history
			set.removeEach([zero, un]);
			assert.equal(set.has(zero), false);
			assert.equal(set.has(un), false);
			assert.equal(set.length, 0);
			changesHistoryEqual([
				[
					{type: "remove", value: zero, key: zero},
					{type: "remove", value: un, key: un},
				]

			]);
		},
	});

	registerSuite({
		name: "forEach method",
		"forEach": function(){
			set = new Set([zero, un, deux]);
			var count = 0;
			set.forEach(function(v, k, d) {
				assert.equal(k, v);
				assert.equal(d, set);
				count++;
			});
			assert.equal(count, 3);
		},
		"forEach on empty set": function(){
			set = new Set();
			var count = 0;
			set.forEach(function(v, k, d) {
				count++;
			});
			assert.equal(count, 0);
		},
		"forEach with scope": function(){
			set = new Set({
				zero: 0,
				un: 1,
				deux: 2
			});
			var count = 0;
			var scope = {};
			set.forEach(function(v, k, d) {
				assert.equal(this, scope);
				count++;
			}, scope);
			assert.equal(count, 3);
		},
	});

	registerSuite({
		name : "difference",
		beforeEach : function() {
			set = new Set();
		},
		base: function() {
			set.add("un");
			set.add("deux");
			set.add("trois");
			var other = new Set();
			other.add("deux");
			var diff = set.difference(other);
			assert.deepEqual(diff.values(), ["un", "trois"]);
		}
	});
});
define([
	'intern!object',
	'intern/chai!assert',
	'../Map',
], function(
	registerSuite,
	assert,
	Map
){
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

	var map, changesHistory;
	var un, deux, zero;

	registerSuite({
		name: "set method",
		beforeEach: function(){
			zero = {value: 0};
			un = {value: 1};
			deux = {value: 2};
			map = new Map();
			changesHistory = [];
			map.asStream("changes").onValue(changesHistory, "push");
		},
		"set a new property": function(){
			map.set(un, 1);
			assert(map.has(un));
			assert.equal(map.get(un), 1);
			assert.equal(map.length, 1);
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: un},
				]
			]);
		},
		"set a existant property": function(){
			map.set(un, 1);
			map.set(un, "un");
			assert(map.has(un));
			assert.equal(map.get(un), "un");
			assert.equal(map.length, 1);
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: un},
				],
				[
					{type: "remove", value: 1, key: un},
					{type: "add", value: "un", key: un},
				]

			]);
		},
		"set each with native object": function() {
			map.setEach({
				"zero": 0,
				"un": 1,
			});
			assert(map.has("zero"));
			assert(map.has("un"));
			assert.equal(map.get("zero"), 0);
			assert.equal(map.get("un"), 1);
			assert.equal(map.length, 2);
			changesHistoryEqual([
				[
					{type: "add", value: 0, key: "zero"},
					{type: "add", value: 1, key: "un"},
				]
			]);
		},
		"set each with array of [key, value] arrays": function() {
			map.setEach([
				[zero, 0],
				[un, 1],
			]);
			assert(map.has(zero));
			assert(map.has(un));
			assert.equal(map.get(zero), 0);
			assert.equal(map.get(un), 1);
			assert.equal(map.length, 2);
			changesHistoryEqual([
				[
					{type: "add", value: 0, key: zero},
					{type: "add", value: 1, key: un},
				]
			]);
		},

	});

	registerSuite({
		name: "remove method",
		beforeEach: function(){
			map = new Map();
			changesHistory = [];
			map.asStream("changes").onValue(changesHistory, "push");
		},
		"remove": function(){
			map.set(un, 1);
			map.remove(un);
			assert.equal(map.has(un), false);
			assert.equal(map.get(un), undefined);
			assert.equal(map.length, 0);
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: un},
				],
				[
					{type: "remove", value: 1, key: un},
				]

			]);
		},
		"removeEach": function(){
			map.setEach({
				"zero": 0,
				"un": 1,
			});
			changesHistory.splice(0); // clear history
			map.removeEach(["zero", "un"]);
			assert.equal(map.has("zero"), false);
			assert.equal(map.has("un"), false);
			assert.equal(map.get("zero"), undefined);
			assert.equal(map.get("un"), undefined);
			assert.equal(map.length, 0);
			changesHistoryEqual([
				[
					{type: "remove", value: 0, key: "zero"},
					{type: "remove", value: 1, key: "un"},
				]

			]);
		},
	});

	registerSuite({
		name: "forEach method",
		"forEach": function(){
			map = new Map({
				zero: 0,
				un: 1,
				deux: 2
			});
			var count = 0;
			map.forEach(function(v, k, d) {
				assert.equal(map.get(k), v);
				assert.equal(d, map);
				count++;
			});
			assert.equal(count, 3);
		},
		"forEach on empty map": function(){
			map = new Map();
			var count = 0;
			map.forEach(function(v, k, d) {
				count++;
			});
			assert.equal(count, 0);
		},
		"forEach with scope": function(){
			map = new Map({
				zero: 0,
				un: 1,
				deux: 2
			});
			var count = 0;
			var scope = {};
			map.forEach(function(v, k, d) {
				assert.equal(this, scope);
				count++;
			}, scope);
			assert.equal(count, 3);
		},
	});

});
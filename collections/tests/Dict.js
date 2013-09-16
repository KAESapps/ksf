define([
	'intern!object',
	'intern/chai!assert',
	'../Dict',
], function(
	registerSuite,
	assert,
	Dict
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

	var dict, changesHistory;

	registerSuite({
		name: "set method",
		beforeEach: function(){
			dict = new Dict();
			changesHistory = [];
			dict.asStream("changes").onValue(changesHistory, "push");
		},
		"set a new property": function(){
			dict.set("un", 1);
			assert(dict.has("un"));
			assert.equal(dict.get("un"), 1);
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: "un"},
				]
			]);
		},
		"set a existant property": function(){
			dict.set("un", 1);
			dict.set("un", "un");
			assert(dict.has("un"));
			assert.equal(dict.get("un"), "un");
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: "un"},
				],
				[
					{type: "remove", value: 1, key: "un"},
					{type: "add", value: "un", key: "un"},
				]

			]);
		},
		"set each": function() {
			dict.setEach({
				"zero": 0,
				"un": 1,
			});
			assert(dict.has("zero"));
			assert(dict.has("un"));
			assert.equal(dict.get("zero"), 0);
			assert.equal(dict.get("un"), 1);
			changesHistoryEqual([
				[
					{type: "add", value: 0, key: "zero"},
					{type: "add", value: 1, key: "un"},
				]
			]);
		},

	});

	registerSuite({
		name: "remove method",
		beforeEach: function(){
			dict = new Dict();
			changesHistory = [];
			dict.asStream("changes").onValue(changesHistory, "push");
		},
		"remove": function(){
			dict.set("un", 1);
			dict.remove("un");
			assert.equal(dict.has("un"), false);
			assert.equal(dict.get("un"), undefined);
			changesHistoryEqual([
				[
					{type: "add", value: 1, key: "un"},
				],
				[
					{type: "remove", value: 1, key: "un"},
				]

			]);
		},
		"removeEach": function(){
			dict.setEach({
				"zero": 0,
				"un": 1,
			});
			changesHistory.splice(0); // clear history
			dict.removeEach(["zero", "un"]);
			assert.equal(dict.has("zero"), false);
			assert.equal(dict.has("un"), false);
			assert.equal(dict.get("zero"), undefined);
			assert.equal(dict.get("un"), undefined);
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
			dict = new Dict({
				zero: 0,
				un: 1,
				deux: 2
			});
			var count = 0;
			dict.forEach(function(v, k, d) {
				assert.equal(dict.get(k), v);
				assert.equal(d, dict);
				count++;
			});
			assert.equal(count, 3);
		},
		"forEach on empty dict": function(){
			dict = new Dict();
			var count = 0;
			dict.forEach(function(v, k, d) {
				count++;
			});
			assert.equal(count, 0);
		},
		"forEach with scope": function(){
			dict = new Dict({
				zero: 0,
				un: 1,
				deux: 2
			});
			var count = 0;
			var scope = {};
			dict.forEach(function(v, k, d) {
				assert.equal(this, scope);
				count++;
			}, scope);
			assert.equal(count, 3);
		},
	});

});
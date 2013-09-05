define([
	'intern!object',
	'intern/chai!assert',
	'../OrderableSet',
], function(
	registerSuite,
	assert,
	OrderableSet
){
	function changesHistoryEqual (exp) {
		assert.equal(changesHistory.length, exp.length);
		exp.forEach(function(expChanges, changesIndex) {
			var changes = changesHistory[changesIndex];
			assert.equal(changes.length, expChanges.length);
			expChanges.forEach(function(expChange, changeIndex) {
				assert.equal(changes[changeIndex].type, expChange.type);
				assert.equal(changes[changeIndex].value, expChange.value);
				assert.equal(changes[changeIndex].index, expChange.index);
			});
		});
	}

	var list, changesHistory;

	registerSuite({
		name: "add method",
		beforeEach: function(){
			list = new OrderableSet();
			changesHistory = [];
			list.asStream("changes").onValue(changesHistory, "push");
		},
		"add primitive": function(){
			list.add("a");
			assert(list.has("a"));
			assert.equal(list.length, 1);
			assert.equal(list.get(0), "a");
			changesHistoryEqual([
				[
					{type: "add", value: "a", index: 0},
				]
			]);
		},
		"add object": function(){
			var toto = {name: "toto"};
			list.add(toto);
			assert(list.has(toto));
			assert.equal(list.length, 1);
			assert.equal(list.get(0), toto);
			changesHistoryEqual([
				[
					{type: "add", value: toto, index: 0},
				]
			]);
		},
		"add a value already in collection": function(){
			var toto = {name: "toto"};
			list.add(toto);
			assert.throw(function() {
				list.add(toto);
			});
		},

	});

	registerSuite({
		name: "remove method",
	});

	registerSuite({
		name: "indexOf method",
	});


	registerSuite({
		name: "addBefore method",
	});


	registerSuite({
		name: "removeAt method",
	});

	registerSuite({
		name: "move method",
	});
});
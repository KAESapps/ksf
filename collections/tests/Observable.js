define([
	'intern!object',
	'intern/chai!assert',
	'../ObservableObject',
	'../OrderableSet',
], function(
	registerSuite,
	assert,
	ObservableObject,
	OrderableSet
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



});
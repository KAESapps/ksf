define([
	'intern!object',
	'intern/chai!assert',
	'../ManyMap',
], function(
	registerSuite,
	assert,
	ManyMap
) {
	var map;
	registerSuite({
		name : "Many-to-many map",
		beforeEach : function() {
			map = new ManyMap();
			map.add([123], [1, 2, 3]);
			map.add([12], [1, 2]);
			map.add([23], [2, 3]);
		},

		"getValues": function() {
			assert.deepEqual(map.getValues(1), [123, 12]);
			assert.deepEqual(map.getValues(2), [123, 12, 23]);
			assert.deepEqual(map.getValues(3), [123, 23]);
		},

		"getKeys": function() {
			assert.deepEqual(map.getKeys(12), [1, 2]);
			assert.deepEqual(map.getKeys(123), [1, 2, 3]);
			assert.deepEqual(map.getKeys(23), [2, 3]);
		},

		"hasValue": function() {
			assert(map.hasValue(123));
			assert(map.hasValue(12));
			assert(map.hasValue(23));
		},

		"hasKey": function() {
			assert(map.hasKey(1));
			assert(map.hasKey(2));
			assert(map.hasKey(3));
		},

		"keys": function() {
			assert.deepEqual(map.keys(), [1, 2, 3]);
		},

		"values": function() {
			assert.deepEqual(map.values(), [123, 12, 23]);
		}
	});
});
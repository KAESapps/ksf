define([
	'intern!object',
	'intern/chai!assert',
	'../Set',
], function(
	registerSuite,
	assert,
	Set
) {
	var s;
	registerSuite({
		name : "base",
		beforeEach : function() {
			s = new Set();
		},
		difference: function() {
			s.add("un");
			s.add("deux");
			s.add("trois");
			var other = new Set();
			other.add("deux");
			var diff = s.difference(other);
			assert.deepEqual(diff.values(), ["un", "trois"]);
		}
	});
});
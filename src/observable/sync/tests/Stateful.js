define([
	'intern!object',
	'intern/chai!assert',
	'../Stateful',
], function(
	registerSuite,
	assert,
	Stateful
){
	var obs, observedValues;

	registerSuite({
		name: "mutation",
		"init value": function() {
			obs = new Stateful();
			assert.equal(obs.value(), undefined);
		},
		"set value": function() {
			obs = new Stateful();
			obs.value('test');
			assert.equal(obs.value(), 'test');
		},

	});
	registerSuite({
		name: "observation",
		"set value": function() {
			observedValues = [];
			obs = new Stateful();
			obs.onValue(function(value) {
				observedValues.push(value);
			});
			obs.value('test');
			assert.deepEqual(observedValues, [
				'test',
			]);
		},

	});
});
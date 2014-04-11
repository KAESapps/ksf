define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../_Stateful',
	'../../computers/Value'
], function(
	registerSuite,
	assert,
	compose,
	_Stateful,
	Value
){
	var obs, observedValues;

	var BasicStateful = compose(_Stateful, {
		_computer: new Value(),
	});

	registerSuite({
		name: "mutation",
		"init value": function() {
			obs = new BasicStateful();
			assert.equal(obs._getValue(), undefined);
		},
		"set value": function() {
			obs = new BasicStateful();
			obs._change('test');
			assert.equal(obs._getValue(), 'test');
		},

	});
	registerSuite({
		name: "observation",
		"set value": function() {
			observedValues = [];
			obs = new BasicStateful();
			obs.onValue(function(value) {
				observedValues.push(value);
			});
			obs._change('test');
			assert.deepEqual(observedValues, [
				'test',
			]);
		},

	});
});
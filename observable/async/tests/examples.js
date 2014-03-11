define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../ValueSourceAccessor',
	'../MemoryValueSource',
	'./Person',
	// './PersonWithAddress',
	// './Station',
	// './Task'
], function(
	registerSuite,
	assert,
	compose,
	Accessor,
	ValueSource,
	Person,
	PersonWithAddress,
	Station,
	Task
){
	registerSuite({
		name: 'simple value',
		'set get': function() {
			var obs = new Accessor(new ValueSource());

			return obs.getValue().then(function(value) {
				assert.equal(value, undefined);
				
				return obs.setValue('toto').then(function() {
					return obs.getValue().then(function(value) {
						assert.equal(value, 'toto');

						assert.throw(function() {
							obs.setValue();
						}, null, null, "Cannot set an undefined value");
					});
				});
			});
		},
		'observing value changes': function() {
			var observedValues = [];
			var obs = new Accessor(new ValueSource());
			var canceler = obs.onValue(function(value) {
				observedValues.push(value);
			});

			return obs.setValue('toto').then(function() {
				assert.deepEqual(observedValues, [
					'toto',
				]);

				canceler();

				return obs.setValue('titi').then(function() {
					assert.deepEqual(observedValues, [
						'toto',
					]);
				});
			});
		},
	});

	registerSuite({
		name: 'Person',
		'set get': function() {
			// observable qui a une valeur de type composite 'object' et qui a une API adaptée à ce cas
			var obs = new Person();

			return obs.setValue().then(function() {
				return obs.getValue().then(function(value) {
					assert.deepEqual(value, {
						firstName: '',
						lastName: '',
						fullName: '',
					});
					return obs.setValue({firstName: 'toto', lastName: 3}).then(function() {
						return obs.getValue().then(function(value) {
							assert.deepEqual(value, {
								firstName: 'toto',
								lastName: '',
								fullName: 'toto',
							});
						});
					});
				});
			});
		},
	});
});
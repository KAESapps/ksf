define([
	'intern!object',
	'intern/chai!assert',
	'../Reactive',
], function(
	registerSuite,
	assert,
	Reactive
){
	registerSuite({
		'set get': function() {
			var r = new Reactive();

			r.set('name', 'toto');
			assert.equal(r.get('name'), 'toto');
		},
		'observing': function() {
			var observedChanges = [];
			var r = new Reactive();
			r.on('changes', function(changes) {
				observedChanges.push(changes);
			});

			r.set('name', 'toto');

			assert.equal(observedChanges.length, 1);
		},

		'external loop': function() {
			var observedChanges = [];
			var r = new Reactive();
			r.on('changes', function(changes) {
				changes.forEach(function(change) {
					console.log('external setter called');
					if (change.key === 'name') {
						r.set('nameChanged', true);
						console.log('external setting done');
					}
				});
			});
			r.on('changes', function(changes) {
				observedChanges.push(changes);
				console.log('changes', changes);
				console.log('r state', r._data);
			});

			r.set('name', 'toto');

			assert.equal(observedChanges.length, 2);
		},

		'computed property': function() {
			var observedChanges = [];
			var r = new Reactive();
			r._processChanges = function(changes) {
				// computedProperty
				var changedProperties = changes.map(function(change) {
					return change.key;
				});
				var firstNameChangeIndex = changedProperties.indexOf('firstName');
				var lastNameChangeIndex = changedProperties.indexOf('lastName');
				if ( firstNameChangeIndex >= 0 || lastNameChangeIndex >= 0) {
					var firstName = firstNameChangeIndex >=0 ? changes[firstNameChangeIndex].value : this.get('firstName');
					var lastName = lastNameChangeIndex >=0 ? changes[lastNameChangeIndex].value : this.get('lastName');
					changes.push({
						type: 'set',
						key: 'fullName',
						value: firstName + ' ' + lastName,
					});
				}
				return changes;
			};
			r.on('changes', function(changes) {
				delete changes.emiter;
				delete changes.type;
				observedChanges.push(changes);
			});

			r.set('firstName', 'toto');

			assert.equal(r.get('firstName'), 'toto');
			assert.equal(r.get('fullName'), 'toto undefined');

			assert.deepEqual(observedChanges, [
				[
					{type: 'set', key: 'firstName', value: 'toto'},
					{type: 'set', key: 'fullName', value: 'toto undefined'},
				],
			]);

		},

	});
});
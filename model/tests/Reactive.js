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

	});
});
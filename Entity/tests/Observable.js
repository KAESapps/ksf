define([
	'intern!object',
	'intern/chai!assert',
	'../Observable',
], function(
	registerSuite,
	assert,
	Observable
){
	registerSuite({
		name: 'simple value',
		'set get': function() {
			var obs = new Observable(undefined);
			assert.equal(obs.get(), undefined);

			obs.set('toto');
			assert.equal(obs.get(), 'toto');
		},
		'observing value': function() {
			var observedValues = [];
			var obs = new Observable();
			var handler = obs.onValue(function(value) {
				observedValues.push(value);
			});

			obs.set('toto');
			assert.deepEqual(observedValues, [
				'toto',
			]);

			handler();
			obs.set('titi');
			assert.deepEqual(observedValues, [
				'toto',
			]);
		},

	});
	registerSuite({
		name: 'composite type key/value',
		'set get': function() {
			// observable qui a une valeur de type composite 'object' et qui a une API adaptée à ce cas
			var obs = new ObservableMap();

			assert.deepEqual(obs.get(), {});
			obs.set({name: 'toto'});
			assert.deepEqual(obs.get(), {name: 'toto'});
		},
		'props': function() {
			var obs = new ObservableMap();

			obs.addProperty('name', 'toto');
			var nameProp = obs.getProperty('name');
			assert.equal(nameProp.get(), 'toto');
			assert.deepEqual(obs.get(), {name: 'toto'});

			nameProp.set('titi');
			assert.equal(nameProp.get(), 'titi');
			assert.deepEqual(obs.get(), {name: 'titi'});

			obs.set({name: 'tata', truc: 'muche'});
			assert.equal(nameProp.get(), 'tata');
			assert.deepEqual(obs.get(), {name: 'tata'});

			obs.removeProperty('name');
			assert.throw(function() {
				nameProp.get();
			});
			assert.deepEqual(obs.get(), {});

		},
		'observing value': function() {
			var observedValues = [];
			var observedNameValues = [];
			var obs = new ObservableMap();
			var handler = obs.onValue(function(value) {
				observedValues.push(value);
			});

			obs.addProperty('name', 'toto');
			var nameProp = obs.getProperty('name');
			var propHandler = nameProp.onValue(function(value) {
				observedNameValues.push(value);
			});

			nameProp.set('titi');
			obs.set({name: 'tata', truc: 'muche'});
			obs.removeProperty('name');

			assert.deepEqual(observedValues, [
				{},
				{name: 'toto'},
				{name: 'titi'},
				{name: 'tata'},
				{},
			]);
			assert.deepEqual(observedNameValues, [
				'toto',
				'titi',
				'tata',
			]);
		},
		"observing properties": function() {
			var observedProperties = [];
			var obs = new ObservableMap();
			obs.onProperties(function(props) {
				observedProperties.push(props);
			});
			obs.addProperty('name', 'toto');
			obs.removeProperty('name');

			assert.deepEqual(observedProperties, [
				{},
				{name: true},
				{}
			]);
		},

	});
	registerSuite({
		name: 'observable with computed property',
		'set get': function() {
			// observable qui a une valeur de type composite 'object' et qui a une API adaptée à ce cas
			var obs = new Person();

			assert.deepEqual(obs.get(), {
				fisrtName: '',
				lastName: '',
				fullName: '',
			});
			obs.set({fisrtName: 'toto'});
			assert.deepEqual(obs.get(), {
				fisrtName: 'toto',
				lastName: '',
				fullName: 'toto ',
			});
		},
		'props': function() {
			var obs = new Person();
			obs.set({fisrtName: 'toto'});

			var nameProp = obs.getProperty('name');
			assert.equal(nameProp.get(), 'toto');

			nameProp.set('titi');
			assert.equal(nameProp.get(), 'titi');
			assert.deepEqual(obs.get(), {
				fisrtName: 'titi',
				lastName: '',
				fullName: 'titi ',
			});

			obs.set({name: 'tata', truc: 'muche'});
			assert.equal(nameProp.get(), 'tata');
			assert.deepEqual(obs.get(), {
				fisrtName: 'tata',
				lastName: '',
				fullName: 'tata ',
			});

			obs.destroy();
			assert.throw(function() {
				nameProp.get();
			});

		},

	});

});
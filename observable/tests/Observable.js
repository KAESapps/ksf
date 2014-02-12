define([
	'intern!object',
	'intern/chai!assert',
	'../Stateful',
	'../ObservableMap',
	'./Person',
	'./PersonWithAddress'
], function(
	registerSuite,
	assert,
	Stateful,
	ObservableMap,
	Person,
	PersonWithAddress
){
	registerSuite({
		name: 'simple value',
		'set get': function() {
			var obs = new Stateful(undefined);
			assert.equal(obs.get(), undefined);

			obs.set('toto');
			assert.equal(obs.get(), 'toto');
		},
		'observing value': function() {
			var observedValues = [];
			var obs = new Stateful();
			obs.set('toto');

			var handler = obs.onValue(function(value) {
				observedValues.push(value);
			});
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
			assert.deepEqual(obs.get(), {}, "No property declared");
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
/*
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
*/
	});

	registerSuite({
		name: 'Person',
		'set get': function() {
			// observable qui a une valeur de type composite 'object' et qui a une API adaptée à ce cas
			var obs = new Person();

			assert.deepEqual(obs.get(), {
				firstName: '',
				lastName: '',
				fullName: '',
			});
			obs.set({firstName: 'toto', lastName: 3});
			assert.deepEqual(obs.get(), {
				firstName: 'toto',
				lastName: '',
				fullName: 'toto',
			});
		},
		'observing value': function() {
			var observedValues = [];
			var obs = new Person();
			var cancel = obs.onValue(function(value) {
				observedValues.push(value);
			});

			obs.set({firstName: 'toto'});
			assert.deepEqual(observedValues, [{
				firstName: '',
				lastName: '',
				fullName: '',
			}, {
				firstName: 'toto',
				lastName: '',
				fullName: 'toto',
			}]);

			cancel();
			obs.set({firstName: 'titi'});
			assert.deepEqual(observedValues, [{
				firstName: '',
				lastName: '',
				fullName: '',
			}, {
				firstName: 'toto',
				lastName: '',
				fullName: 'toto',
			}]);
			assert.deepEqual(obs.get(), {
				firstName: 'titi',
				lastName: '',
				fullName: 'titi',
			});
		},
		'props': function() {
			var obs = new Person();
			obs.set({firstName: 'toto'});

			var nameProp = obs.getProperty('firstName');
			assert.equal(nameProp.get(), 'toto');

			nameProp.set('titi');
			assert.equal(nameProp.get(), 'titi');
			assert.deepEqual(obs.get(), {
				firstName: 'titi',
				lastName: '',
				fullName: 'titi',
			});

			obs.set({ firstName: 'tata', truc: 'muche'});
			assert.equal(nameProp.get(), 'tata');
			assert.deepEqual(obs.get(), {
				firstName: 'tata',
				lastName: '',
				fullName: 'tata',
			});

			obs.destroy();
			assert.throw(function() {
				nameProp.get();
			});
		},
		'observing properties': function() {
			var observedFirstNameValues = [];
			var obs = new Person();

			var nameProp = obs.getProperty('firstName');
			var canceler = nameProp.onValue(function(value) {
				observedFirstNameValues.push(value);
			});

			nameProp.set('titi');
			obs.set({ firstName: 'tata', truc: 'muche'});
			canceler();

			nameProp.set('toto');

			nameProp.destroy();
			assert.throw(function() {
				nameProp.onValue(function(value) {
					observedFirstNameValues.push(value);
				});
			});
			assert.throw(function() {
				nameProp.set('tutu');
			});
			obs.set({ firstName: 'tutu' });

			assert.deepEqual(observedFirstNameValues, [
				'',
				'titi',
				'tata',
			]);
		},
		// TODO :
		/*
		'set computed property': function() {
			var obs = new Person();

			obs.set({fullName: 'toto Lili'});
			assert.deepEqual(obs.get(), {
				firstName: 'toto',
				lastName: 'Lili',
				fullName: 'toto Lili',
			});

			obs.getProperty('fullName').set('Toto Lulu');
			assert.deepEqual(obs.get(), {
				firstName: 'Toto',
				lastName: 'Lulu',
				fullName: 'Toto Lulu',
			});

			obs.set({fullName: 'toto Lili', firstName: "Tata" });
			assert.deepEqual(obs.get(), {
				firstName: 'Tata',
				lastName: '',
				fullName: 'Tata',
			});
		},
		*/
	});

	registerSuite({
		name: 'Person with address',
		'set get nested': function() {
			var obs = new PersonWithAddress();

			assert.deepEqual(obs.get(), {});
			obs.set({
				firstName: 'toto',
				address: {
					city: "Paris",
					street: "rue de la paix"
				}
			});
			assert.deepEqual(obs.get(), {
				firstName: 'toto',
				address: {
					city: "Paris",
					street: "rue de la paix"
				}
			});

			var streetProp = obs.getProperty('address').getProperty('street');

			assert.equal(streetProp.get(), "rue de la paix");
			
			streetProp.set('av des Champs-Elysees');

			assert.deepEqual(obs.get(), {
				firstName: 'toto',
				address: {
					city: "Paris",
					street: "av des Champs-Elysees"
				}
			});
		},
	});

	registerSuite({
		name: "Avec logique",
		"": function() {

		}
	});
});
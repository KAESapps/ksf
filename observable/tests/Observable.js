define([
	'intern!object',
	'intern/chai!assert',
	'../Stateful',
	'./Person',
	'./PersonWithAddress',
	'./Station'
], function(
	registerSuite,
	assert,
	Stateful,
	Person,
	PersonWithAddress,
	Station
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
		name: "Station et arbres",
		"get set": function() {
			var obs = new Station();

			assert.deepEqual(obs.get(), {
				nom: '',
				arbres: []
			});

			obs.getProperty('nom').set('Station 1');

			var arbresProp = obs.getProperty('arbres');

			var arbre1Accessor = arbresProp.add();

			assert.deepEqual(arbre1Accessor.get(), {});

			arbre1Accessor.getProperty('essence').set('Frêne');
			arbre1Accessor.getProperty('circonference').set(45);

			assert.deepEqual(obs.get(), {
				nom: 'Station 1',
				arbres: [{
					essence: 'Frêne',
					circonference: 45
				}]
			});

			var arbre2Accessor = arbresProp.add();
			arbre2Accessor.set({
				essence: 'Chêne',
				circonference: 125
			});

			assert.deepEqual(obs.get(), {
				nom: 'Station 1',
				arbres: [{
					essence: 'Frêne',
					circonference: 45
				}, {
					essence: 'Chêne',
					circonference: 125
				}]
			});

			arbresProp.remove(0);

			assert.deepEqual(obs.get(), {
				nom: 'Station 1',
				arbres: [{
					essence: 'Chêne',
					circonference: 125
				}]
			});
		}
	});
});
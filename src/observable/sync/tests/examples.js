define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../Stateful',
	// './Person',
	'./PersonWithAddress',
	// './Station',
	// './Task'
], function(
	registerSuite,
	assert,
	compose,
	Stateful,
	// Person,
	PersonWithAddress
	// Station,
	// Task
){
/*	registerSuite({
		name: 'simple value',
		'set get': function() {
			var obs = new Stateful(undefined);
			assert.equal(obs.getValue(), undefined);

			obs.setValue('toto');
			assert.equal(obs.getValue(), 'toto');
		},
		'observing value': function() {
			var observedValues = [];
			var obs = new Stateful();

			var observe = obs.onValue(function(value) {
				observedValues.push(value);
			});

			obs.setValue('toto');
			assert.deepEqual(observedValues, [
				'toto',
			]);

			observe.destroy();
			obs.setValue('titi');
			assert.deepEqual(observedValues, [
				'toto',
			]);
		},
	});
*/
/*	registerSuite({
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
	});
*/
	registerSuite({
		name: 'Person with address',
		'set get nested': function() {
			var obs = new PersonWithAddress();

			assert.deepEqual(obs.value(), {
				firstName: "",
				lastName: "",
				address: {
					city: "",
					street: ""
				}
			});
			obs.value({
				firstName: "toto",
				lastName: "",
				address: {
					city: "Paris",
					street: "rue de la paix"
				}
			});
			assert.deepEqual(obs.value(), {
				firstName: 'toto',
				lastName: "",
				address: {
					city: "Paris",
					street: "rue de la paix"
				}
			});

			var streetProp = obs.prop('address').prop('street');

			assert.equal(streetProp.value(), "rue de la paix");

			streetProp.value('av des Champs-Elysees');

			assert.deepEqual(obs.value(), {
				firstName: 'toto',
				lastName: "",
				address: {
					city: "Paris",
					street: "av des Champs-Elysees"
				}
			});
		},
	});

/*	registerSuite({
		name: "Station et arbres",
		"get set": function() {
			var obs = new Station();

			assert.deepEqual(obs.get(), {
				nom: '',
				arbres: [],
				position: undefined
			});

			obs.getProperty('nom').set('Station 1');

			var arbresProp = obs.getProperty('arbres');

			var arbre1Accessor = arbresProp.add();

			assert.deepEqual(arbre1Accessor.get(), {
				essence: undefined,
				circonference: undefined
			});

			arbre1Accessor.getProperty('essence').set('Frêne');
			arbre1Accessor.getProperty('circonference').set(45);

			assert.deepEqual(obs.get(), {
				nom: 'Station 1',
				position: undefined,
				arbres: [{
					essence: 'Frêne',
					circonference: 45
				}]
			});

			var arbre2Accessor = arbresProp.add({
				essence: 'Chêne',
				circonference: 125
			});

			assert.deepEqual(obs.get(), {
				nom: 'Station 1',
				position: undefined,
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
				position: undefined,
				arbres: [{
					essence: 'Chêne',
					circonference: 125
				}]
			});

			assert.deepEqual(arbre2Accessor.get(), {
				essence: 'Chêne',
				circonference: 125
			});
		},
		"observing changes": function() {
			var obs = new Station();
			var observedChanges = [];
			var canceler = obs.onChanges(function(ev) {
				observedChanges.push(ev);
			});

			obs.getProperty('nom').set('Station 1');
			obs.getProperty('arbres').add().getProperty('essence').set('Frêne');

			assert.deepEqual(observedChanges[0], [{
				type: 'set',
				key: 'nom',
				value: "Station 1"
			}]);
			assert.deepEqual(observedChanges[1], [{
				type: 'patched',
				key: 'arbres',
				arg: [{
					type: 'added',
					index: 0,
					value: {
						essence: undefined,
						circonference: undefined
					}
				}]
			}]);
			assert.deepEqual(observedChanges[2], [{
				type: 'patched',
				key: 'arbres',
				arg: [{
					type: 'patched',
					index: 0,
					arg: [{
						type: 'set',
						key: 'essence',
						value: 'Frêne'
					}]
				}]
			}]);
		},
		"observing sub-changes": function() {
			var arbresProp = new Station().getProperty('arbres');

			var arbresChanges = [];
			var canceler = arbresProp.onChanges(function(ev) {
				arbresChanges.push(ev);
			});

			arbresProp.add({
				essence: "Frêne",
				circonference: 56
			});
			arbresProp.add({
				essence: 'Chêne',
				circonference: 125
			});
			arbresProp.remove(0);

			assert.deepEqual(arbresChanges[0], [{
				type: 'added',
				index: 0,
				value: {
					essence: "Frêne",
					circonference: 56
				}
			}]);
			assert.deepEqual(arbresChanges[1], [{
				type: 'added',
				index: 1,
				value: {
					essence: "Chêne",
					circonference: 125
				}
			}]);
			assert.deepEqual(arbresChanges[2], [{
				type: 'removed',
				index: 0
			}]);
		}
	});

	registerSuite({
		name: "Locked tasks",
		"get set": function() {
			var obs = new Task();
			assert.deepEqual(obs.get(), {
				label: "",
				done: false
			});

			var observedLabels = [];
			var labelAcc = obs.getProperty('label');
			var canceler = labelAcc.onValue(function(value) {
				observedLabels.push(value);
			});

			obs.set({
				label: "A faire pour demain."
			});
			assert.deepEqual(obs.get(), {
				label: "A faire pour demain.",
				done: false
			});

			obs.patch([{
				type: 'set',
				key: 'done',
				value: true
			}]);
			assert.deepEqual(obs.get(), {
				done: true,
				label: "A faire pour demain."
			});

			obs.patch([{
				type: 'set',
				key: 'label',
				value: "A faire pour hier."
			}]);
			assert.deepEqual(obs.get(), {
				done: true,
				label: "A faire pour demain."
			});

			obs.set({
				label: "Toujours à faire"
			});
			assert.deepEqual(obs.get(), {
				label: "Toujours à faire",
				done: false
			});

			assert.deepEqual(observedLabels, [
				"",
				"A faire pour demain.",
				"A faire pour demain.",
				"A faire pour demain.",
				"Toujours à faire"
			]);
		},
		"observing changes": function() {
			var obs = new Task();

			var observedChanges = [];
			var canceler = obs.onChanges(function(value) {
				observedChanges.push(value);
			});

			var labelAcc = obs.getProperty('label');
			var doneAcc = obs.getProperty('done');
			labelAcc.set("A faire pour demain");
			doneAcc.set(true);
			labelAcc.set("Plus à faire");

			assert.deepEqual(obs.get(), {
				label: "A faire pour demain",
				done: true
			});

			assert.deepEqual(observedChanges[0], [{
				type: 'set',
				key: 'label',
				value: "A faire pour demain"
			}]);
			assert.deepEqual(observedChanges[1], [{
				type: 'set',
				key: 'done',
				value: true
			}]);
			assert.equal(observedChanges.length, 2);
		}
	});*/
});
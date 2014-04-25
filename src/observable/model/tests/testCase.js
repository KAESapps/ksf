define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../StatefulFactory',
	'../../StatefulWithLogicFactory',
	'../Store',
	'../Value',
	'../IncrementalPropertyObject',
	'../PropertyObjectOrUndefined',
	'../ImplicitDict',
	'../AtomicPropertyObject',
	'../Integer',

], function(
	registerSuite,
	assert,
	compose,
	StatefulFactory,
	StatefulWithLogicFactory,
	Store,
	Value,
	IncrementalPropertyObject,
	PropertyObjectOrUndefined,
	ImplicitDict,
	AtomicPropertyObject,
	Integer
){

	var SiteStore = new StatefulFactory(new Store(new IncrementalPropertyObject({
		nom: new Value(),
		description: new Value(),
		adresse: new IncrementalPropertyObject({
			rue: new Value(),
			ville: new Value(),
		}),
	}))).ctr;


	var siteStore;
	registerSuite({
		name: 'nested model',
		'beforeEach': function() {

			siteStore = new SiteStore({
				1: {
					nom: "Site 1",
					description: "description du site 1",
					adresse: {
						rue: "av de la République",
						ville: 'Choisy',
					},
				},
			});
		},
		'basic': function() {
			assert.deepEqual(siteStore._value, {
				"1": {
					nom: "Site 1",
					description: "description du site 1",
					adresse: {
						rue: "av de la République",
						ville: 'Choisy',
					},
				}
			});
		},
		'item accessor value': function() {
			var site1Accessor = siteStore.item("1");
			assert.deepEqual(site1Accessor.value(), {
				nom: "Site 1",
				description: "description du site 1",
				adresse: {
					rue: "av de la République",
					ville: 'Choisy',
				},
			});

		},
		'item accessor prop': function() {
			var site1Accessor = siteStore.item("1");
			var nomDuSite1 = site1Accessor.prop('nom');
			assert.equal(nomDuSite1.value(), "Site 1");
			nomDuSite1.value("Nouveau nom du site 1");
			assert.equal(nomDuSite1.value(), "Nouveau nom du site 1");

		},
		'nested item accessor prop': function() {
			var site1Accessor = siteStore.item("1");
			var site1AddressAccessor = site1Accessor.prop('adresse');
			var site1CityAccessor = site1AddressAccessor.prop('ville');
			assert.equal(site1CityAccessor.value(), "Choisy");
			site1CityAccessor.value("Paris");
			assert.equal(site1CityAccessor.value(), "Paris");

		},
	});

	var LastRequestStatus = new StatefulFactory(new PropertyObjectOrUndefined({
		started: new Value(),
		finished: new Value(),
		stage: new Value(),
	})).ctr;

	registerSuite({
		name: 'PropertyObjectOrUndefined',
		"init to undefined": function() {
			var reqStatus = new LastRequestStatus();
			assert.equal(reqStatus.value(), undefined);
		},
		"init to object": function() {
			var reqStatus = new LastRequestStatus({
				started: "started",
				finished: undefined,
				stage: "stage",
			});
			assert.deepEqual(reqStatus.value(), {
				started: "started",
				finished: undefined,
				stage: "stage",
			});
		},
		"from object to undefined": function() {
			var reqStatus = new LastRequestStatus({
				started: "started",
				finished: undefined,
				stage: "stage",
			});
			var observedChanges = [];
			reqStatus.onChange(function(change) {
				observedChanges.push(change);
			});
			var observedValues = [];
			reqStatus.onChange(function(value) {
				observedValues.push(value);
			});

			reqStatus._change(undefined);

			assert.deepEqual(observedChanges, [
				undefined,
			]);
			assert.deepEqual(observedValues, [
				undefined,
			]);
		},
		"from undefined to object": function() {
			var reqStatus = new LastRequestStatus();
			var observedChanges = [];
			reqStatus.onChange(function(change) {
				observedChanges.push(change);
			});
			var observedValues = [];
			reqStatus.onChange(function(value) {
				observedValues.push(value);
			});

			reqStatus._change({
				started: "started",
				stage: "stage",
			});

			assert.deepEqual(observedChanges, [
				{
					started: "started",
					stage: "stage",
				},
			]);
			// pour un PropertyObjectOrUndefined, il faut interpréter de façon équivalente le fait que la propriété n'existe pas ou que sa valeur soit égale à undefined.
			assert.deepEqual(observedValues, [
				{
					started: "started",
					stage: "stage",
				},
			]);
		},
		"started accessor from undefined to object": function() {
			var reqStatus = new LastRequestStatus();
			var startedAccessor = reqStatus.prop('started');
			var observedValues = [];
			startedAccessor.onChange(function(value) {
				observedValues.push(value);
			});

			reqStatus._change({
				started: "started",
				stage: "stage",
			});

			assert.deepEqual(observedValues, [
				"started",
			]);
		},
		"finished accessor from undefined to object": function() {
			var reqStatus = new LastRequestStatus();
			var accessor = reqStatus.prop('finished');
			var observedValues = [];
			accessor.onChange(function(value) {
				observedValues.push(value);
			});

			reqStatus._change({
				started: "started",
				stage: "stage",
			});

			assert.deepEqual(observedValues, [
			]);
		},
		"started accessor from object to undefined": function() {
			var reqStatus = new LastRequestStatus({
				started: "started",
				finished: undefined,
				stage: "stage",
			});
			var startedAccessor = reqStatus.prop('started');
			var observedValues = [];
			startedAccessor.onChange(function(value) {
				observedValues.push(value);
			});

			reqStatus._change(undefined);

			assert.deepEqual(observedValues, [
				undefined,
			]);
		},
	});

	var Dict = new StatefulFactory(new ImplicitDict()).ctr;

	registerSuite({
		name: 'ImplicitDict',
		"init value": function() {
			var dict = new Dict({
				nom: 'toto',
				age: 30,
			});

			assert.deepEqual(dict.value(), {
				nom: 'toto',
				age: 30,
			});
		},
		"prop accessor get value": function() {
			var dict = new Dict({
				nom: 'toto',
				age: 30,
			});
			var nom = dict.prop('nom');

			assert.deepEqual(nom.value(), "toto");
		},
		"prop accessor set value": function() {
			var dict = new Dict({
				nom: 'toto',
				age: 30,
			});
			var nom = dict.prop('nom');
			nom.value('titi');
			assert.deepEqual(nom.value(), "titi");
		},
		"prop accessor changes": function() {
			var dict = new Dict({
				nom: 'toto',
				age: 30,
			});
			var observedValues = [];
			var nom = dict.prop('nom');
			nom.onChange(function(value) {
				observedValues.push(value);
			});
			nom.value('titi');

			assert.deepEqual(observedValues, ["titi"]);
		},
		"set prop value to undefined": function() {
			var dict = new Dict({
				nom: 'toto',
				age: 30,
			});
			var observedValues = [];
			var nom = dict.prop('nom');
			nom.onChange(function(value) {
				observedValues.push(value);
			});
			nom.value(undefined);

			assert.deepEqual(observedValues, [undefined]);

			assert.deepEqual(dict.value(), {
				age: 30,
			});
		},


	});

	var Site = new StatefulWithLogicFactory(new AtomicPropertyObject({
		nom: new Value(),
		surface: new Integer(),
	})).ctr;

	registerSuite({
		name: 'AtomicPropertyObject',
		"no init value": function() {
			var site = new Site();
			assert.deepEqual(site.value(), {
				nom: undefined,
				surface: undefined,
			});
		},
		"change value": function() {
			var site = new Site();
			site.change({
				nom: "site 1",
				surface: 45.3,
			});
			assert.deepEqual(site.value(), {
				nom: "site 1",
				surface: 45,
			});
		},
		"observe value": function() {
			var site = new Site();
			var observedValues = [];
			site.onChange(function(value) {
				observedValues.push(value);
			});
			site.change({
				nom: "site 1",
				surface: 45.3,
			});
			assert.deepEqual(observedValues, [{
				nom: "site 1",
				surface: 45,
			}]);
		},
	});

});
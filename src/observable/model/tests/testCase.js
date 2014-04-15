define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../StatefulFactory',
	'../Store',
	'../Value',
	'../BasicPropertyObject',
	'../PropertyObjectOrUndefined',

], function(
	registerSuite,
	assert,
	compose,
	StatefulFactory,
	Store,
	Value,
	BasicPropertyObject,
	PropertyObjectOrUndefined
){

	var SiteStore = new StatefulFactory(new Store(new BasicPropertyObject({
		nom: new Value(),
		description: new Value(),
		adresse: new BasicPropertyObject({
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
			reqStatus.onChanges(function(change) {
				observedChanges.push(change);
			});
			var observedValues = [];
			reqStatus.onValue(function(value) {
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
			reqStatus.onChanges(function(change) {
				observedChanges.push(change);
			});
			var observedValues = [];
			reqStatus.onValue(function(value) {
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
			startedAccessor.onValue(function(value) {
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
			accessor.onValue(function(value) {
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
			startedAccessor.onValue(function(value) {
				observedValues.push(value);
			});

			reqStatus._change(undefined);

			assert.deepEqual(observedValues, [
				undefined,
			]);
		},
	});

});
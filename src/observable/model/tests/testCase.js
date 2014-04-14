define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../StatefulFactory',
	'../Store',
	'../Value',
	'../BasicPropertyObject',

], function(
	registerSuite,
	assert,
	compose,
	StatefulFactory,
	Store,
	Value,
	BasicPropertyObject
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

});
define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'../../computers/Store',
	'../../computers/BasicPropertyObject',
	'../../computers/Value',
	'../../sync/_Stateful',
	'../../accessorMixins/Store',
	'../../accessorMixins/BasicPropertyObject',
	'../../accessorMixins/Value',
], function(
	registerSuite,
	assert,
	compose,
	StoreComputer,
	PropertyObjectComputer,
	ValueComputer,
	_Stateful,
	StoreAccessorMixin,
	BasicPropertyObjectAccessorMixin,
	ValueAccessorMixin
){

	var Store = compose(function(itemModel) {
		this.computer = new StoreComputer(itemModel.computer);
		this.accessorMixin = new StoreAccessorMixin(itemModel.accessorMixin).ctr;
	});

	var BasicPropertyObject = compose(function(properties) {
		var computers = {},
			accessorMixins = {};
		Object.keys(properties).forEach(function(prop) {
			computers[prop] = properties[prop].computer;
			accessorMixins[prop] = properties[prop].accessorMixin;
		});
		this.computer = new PropertyObjectComputer(computers);
		this.accessorMixin = new BasicPropertyObjectAccessorMixin(accessorMixins).ctr;
	});

	var Value = compose(function() {
		this.computer = new ValueComputer();
		this.accessorMixin = new ValueAccessorMixin().ctr;
	});

	var Stateful = compose(function(model) {
		this.ctr = compose(_Stateful, model.accessorMixin, {
			_computer: model.computer,
		}, function(data) {
			this._value = data;
		});
	});

	var SiteStore = new Stateful(new Store(new BasicPropertyObject({
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
	});

});
define([
	'intern!object',
	'intern/chai!assert',
	'../ResourcesManager',
	'../propertyManagers/PropertyValueStore',
	'../propertyManagers/WithValueIsMap',
	"compose",
	'ksf/collections/ObservableObject',
], function(
	registerSuite,
	assert,
	ResourceManager,
	PropertyValueStore,
	WithValueIsMap,
	compose,
	ObservableObject
) {
	var typeMng = new ResourceManager({
		factory: {create: function() {
			return new ResourceManager({
				factory: {create: function() {
					return {};// pour le test, les ressources n'exposent aucune donnée
				}},
			});
		}},
	});
	var labelPropMng = new PropertyValueStore();
	typeMng.propertyManagers.label = labelPropMng;
	typeMng.propertyManagers.props = new PropertyValueStore();
	WithValueIsMap.call(typeMng.propertyManagers.props);

	var addressMng = typeMng.create();

	var uriPropMng = new PropertyValueStore({
		schema: {type: 'string'},
	});
	var originalSetValue = uriPropMng.setValue;
	uriPropMng.setValue = function(rsc, value) {
		if (typeof value !== 'string'){
			throw "value is not conform to schema";
		} else {
			originalSetValue.apply(this, arguments);
		}
	};


	typeMng.setPropValue(addressMng, 'label', "Manager d'adresses");
	typeMng.setPropValue(addressMng, 'props', {
		uri: uriPropMng,
	});
	addressMng.propertyManagers = typeMng.getPropValue(addressMng, 'props');


	var myAddress = addressMng.create();
	typeMng.getPropValue(addressMng, 'props').uri.setValue(myAddress, "example.com/address/myaddress");

	var countryManager = typeMng.create();
	typeMng.setPropValue(countryManager, 'props', {
		code: new PropertyValueStore(),
	});
	countryManager.propertyManagers = typeMng.getPropValue(countryManager, 'props');

	var countryPropMng = new PropertyValueStore();
	originalSetValue = countryPropMng.setValue;
	countryPropMng.setValue = function(rsc, value) {
		if (! countryManager.has(value)){
			throw "value is not valid";
		} else {
			originalSetValue.apply(this, arguments);
		}
	};
	typeMng.getPropValue(addressMng, 'props').country = countryPropMng;

	var france = countryManager.create({
		code: 'fr',
	});

	addressMng.setPropValue(myAddress, "country", france);


	registerSuite({
		'basic prop of rscMng': function() {
			assert.equal(typeMng.getPropValue(addressMng, 'label'), "Manager d'adresses");
		},
		'props prop of rscMng': function() {
			assert.throw(function() {
				typeMng.getPropValue(addressMng, 'props').uri.setValue(myAddress, 1234);
			});
			assert.equal(typeMng.getPropValue(addressMng, 'props').uri.getValue(myAddress), "example.com/address/myaddress");
		},
		'propMng on generated rscMng': function() {
			assert.equal(addressMng.getPropValue(myAddress, 'uri'), "example.com/address/myaddress");
		},
		'relation': function() {
			assert.equal(addressMng.getPropValue(myAddress, 'country'), france);
			assert.throw(function() {
				addressMng.setPropValue(myAddress, "country", {code: 'fr'});
			});
		},
	});
});
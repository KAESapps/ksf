define([
	'intern!object',
	'intern/chai!assert',
	'../ResourcesManager',
	'../propertyManagers/PropertyValueStore',
	'../propertyManagers/WithValueIsMap',
	"compose",
	'ksf/collections/ObservableObject',
	'dojo/store/Memory',
], function(
	registerSuite,
	assert,
	ResourceManager,
	PropertyValueStore,
	WithValueIsMap,
	compose,
	ObservableObject,
	MemoryStore
) {

	var PropertyManager = compose(
		PropertyValueStore,
		function(args){
			this.type = args.type;
		}, {
			setValue: function(rsc, value) {
				if (! this.type.isValid(value)){
					throw "the value is not of the required type";
				} else {
					PropertyValueStore.prototype.setValue.apply(this, arguments);
				}
			},
		}
	);

	// *** non resource type constructor
	var NonResourceType = compose(function(schema){
			// this.typeof = schema.type;
		}, {
			isValid: function(value){
				// TODO: utiliser un json schema validator
				return typeof value === typeMng.getPropValue(this, 'typeof');
			},
		}
	);

	// *** resource type constructor
	var ResourceType = compose(ResourceManager, function(args){
			// this.typeof = args.type;
	}, {
		add: function(rsc){
			// TODO: utiliser un json schema validator
			if (typeof rsc !== typeMng.getPropValue(this, 'typeof')) {
				throw 'the resource is not conform to schema';
			}
			return this.resources.add(rsc);
		},
		isValid: function(value){
			// pour les types dont les valeurs sont des ressources, on s'assure uniquement qu'elle est bien référencée (car le contrôle de sa validité a été fait à l'enregistrement)
			return this.has(value);
		},

	});



	// *** type manager
	var typeMng = new ResourceManager({
		factory: {create: function(args) {
			var type;
			// TODO: comment choisir entre ResourceType et NonResourceType ?
			if (args.isResourceType){
				type = new ResourceType({
					factory: {create: function() {
						return {};// pour le test, les ressources n'exposent aucune donnée
					}},
				});
			} else {
				type = new NonResourceType();
			}
			return type;
		}},
	});
	typeMng.propertyManagers.typeof = new PropertyValueStore();

	// one non resource type
	var stringType = typeMng.create({
		isResourceType: false,
		typeof: 'string',
	});


	typeMng.propertyManagers.id = new PropertyManager({
		type: stringType,
	});
	typeMng.propertyManagers.label = new PropertyManager({
		type: stringType,
	});
	typeMng.propertyManagers.props = new PropertyValueStore();

	// *** register string type as a type
	// we don't use typeMng.create because it is only
	// typeMng.add(stringType);
	typeMng.setEachPropValue(stringType, {
		id: 'string',
		label: 'type natif string',
	});

	// **** person manager with only uri prop
	var personMng = typeMng.create({
		isResourceType: true,
	});
	typeMng.setPropValue(personMng, 'typeof', "object");
	typeMng.setPropValue(personMng, 'label', "Manager du type Person");
	typeMng.setPropValue(personMng, 'props', {
		uri: new PropertyManager({
			type: stringType,
		}),
	});
	personMng.propertyManagers = typeMng.getPropValue(personMng, 'props');

	// **** create person
	var syv = personMng.create();
	typeMng.getPropValue(personMng, 'props').uri.setValue(syv, "example.com/person/syv");

	// **** extend person type with 'spouse' property that only accepts a value of type Person
	var personSpousePropMng = new PropertyValueStore();
	var originalSetValue = personSpousePropMng.setValue;
	personSpousePropMng.setValue = function(rsc, value) {
		if (! personMng.has(value)){
			throw "value is not valid";
		} else {
			originalSetValue.apply(this, arguments);
		}
	};
	typeMng.getPropValue(personMng, 'props').spouse = personSpousePropMng;

	// *** define spouse property of syv
	var aur = personMng.create();
	typeMng.getPropValue(personMng, 'props').uri.setValue(aur, "example.com/person/aur");
	personMng.setPropValue(syv, 'spouse', aur);

	// *** create city manager and the Choisy city
	var cityMng = typeMng.create({
		isResourceType: true,
	});
	typeMng.setPropValue(cityMng, 'typeof', 'object');
	typeMng.setPropValue(cityMng, 'props', {
		name: new PropertyValueStore(),
		code: new PropertyValueStore(),
	});
	cityMng.propertyManagers = typeMng.getPropValue(cityMng, 'props');
	var choisy = cityMng.create({
		name: 'Choisy',
		code: '94600',
	});
	cityMng.getProperty = "code";

	// **** extend person type with 'address' property that only accepts a an object with street as string, number as string and city as City
	var cityType = {
		prototype: {},
		instanceCollection: [],
		props: {
			code: {
				type: stringType,
				isValid: function(value){
					return this.type.isValid(value);
				},
			},
			name: {
				type: stringType,
				isValid: function(value){
					return this.type.isValid(value);
				}
			},
		},
		required: ['code'],
		isValid: function(value){
			if (! this.instanceCollection.has(value)) { return false; }
			if (typeof value !== 'object'){ return false; }
			Object.keys(this.props).forEach(function(key){
				if (! this.props[key].isValid(value[key])){
					return false;
				}
			});
			return true;
		},
		create: function(args){
			var instance = Object.create(this.prototype);
			Object.keys(args).forEach(function (key) {
				instance[key] = args[key];
			});
			this.instanceCollection.push(instance);
			if (! this.isValid(instance)) {
				this.instanceCollection.pop();
				throw 'invalid args';
			}
			return instance;
		},
	};

	var addressType = {
		props: {
			street: {
				type: stringType,
				isValid: function(value){
					return this.type.isValid(value);
				},
			},
			number: {
				type: stringType,
				isValid: function(value){
					return this.type.isValid(value);
				}
			},
			city: {
				type: cityMng,
				isValid: function(value){
					return this.type.isValid(value);
				}
			},
		},
		required: ['city'],
		isValid: function(value){
			if (typeof value !== 'object'){ return false; }
			Object.keys(this.props).forEach(function(key){
				if (! this.props[key].isValid(value[key])){
					return false;
				}
			});
			return true;
		},
	};
	var personAddressPropMng = new PropertyValueStore();
	originalSetValue = personAddressPropMng.setValue;
	personAddressPropMng.setValue = function(rsc, value) {
		originalSetValue.apply(this, arguments);
	};
	typeMng.getPropValue(personMng, 'props').address = personAddressPropMng;

	// *** define address property of syv
	var syvAddress = {
		street: "Avenue de la république",
		number: "2",
		city: cityMng.get("94600"),
	};
	personMng.setPropValue(syv, 'address', syvAddress);

	// *** create manager of personCollections
/*	var personCollectionMng = typeMng.create({
		label: "Manager de collections de personnes",
		props: {
			uri: new PropertyValueStore({
				// TODO: faire une classe PropertyManager qui accepte un store (l'instance, un new Map ou n'importe quelle collection de type Map avec get/set/add)
				store: new Map(),
				type: typeMng.create({
					label: 'type string natif',
					type: typeMng.get('string'),
				}),
			}),
			// items:
			page: new PropertyValueStore({
				type: typeMng.create({
					label: 'type number natif',
					type: typeMng.get('number'),
				}),
			}),
			next: new PropertyValueStore({
				type: personCollectionMng,
			}),
			previous: new PropertyValueStore({
				type: personCollectionMng,
			}),
		},
		required: ['items'],
	});
*/


	registerSuite({
		'basic prop of rscMng': function() {
			assert.equal(typeMng.getPropValue(personMng, 'label'), "Manager du type Person");
		},
		'props prop of rscMng': function() {
			assert.throw(function() {
				typeMng.getPropValue(personMng, 'props').uri.setValue(syv, 1234);
			});
			assert.equal(typeMng.getPropValue(personMng, 'props').uri.getValue(syv), "example.com/person/syv");
		},
		'propMng on generated rscMng': function() {
			assert.equal(personMng.getPropValue(syv, 'uri'), "example.com/person/syv");
		},
		'relation': function() {
			assert.equal(personMng.getPropValue(syv, 'spouse'), aur);
			assert.throw(function() {
				personMng.setPropValue(syv, "spouse", {uri: "example.com/person/aur"});
			});
		},
		'indirect relation': function() {
			assert.equal(personMng.getPropValue(syv, 'address').number, "2");
			assert.throw(function() {
				personMng.setPropValue(syv, "address", {street: "test", number: "3", city: "Choisy"});
			});
			var syvAddressCity = personMng.getPropValue(syv, 'address').city;
			assert.equal(cityMng.getPropValue(syvAddressCity, "code"), "94600");

		},

	});
});
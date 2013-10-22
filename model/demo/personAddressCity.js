define([
	'intern!object',
	'intern/chai!assert',
	'lodash/objects/cloneDeep',
	"compose",
	'ksf/collections/ObservableObject',
], function(
	registerSuite,
	assert,
	cloneDeep,
	compose,
	ObservableObject
) {
	var MemoryStore = compose(function() {
		this.data = {};
		this.counter = 0;
	}, {
		get: function(id) {
			return this.data[id];
		},
		put: function(value, id) {
			if (!id){
				id = this.counter++;
			}
			if (typeof value === 'object'){
				value = cloneDeep(value); // comme cela on est sûr de fonctionner comme un datasource hors mémoire
			}
			this.data[id] = value;
			return id;
		},
		delete: function(id) {
			delete this.data[id];
		},
	});

	var stringType = {
		serialize: function(instance) {
			// TODO?: if (typeof instance === 'string')
			return instance;
		},
		deserialize: function(data) {
			return data+''; // coerce to string
		},
	};

	// prototype pour les types composite qui ne sont pas des ressources
	var compositeType = {
		description: null,
		// délègue en cascade au serialize des types
		serialize: function(instance) {
			var data = {};
			Object.keys(this.description.properties).forEach(function(propName) {
				var prop = this.description.properties[propName];
				var value = instance[propName];
				var serializePropName = prop.serializePropName || propName;
				data[serializePropName] = prop.type.serialize(value);
			}.bind(this));
			return data;
		},
		// cette implémentation transforme la sérialisation en arguments pour la méthdde 'create'
		// c'est à dire que 'create' doit être adapté pour recevoir ces arguments et construire une instance qui correspond
		deserialize: function(data) {
			var createArgs = {};
			Object.keys(this.description.properties).forEach(function(propName) {
				var prop = this.description.properties[propName];
				var value = data[propName];
				createArgs[propName] = prop.type.deserialize(value);
			}.bind(this));
			return this.create(createArgs);
		},
	};


	var resourceType = Object.mixin(Object.create(compositeType), {
		dataSource: null,
		registry: null,
		// pour une ressource, sa sérialisation publique est un simple id
		serialize: function(instance) {
			return this.getIdentity(instance);
		},
		// ... donc sa désérialisation consiste à retrouver l'instance correspondant à l'id, ou à la créer si elle n'existe pas encore ou n'est pas en cache en mémoire
		deserialize: function(id) {
			return this.getOrCreate(id);
		},
		// persiste les données de la ressource dans le dataSource
		save: function(instance) {
			// serialize interne qui est en fait le même que le serialize public d'un type composite
			var data = compositeType.serialize.call(this, instance);
			// stockage
			var id = this.getIdentity(instance);
			if (id) {
				this.dataSource.put(data, id);
			} else {
				id = this.dataSource.put(data);
				this.register(instance, id);
			}
		},
		// charge les données depuis le dataSource, les désérialise et met à jour l'instance avec 'restore'
		// ce sont en fait les mêmes arguments que pour 'create', mais dans ce cas, l'instance existe déjà
		load: function(instance) {
			var data = this.dataSource.get(this.getIdentity(instance));
			var restoreArgs = compositeType.deserialize.call(this, data);
			this.restore(instance, restoreArgs);
		},
		// récupère une instance du regsitre par id ou en crée une pour cet id
		getOrCreate: function(id) {
			var instance = this.registry[id];
			if (!instance){
				instance = this.create();
				this.registry[id] = instance;
			}
			return instance;
		},
		register: function(instance, id) {
			if (!id) {
				id = Math.floor(Math.random() * 10000)+'';
			}
			this.registry[id] = instance;
		},
		getIdentity: function(instance) {
			var ret;
			// look for id by instance
			Object.keys(this.registry).forEach(function(identity) {
				if (this.registry[identity] === instance){
					ret = identity;
				}
			}.bind(this));
			return ret;
		},
	});

	// exemple d'un objet qui se sérialise en string
	var PostalCode = compose(function(data) {
		this.depCode = data.substring(0,2);
		this.bureauCode = data.substring(2,5);
	}, {
		describe: 'Code postal',
	});
	var postalCodeType = {
		serialize: function(instance) {
			return instance.depCode+instance.bureauCode;
		},
		deserialize: function(data) {
			return new PostalCode(data);
		},
	};



	var City = compose(function(args) {
		this.name = args.name;
		this.postalCode = args.postalCode;
	}, {
		describe: function() {
			return "Je suis la ville de "+ this.name;
		},
	});
	var cityType = Object.mixin(Object.create(resourceType), {
		dataSource: new MemoryStore(),
		registry: {},
		create: function(args) {
			return new City(args);
		},

		description: {
			label: 'Milieu physique de concentration urbaine',
			type: 'object',
			properties: {
				name: {
					label: "Nom de la ville",
					type: stringType,
				},
				postalCode: {
					label: "Code postal",
					type: postalCodeType,
					serializePropName: 'cp',
				},
			},
		},
	});

	var Address = compose(function(args) {
		this.street = args.street;
		this.number = args.number;
		this.city = args.city;
	}, {
		describe: function() {
			return "Bonjour, je suis une addresse";
		},
	});
	var addressType = Object.mixin(Object.create(compositeType), {
		description: {
			label: 'Addresse postale',
			type: 'object',
			properties: {
				street: {
					label: "Nom de la rue",
					type: stringType,
					default: "",
				},
				number: {
					label: "Numéro de la rue",
					type: stringType,
					default: "",
				},
				city: {
					label: "Ville",
					type: cityType,
				},
			},
		},
		create: function(args) {
			// on prend le cas d'un constructeur qui a des arguments obligatoires
			// donc on est obligé de fournir des valeurs par défaut pour les champs obligatoires
			return new Address({
				street: args && args.street || "",
				number: args && args.number || "",
				city: args && args.number || new City({
					name: "default",
					postalCode: new PostalCode('00000'),
				}),
			});
		},
	});


	var Person = compose(function(args) {
		this.name = args.name;
		this.address = args.address;
	}, {
		describe: function() {
			return "Bonjour, je suis "+ this.name;
		},
		// l'idée par rapport à setEach est que si l'instance a des propriétés qui ne sont pas dans 'args', il faut les enlever
		setAll: function(args) {
			if(args.name){
				this.name = args.name;
			} else {
				delete this.name;
			}
			if(args.address){
				this.address = args.address;
			} else {
				delete this.address;
			}
		},
	});
	var personType = Object.mixin(Object.create(resourceType), {
		create: function(args) {
			return new Person(args);
		},
		restore: function(instance, args) {
			instance.setAll(args);
		},
		description: {
			label: 'Personne physique',
			type: 'object',
			isResource: true,
			properties: {
				name: {
					label: "Nom usuel",
					type: stringType,
				},
				address: {
					label: "Adresse personnelle",
					type: addressType,
				},
			},
		},
		registry: {},
		dataSource: new MemoryStore(),
	});


	registerSuite({
		'stringType': function() {
			assert.equal(stringType.serialize("2"), "2");
			assert.equal(stringType.deserialize(2), "2");
		},
		'postalCodeType': function() {
			var serialized = "94600";
			var instance = postalCodeType.deserialize(serialized);
			assert.equal(instance.depCode, '94');
			assert.equal(instance.bureauCode, '600');
			assert(postalCodeType.serialize(instance) === serialized); // on peut faire ça car la sérialisation est un string, sinon il faudrait faire un deepEqual
		},
		'cityType': function() {
			var instance = new City({
				name: "Choisy",
				postalCode: new PostalCode("94600"),
			});
			cityType.register(instance);
			var serialized = cityType.serialize(instance);
			assert(cityType.deserialize(serialized) === instance);

			cityType.save(instance);
			assert.deepEqual(cityType.dataSource.get(serialized), {
				name: 'Choisy',
				cp: '94600',
			});

		},
		'addressMng': function() {
			var instance = new Address({
				street: "Avenue de la République",
				number: "2",
				city: new City({
					name: "Choisy",
					postalCode: new PostalCode("94600"),
				}),
			});
			var serialized = addressType.serialize(instance);
			assert(serialized.street === "Avenue de la République");
			assert(serialized.city === cityType.getIdentity(instance.city));
		},
		'personMng': function() {
			var syv = new Person({
				name: "Sylvain",
				address: new Address({
					street: "Avenue de la République",
					number: "2",
					city: new City({
						name: "Choisy",
						postalCode: new PostalCode("94600"),
					}),
				}),
			});
			personType.register(syv);
			var serialized = personType.serialize(syv);
			assert(personType.deserialize(serialized) === syv);

			personType.save(syv);
			assert.deepEqual(personType.dataSource.get(serialized), {
				name: 'Sylvain',
				address: {
					street: "Avenue de la République",
					number: "2",
					city: cityType.getIdentity(syv.address.city),
				},
			});
		},

	});

});
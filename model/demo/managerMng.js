define([
	'intern!object',
	'intern/chai!assert',
	"compose",
	'lodash/objects/cloneDeep',
], function(
	registerSuite,
	assert,
	compose,
	cloneDeep
) {
	var MemoryStore = compose(function() {
		this.data = {};
	}, {
		get: function(id) {
			return this.data[id];
		},
		put: function(value, id) {
			if (typeof value === 'object'){
				value = cloneDeep(value); // comme cela on est sûr de fonctionner comme un datasource hors mémoire
			}
			this.data[id] = value;
		},
		delete: function(id) {
			delete this.data[id];
		},
	});

	// class pour créer des "managers" de valeurs finales (c'est à dire qui ne font pas référence à des ressources) à partir d'un Json schema
	var JsonSchemaTypeMng = compose(function(args) {
		this.schema = args.schema;
	}, {
		serialize: function(instance) {
			// TODO: si c'est un composite, le cloner ?
			return instance;
		},
		isManagerOf: function(instance) {
			return typeof instance === this.schema.type;
			// TODO: return validator.validate(this.serialize(instance), this.schema);
		},
		// cette méthode ne prend pas d'arguments car elle est faite pour créer une instance par défaut
		// si un constructeur requiert des arguments obligatories, c'est à la factory de les fournir
		create: function() {
			// TODO: produire une instance valide à partir du schema, par exemple, un objet avec les propriétés obligatories et les valeurs par défaut
		},
	});

	var stringMng = new JsonSchemaTypeMng({
		schema: {type: 'string'},
	});
	var postalCodeMng = new JsonSchemaTypeMng({
		schema: {
			type: "string",
			maxLength: 5,
		},
	});
	var integerManager = new JsonSchemaTypeMng({
		schema: {type: 'number'},
	});

	// manager pour des objets qui ne sont pas des ressources, c'est à dire qui ne sont pas partageable, n'ont pas de capacité de persistance autonome et dont on ne cherche pas à garantir l'unicité en mémoire
	// mais qui sont plus complexes que ce qui est possible avec un JSON schema (des méthodes, des bindings, ...)
	var CompositeManager = compose(function(args) {
		this.description = args.description;
		this._factory = args.factory;

	}, {
		get: function(id) {
			// ce type produit toujours de nouvelles instances car c'est un type "privé" : ses instances ne sont pas partageables
			// et même si techniquement, on peut attribuer la même instance à 2 personnes différentes, lors de la sérialisation ce sera perdu
			var instance = this.create();
			this.deserialize(instance, id);
			return instance;
		},
		release: function(instance) {
			Object.keys(this.props).forEach(function(key){
				if (instance[key]){
					this.props[key].manager.release(instance[key]);
				}
			}.bind(this));
		},
		has: function(value){
			// pour un type plain object, on ne procède pas par identité mémoire mais par la structure des données
			if (typeof value !== 'object'){ return false; }
			Object.keys(this.props).forEach(function(key){
				if (! this.props[key].manager.has(value[key])){
					return false;
				}
			}.bind(this));
			return true;
		},
		getIdentity: function(instance) {
			// puisque ce manager n'a pas de persistance propre, il renvoi la sérialisation de ses données comme sérialisation d'identité
			// comme ça, quand on fera 'get' avec cette sérialisation, on pourra reconstruire une instance (au lieu de rechercher les données dans le data source à partir d'un id)
			return this.serialize(instance);
		},
		serialize: function(instance) {
			var ret = {};
			Object.keys(this.props).forEach(function (key) {
				ret[key] = this.props[key].manager.getIdentity(instance[key]);
			}.bind(this));
			return ret;
		},
		// crée systématiquement une nouvelle instance
		// en fait, c'est une factory spécialisée qui prend en entrée une sérialisation
		deserialize: function(data) {
			var instance = this._factory();
			Object.keys(this.props).forEach(function (key) {
				if (data[key]){
					instance[key] = this.props[key].manager.get(data[key]);
				} else {
					this.props[key].manager.release(instance[key]);
					delete instance[key];
				}
			}.bind(this));
			return instance;
		},
	});

	var PersistableResourceManager = compose(function(args) {
		this.instancesByIdentity = {};
		this.instancesUserCounter = {};
		this.description = args.description;
		this._factory = args.factory;
		this.dataSource = args.dataSource;
		this.counter = 0;
	}, {
		instancesAreRessources: true, // utile lors de la sérialisation des objets qui font référence à une ville pour savoir s'il faut faire 'getIdentity' ou 'serialize'
		// créée une instance correspondant à l'id ou la renvoie si elle existe déjà. Mais n'interroge pas le datasource
		get: function(id) {
			var instance = this.instancesByIdentity[id];
			if (! instance){
				instance = this._factory();
				this.add(instance, id);
			}
			this.instancesUserCounter[this.getIdentity(instance)]++;
			return instance;
		},
		release: function(instance) {
			var id = this.getIdentity(instance);
			this.instancesUserCounter[id]--;
			if (this.instancesUserCounter[id] === 0){
				this.unload(instance);
				delete this.instancesByIdentity[id];
				delete this.instancesUserCounter[id];
			}
		},
		getIdentity: function(instance) {
			var ret;
			// look for id by instance
			Object.keys(this.instancesByIdentity).forEach(function(identity) {
				if (this.instancesByIdentity[identity] === instance){
					ret = identity;
				}
			}.bind(this));
			return ret;
		},
		// methode privée
		add: function(instance, identity) {
			// ici, on génère un id systématiquement. Mais on pourrait imaginer que ce soit le datasource qui le donne. Dans ce cas, il faudrait utiliser des Maps et pas des dictionnaires pour le compteur d'utilisateurs et autres...
			identity = identity || this.generateIdentity();
			this.instancesByIdentity[identity] = instance;
			this.instancesUserCounter[identity] = 0;
		},
		generateIdentity: function() {
			this.counter++;
			return this.counter+'';
		},
		serialize: function(instance) {
			var data = {};
			Object.keys(this.description.props).forEach(function (key) {
				var propDesc = this.description[key];
				var serializePropName = propDesc.serializePropName || key;
				var valueMng = propDesc.manager;
				if (valueMng.instancesAreRessources) {
					data[serializePropName] = valueMng.getIdentity(instance[key]);
				} else {
					data[serializePropName] = valueMng.serialize(instance[key]);
				}
			}.bind(this));
			return data;
		},
		deserialize: function(serializedData) {
			var values = {};
			Object.keys(this.description.props).forEach(function (key) {
				if (serializedData[key]){
					// on met comme valeur de cahque propriété les données qui correspondent à l'id sérialisé de la valeur
					values[key] = this.props[key].manager.get(serializedData[key]);
				}
			}.bind(this));
			return values;
		},
		load: function(instance) {
			var data = this.dataSource.get(this.getIdentity(instance));
			var values = this.deserialize(data);
			Object.keys(this.description.props).forEach(function (key) {
				if ()
				values[key] = this.props[key].manager.deserialize(serializedData[key]);
			}.bind(this));

		},
		unload: function(instance) {
			Object.keys(this.props).forEach(function (key) {
				if (instance[key]){
					// on averti le manager que l'on n'a plus de dépendance sur une de ses instances
					this.props[key].manager.release(instance[key]);
				}
			}.bind(this));
		},
		merge: function(instance, values) {
			Object.keys(this.description.props).forEach(function (key) {
				if (data[key]){
					instance[key] = this.props[key].manager.get(data[key]);
				} else {
					this.props[key].manager.release(instance[key]);
					delete instance[key];
				}
			}.bind(this));
		},
	});

	var cityMng = new PersistableResourceManager({
		dataSource: new MemoryStore(),
		factory: function() {
			return Object.create({describe: "Je suis une ville"});
		},
		description: {
			label: 'Ville',
			comment: 'Milieu physique où se concentre une forte population humaine',
			props: {
				code: {
					label: "Code postal",
					manager: postalCodeMng,
					required: true,
					serializeAs: "postalCode", // nom de la propriété dans la version sérialisée
				},
				name: {
					label: "Nom de la ville",
					manager: stringMng,
				},
				population: {
					label: 'Population (hab.)',
					manager: integerManager,
				},
			},
		},
		has: function(instance){
			return this.getIdentity !== undefined;
		},
	};

	var personMng = Object.create(cityMng);
	Object.mixin(personMng, {
		instancesByIdentity: {},
		instancesUserCounter: {},
		prototype: {
			describe: "Je suis une personne",
		},
		jsonSchema: {
			type: 'object',
			properties: {
				name: {type: 'string'},
			},
		},
		props: {
			name: {
				manager: stringMng,
				label: 'Dénomination usuelle',
			},
			address: {
				manager: addressMng,
				label: 'Adresse personnelle',
			},
		},
	});

	var addressMng = {
		description: {
			label: 'Adresse postale',
			type: 'object',
			properties: {
				street: {type: 'string'}, // ce n'est pas une ressource, il faut créer un type spécifique
				number: {type: 'string'},
				city: {$ref: '/ks/type/cityOfTheWorld'}, // c'est une ressource
			},
			required: ['city'],
		},
		props: {
			street: {
				manager: stringMng,
				label: "rue de l'adresse",
			},
			number: {
				manager: stringMng,
			},
			city: {
				manager: cityMng,
				required: true,
			},
		},
	};



	// le type propList (liste des propriétés d'un ressource manager) est un type interne de managerMng qui autorise des instances étant un object dont les éléments sont des propertyDescriptor
	var propListMng = Object.create(addressMng);
	Object.mixin(propListMng, {
		create: function(serializedIdentity) {
			return {}; // on retourne l'objet de propriétés directement, il n'y a rien à faire
		},
		has: function(instance) {
			if (typeof value !== 'object'){ return false; }
			// TODO: keys.forEach (propDescMng.has(value))
		},
		serialize: function(instance) {
			var ret = {};
			Object.keys(instance).forEach(function (key) {
				ret[key] = propDescMng.getIdentity(instance[key]);
			}.bind(this));
			return ret;
		},
		deserialize: function(instance, data) {
			Object.keys(data).forEach(function (key) {
				instance[key] = propDescMng.get(data[key]);
			}.bind(this));
		},
	});


	var managerMng = window.managerMng = Object.create(cityMng);
	Object.mixin(managerMng, {
		describe: 'Je suis le manager de managers',
		instancesByIdentity: {},
		instancesUserCounter: {},
		create: function(args) {
			var mng = Object.create(cityMng);
			Object.mixin(mng, {
				instancesByIdentity: {},
				instancesUserCounter: {},
				props: {},
				prototype: {
					describe: 'je suis une ressource générique',
				},
			});
			return mng;
		},
		props: {
			props: {
				manager: propListMng,
			},
		},
	});

	// une instance du type propDesc est un objet ayant au moins la propriété 'manager' dont la valeur est connue de managerMng
	var propDescMng = Object.create(addressMng);
	Object.mixin(propDescMng, {
		props: {
			manager: {
				manager: managerMng,
			},
		},
		create: function(serializedIdentity) {
			return {}; // on retourne l'objet de propriétés directement, il n'y a rien à faire
		},

	});


	registerSuite({
		'stringMng': function() {
			var serializedIdentity = "2";
			var instance = stringMng.get(serializedIdentity);
			assert.equal(instance, "2");
			assert(stringMng.has(instance));
			assert(stringMng.get(serializedIdentity) === instance);
		},
		'postalCodeMng': function() {
			var serializedIdentity = "94600";
			var instance = postalCodeMng.get(serializedIdentity);
			assert.equal(instance, "94600");
			assert(postalCodeMng.has(instance));
			assert(postalCodeMng.get(serializedIdentity) === instance);
		},
		'cityMng': function() {
			var instance = cityMng.get();
			var serializedIdentity = cityMng.getIdentity(instance);
			assert.equal(instance.__proto__, cityMng.prototype); // mais cela n'est pas obligatoire, c'est juste que l'instance a été créée par le constructeur du manager mais dans l'idée, on pourrait aussi ajouter dans un manager des instances créées autrement
			assert(cityMng.has(instance));
			assert(cityMng.get(serializedIdentity) === instance);
		},
		'addressMng': function() {
			var serializedIdentity = {
				street: "Avenue de la république",
				number: "2",
				city: "1",
			};
			var instance = addressMng.get(serializedIdentity);
			assert.equal(instance.street, "Avenue de la république");
			assert.equal(instance.city.describe, "Je suis une ville");

			assert(addressMng.has(instance));
			assert(addressMng.get(serializedIdentity) !== instance); // pour ce type on ne récupère jamais la même instance par identité car il n'y a pas de mécanisme d'unicité de la serialisation de l'identité
		},
		'personMng': function() {
			var serializedIdentity = 'syv';
			var syv = personMng.get(serializedIdentity);
			syv.name = stringMng.get('Sylvain');
			syv.address = addressMng.get({});
			syv.address.street = stringMng.get("Avenue de la République");
			syv.address.number = stringMng.get("2");
			syv.address.city = cityMng.get('1');
			assert(personMng.has(syv));
			assert(personMng.get(serializedIdentity) === syv);
		},
		'customerMng': function() {
			managerMng.set('stringMng', stringMng);
			managerMng.set('addressMng', addressMng);
			var customerMng = window.customerMng = managerMng.get({});
			managerMng.deserialize(customerMng, {
				props: {
					name: {
						manager: 'stringMng',
					},
					address: {
						manager: 'addressMng',
					},
				},
			});
			var customer = window.customer = customerMng.get('test');
			customerMng.deserialize(customer, {
				name: "test",
				address: {
					street: "Avenue de la république",
					number: "2",
					city: "1",
				},
			});
			assert.equal(customer.name, "test");
			cityMng.get('1').name = "Choisy";
		},

	});


});
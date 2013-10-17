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
	var managerProto = {

	};
	// pour un type litéral, la valeur de l'objet est directement utilisable et elle est non modifiable
	var stringMng = {
		jsonSchema: {
			type: "string",
		},
		get: function(serializedIdentity) {
			return serializedIdentity+''; // coerce to string
		},
		has: function (instance) {
			return typeof instance === 'string';
		},
		getIdentity: function(instance) {
			return instance; // l'instance est directement une serialisation de l'identité
		},
		release: function() {},
	};
	var postalCodeMng = {
		jsonSchema: {
			type: "string",
			maxLength: 5,
		},
		get: function(serializedIdentity) {
			if (this.has(serializedIdentity)) {
				return serializedIdentity;
			}
			// sinon on ne retourne rien, c'est à dire 'undefined', donc l'utilisateur devrait l'interpréter comme pas de valeur plutôt que la valeur <undefined>
		},
		has: function (value) {
			if (typeof value !== 'string') {return false;}
			if (value.length > 5) {return false;}
			// TODO: vérifier que ce sont des chiffres
			return true;
		},
		getIdentity: function(instance) {
			return instance; // l'instance est directement une serialisation de l'identité
		},
		release: function() {},
	};

	var cityMng = {
		instancesByIdentity: {},
		instancesUserCounter: {},
		prototype: {
			describe: "Je suis une ville",
		},
		jsonSchema: {
			type: 'object',
			properties: {
				code: {$ref: 'postalCodeMng'},
				name: {type: 'string'},
			},
		},
		props: {
			code: {
				manager: postalCodeMng,
				required: true,
			},
			name: {
				manager: stringMng,
			},
		},
		// get or create from serializedIdentity
		// il faut spécialiser cette méthode pour créer une instance à partir du serializedIdentity si besoin
		get: function(serializedIdentity) {
			var instance = this.instancesByIdentity[serializedIdentity];
			if (! instance){
				instance = this.create();
				this.set(serializedIdentity, instance);
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
		has: function(instance){
			return this.getIdentity !== undefined;
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
		// methode privée à priori
		set: function(identity, instance) {
			identity = identity || this.generateIdentity();
			this.instancesByIdentity[identity] = instance;
			this.instancesUserCounter[identity] = 0;
		},
		// je considère que create est une méthode interne. En fait, c'est juste une factory pour créer une instance
		// l'autre implémentation possible serait : return new City(args);
		create: function(args){
			var instance = Object.create(this.prototype);
			if (args){
				Object.keys(this.props).forEach(function (key) {
					instance[key] = args[key];
				});
			}
			return instance;
		},
		counter: 0,
		generateIdentity: function() {
			this.counter++;
			return this.counter+'';
		},
		serialize: function(instance) {
			var data = {};
			Object.keys(this.props).forEach(function (key) {
				data[key] = this.props[key].manager.getIdentity(instance[key]);
			}.bind(this));
			return data;
		},
		deserialize: function(instance, serializedData) {
			Object.keys(this.props).forEach(function (key) {
				if (serializedData[key]){
					// on met comme valeur de cahque propriété les données qui correspondent à l'id sérialisé de la valeur
					instance[key] = this.props[key].manager.get(serializedData[key]);
				}
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
			},
			address: {
				manager: addressMng,
			},
		},
	});

	var addressMng = {
		prototype: {},
		jsonSchema: {
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
		get: function(serializedIdentity) {
			// ce type produit toujours de nouvelles instances car c'est un type "privé" : ses instances ne sont pas partageables
			// et même si techniquement, on peut attribuer la même instance à 2 personnes différentes, lors de la sérialisation ce sera perdu
			var instance = this.create();
			this.deserialize(instance, serializedIdentity);
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
		create: function(args){
			var instance = Object.create(this.prototype);
			if (args){
				Object.keys(this.props).forEach(function (key) {
					if (args[key]){
						instance[key] = args[key]; // ici les données sont déjà des instances de manager donc, contrairement à deserialize, pas besoin de faire un get sur le manager
					}
				}.bind(this));
			}
			// TODO: faut-il s'assurer de produire une instance avec des données valides ?
			return instance;
		},
		serialize: function(instance) {
			var ret = {};
			Object.keys(this.props).forEach(function (key) {
				ret[key] = this.props[key].manager.getIdentity(instance[key]);
			}.bind(this));
			return ret;
		},
		deserialize: function(instance, data) {
			Object.keys(this.props).forEach(function (key) {
				if (data[key]){
					instance[key] = this.props[key].manager.get(data[key]);
				} else {
					this.props[key].manager.release(instance[key]);
					delete instance[key];
				}
			}.bind(this));
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


	var managerMng = Object.create(cityMng);
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
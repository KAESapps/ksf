define([
	'intern!object',
	'intern/chai!assert',
	'lodash/objects/clone',
	"compose",
	'dojo/store/Memory',
	'dojo/Deferred',
	'ksf/collections/ObservableObject',
	'ksf/collections/Dict',
	'ksf/collections/Set',
], function(
	registerSuite,
	assert,
	clone,
	compose,
	Memory,
	Deferred,
	ObservableObject,
	Dict,
	ObservableSet
) {
	var identity = function(v) { return v; };


	var persistableGenerator = function(args) {
		var SAVE = args.save || "save";
		var LOAD = args.load || "load";
		var REPOSITORY = args.repository || "_repository";

		var proto = {};
		proto[SAVE] = function() {
			return this[REPOSITORY].push(this);
		};
		proto[LOAD] = function() {
			return this[REPOSITORY].pull(this);
		};

		return proto;
	};

	var Repository = compose(function(args) {
		this._registry = {}; // mapping id <-> rsc
		this._factory = args.factory;
		this._dataSource = args.dataSource;
		this._serializer = args.serializer;
	}, {
		// le 'get' est une méthode publique à destination des autres repositories uniquement, pas des utilisateurs des repositories
		// on n'interroge pas le dataSource, donc potentiellement, le get est un create mais on ne le saura qu'en faisant push
		get: function(id) {
			var instance = this._registry[id];
			if (! instance) {
				instance = this._factory();
				this._registry[id] = instance;
			}
			return instance;
		},
		getIdentity: function(rsc) {
			var found;
			Object.keys(this._registry).forEach(function(id) {
				if (this._registry[id] === rsc) {
					found = id;
				}
			}, this);
			return found;
		},
		push: function(rsc) {
			var data = this._serializer.serialize(rsc);
			var id = this.getIdentity(rsc);
			if (!id) {
				// il n'y a pas d'id connu, c'est que c'est une création, il faut donc l'enregistrer dans le registre
				id = this._dataSource.add(data);
				this._registry[id] = rsc;
				return id;
			} else {
				return this._dataSource.put(data, id);
			}
		},
		pull: function(rsc) {
			var id = this.getIdentity(rsc);
			var data = this._dataSource.get(id);
			var rscState = this._serializer.deserialize(data);
			rsc.setContent(rscState); // c'est bien le rôle du repository de faire le merge pour avoir des instances uniques et pas au deserializer
		},
	});

	// local storage
	var LocalStorage = compose(function(prefix) {
		this._prefix = prefix;
		this._counter = 0;
	}, {
		get: function(id) {
			return JSON.parse(localStorage.getItem(this._prefix+'/'+id));
		},
		put: function(data, id) {
			return localStorage.setItem(this._prefix+'/'+id, JSON.stringify(data));
		},
		add: function(data) {
			var id = this.generateId();
			this.put(data, id);
			return id;
		},
		generateId: function() {
			this._counter++;
			return this._counter+'';
		},
	});

	// asyncMemory
	var JsonRestStore = compose(Memory, {
		get: compose.around(function(baseGet){
			return function(id){
				var results = baseGet.call(this, id);
				var dfd = new Deferred();
				setTimeout(function(){
					dfd.resolve(results);
				}, 20);
				return dfd;
			};
		}),
		put: compose.around(function(basePut){
			return function(item, options){
				// clone item to have the same behavior as a regular dataSource
				item = clone(item, true);
				var results = basePut.call(this, item, options);
				var dfd = new Deferred();
				setTimeout(function(){
					dfd.resolve(results);
				}, 20);
				return dfd;
			};
		}),
	});

	// ******************* APPLI **************************

	var Parcelle = compose(function(args) {
		this.set('name', args.name || "");
		this.set('geom', args.geom);
		this._validationReport = {};
	}, {
		validate: function() {
			if (this.get('name').length < 3) {
				this._validationReport.name = "Le nom est trop court";
			}
		},
	});

	var Station = compose(function(args) {
		this.mesures = new ObservableSet(args.mesures);
		this.set('location', args.location);
		this.set('parcelle', args.parcelle);
		this.set('mesures', args.mesures);
		this.set('name', args.name);
	}, {
		// TODO
/*		_parcelleSetter: function(parcelle) {
			parcelleManager.release(this.get('parcelle'));
			this.set('parcelle', parcelleManager.using(parcelle));
		},
*/		_mesuresSetter: function(mesures) {
			return this.mesures.setContent(mesures);
		},
		_mesuresGetter: function() {
			return this.mesures;
		},
	});

	var Polygon = function Polygon (argument) {
		this.points = argument;
	};

	var GeoPoint = compose(ObservableObject, function (long, lat){
		this.setEach({
			longitude: long,
			latitude: lat,
		});
	});



	var SchemaSerializer = compose(function(schema, serializers) {
		this.serializers = serializers;
		this.schema = schema;
	}, {
		serialize: function(instance) {
			var schema = this.schema;
			var type = schema.type;
			if (['string', 'number', 'integer'].indexOf(type) >= 0) {
				return instance;
			}
			if (type === 'object') {
				var data = {};
				Object.keys(schema.properties).forEach(function(propName){
					var value = instance.get(propName);
					data[propName] = this.serializers[schema.properties[propName]].serialize(value);
				}, this);
				return data;
			}
			if (type === 'set') {
				var itemSerializer = this.serializers[schema.items];
				return instance.toArray().map(itemSerializer.serialize, itemSerializer);
			}
		},
		deserialize: function(data) {
			var schema = this.schema;
			var type = schema.type;
			if (['string', 'number', 'interger'].indexOf(type) >= 0) {
				return data;
			}
			if (type === 'object') {
				var object = {};
				Object.keys(schema.properties).forEach(function(propName){
					var value = data[propName];
					object[propName] = this.serializers[schema.properties[propName]].deserialize(value);
				}, this);
				return object;
			}
			if (type === 'set') {
				var itemSerializer = this.serializers[schema.items];
				return data.map(itemSerializer.deserialize, itemSerializer);
			}
		},
	});

	var EntityIdentitySerializer = function(registry) {
		this._registry = registry;
	};
	EntityIdentitySerializer.prototype = {
		serialize: function(rsc) {
			return this._registry.getIdentity(rsc);
		},
		deserialize: function(id) {
			return this._registry.get(id);
		},
	};

	var EntityBase = compose(
		Dict,
		persistableGenerator({
			save: "save",
			load: 'load',
			repository: 'repository',
		})
	);

	var LocalRemoteEntityBase = compose(
		Dict,
		persistableGenerator({
			save: "save",
			load: 'load',
			repository: 'localRepository',
		}),
		persistableGenerator({
			save: 'push',
			load: 'pull',
			repository: 'remoteRepository',
		})
	);

	var LocalApp = compose(function(args) {
		var self = this;
		this.entities = args.entities;
		this.relations = args.relations;
		this.dataSourcesProvider = args.dataSourcesProvider;
		this.factories = {};
		this.serializers = {};
		this.repositories = {};

		Object.keys(args.types).forEach(function(typeId) {
			this.addType(typeId, args.types[typeId]);
		}, this);


	}, {
		addType: function(typeId, options) {
			if (this._isEntityType(typeId)) {
				// pour une entité, on considère qu'elle est toujours déclarée avec un schéma
				var Entity = compose(EntityBase, {
					schema: options.schema,
				});
				var instancesRegistry = new Set();
				this.factories[typeId] = function(args) {
					var instance = args ? new Entity(args) : new Entity();
					instancesRegistry.add(instance);
					return instance;
				};


				this.repositories[typeId] = new Repository({
					factory: this.factories[typeId],
					serializer: new SchemaSerializer(options.schema, this.serializers),
					dataSource: this.dataSourcesProvider.get(typeId),
				});

				Entity.prototype.repository = this.repositories[typeId];

				this.serializers[typeId] = new EntityIdentitySerializer(this.repositories[typeId]);
			} else {
				if (options.factory){
					this.factories[typeId] = options.factory;
				} else {
					var instanceConstructor;
					if (options.schema.type === 'object') {
						instanceConstructor = Dict;
					}
					if (options.schema.type === 'set') {
						instanceConstructor = ObservableSet;
					}
					this.factories[typeId] = function(args) {
						return instanceConstructor(args);
					};
				}
				this.serializers[typeId] = options.serializer || new SchemaSerializer(options.schema, this.serializers);
			}
		},
		create: function(type, args) {
			return this.factories[type](args);
		},
		_isEntityType: function(type) {
			return this.entities.indexOf(type) >= 0;
		},
	});


	var LocalRemoteApp = compose(function(args) {
		var self = this;
		this.entities = args.entities;
		this.relations = args.relations;
		this.factories = {};
		this.localSerializers = {};
		this.remoteSerializers = {};
		this.localRepositories = {};
		this.remoteRepositories = {};
		this.localDataSourcesProvider = args.localDataSourcesProvider;
		this.remoteDataSourcesProvider = args.remoteDataSourcesProvider;

		Object.keys(args.types).forEach(function(typeId) {
			this.addType(typeId, args.types[typeId]);
		}, this);


	}, {
		addType: function(typeId, options) {
			if (this._isEntityType(typeId)) {
				var LocalRemoteEntity = compose(LocalRemoteEntityBase, {
					schema: options.schema,
				});
				var instancesRegistry = new Set();
				this.factories[typeId] = function(args) {
					var instance = args ? new LocalRemoteEntity(args) : new LocalRemoteEntity();
					instancesRegistry.add(instance);
					return instance;
				};


				this.localRepositories[typeId] = new Repository({
					factory: this.factories[typeId],
					serializer: new SchemaSerializer(options.schema, this.localSerializers),
					dataSource: this.localDataSourcesProvider.get(typeId),
				});
				this.remoteRepositories[typeId] = new Repository({
					factory: this.factories[typeId],
					serializer: new SchemaSerializer(options.schema, this.remoteSerializers),
					dataSource: this.remoteDataSourcesProvider.get(typeId),
				});

				LocalRemoteEntity.prototype.localRepository = this.localRepositories[typeId];
				LocalRemoteEntity.prototype.remoteRepository = this.remoteRepositories[typeId];

				this.localSerializers[typeId] = new EntityIdentitySerializer(this.localRepositories[typeId]);
				this.remoteSerializers[typeId] = new EntityIdentitySerializer(this.remoteRepositories[typeId]);
			} else {
				if (options.factory){
					this.factories[typeId] = options.factory;
				} else {
					var instanceConstructor;
					if (options.schema.type === 'object') {
						instanceConstructor = Dict;
					}
					if (options.schema.type === 'set') {
						instanceConstructor = ObservableSet;
					}
					this.factories[typeId] = function(args) {
						return instanceConstructor(args);
					};
				}
				this.localSerializers[typeId] = options.localSerializer || options.serializer || new SchemaSerializer(options.schema, this.localSerializers);
				this.remoteSerializers[typeId] = options.remoteSerializer || options.serializer || new SchemaSerializer(options.schema, this.remoteSerializers);
			}
		},
		create: function(type, args) {
			return this.factories[type](args);
		},
		_isEntityType: function(type) {
			return this.entities.indexOf(type) >= 0;
		},
	});

	var modelDeclaration = {
		entities: [
			'station',
			'parcelle',
		],
		// en pahse expérimentale, on ne gère que des relations un-à-plusieurs avec une propriété sur la ressource 'plusieurs' qui représente la clé étrangère
		relations: {
			station: {
				model: 'parcelle',
				propName: 'parcelle',
			},
		},
		types: {
			string: {
				schema: {
					type: 'string',
				}
			},
			number: {
				schema: {
					type: 'number',
				},
			},
			positiveInteger: {
				schema: {
					type: 'integer',
					min: 0,
				}
			},
			polygon: {
				factory: function(args) {
					return new Polygon(args);
				},
				serializer: {
					serialize: function(polygon) {
						return this.points;
					},
					deserialize: function(points) {
						return new Polygon(points);
					},
				},
			},
			point: {
				factory: function(args) {
					return new GeoPoint(args.longitude, args.latitude);
				},
				serializer: {
					serialize: function(geoPoint) {
						return {
							x: geoPoint.get('longitude'),
							y: geoPoint.get('latitude'),
						};
					},
					deserialize: function(data) {
						return new GeoPoint(data.x, data.y);
					},
				},
			},
			essence: {
				schema: {
					type: 'string',
					enum: ["Chêne", "Frêne", "Hêtre"],
				}
			},
			mesures: {
				schema: {
					type: 'set',
					items: 'mesure',
				},
			},
			mesure: {
				schema: {
					type: 'object',
					properties: {
						essence: 'essence',
						diametre: 'positiveInteger'
					},
				},

			},
			parcelle: {
				schema: {
					type: 'object',
					properties: {
						name: 'string',
						geom: 'polygon',
					},
				}
			},
			station: {
				schema: {
					type: 'object',
					properties: {
						name: 'string',
						mesures: 'mesures',
						location: 'point',
						parcelle: 'parcelle', // a supprimer quand les relations seront implémentées
					},
				},
			},

		},

	};

	var LocalStorageProvider = function(nameSpace) {
		this._nameSpace = nameSpace;
	};
	LocalStorageProvider.prototype.get = function(typeId) {
		return new LocalStorage(this._nameSpace+'/'+typeId);
	};

	var LocalJsonRestService = function(service, baseUrl) {
		this._service = service;
		this._baseUrl = baseUrl;
	};
	LocalJsonRestService.prototype = {
		get: function(id) {
			return this._service.get(this._baseUrl+'/'+id);
		},
		put: function(data, id) {
			return this._service.put(this._baseUrl+'/'+id, data);
		},
		add: function(data) {
			return this._service.post(this._baseUrl, data);
		},
	};

	var LocalJsonRestServiceProvider = function(service) {
		this._service = service;
	};
	LocalJsonRestServiceProvider.prototype.get = function(typeId) {
		return new LocalJsonRestService(this._service, typeId);
	};


	// server
	var serverApp = new LocalApp({
		entities: modelDeclaration.entities,
		relations: modelDeclaration.relations,
		types: modelDeclaration.types,
		dataSourcesProvider: new LocalStorageProvider('server'),
	});

	var RestView = compose(function(args) {
		this._modelApp = args.app;
	}, {
		get: function(url) {
			var typeId = url.split('/')[0];
			var id = url.split('/')[1];
			var repo = this._modelApp.repositories[typeId];
			var instance = repo.get(id);
			// ici on utilise la même sérialisation que pour le dataSource... mais c'est un gros raccourci
			var data = repo._serializer.serialize(instance);
			return data;
		},
		put: function(url, data) {
			var typeId = url.split('/')[0];
			var id = url.split('/')[1];
			var repo = this._modelApp.repositories[typeId];
			var instance = repo.get(id);
			// ici on utilise la même désérialisation que pour le dataSource... mais c'est un gros raccourci
			var newInstanceState = repo._serializer.deserialize(data);
			instance.setContent(newInstanceState);
			return "ok"; // faudrait-il retourner this.get(url) ?
		},
		post: function(url, data) {
			// ici on ne traite que le cas de la création
			var typeId = url;
			var repo = this._modelApp.repositories[typeId];
			var factory = this._modelApp.factories[typeId];
			var instance = factory();
			var newInstanceState = repo._serializer.deserialize(data);
			instance.setContent(newInstanceState);
			instance.save();
			var id = repo.getIdentity(instance);
			return id;

		},
		delete: function(url) {},
	});

	var serverView = new RestView({
		app: serverApp,
	});

	// client
	var clientApp =	new LocalRemoteApp({
		entities: modelDeclaration.entities,
		relations: modelDeclaration.relations,
		types: modelDeclaration.types,
		localDataSourcesProvider: new LocalStorageProvider('client'),
		remoteDataSourcesProvider: new LocalJsonRestServiceProvider(serverView),
	});




	var clientParcelle1;

	registerSuite({
		name: 'clientApp data creation',
		'parcelle': function() {
			clientParcelle1 = clientApp.create('parcelle', {
				name: 'Parcelle 1',
			});
			clientParcelle1.save();

			var localRepo = clientApp.localRepositories['parcelle'];
			var id = localRepo.getIdentity(clientParcelle1);
			assert.deepEqual(localRepo._dataSource.get(id), {
				name: 'Parcelle 1',
			});
		},
		'parcelle-station': function() {
			var stationP1S1 = clientApp.create('station', {
				parcelle: clientParcelle1,
				name: 'P1S1',
				mesures: clientApp.create('mesures', [
					clientApp.create('mesure', {essence: 'Chêne', diametre: 30}),
				]),
				location: clientApp.create('point', {
					longitude: 12.3,
					latitude: 17.5,
				}),
			});

			stationP1S1.save();

			var localRepo = clientApp.localRepositories['station'];
			var id = localRepo.getIdentity(stationP1S1);
			assert.deepEqual(localRepo._dataSource.get(id), {
				name: 'P1S1',
				parcelle: '1',
				location: {x: 12.3, y: 17.5},
				mesures: [
					{
						essence: 'Chêne',
						diametre: 30,
					}
				],
			});


		},
	});

	var serverParcelle2;

	registerSuite({
		name: 'serverApp data creation',
		'parcelle': function() {
			serverParcelle2 = serverApp.create('parcelle', {
				name: 'Parcelle 2',
			});
			serverParcelle2.save();

			var repo = serverApp.repositories['parcelle'];
			var id = repo.getIdentity(serverParcelle2);
			assert.deepEqual(repo._dataSource.get(id), {
				name: 'Parcelle 2',
			});
		},
		'parcelle-station': function() {
			var serverParcelle2 = serverApp.repositories['parcelle'].get('1');

			var stationP2S1 = serverApp.create('station', {
				parcelle: serverParcelle2,
				name: 'P2S1',
				mesures: serverApp.create('mesures', [
					serverApp.create('mesure', {essence: 'Hêtre', diametre: 35}),
				]),
				location: serverApp.create('point', {
					longitude: 15.3,
					latitude: 23.5,
				}),
			});

			stationP2S1.save();

			var repo = serverApp.repositories['station'];
			var id = repo.getIdentity(stationP2S1);
			assert.deepEqual(repo._dataSource.get(id), {
				name: 'P2S1',
				parcelle: '1',
				location: {x: 15.3, y: 23.5},
				mesures: [
					{
						essence: 'Hêtre',
						diametre: 35,
					}
				],
			});


		},
	});

	var clientParcelle2;

	registerSuite({
		name: 'client server exchanges',
		'client get remote data by id': function() {
			clientParcelle2 = clientApp.remoteRepositories['parcelle'].get('1');
			clientParcelle2.pull();
			assert.equal(clientParcelle2.get('name'), 'Parcelle 2');

		},
		'client update data on remote source': function() {

			clientParcelle2.set('name', 'nouveau nom pour la parcelle 2');
			clientParcelle2.push();

			assert.equal(serverParcelle2.get('name'), 'nouveau nom pour la parcelle 2');

		},
		'client create data on remote source': function() {

			var remoteId = clientParcelle1.push();

			var serverParcelle1 = serverApp.repositories.parcelle.get(remoteId);
			assert.equal(serverParcelle1.get('name'), 'Parcelle 1');

		},
	});

});
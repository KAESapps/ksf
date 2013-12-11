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

	var nativeTypeSerializer = {
		serialize: identity,
		deserialize: identity,
	};

	var stringDesc = {
		type: 'string',
		serializer: nativeTypeSerializer,
	};


	var numberDesc = {
		type: 'number',
		serializer: nativeTypeSerializer,
	};


	var ValueObjectSerializer = compose(function(desc, options) {
		this._desc = desc;
		this._options = options || {};
	}, {
		serialize: function(instance) {
			var desc = this._desc;
			var options = this._options;
			var data = {};
			Object.keys(desc.properties).forEach(function(propName){
				if (options[propName] !== false) {
					var serializedPropName = options[propName] && options[propName].propName || propName;
					var value = instance.get(propName);
					if (value !== undefined) { // on ne sérialise pas les propriétés qui ont une valeur undefined... mais ce n'est peut-être pas une bonne idée
						data[propName] = desc.properties[propName].serializer.serialize(value, options[propName] && options[propName].serializer);
					}
				}
			});
			return data;
		},
		deserialize: function(data) {
			var desc = this._desc;
			var options = this._options;
			var object = {};
			Object.keys(desc.properties).forEach(function(propName){
				if (options[propName] !== false) {
					var serializedPropName = options[propName] && options[propName].propName || propName;
					object[propName] = desc.properties[propName].serializer.deserialize(data[serializedPropName], options[propName] && options[propName].serializer);
				}
			});
			return object;
		},
	});

	var ArraySerializer = compose(function(args) {
		this._desc = args;
	}, {
		serialize: function(instance) {
			return instance.map(this._desc.serializer.serialize, this._desc.serializer);
		},
		deserialize: function(data) {
			return data.map(this._desc.serializer.deserialize, this._desc.serializer);
		},
	});

	var ObservableSetSerializer = compose(function(args) {
		this._desc = args;
	}, {
		serialize: function(instance) {
			return instance.toArray().map(this._desc.serializer.serialize, this._desc.serializer);
		},
		deserialize: function(data) {
			return new ObservableSet(data.map(this._desc.serializer.deserialize, this._desc.serializer));
		},
	});


	var EntityIdentityMultiRepositoriesSerializer = compose(function(args){
			this._description = args;
		}, {
			serialize: function(rsc, repositoryName) {
				return this._description.repositories[repositoryName].getIdentity(rsc);
			},
			deserialize: function(id, repositoryName) {
				return this._description.repositories[repositoryName].get(id);
			},
		}
	);

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
		this._typeDesc = args.typeDesc;
		this._dataSource = args.dataSource;
		this._registry = {}; // mapping id <-> rsc
		this._serializer = args.serializer;
	}, {
		// le 'get' est une méthode publique à destination des autres repositories uniquement, pas des utilisateurs des repositories
		// on n'interroge pas le dataSource, donc potentiellement, le get est un create mais on ne le saura qu'en faisant push
		get: function(id) {
			var instance = this._registry[id];
			if (! instance) {
				instance = this._typeDesc.create();
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
			} else {
				this._dataSource.put(data, id);
			}
		},
		pull: function(rsc) {
			var id = this.getIdentity(rsc);
			var data = this._dataSource.get(id);
			var rscState = this._serializer.deserialize(data);
			rsc._setContent(rsc, rscState); // c'est bien le rôle du repository de faire le merge pour avoir des instances uniques et pas au deserializer
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

	var GeoPoint = compose(function (long, lat){
		this.setEach({
			longitude: long,
			latitude: lat,
		});
	});

	var pointDesc = {};
	Object.assign(pointDesc, {
		type: 'object',
		isEntity: false,
		properties: {
			latitude: numberDesc,
			longitude: numberDesc,
		},
		instanceConstructor: compose(
			ObservableObject,
			GeoPoint,
			{
				typeDesc: pointDesc,
			}
		),
		create: function(args) {
			return this.instanceConstructor(args);
		},
		serializer: new ValueObjectSerializer(pointDesc, {
			latitude: {propName: 'x'},
			longitude: {propName: 'y'},
		}),
	});


	var polygonDesc = {};
	Object.assign(polygonDesc, {
		type: 'object',
		isEntity: false,
		properties: {
			points: {
				type: 'array',
				items: pointDesc,
				serializer: new ArraySerializer(pointDesc),
			},
			area: {type: 'number', serializer: nativeTypeSerializer},
		},
		instanceConstructor: compose(
			Dict,
			{
				typeDesc: polygonDesc,
			}
		),
		create: function(args) {
			return this.instanceConstructor(args);
		},
		serializer: new ValueObjectSerializer(polygonDesc, {
			area: false, // cette propriété ne sera pas sérialisée
		}),
	});

	var parcelleDesc = {};
	Object.assign(parcelleDesc, {
		// id: 'parcelle', // est-ce nécessaire ?
		isEntity: true,
		type: 'object',
		properties: { // décrit l'API publique
			name: stringDesc,
			geom: polygonDesc,
		},
		registry: new Set(),
		create: function(args) {
			var parcelle = args ? new this.instanceConstructor(args) : new this.instanceConstructor();
			this.registry.add(parcelle);
			return parcelle;
		},
		repositories: {
			local: new Repository({
				typeDesc: parcelleDesc,
				dataSource: new LocalStorage('parcelles'),
				serializer: new ValueObjectSerializer(parcelleDesc),
			}),
			remote: new Repository({
				typeDesc: parcelleDesc,
				dataSource: new JsonRestStore('/parcelles'),
				serializer: new ValueObjectSerializer(parcelleDesc),
			}),
		},
		serializer: new EntityIdentityMultiRepositoriesSerializer(parcelleDesc),
/*		serializers: {
			local: new EntityIdentity(parcelleDesc.repositories.local),
			remote: new EntityIdentity(parcelleDesc.repositories.remote),
		},
*/	});
	parcelleDesc.instanceConstructor = compose(
		ObservableObject,
		Parcelle, // mixin spécifique au domaine
		persistableGenerator({
			save: "save",
			load: 'load',
			repository: 'localRepository',
		}),
		persistableGenerator({
			save: 'pull',
			load: 'push',
			repository: 'remoteRepository',
		}), {
			typeDesc: parcelleDesc,
			localRepository: parcelleDesc.repositories.local,
			remoteRepository: parcelleDesc.repositories.remote,
		}
	);

	var essenceDesc = {
		type: 'string',
		enum: ['Chêne', 'Frêne', "Hêtre"],
		serializer: nativeTypeSerializer,
	};

	var mesureDesc = {};
	Object.assign(mesureDesc, {
		type: 'object',
		isEntity: false,
		properties: {
			essence: essenceDesc,
			diametre: {
				type: 'number',
				min: 0,
				serializer: nativeTypeSerializer,
			},
		},
		instanceConstructor: compose(
			Dict,
			//Mesure, // mixin spécifique au domaine
			{
				typeDesc: mesureDesc,
			}
		),
		create: function(args) {
			return this.instanceConstructor(args);
		},
		serializer: new ValueObjectSerializer(mesureDesc),
	});



	var stationDesc = {};
	Object.assign(stationDesc, {
		// id: 'station', // est-ce nécessaire ?
		isEntity: true,
		type: 'object',
		properties: {
			name: stringDesc,
			mesures: {
				type: 'array',
				items: mesureDesc,
				serializer: new ObservableSetSerializer(mesureDesc),
			},
			location: pointDesc,
			parcelle: parcelleDesc, // clé étrangère
		},
		registry: new Set(),
		create: function(args) {
			var instance = args ? new this.instanceConstructor(args) : new this.instanceConstructor();
			this.registry.add(instance);
			return instance;
		},
		repositories: {
			local: new Repository({
				typeDesc: stationDesc,
				dataSource: new LocalStorage('stations'),
				serializer: new ValueObjectSerializer(stationDesc, {
					parcelle: {serializer: 'local'}, // serait-il possible de définir l'option 'local' pour toutes les propriétés qui pointent vers une entité ?
				}),
			}),
			remote: new Repository({
				typeDesc: stationDesc,
				dataSource: new JsonRestStore('/stations'),
				serializer: new ValueObjectSerializer(stationDesc, {
					parcelle: {serializer: 'remote'},
				}),
			}),
		},
		serializer: new EntityIdentityMultiRepositoriesSerializer(stationDesc),
	});
	stationDesc.instanceConstructor = compose(
		ObservableObject,
		Station, // mixin spécifique au domaine
		persistableGenerator({
			save: "save",
			load: 'load',
			repository: 'localRepository',
		}),
		persistableGenerator({
			save: 'pull',
			load: 'push',
			repository: 'remoteRepository',
		}), {
			typeDesc: stationDesc,
			localRepository: stationDesc.repositories.local,
			remoteRepository: stationDesc.repositories.remote,
		}
	);


	registerSuite({
		name: 'data creation',
		'parcelle': function() {
			var parcelle1 = parcelleDesc.create({
				name: 'Parcelle 1',
			});
			parcelle1.save();

			var localRepo = parcelleDesc.repositories.local;
			var id = localRepo.getIdentity(parcelle1);
			assert.deepEqual(localRepo._dataSource.get(id), {
				name: 'Parcelle 1',
			});
		},
		'parcelle-station': function() {
			var parcelle1 = parcelleDesc.repositories.local.get('1');
			var station1 = stationDesc.create({
				name: 'P1S1',
				parcelle: parcelle1,
				mesures: [
					mesureDesc.create({
						essence: essenceDesc.enum[0],
						diametre: 30,
					}),
				],
			});
			station1.save();

			var localRepo = stationDesc.repositories.local;
			var id = localRepo.getIdentity(station1);
			assert.deepEqual(localRepo._dataSource.get(id), {
				name: 'P1S1',
				parcelle: '1',
				mesures: [
					{
						essence: 'Chêne',
						diametre: 30,
					}
				],
			});


		},
	});



});
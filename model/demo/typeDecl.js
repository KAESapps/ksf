define([
	'intern!object',
	'intern/chai!assert',
	"compose",
	'ksf/collections/ObservableObject',
	'ksf/collections/Set',
], function(
	registerSuite,
	assert,
	compose,
	ObservableObject,
	Set
) {
	var parcelleTypeDesc = {
		properties: {
			name: "string",
		},
	};

	var inventaireTypeDesc = {
		properties: {
			name: "string",
			date: "date",
		},
	};

	var locationTypeDesc = {
		properties: {
			long: "number",
			lat: "number",
		},
	};

	var mesureTypeDesc = {
		properties: {
			location: 'location',
			mesureTotale: 'number',
			nbArbres: "number",
			parcelle: 'parcelle',
			inventaire: 'inventaire',
		},
	};

	var ObjectValueType = function ValueType(description, factory) {
		this.description = description;
		this._factory = factory;
	};
	ObjectValueType.prototype = {
		create: function(args) {
			return this._factory(args);
		},
		validate: function(v) {
			// là on ne teste que le type des propriétés de l'objet mais on pourrait aussi tester son API (l'existence des méthodes)
			Object.keys(this.description.properties).forEach(function(propName) {
				var expectedPropValueType = this.description.properties[propName];
				if (! expectedPropValueType.validate(v.get(propName))) {
					return false;
				}
				return true;
			}, this);
		},
	};

	var EntityType = function EntityType(factory) {
		this._factory = factory;
		this._registry = new Set();
		this.description = {isEntity: true};
	};
	EntityType.prototype = {
		create: function(args) {
			var instance = this._factory(args);
			this.registry.add(instance);
			return instance;
		},
		validate: function(v) {
			return this._registry.has(v);
		},
	};

	var stringType = {
		create: function(s) { return s; },
		validate: function(s) {
			return typeof s === 'string';
		},
	};

	var numberType = {
		create: function(n) { return n; },
		validate: function(n) {
			return typeof n === 'number';
		},
	};

	var dateType = {
		create: function(d) { return new Date(d); },
		validate: function(d) {
			// mais on pourrait faire du duck typing plutôt que instanceof
			return d instanceof Date;
		},
	};


	var positiveIntegerType = {
		create: function(n) {
			if (this.validate(n)) {
				return n;
			}
		},
		validate: function(n) {
			return n >= 0;
		},
	};


	var Location = compose(ObservableObject, function (x, y){
		this.setEach({
			long: x,
			lat: y,
		});
	});
	var locationType = new ObjectValueType({
		properties: {
			long: positiveIntegerType,
			lat: positiveIntegerType,
		}
	}, function(args) {
		return new Location(args.x, args.y);
	});

	var persistableGenerator = function(args) {
		var SAVE = args.saveName || "save";
		var LOAD = args.loadName || "load";
		var REPOSITORY = args.repositoryName || "_repository";

		var proto = {};
		proto[SAVE] = function() {
			return this[REPOSITORY].push(this);
		};
		proto[LOAD] = function() {
			return this[REPOSITORY].pull(this);
		};

		return proto;
	};

	var Parcelle = compose(ObservableObject, function(args) {
		this.set('name', args.name || "");
	});
	var parcelleType = new ObjectValueType({
		properties: {
			name: stringType,
		},
	}, function(args) {
		return new Parcelle(args);
	});
	var parcelleEntityType = new EntityType(function(args) {
		return new Parcelle(args);
	});

	var Inventaire = compose(ObservableObject, function(args) {
		this.set('name', args.name || "");
		this.set('date', args.date);
	});
	var inventaireType = new ObjectValueType({
		properties: {
			name: stringType,
			date: dateType,
		},
	}, function(args) {
		return new Inventaire(args);
	});
	var inventaireEntityType = new EntityType(function(args) {
		return new Inventaire(args);
	});


	var Mesure = compose(ObservableObject, function(args) {
		this.set('location', args.location);
		this.set('mesure', args.mesure);
		this.set('inventaire', args.inventaire);
		this.set('parcelle', args.parcelle);
	});
	var mesureType = new ObjectValueType({
		properties: {
			location: locationType,
			mesure: numberType,
			parcelle: parcelleEntityType,
			inventaire: inventaireEntityType,
		},
	}, function(args) {
		return new Mesure(args);
	});
	var mesureEntityType = new EntityType(function(args){
		return new Mesure(args);
	});


	var Repository = compose(function(args) {
		this._type = args.type;
		this._dataSource = args.dataSource;
		this._registry = {}; // mapping id <-> rsc
		this._serializer = args.serializer;
	}, {
		// le 'get' est une méthode publique à destination des autres repositories uniquement, pas des utilisateurs des repositories
		// on n'interroge pas le dataSource, donc potentiellement, le get est un create mais on ne le saura qu'en faisant push
		get: function(id) {
			var instance = this._registry[id];
			if (! instance) {
				instance = this._type.create(id); // la factory du entityType pourrait éventuellement quoi faire de l'id ?
				this._registry[id] = instance;
			}
			return instance;
		},
		getIdentity: function(rsc) {

		},
		push: function(rsc) {
			var data = this._serializer.serialize(rsc);
			var id = this.getIdentity(rsc);
			if (!id) {
				// il n'y a pas d'id connu, c'est que c'est une création, il faut donc l'enregistrer dans le registre
				id = this._dataSource.put(data);
				this._registry[id] = rsc;
			} else {
				this._dataSource.put(data, id);
			}
		},
		pull: function(rsc) {
			var id = this.getIdentity(rsc);
			var data = this._dataSource.get(id);
			var rscState = this._serializer.deserialize(data);
			this._merge(rsc, rscState);
		},
		_merge: function(rsc, data){
// 			c'est bien le rôle du repository de faire le merge pour avoir des instances uniques et pas au deserializer
			rsc.merge(this._serializer.deserialize(data));
		}
	});

	var locationSerializer = {
		serialize: function(location) {
			return {
				x: location.get('long'),
				y: location.get('lat'),
			};
		},
		deserialize: function(data){
			return new Location({
				long: data.x,
				lat: data.y,
			});
		},
	};

	var EntitySerializer = compose(function(serializeDesc, factory){
		this._serializeDesc = serializeDesc;
		this._factory = factory;
	}, {
		serialize: function(v){
			var data = {};
			Object.keys(this._serializeDesc.properties).forEach(function(propName){
				args[propName] = this._description.properties[propName](v.get(propName));
			});
			return data;
		},
		deserialize: function(data) {

		},
	});

	var mesureSerializer = new Serializer({
		mesure: positiveIntegerSerializer,
		location: locationSerializer,
		parcelle: parcelleEntitySerializer,
		inventaire: inventaireEntitySerializer,
	}, function(args){
		return args;
	});
		{
		serialize: function(mesure) {
			return {
				mesure: mesure.get('mesure'),
				location: locationSerializer.serialize(mesure.get('location')),
				parcelle: parcelleRepository.getIdentity(mesure.get('parcelle')),
				inventaire: inventaireRepository.getIdentity(mesure.get('inventaire')),
			};
		},
		deserialize: function(data) {
// 			son rôle n'est pas de faire le merge mais juste de transformer des données en un nouvel objet
			return {
				mesure: data.mesure,
				location: locationSerializer.deserialize(data.location),
				parcelle: parcelleRepository.get(data.parcelle),
				inventaire: inventaireRepository.get(data.inventaire),
			};
		},
	};

	var parcelleSerializer = {
		serialize: function(parcelle) {
			return {
				name: parcelle.get('name'),
			};
		},
		deserialize: function(parcelle, data) {
			parcelle.setEach({
				name: data.name,
			});
		},
	};

	var dateSerializer = {
		serialize: function(date){
			return date.toISO();
		},
		deserialize: function(data){
			return Date.fromISO(data);
		},
	}

	var inventaireSerializer = {
		serialize: function(inventaire) {
			return {
				name: inventaire.get('name'),
				date: dateSerializer.serialize(inventaire.get('date')),
			};
		},
		deserialize: function(inventaire, data) {
			inventaire.setEach({
				name: data.name,
				date: dateSerializer.deserialize(data.date),
			});
		},
	};


});
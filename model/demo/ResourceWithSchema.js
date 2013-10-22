define([
	'intern!object',
	'intern/chai!assert',
	"compose",
	'ksf/collections/Dict',
], function(
	registerSuite,
	assert,
	compose,
	Dict
) {

	var statutSchema = {
		id: 'statut',
		label: "Statut de site",
		properties: {
			libelle: {
				type: 'string',
			}
		},
		url: 'acuicite.com/statut',
	};
	var siteSchema = {
		id: 'site',
		label: "Site",
		properties: {
			name: {
				type: 'string',
				maxLength: 20,
			},
			statut: {
				type: 'statut',
				enum: {$ref: "statut/all"}, // valeurs possibles pour le statut d'un site
			}
		},
		url: 'acuicite.com/site',
	};


	var Uniq = compose(function(args) {
		this.registry = {};
		this.factory = args.factory;
	}, {
		resolve: function(id) {
			if (id in this.registry){
				return this.registry[id];
			} else {
				var instance = this.factory();
				instance.id = id;
				this.registry[id] = instance;
				return instance;
			}
		},
		serialize: function(instance) {
			return instance.id;
		},
	});

	var Resource = compose({
		load: function() {
			var data = this.dataSource.get(this.id);
			this.schema.properties.forEach(function(prop, propName) {
				this[propName] = prop.type.resolve(data[propName]);
			}.bind(this));
		},
		save: function() {
			var data = {};
			this.schema.properties.forEach(function(prop, propName) {
				data[propName] = prop.type.serialize(this[propName]);
			}.bind(this));
			this.dataSource.set(this.id, data);
		},
	});

	var ResourceManager = compose(Uniq, function(args) {
		this.resolver = args.resolver;
		this.ctr = compose(Resource); // comme ça on ne modifie pas le prototype de Resource
		this.factory = function() {
			return new this.ctr();
		};
	}, {
		setSchema: function(schema) {
			var resolvedSchema = {
				properties: new Dict(),
			};
			Object.keys(schema.properties).forEach(function(propName) {
				var prop = schema.properties[propName];
				resolvedSchema.properties.set(propName, {type: this.resolver.resolve(prop.type)});
			}.bind(this));
			this.ctr.prototype.schema = resolvedSchema;
		},
		setDataSource: function(args) {
			// var dataSource = new AcuiciteDataSource(args.url);
			var dataSource = args;
			this.ctr.prototype.dataSource = dataSource;
		},
	});


	var managerManager = window.managerManager = new Uniq({
		factory: function() {
			return new ResourceManager({
				resolver: managerManager,
			});
		},
	});
	managerManager.registry.string = {
		resolve: function(s) {return s;},
		serialize: function(s) {return s;},
	};

	var siteManager = managerManager.resolve('site');
	siteManager.setSchema(siteSchema);
	siteManager.setDataSource(new Dict({
		"5": {
			name: "Site n°5",
			statut: 9,
		},
	}));

	var site5 = window.site5 = siteManager.resolve(5);
	site5.load();
	site5.save();

	registerSuite({
		"site load": function() {
			assert(site5.name === "Site n°5");
			assert(site5.statut.id === 9);
		},
		"instance equality": function() {
			assert(managerManager.resolve('statut').resolve(9) === site5.statut);
		},
		"site save": function() {
			assert.deepEqual(site5.dataSource.get(5), {name: "Site n°5", statut: 9});
		},
	});
});
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
	};


	var Uniq = compose(function(args) {
		this.registry = {};
		this.ctr = args && args.ctr;
	}, {
		resolve: function(id) {
			if (id in this.registry){
				return this.registry[id];
			} else {
				var instance = new this.ctr();
				instance.set('id', id);
				this.registry[id] = instance;
				return instance;
			}
		},
		serialize: function(instance) {
			return instance.get('id');
		},
	});

	var Resource = compose(Dict, {
		load: function() {
			var data = this.dataSource.get(this.get('id'));
			this.schema.properties.forEach(function(prop, propName) {
				var serializedPropName = prop.serializedPropName || propName;
				this.set(propName, prop.type.resolve(data[serializedPropName]));
			}.bind(this));
		},
		save: function() {
			var data = {};
			this.schema.properties.forEach(function(prop, propName) {
				data[propName] = prop.type.serialize(this.get(propName));
			}.bind(this));
			this.dataSource.set(this.get('id'), data);
		},
	});

	var stringType = {
		resolve: function(s) {return s;},
		serialize: function(s) {return s;},
	};
	var schemaType = {
		resolve: function(schema) {
			var resolvedSchema = {
				properties: new Dict(),
			};
			Object.keys(schema.properties).forEach(function(propName) {
				var prop = schema.properties[propName];
				resolvedSchema.properties.set(propName, {type: managerManager.resolve(prop.type)});
			}.bind(this));
			return resolvedSchema;
		},
	};

	// ResourceManager est un manager mais aussi une ressource
	var ResourceManager = compose(Uniq, Resource, function(args) {
		// this.resolver = args.resolver;
		this.ctr = compose(Resource); // comme ça on ne modifie pas le prototype de Resource
	}, {
/*		setSchema: function(schema) {
			var resolvedSchema = {
				properties: new Dict(),
			};
			Object.keys(schema.properties).forEach(function(propName) {
				var prop = schema.properties[propName];
				resolvedSchema.properties.set(propName, {type: this.resolver.resolve(prop.type)});
			}.bind(this));
			this.ctr.prototype.schema = resolvedSchema;
		},
*/		setDataSource: function(args) {
			// var dataSource = new AcuiciteDataSource(args.url);
			var dataSource = args;
			this.ctr.prototype.dataSource = dataSource;
		},
		schema: {
			properties: new Dict({
				id: {type: stringType},
				schema: {type: schemaType},
				// dataSource: {type: 'url', serializedPropName: 'dataSourceUrl'},
			}),
		},
		dataSource: new Dict({
			site: {
				id: 'site',
				schema: siteSchema,
				dataSourceUrl: 'acuicite.com/site',
			},
			statut: {
				id: 'statut',
				schema: statutSchema,
				dataSourceUrl: 'acuicite.com/statut',
			},
		}),
		_schemaSetter: function(schema) {
			this.ctr.prototype.schema = schema;
		},
		_schemaGetter: function() {
			return this.ctr.prototype.schema;
		},
	});

	var managerManager = window.managerManager = new Uniq({
		ctr: ResourceManager,
	});
	managerManager.registry.string = stringType;
	managerManager.registry.schema = schemaType;



	var siteManager = managerManager.resolve('site');
	// siteManager.setSchema(siteSchema);
	siteManager.load();
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
			assert(site5.get('name') === "Site n°5");
			assert(site5.get('statut').get('id') === 9);
		},
		"instance equality": function() {
			assert(managerManager.resolve('statut').resolve(9) === site5.get('statut'));
		},
		"site save": function() {
			assert.deepEqual(site5.dataSource.get(5), {name: "Site n°5", statut: 9});
		},
	});
});
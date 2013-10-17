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


	var Person = compose(function(args) {
		this.name = args.name;
		this.address = args.address;
	}, {
		describe: function() {
			return "Bonjour, je suis "+ this.name;
		},
		dataSource: new MemoryStore(),
		save: function() {
			// serialize
			var data = {};
			data.name = this.name;
			data.address = {};
			data.address.street = this.address.street;
			data.address.number = this.address.number;
			data.address.city = this.address.city.id();
			// store
			if (! this.id){
				this.id = this.dataSource.put(data);
			} else {
				this.dataSource.put(data, this.id);
			}
		},
		load: function() {
			var data = this.dataSource.get(this.id);
			this.name = data.name;
			this.address = new Address(); // ici on n'a pas besoin d'unicité
			this.address.street = data.address.street;
			this.address.number = data.address.number;
			this.address.city = City.get(data.address.city);
		},
	});
	Person.description = {
		label: 'Personne physique',
		type: 'object',
		properties: {
			name: {
				label: "Nom usuel",
				type: String,
			},
			address: {
				label: "Adresse personnelle",
				type: Address,
			},
		},
	};

	var Address = compose(function(args) {
		this.street = args.street;
		this.number = args.number;
		this.city = args.city;
	}, {
		describe: function() {
			return "Bonjour, je suis une addresse";
		},
	});
	Address.description = {
		label: 'Addresse postale',
		type: 'object',
		properties: {
			street: {
				label: "Nom de la rue",
				type: String,
			},
			number: {
				label: "Numéro de la rue",
				type: String,
			},
			city: {
				label: "Ville",
				type: City,
			},
		},
	};


	var City = compose(function(args) {
		this.name = args.name;
		this.code = args.code;
	}, {
		describe: function() {
			return "Je suis la ville de "+ this.name;
		},
		dataSource: new MemoryStore(),
		save: function() {
			// serialize
			var data = {};
			data.name = this.name;
			data.code = this.caode;
			// store
			if (! this.id){
				this.id = this.dataSource.put(data);
				City.registry.id = this;
			} else {
				this.dataSource.put(data, this.id);
			}
		},
	});
	City.description = {
		label: 'Milieu physique de concentration urbaine',
		type: 'object',
		properties: {
			name: {
				label: "Nom de la ville",
				type: String,
			},
			code: {
				label: "Code postal",
				type: String,
			},
		},
	};
	City.registry = {};
	City.get = function(id) {
		return this.registry(id);
	};



});
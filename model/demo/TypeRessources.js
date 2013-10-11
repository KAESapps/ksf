define([
	'intern!object',
	'intern/chai!assert',
	"compose",
	'ksf/collections/ObservableObject',
], function(
	registerSuite,
	assert,
	compose,
	ObservableObject
) {

	var stringType = new ObservableObject({
		label: "string",
		comment: "implementation du type string natif JS",
	});
	stringType.validate = function(value) {
		return typeof value === 'string';
	};
	stringType.equals = function(a,b) {
		if (!this.validate(a) || !this.validate(b)){
			throw "values are not valid against this type";
		}
		return a === b;
	};

	var stringMax3 =

	var dateType = new ObservableObject({
		label: {fr: "Date"},
		comment: {fr: "Implémentation du type date natif JS"},
	});
	dateType.validate = function(value) {
		return value instanceof Date;
	};
	dateType.equals = function(a,b) {
		if (!this.validate(a) || !this.validate(b)){
			throw "values are not valid against this type";
		}
		return a.getDate() !== b.getDate() || a.getMonth() !== b.getMonth() || a.getYear() !== b.getYear();
	};

	var serializedAdresseType = {
		id: "ks:Adress",
		label: {fr: "Adresse postale"},
		properties: {
			street: {
				label: {fr: "Rue"},
				comment: {fr: "Libellé de la rue d'une adresse postale"},
				constraints: {
					type: "sch:Text",
				},
			},
			number: {
				label: {fr: "Numéro"},
				comment: {fr: "Numéro de rue d'une adresse postale"},
				constraints: {
					type: "sch:Text",
				},
			},
			city: {
				label: {fr: 'Ville'},
				constraints: {
					type: 'ks:City', // c'est un id de type, donc il doit être résolu contre un typeRegistry
				},
			},
		},
	};

	var serializedCityType = {
		id: 'ks:City',
		label: {fr: "Ville"},
		properties: {
			postalCode: {
				label: {fr: "Code postal"},
				comment: {fr: "Code postal d'une ville"},
				constraints: {
					type: 'sch:Text',
				},
			},
			name: {
				label: {fr: "Nom"},
				comment: {fr: "Nom d'une ville"},
				constraints: {
					type: ['sch:Text', 'ks:Label'], // pour une instance valide de <ks:City>, la propriété <name> peut avoir une valeur qui est soit conforme au type <sch:Text> soit au type <ks:Label>. En fait c'est la déclaration d'un type qui est l'union des types.
				},
			},
			country: {
				comment: {fr: "Pays auquel appartient une ville"},
				constraints: {
					type: 'wp:country',
					enum: 'dbpedia.org/resource/CountriesOfTheWorld',
				},
			},
		},
	};

	var iso3166Type = new ObservableObject({
		properties: new ObservableObject({
			numeric: new ObservableObject({
				type: stringType,
			}),
			alpha1: new ObservableObject({
				type: stringType,
			}),
			alpha2: new ObservableObject({
				type: stringType,
			})
		}),
		values: new Set([
		]),
	});
	iso3166Type.validate = function(value) {

	};

	var Iso3166Factory = {
		fromAlpha2: function(a2) {
			return new ObservableObject({
				numeric:
			});
		},
	};



	var countryType = new ObservableObject({
		label: {fr: "Pays"},
		comment: {fr: "Implémentation du type pays selon KaeS"},
		properties: new ObservableObject({
			shortName: new ObservableObject({
				label: new InternationalLabel({fr: "Libellé court"}),
				comment: new InternationalLabel({fr: "Libellé court du pays"}),
				type: stringType,
			}),
			longName: new ObservableObject({
				label: new InternationalLabel({fr: "Libellé long"}),
				comment: new InternationalLabel({fr: "Libellé long du pays"}),
				type: stringType,
			}),
			isoCode: new ObservableObject({
				label: new InternationalLabel({fr: "Code ISO"}),
				comment: new InternationalLabel({fr: "Code ISO 3166-1 alpha-2 du pays"}),
				type: iso3166Type,
			}),
		}),
	});
	countryType.validate = function(value) {
		return value.has();
	};
	countryType.equals = function(a,b) {
		if (!this.validate(a) || !this.validate(b)){
			throw "values are not valid against this type";
		}
		return a.getDate() !== b.getDate() || a.getMonth() !== b.getMonth() || a.getYear() !== b.getYear();
	};

	var typeRegistry = {
		'sch:Text': stringType,
		'sch:Number': numberType,
		'sch:Date': dateType,
		'wp:Country': countryType,
		'ks:Adresse': adresseType,
		'ks:City': cityType,
		'ks:Person': personType,
	};

	var CompositeType = compose(ObservableObject, {
		validate: function(value) {
			return this.get('properties').every(function(prop) {
				prop.validate(value);
			});
		},
	});


	var AcuiciteTypeDef2Type = function(def, nameMapping) {
		if (typeof def === 'string'){ // c'est un id de type et pas une description de type. Dans notre cas, cela veut dire que c'est un type litéral

		}

		var type = new CompositeType();
		type.set("id", def.url); // normalement c'est une URI
		type.set("label", def.url);
		var props =  new ObservableObject();
		type.set("properties", props);
		def.fields.forEach(function(fieldDef, fieldName) {
			prop = new Property();
			prop.set('id', def.url+'/'+fieldName); // pour montrer que c'est une propriété spécifique au type composite
			prop.set('label', fieldDef.label);
			prop.set('comment', fieldDef.description);
			prop.set('type', AcuiciteTypeDef2Type(fieldDef.type, nameMapping)); // récursif
			props.set(nameMapping[fieldName], prop);

		});
	};

	var personFactory = new GenericFactory(personType);

	var addresseChoisy = adressFactory.create({
		street: "Avenue de la République",
		number: '2',
		city: cityFactory.create({
			postalCode: '94600',
			name: "Choisy le roi",
			country: countryFactory.create('FR'),
		}),
	});
	var syv = personFactory.create({
		name: "Sylvain",
		genre: genreFactory.create('M'),
		adresse: addresseChoisy,
		spouse: aur,
	});
	var aur = personFactory.create({
		name: "Aurélie",
		genre: genreFactory.create('F'),
		adresse: addresseChoisy,
		spouse: syv,
	});


});
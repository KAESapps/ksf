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

	var schemasData = {
		site: {
			uri: 'acuicite.com/schema/site',
			comment: {fr: "Un site au sens acuicité"},
			type: 'object',
			properties: {
				name: 'js.org/type/string', // cela serait résolu par une implémentation locale
				label: 'kaes.fr/type/internationalLabel',  // cela serait résolu par une implémentation locale
				statut: "acuicite.com/schema/Statut",  // cela serait résolu par une requête http
			},
			context: { // à la JSON-LD, sert à donner la signification des propriétés
				name: {
					uri: 'xxxx',
					label: 'nom du site',
				},
				label: {
					label: 'libellé du site',
				},
				statut: {
					label: 'statut du site',
				}
			},
		},
		statut: {
			comment: {fr: "Un statut possible pour un site au sens acuicité"},
			type: 'object',
			properties: {
				label: 'kaes.fr/type/internationalLabel',
			},
			enum: 'acuicite.com/statuts', // uri qui pointe vers la collection des valeurs possibles
		},
	};

	var sitesData = {
		"00": {name: "Site X", statut: "03", seeAlso: "wikipedia.fr/xxx"},
		"01": {name: "Site Y", statut: "03", seeAlso: "dbpedia.fr/yyyy"},
	};

	var stringSchema = {
		uri: 'js.org/type/string', // cela serait mappé vers une implémentation chargée en amd
		comment: {fr: "Chaine de caractères"},
		type: 'string',

	};
	var internationalLabelSchema = {
		uri: 'kaes.fr/schema/internationalLabel',
		comment: {fr: "Libellé dans différente langue"},
		type: 'object',
		patternProperties: {
			'xx': stringSchema, // une instance de internationalLabelSchema doit être un objet avec des noms de propriétés à 2 lettres et des valeurs de type 'string'
		},
	};


	var data = {
		acuicite: {
			schema: schemasData,
			site: sitesData,
			statut: statutData,
		},
		kaes: {
			schema: {
				internationalLabel: internationalLabelSchema,
			}
		},
	};



	var siteType = typeManager.getBy('uri', 'acuicite.com/schema/site');
	siteType.pull();


	var stringType = new ObservableObject({
		comment: {fr: "Chaine de caractères native JS sans restriction"},
		typeof: 'string',
	});

	var internationalLabelType = new ObservableObject({
		comment: {fr: "Chaine de caractères native JS sans restriction traduite dans plusieurs langues"},
		typeof: 'object',
		properties: new ObservableObject({
			fr: new ObservableObject({
				label: {fr: 'Traduction française', en: 'French translation'},
				required: false,
				type: stringType,
			}),
			en: new ObservableObject({
				label: {fr: 'Traduction anglaise', en: "English translation"},
				required: false,
				type: stringType,
			}),
		}),
	});

	var statutType = new ObservableObject({
		comment: {fr: "Un statut possible pour un site au sens acuicité"},
		typeof: 'object', // c'est son type literal, que l'on peut vérifier avec typeof
		properties: new ObservableObject({
			label: new ObservableObject({
				label: 'Libellé du statut',
				required: true,
				type: internationalLabelType,
			}),
		}),
	});


	var siteType = new ObservableObject({
		comment: {fr: "Un site au sens acuicité"},
		typeof: 'object', // c'est son type literal, que l'on peut vérifier avec typeof
		properties: new ObservableObject({
			name: new ObservableObject({
				label: 'Nom du site',
				required: true,
				type: stringType,
			}),
			label: new ObservableObject({
				label: 'Libellé du site',
				required: false,
				type: internationalLabelType,
			}),
			statut: new ObservableObject({
				label: 'Statut du site',
				required: true,
				type: stringType,
			}),
		}),
		links: new ObservableObject({
			statut: new ObservableObject({
				label: 'Statut du site',
				required: true,
				type: statutType,
			}),
		}),
	});

	var rootManager = {
		get: function(uri){
			var firstSegment = uri.split('/')[0];
			var restPath = uri.split('/').pop().join('/');
			if (firstSegment === "acuicite"){
				return acuiciteManager.get(restPath);
			}
		},
	};

	var acuiciteManager = {
		cache: {},
		get: function(uri){
			var model = uri.split('/')[0];
			if (this.cache[model])
			return this.deserialise(dataSource[model]);
		},
		// dans le cas d'acuicite, le manager
		deserialise: function(rawData) {

		},
	};
});
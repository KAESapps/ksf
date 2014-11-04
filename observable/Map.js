define([
	'../utils/compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	// s'occupe uniquement du mapping clé/valeur mais sans s'occuper de la notion d'ajout ou de suppression de clé. En fait, toutes les clés existent théoriquement et pointent vers la valeur undefined par défaut jusq'à ce qu'on les fasse pointer vers autre chose.
	// Dans une implémentation stricte, il ne serait pas possible d'itérer sur les clés non null (ce qui permettrait d'utiliser un WeakMap comme structure de sockage)
	return compose(_Evented, function(initValue) {
		this._storage = initValue || {};
	}, {
		// @param change objet de la forme {key1: value1, key2: value2, ...}
		change: function(change) {
			var storage = this._storage;
			Object.keys(change).forEach(function(key) {
				var newKeyValue = change[key];
				if (newKeyValue === undefined) {
					delete storage[key];
				} else {
					storage[key] = newKeyValue;
				}
			});
			this._emit('change', change);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
		valueOfKey: function(key) {
			return this._storage[key];
		},
		// permet de récupérer la liste des valeurs non null en mode getter
		// permet également de réinitialiser les valeurs en mode setter, en passant à null toutes les clés a qui on n'affecte pas une valeur
		// ça serait surement à sortir d'une implémentation un peu stricte qui voudrait utiliser un WeakMap
		value: function(value) {
			if (arguments.length) {
				var change = value; // TODO: faire un clone pour plus de sécurité
				Object.keys(this._storage).forEach(function(key) {
					if (!(key in value)) {
						change[key] = undefined;
					}
				}, this);
				this.change(change);
				return this;
			}
			return this._storage;
		},
	});

});
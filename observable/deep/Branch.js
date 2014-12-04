define([
	'../../utils/compose',
	'../../base/_Evented',
], function(
	compose,
	_Evented
) {
	function firstPathSegment (path) {
		var slashIndex = path.indexOf('/');
		return slashIndex < 0 ? path : path.substring(0, slashIndex);
	}

	return compose(_Evented, function(source, key) {
		var self = this;
		this._source = source;
		this._key = key;

		var values = this._values = {};
		var keyLength = key.length;
		var sourceValue = source.value();
		Object.keys(sourceValue).forEach(function(sourceKey) {
			if (firstPathSegment(sourceKey) === key) {
				var relativeKey = sourceKey.substr(keyLength+1);
				values[relativeKey] = sourceValue[sourceKey];
			}
		});

		source.onChange(function(change) {
			if (firstPathSegment(change.key) === key) {
				var relativeKey = change.key.substr(keyLength+1);

				if (change.value === undefined) {
					// dans le cas d'une suppression, si après la suppression dans le cache, il n'y a plus de clé qui commence par le premier segment, on émet 'keyRemoved'
					delete values[relativeKey];
					if (!self.hasKey(firstPathSegment(relativeKey))) {
						self._emit('keyRemoved', firstPathSegment(relativeKey));
					}
				} else {
					// dans le cas de l'ajout/update, si avant la mise à jour du cache, il n'y a pas encore de clé qui commence par le premier segment, on émet 'keyAdded'
					if (!self.hasKey(firstPathSegment(relativeKey))) {
						values[relativeKey] = change.value;
						self._emit('keyAdded', firstPathSegment(relativeKey));
					} else {
						values[relativeKey] = change.value;
					}
				}

				self._emit('change', {
					key: relativeKey,
					value: change.value,
				});
			}
		});
	}, {
		hasKey: function(key) {
			return Object.keys(this._values).some(function(valueKey) {
				return firstPathSegment(valueKey) === key;
			});
		},
		// retourne la liste dédoublonnée du premier niveau de chaque clé
		keys: function() {
			return Object.keys(this._values).reduce(function(acc, path) {
				var child = firstPathSegment(path);
				if (! (child in acc)) {
					acc[child] = true;
				}
				return acc;
			}, {});
		},
		change: function(key, value) {
			return this._source.change(this._key + '/' + key, value);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
		onKeyAdded: function(cb) {
			// appeler le cb dès qu'une clé est ajoutée (passe à non null)
			return this._on('keyAdded', cb);
		},
		onKeyRemoved: function(cb) {
			// appeler le cb dès qu'une clé est enlevée (passe à null)
			return this._on('keyRemoved', cb);
		},
		value: function() {
			return this._values;
		},
		addKey: function(key) {
			// ajoute au moins une entrée qui permet d'être sûr que la clé est créée. Par défaut, c'est la valeur 'null'
			key = key || (Math.random()*1e16).toFixed();
			this.change(key, null);
			return key;
		},
		removeKey: function(key) {
			// supprime toutes les clés qui ont comme premier segment 'key', pour être sûr que ça déclenche l'événement 'keyRemoved'
			var self = this;
			Object.keys(this._values).forEach(function(path) {
				if (firstPathSegment(path) === key) {
					self.change(path, undefined);
				}
			});
		},
	});

});
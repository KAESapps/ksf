define([
	'compose',
	'ksf/base/_Evented',
], function(
	compose,
	_Evented
){
	/**
		Maintien un cache mémoire du storage via l'observation de ses changements
		Ne supporte pas de mettre à null un noeud, il faut toujours mettre à null toutes les feuilles pour que le noeud soit supprimé. Si besoin, cette logique doit être réalisée par un accesseur de plus haut niveau.
	*/
	var Cache = compose(_Evented, function(storage) {
		this._storage = storage;
		this._init();
	}, {
		_init: function() {
			var self = this;
			var storage = this._storage;
			this._value = {};
			this.ready = storage.getAll().then(function(tupples) {
				// initialise le cache avec les valeurs du storage
				tupples.forEach(self._updateCache, self);
				// observe le storage pour maintenir le cache à jour
				storage.onChange(function(tupple) {
					self._updateCache(tupple);
					self._emit('change', tupple);
				});
			});
		},
		value: function() {
			return this._value;
		},
		// met à jour le cache à partir d'un événement issu du store de la forme ['foo', 'bar', true]
		// où le dernier argument est la valeur à stocker et les arguments précédents le chemin où la stocker
		// si la valeur est 'null' on peut supprimer le noeud
		_updateCache: function(tupple) {
			var node, key, i;
			var length = tupple.length;
			var value = tupple[length-1];
			// cas de la supression
			if (value === null) {
				node = this._value;
				var nodes = [this._value];
				// on parcours le chemin et on stocke les noeuds
				for (i = 0; i < length-2; i++) {
					key = tupple[i];
					node = node[key];
					nodes.push(node);
				}
				delete node[tupple[length-2]];
				// on remonte le chemin et si on trouve un noeud qui n'a aucun enfant, on le supprime
				for (i = length-3; i >=0 ; i--) {
					node = nodes[i];
					key = tupple[i];
					if (Object.keys(node[key]).length === 0) {
						delete node[key];
					}
				}
			} else {
			// cas de la création/modification
				node = this._value;
				key = tupple[0];
				// on suite le chemin
				// on crée en cascade les noeuds si besoin
				for (i = 0; i < length-2; i++) {
					if(!(key in node)) {
						node[key] = {};
					}
					node = node[key];
					key = tupple[i+1];
				}
				node[key] = value;
			}
		},
		change: function(tupple) {
			return this._storage.change(tupple);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
	});
	return Cache;
});
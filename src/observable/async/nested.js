define([
	'intern!object',
	'intern/chai!assert',
	'compose',
	'ksf/base/_Evented',
	'../../storage/PouchDb',
], function(
	registerSuite,
	assert,
	compose,
	_Evented,
	PouchDb
){
	/**
		Transforme des changements de la forme 'tupple' en key/value et inversement pour les notifications
	*/
	var TuppleStorage = compose(function(storage) {
		this._storage = storage;
	}, {
		change: function(change) {
			var length = change.length;
			var value = change[length-1];
			var path = change[0];
			for (var i = 1; i < length-1; i++) {
				path = path + '/' + change[i];
			}
			return this._storage.set(path, value);
		},
		onChange: function(cb) {
			return this._storage.onChange(function(change) {
				var key = change[0];
				var value = change[1];
				var tupple = key.split('/');
				tupple.push(value);
				cb(tupple);
			});
		},
		getAll: function() {
			return this._storage.getAll().then(function(values) {
				return Object.keys(values).map(function(key) {
					var value = values[key];
					var tupple = key.split('/');
					tupple.push(value);
					return tupple;
				});
			});
		},
	});


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


	var db, tuppleStore, store;
	registerSuite({
		setup: function() {
			return new PouchDb('nested').destroy().then(function() {
				db = window.db = new PouchDb('nested');
				tuppleStore = new TuppleStorage(db);
				store = new Cache(tuppleStore);
				return store.ready;
			});

		},
		'first value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['syv', "Sylvain"]);
				assert.deepEqual(store.value(), {'syv': "Sylvain"});
			}));
			store.change(['syv', "Sylvain"]);
		},
		'add second value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['ket', "Quentin"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain",
					'ket': "Quentin",
				});
			}));
			store.change(['ket', "Quentin"]);
		},
		'add nested value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['ant', 'name', "Antonin"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin",
					}
				});
			}));
			store.change(['ant', 'name', "Antonin"]);
		},
		'change value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['syv', "Sylvain Vuilliot"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin",
					}
				});
			}));
			store.change(['syv', "Sylvain Vuilliot"]);
		},
		'change deep value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['ant', 'name', "Antonin Vuilliot"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'ant': {
						'name': "Antonin Vuilliot",
					}
				});
			}));
			store.change(['ant', 'name', "Antonin Vuilliot"]);
		},
		'remove deep value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['ant', 'name', null]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
				});
			}));
			store.change(['ant', 'name', null]);
		},
		'create very deep value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['aur', 'address', 'city', 'postalCode', "94600"]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
					'aur': {
						'address': {
							'city': {
								'postalCode': "94600",
							}
						}
					}
				});
			}));
			store.change(['aur', 'address', 'city', 'postalCode', "94600"]);
		},
		'remove very deep value': function() {
			var dfd = this.async();
			store.onChange(dfd.callback(function(change) {
				assert.deepEqual(change, ['aur', 'address', 'city', 'postalCode', null]);
				assert.deepEqual(store.value(), {
					'syv': "Sylvain Vuilliot",
					'ket': "Quentin",
				});
			}));
			store.change(['aur', 'address', 'city', 'postalCode', null]);
		},
	});
});
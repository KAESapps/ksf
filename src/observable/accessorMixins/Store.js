define([
	'compose',
	'lodash/objects/mapValues',
	'lodash/objects/clone',
	'ksf/utils/csv',
], function(
	compose,
	mapValues,
	clone,
	convert2csv
){
	var StoreMutationAPI = {
		add: function(value, key) {
			var changeArg = {};
			changeArg[key] = {add: value};
			var changes = this._change(changeArg);
			return Object.keys(changes)[0];
		},
		remove: function(key) {
			var changeArg = {};
			changeArg[key] = {remove: true};
			return this._change(changeArg)[key];
		},
		onChange: function(cb) {
			return this._onChange(cb);
		},
	};

	// méthodes de création d'accesseur
	var StoreAccessorsAPI = {
		item: function(key) {
			return this._item(key);
		},
		filter: function(filterFn) {
			return new FilterAccessor(this, filterFn);
		},
		sub: function(prop, value) {
			return new SubStoreAccessor(this, prop, value);
		},
		sort: function(sortFn) {
			return new SortedAccessor(this, sortFn);
		},
		count: function() {
			return new CountAccessor(this);
		},
		reduce: function(reduceFn, initialValue) {
			return new ReduceAccessor(this, reduceFn, initialValue);
		},
		partial: function(props) {
			return new PartialAccessor(this, props);
		},
		withComputedProperty: function(prop, deps, computeFn) {
			return new WithComputedPropertyAccessor(this, prop, deps, computeFn);
		},
		sum: function(prop) {
			return new SumAccessor(this, prop);
		},
		prop: function(prop) {
			return new (this._getPropAccessorFactory(prop))(this);
		},
		csv: function(columnsConfig) {
			var storeValue = this._getValue();
			return convert2csv(Object.keys(storeValue).map(function(key) {
				var itemValue = clone(storeValue[key]);
				itemValue.id = key;
				return itemValue;
			}), columnsConfig);
		},
		onChange: function(cb) {
			return this._onChange(cb);
		},
	};

	/**
		Un itemAccessor permet d'accéder à la valeur d'un élément du store par id.
		Potentiellement, on peut demander un itemAccessor pour un élément qui n'existe pas (son id n'est pas connu dans le store). Son _getValue renvoi alors 'undefined', c'est à dire qu'il ne répond pas (il pourrait même déclencher une erreur). Il pourrait avoir une méthode 'exists' qui permet de savoir s'il existe avant d'appeler '_getValue'.
		C'est pourquoi, sur 'onChange', on récupère uniquement les changements de valeurs et pas l'événement de destruction. Il faut s'abonner à 'onDelete' pour savoir que l'élément a été supprimé sur le store, que 'exists()' va renvoyer 'faux' et qu'il ne faut pas appeler '_getValue' et qu'on ne peut pas appeler '_change' non plus
	*/
	var ItemAccessor = compose(function(source, key) {
		this._source = source;
		this._key = key;
	}, {
		_exists: function() {
			return this._key in this._source._getValue();
		},
		_getValue: function() {
			return this._source._getValue()[this._key];
		},

		_change: function(changeArg) {
			var sourceChangeArg = {};
			sourceChangeArg[this._key] = { change: changeArg };
			return this._source._change(sourceChangeArg)[this._key].change;
		},
		_onChange: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				var itemChange = sourceChanges[key];
				if (itemChange && itemChange.change) {
					cb(itemChange.change);
				}
			});
		},
		'delete': function() {
			return this._source.remove(this._key);
		},
		// la méthode 'create' n'est pas très utile, mais c'est pour montrer le parallèle avec 'delete' qui en sont en fait que des redirections vers 'add' et 'remove' de la source.
		create: function() {
			return this._source.add(this._key);
		},
		onDelete: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				var itemChange = sourceChanges[key];
				if (itemChange && itemChange.remove) {
					cb();
				}
			});
		},
	});

	// TODO: à découper
	var AccessorBase = {
		_item: function(key) {
			return this._source._item(key);
		},
		onChange: function(cb) {
			return this._onChange(cb);
		},
		count: function() {
			return new CountAccessor(this);
		},
	};

	var FilterAccessor = compose(AccessorBase, StoreAccessorsAPI, function(source, filterFn) {
		this._source = source;
		this._filterFn = filterFn;
	},
	// as store source mixin
	{
		_getValue: function() {
			var self = this,
				value = this._source._getValue();
			var ret = {};
			Object.keys(value).forEach(function(key) {
				var item = value[key];
				if (self._filterFn(item, key)) {
					ret[key] = item;
				}
			});
			return ret;
		},
		_computeChanges: function(changes) {
			// TODO: filtrer les changes, ne rien retourner s'il n'y a pas de changes qui passent le filtre
			return changes;
		},
		_onChange: function(cb) {
			var self = this;
			return this._source._onChange(function(sourceChanges) {
				var changes = self._computeChanges(sourceChanges);
				if (changes) {
					cb(changes);
				}
			});
		},
		_getPropAccessorFactory: function(prop) {
			return this._source._getPropAccessorFactories(prop);
		},
		item: function(key) {
			return this._item(key);
		},
	});

	var SubStoreAccessor = compose(FilterAccessor, function(source, prop, value) {
		this._filterProp = prop;
		this._filterValue = value;
		this._filterFn = function(itemValue) {
			return itemValue[prop] === value;
		};
	}, {
		add: function(value, key) {
			value = value || {};
			value[this._filterProp] = this._filterValue;
			var changeArg = {};
			changeArg[key] = {add: value};
			var changes = this._source._change(changeArg);
			return Object.keys(changes)[0];
		},
	});

	var SortedAccessor = compose(AccessorBase, function(source, compareFn) {
		this._source = source;
		this._compareFn = compareFn;
	}, {
		_getValue: function() {
			var source = this._source._getValue();
			var compareFn = this._compareFn;
			return Object.keys(source).sort(function(key1, key2) {
				return compareFn(source[key1], source[key2]);
			});
		},
		value: function() {
			return this._getValue();
		},
		item: function(key) {
			return this._item(key);
		},
		items: function() {
			return this._getValue().map(function(key) {
				return this._item(key);
			}, this);
		},
		_computeDiff: function(initial, target) {
			var ret = [],
				initialCopy = initial.slice();
			initial.forEach(function(item){
				if (target.indexOf(item) < 0) {
					var index = initialCopy.indexOf(item);
					ret.push({
						type: 'remove',
						index: index
					});
					initialCopy.splice(index, 1);
				}
			});
			// insert new components and move current components
			target.forEach(function(key, index) {
				var currentItem = initialCopy[index];

				if (currentItem !== key) {
					var initialIndex = initialCopy.indexOf(key);
					if (initialIndex < 0) {
						ret.push({
							type: 'add',
							index: index,
							value: key
						});
						initialCopy.splice(index, 0, key);
					} else {
						ret.push({
							type: 'move',
							from: initialIndex,
							to: index
						});
						initialCopy.splice(initialIndex, 1);
						initialCopy.splice(index, 0, key);
					}
				}
			});
			return ret;
		},
		_onChange: function(listener) {
			var self = this;
			var oldValue = this._getValue();
			return this._source._onChange(function() {
				var newValue = self._getValue();
				var changes = self._computeDiff(oldValue, newValue);
				changes.length && listener(changes);
				oldValue = newValue;
			});
		},
		onItemChanges: function(cb) {
			var self = this;
			return this._onChange(function(changes) {
				cb(changes.map(function(change) {
					if (change.type === 'add') {
						return {
							type: 'add',
							index: change.index,
							item: self._item(change.value),
						};
					}
					return change;
				}));
			});
		},
		range: function(from, to) {
			return new RangeAccessor(this, { from: from, to: to});
		},

	});

	var RangeAccessor = compose(AccessorBase, function(source, bounds) {
		this._source = source;
		this._bounds = bounds;
	}, {
		_getValue: function() {
			var self = this,
				value = this._source._getValue();
			return value.slice(self._bounds.from, self._bounds.to);
		},
		_computeDiff: SortedAccessor.prototype._computeDiff,
		_onChange: SortedAccessor.prototype._onChange,
		onItemChanges: SortedAccessor.prototype.onItemChanges,
		items: SortedAccessor.prototype.items,
	}, {
	});

	var CountAccessor = compose(function(source) {
		this._source = source;
	}, {
		_getValue: function() {
			var parentValue = this._source._getValue();
			return Object.keys(parentValue).length;
		},
		onValue: function(cb) {
			var self = this;
			return this._source._onChange(function() {
				cb(self._getValue());
			});
		},
		value: function() {
			return this._getValue();
		},

	});

	var ReduceAccessor = compose(function(source, reduceFn, initialValue) {
		this._source = source;
		this._reduceFn = reduceFn;
		this._initialValue = initialValue;
	}, {
		_getValue: function() {
			var parentValue = this._source._getValue();
			return this._computeValue(parentValue);
		},
		onValue: function(cb) {
			var self = this;
			return this._source.onValue(function(value) {
				cb(self._computeValue(value));
			});
		},
		value: function() {
			return this._getValue();
		},
		_computeValue: function(sourceValue) {
			var reduceFn = this._reduceFn;
			return Object.keys(sourceValue).reduce(function(accumulator, key) {
				var item = sourceValue[key];
				return reduceFn(accumulator, item, key);
			}, this._initialValue);
		},
	});

	var PartialAccessor = compose(function(source, props) {
		this._source = source;
		this._props = props;
	}, {
		_getValue: function() {
			var parentValue = this._source._getValue();
			var props = this._props;
			return Object.keys(parentValue).map(function(key) {
				var item = parentValue[key];
				return props.map(function(prop) {
					return item[prop];
				});
			});
		},
		onValue: function(cb) {
			var props = this._props;
			var self = this;
			return this._source._onChange(function(changes) {
				console.time('computing needs pulse');
				if (Object.keys(changes).some(function(key) {
					var change = changes[key];
					if (! ('change' in change)) {
						return false;
					}
					return Object.keys(change.change).some(function(prop) {
						return props.indexOf(prop) >= 0;
					});
				})) {
					console.timeEnd('computing needs pulse');

					console.time('computing value');
					cb(self._getValue());
					console.timeEnd('computing value');
				}
			});
		},
		value: function() {
			return this._getValue();
		},
		reduce: function(reduceFn, initialValue) {
			return new ReduceAccessor(this, reduceFn, initialValue);
		},
	});

	var get = function(value) {
		return function(prop) {
			return value[prop];
		};
	};

	var WithComputedPropertyAccessor = compose(StoreAccessorsAPI, function(source, prop, deps, computeFn) {
		this._source = source;
		this._prop = prop;
		this._deps = deps;
		this._computeFn = computeFn;
	}, {
		_getValue: function() {
			var prop = this._prop;
			var deps = this._deps;
			var computeFn = this._computeFn;
			return mapValues(this._source._getValue(), function(itemValue) {
				var ret = clone(itemValue);
				ret[prop] = computeFn.apply(null, deps.map(get(itemValue)));
				return ret;
			});
		},
		value: function() {
			return this._getValue();
		},
		_onChange: function(cb) {
			var prop = this._prop;
			var deps = this._deps;
			var computeFn = this._computeFn;
			var source = this._source;
			var sourceValue;
			return this._source._onChange(function(changes) {
				cb(mapValues(changes, function(change, itemKey) {
					if (change.add) {
						var value = clone(change.add);
						value[prop] = computeFn.apply(null, deps.map(get(change.add)));
						return { add: value };
					}
					if (change.remove) {
						return { remove: change.remove };
					}
					if (change.change) {
						if (Object.keys(change.change).some(function(changedKey) {
							return deps.indexOf(changedKey) >= 0;
						})) {
							var retChange = clone(change.change);
							retChange[prop] = computeFn.apply(null, deps.map(function(depProp) {
								if (depProp in retChange) {
									return retChange[depProp];
								} else {
									sourceValue = sourceValue || source._getValue();
									return sourceValue[itemKey][depProp];
								}
							}));
							return {change: retChange};
						} else {
							// rien à faire
							return {change: change.change};
						}
					}
				}));
			});
		},
	});

	var SumAccessor = compose(function(source, prop) {
		this._source = source;
		this._prop = prop;
	}, {
		value: function() {
			var sourceValue = this._source.value();
			var prop = this._prop;
			return Object.keys(sourceValue).reduce(function(acc, itemKey) {
				return acc + sourceValue[itemKey][prop];
			}, 0);
		},
		_onChange: function(cb) {
			var prop = this._prop;
			return this._source._onChange(function(changes) {
				if (Object.keys(changes).some(function(itemKey) {
					var change = changes[itemKey];
					if (change.add || change.remove) {
						return true;
					}
					if (change.change) {
						return prop in change.change;
					}
				})) {
					cb(); // quelle valeur faudrait-il envoyer ? le delta de somme surement
				}
			});
		},
		onValue: function(cb) {
			var self = this;
			return this._onChange(function() {
				cb(self.value());
			});
		},
	});

	var Store = compose(function(itemAPI, propAccessorFactories) {
		this.ctr = compose(StoreAccessorsAPI, StoreMutationAPI, {
			_itemAccessorFactory: compose(itemAPI, ItemAccessor),
			_item: function(key) {
				return new this._itemAccessorFactory(this, key);
			},
			_getPropAccessorFactory: function(prop) {
				return this._propAccessorFactories[prop];
			},
			_propAccessorFactories: propAccessorFactories,
		});
	});
	return Store;
});
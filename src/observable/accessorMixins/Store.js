define([
	'compose',
], function(
	compose
){
	var StoreMutationAPI = {
		add: function(value, key) {
			var changeArg = {};
			changeArg[key] = {add: value};
			return this._change(changeArg);
		},
		remove: function(key) {
			var changeArg = {};
			changeArg[key] = {remove: true};
			return this._change(changeArg);
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
		sort: function(sortFn) {
			return new SortedAccessor(this, sortFn);
		},
		count: function() {
			return new CountAccessor(this);
		},
	};

	var ItemAccessor = compose(function(source, key) {
		this._source = source;
		this._key = key;
	}, {
		_getValue: function() {
			return this._source._getValue()[this._key];
		},
		_change: function(changeArg) {
			var sourceChangeArg = {};
			sourceChangeArg[this._key] = { change: changeArg };
			this._source._change(sourceChangeArg);
		},
		_onChange: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				var itemChange = sourceChanges[key];
				if (itemChange) {
					cb(itemChange.change);
				}
			});
		},
	});

	// TODO: à découper
	var AccessorBase = {
		_item: function(key) {
			return this._source._item(key);
		},
		onValue: function(cb) {
			var self = this;
			return this._onChange(function() {
				cb(self._getValue());
			});
		},
		count: function() {
			return new CountAccessor(this);
		},
	};

	var FilterAccessor = compose(AccessorBase, function(source, filterFn) {
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
				if (self._filterFn(item)) {
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
		_item: function(key) {
			return this._source._item(key);
		},
	},
	// as filter accessor mixin
	{
		sort: function(sortFn) {
			return new SortedAccessor(this, sortFn);
		},
		onChanges: function(cb) {
			return this._onChange(cb);
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
			var self = this;
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


	var Store = compose(function(itemAPI) {
		this.ctr = compose(StoreAccessorsAPI, StoreMutationAPI, {
			_itemAccessorFactory: compose(itemAPI, ItemAccessor),
			_item: function(key) {
				return new this._itemAccessorFactory(this, key);
			},
		});
	});
	return Store;
});
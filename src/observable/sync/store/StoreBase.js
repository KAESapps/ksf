define([
	'compose',
	'lodash/objects/clone',
	'lodash/collections/filter',
	'../CompositeStateful',
	'../../computers/propertyObject/Computer',
	'../propertyObject/CompositePropertyAccessor',
	'../propertyObject/_WithPropertyAccessors'
], function(
	compose,
	clone,
	filter,
	CompositeStateful,
	PropertyObjectComputer,
	CompositePropertyAccessor,
	_WithPropertyAccessors
){
	var StoreComputer = compose(function(itemComputer) {
		this._itemComputer = itemComputer;
	}, {
		computeChangesFromSet: function(arg, initValue) {
			arg = arg || {};
			initValue = initValue || {};

			var changes = [],
				self = this;
			
			Object.keys(arg).forEach(function(propId) {
				var propComputer = self._getPropertyComputer(propId),
					propValue;
				if (propComputer.computeChangesFromSet) {
					changes.push({
						type: 'patched',
						key: propId,
						arg: propComputer.computeChangesFromSet(arg[propId], initValue[propId])
					});
				} else {
					changes.push({
						type: 'set',
						key: propId,
						value: propComputer.computeValueFromSet(arg[propId], initValue[propId])
					});
				}
			});
			return this.computeChangesFromPatch(changes, initValue);
		},
		computeChangesFromPatch: function(propChanges, initValue) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			propChanges.forEach(function(change) {
				var propComputer = this._getPropertyComputer(change.key);
				if (change.type === 'patched') {
					change.arg = propComputer.computeChangesFromPatch(change.arg, initValue[change.key]);
				} else if (change.type === 'set') {
					change.value = propComputer.computeValueFromSet(change.value, initValue[change.key]);
				} else if (change.type === 'added') {
					change.value = propComputer.computeValueFromSet(change.value, initValue[change.key]);
				}
			}.bind(this));
			return propChanges;
		},
		computeValueFromChanges: function(propChanges, initValue) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			var newValue = clone(initValue);
			propChanges.forEach(function(change) {
				var propValue;
				if (change.type === 'removed') {
					delete newValue[change.key];
				} else {
					if (change.type === 'patched') {
						var propComputer = this._getPropertyComputer(change.key);
						propValue = propComputer.computeValueFromChanges(change.arg, initValue[change.key]);
					} else if (change.type === 'set') {
						propValue = change.value;
					} else if (change.type === 'added') {
						propValue = change.value;
					}
					newValue[change.key] = propValue;
				}
			}.bind(this));
			return newValue;
		},

		computeValueFromSet: function(arg, initValue) {
			return this.computeValueFromChanges(this.computeChangesFromSet(arg, initValue), initValue);
		},

		_getPropertyComputer: function(propId) {
			return this._itemComputer;
		}
	});

	var FilterAccessor = function(source, filterFn) {
		this._source = source;
		this._filterFn = filterFn;
	};
	FilterAccessor.prototype = {
		get: function() {
			var self = this,
				value = this._source.get();
			var ret = {};
			Object.keys(value).forEach(function(key) {
				var item = value[key];
				if (self._filterFn(item)) {
					ret[key] = item;
				}
			});
			return ret;
		},
		sort: function(sortFn) {
			return new SortedAccessor(this, sortFn);
		},
		onValue: function(cb) {
			var self = this;
			return this._source.onValue(function() {
				cb(self.getValue());
			});
		},
		getItemByKey: function(key) {
			return this._source.getItemByKey(key);
		},
		getKeys: function() {
			return Object.keys(this.getValue());
		},
	};

	var SortedAccessor = function(source, sortFn) {
		this._source = source;
		this._sortFn = sortFn;
	};
	SortedAccessor.prototype = {
		get: function() {
			var self = this,
				value = this._source.get();

			var ret = Object.keys(value).map(function(key) {
				return value[key];
			});
			ret.sort(self._sortFn);
			return ret;
		},
		getKeys: function() {
			var self = this,
				value = this._source.get();

			var ret = Object.keys(value).map(function(key) {
				return { key: key, value: value[key] };
			});
			ret.sort(function(a, b) {
				return self._sortFn(a.value, b.value);
			});
			return ret.map(function(keyValue) {
				return keyValue.key;
			});
		},
		add: function(value, key) {
			return this._source.add(value, key);
		},
		remove: function(key) {
			return this._source.remove(key);
		},
		getItemByKey: function(key) {
			return this._source.getItemByKey(key);
		},
		range: function(from, to) {
			return new RangeAccessor(this, { from: from, to: to});
		},
		_onValue: function(listener) {
			var self = this;
			return this._source.on('value', function() {
				listener(self.get());
			});
		},
		_onKeys: function(listener) {
			var self = this;
			return this._source.on('value', function() {
				listener(self.getKeys());
			});
		},
		on: function(event, listener) {
			if (event === 'value') {
				return this._onValue(listener);
			}
			if (event === 'keys') {
				return this._onKeys(listener);
			}
		}
	};

	var RangeAccessor = function(source, bounds) {
		this._source = source;
		this._bounds = bounds;
	};
	RangeAccessor.prototype = {
		getKeys: function() {
			var self = this,
				value = this._source.getKeys();
			return value.slice(self._bounds.from, self._bounds.to);
		},
		get: function() {
			var self = this,
				value = this._source.get();
			return value.slice(self._bounds.from, self._bounds.to);
		},
		getItemByKey: function(key) {
			return this._source.getItemByKey(key);
		},
		onValue: function(cb) {
			var self = this;
			return this._source.onValue(function() {
				cb(self.getValue());
			});
		},
	};

	var Store = function(itemComputer, itemAccessorFactory) {
		CompositeStateful.call(this, new StoreComputer(
			itemComputer
		));
		this._itemAccessorFactory = itemAccessorFactory;
	};
	Store.prototype = Object.create(CompositeStateful.prototype);
	Store.prototype.getItemByKey = function(key) {
		return new this._itemAccessorFactory(this, key);
	};
	Store.prototype.add = function(value, key) {
		return this.patchValue([{
			type: 'added',
			key: key,
			value: value
		}]);
	};
	Store.prototype.remove = function(key) {
		return this.patchValue([{
			type: 'removed',
			key: key
		}]);
	};
	Store.prototype.filter = function(filterFn) {
		return new FilterAccessor(this, filterFn);
	};
	Store.prototype.sort = function(sortFn) {
		return new SortedAccessor(this, sortFn);
	};
	Store.prototype.getKeys = function() {
		return Object.keys(this.getValue());
	};
	return Store;
});
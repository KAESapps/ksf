define([
	'compose',
	'lodash/objects/clone',
	'lodash/collections/filter',
	'../MemoryValueSource',
	'../ValueSourceCompositeAccessor',
	'../propertyObject/Computer',
	'../propertyObject/_WithComputedProperties',
	'../propertyObject/CompositePropertyAccessor',
	'../propertyObject/_WithPropertyAccessors'
], function(
	compose,
	clone,
	filter,
	ValueSource,
	ValueSourceCompositeAccessor,
	PropertyObjectComputer,
	_WithComputedProperties,
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
				if (change.type === 'patched') {
					var propComputer = this._getPropertyComputer(change.key);
					propValue = propComputer.computeValueFromChanges(change.arg, initValue[change.key]);
				} else if (change.type === 'set') {
					propValue = change.value;
				} else if (change.type === 'added') {
					propValue = change.value;
				}
				newValue[change.key] = propValue;
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
		getValue: function() {
			var self = this;
			return this._source.getValue().then(function(value) {
				var ret = {};
				Object.keys(value).forEach(function(key) {
					var item = value[key];
					if (self._filterFn(item)) {
						ret[key] = item;
					}
				});
				return ret;
			});
		}
	};

	var SortedAccessor = function(source, sortFn) {
		this._source = source;
		this._sortFn = sortFn;
	};
	SortedAccessor.prototype = {
		getValue: function() {
			var self = this;
			return this._source.getValue().then(function(value) {
				var ret = Object.keys(value).map(function(key) {
					return value[key];
				});
				ret.sort(self._sortFn);
				return ret;
			});
		},
		getKeys: function() {
			var self = this;
			return this._source.getValue().then(function(value) {
				var ret = Object.keys(value).map(function(key) {
					return { key: key, value: value[key] };
				});
				ret.sort(function(a, b) {
					return self._sortFn(a.value, b.value);
				});
				return ret.map(function(keyValue) {
					return keyValue.key;
				});
			});
		},
		add: function(value, key) {
			return this._source.add(value, key);
		},
		getItemByKey: function(key) {
			return this._source.getItemByKey(key);
		},
		range: function(from, to) {
			return new RangeAccessor(this, { from: from, to: to});
		}
	};

	var RangeAccessor = function(source, bounds) {
		this._source = source;
		this._bounds = bounds;
	};
	RangeAccessor.prototype = {
		getKeys: function() {
			var self = this;
			return this._source.getKeys().then(function(value) {
				return value.slice(self._bounds.from, self._bounds.to);
			});
		},
		getValue: function() {
			var self = this;
			return this._source.getValue().then(function(value) {
				return value.slice(self._bounds.from, self._bounds.to);
			});
		},
		getItemByKey: function(key) {
			return this._source.getItemByKey(key);
		}
	};

	var Store = function(params) {
		var propertyComputers = {},
			accessorFactories = {};
		for (var key in params.properties) {
			propertyComputers[key] = params.properties[key].computer;
			accessorFactories[key] = params.properties[key].accessorFactory;
		}
		ValueSourceCompositeAccessor.call(this, new ValueSource(), new StoreComputer(
			new PropertyObjectComputer(propertyComputers)
		));
		this._itemAccessorFactory = compose(CompositePropertyAccessor, _WithPropertyAccessors, {
			_accessorFactories: accessorFactories
		});
	};
	Store.prototype = Object.create(ValueSourceCompositeAccessor.prototype);
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
	Store.prototype.filter = function(filterFn) {
		return new FilterAccessor(this, filterFn);
	};
	Store.prototype.sort = function(sortFn) {
		return new SortedAccessor(this, sortFn);
	};
	return Store;
});
define([
	'compose',
	'../CompositeStateful',
	'../propertyObject/CompositePropertyAccessor',
	'../propertyObject/_WithPropertyAccessors',
	'./StoreComputer'
], function(
	compose,
	CompositeStateful,
	CompositePropertyAccessor,
	_WithPropertyAccessors,
	StoreComputer
){
	var FilterAccessor = function(source, filterFn) {
		this._source = source;
		this._filterFn = filterFn;
	};
	FilterAccessor.prototype = {
		value: function() {
			var self = this,
				value = this._source.value();
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
		_onValue: function(cb) {
			var self = this;
			return this._source.on('value', function() {
				cb(self.value());
			});
		},
		item: function(key) {
			return this._source.item(key);
		},
		keys: function() {
			return Object.keys(this.value());
		},
		on: function(event, listener) {
			if (event === 'value') {
				return this._onValue(listener);
			}
		}
	};

	var SortedAccessor = function(source, compareFn) {
		this._source = source;
		this._compareFn = compareFn;
	};
	SortedAccessor.prototype = {
		value: function() {
			var self = this,
				value = this._source.value();

			var ret = Object.keys(value).map(function(key) {
				return value[key];
			});
			ret.sort(self._compareFn);
			return ret;
		},
		keys: function() {
			var self = this,
				value = this._source.value();

			var ret = Object.keys(value).map(function(key) {
				return { key: key, value: value[key] };
			});
			ret.sort(function(a, b) {
				return self._compareFn(a.value, b.value);
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
		item: function(key) {
			return this._source.item(key);
		},
		items: function() {
			return this.keys().map(function(key) {
				return this.item(key);
			}, this);
		},
		range: function(from, to) {
			return new RangeAccessor(this, { from: from, to: to});
		},
		_onValue: function(listener) {
			var self = this;
			return this._source.on('value', function() {
				listener(self.value());
			});
		},
		_onKeys: function(listener) {
			var self = this;
			return this._source.on('value', function() {
				listener(self.keys());
			});
		},
		_computeChanges: function(initial, target) {
			// remove domNode of components that are no longer in content
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
							item: self.item(key)
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
		_onItemChanges: function(listener) {
			var self = this;
			var oldValue = this.keys();
			return this.on('keys', function(keys) {
				var newValue = keys;
				listener(self._computeChanges(oldValue, newValue));
				oldValue = newValue;
			});
		},
		on: function(event, listener) {
			if (event === 'value') {
				return this._onValue(listener);
			}
			if (event === 'keys') {
				return this._onKeys(listener);
			}
			if (event === 'changes') {
				return this._onChanges(listener);
			}
			if (event === 'itemChanges') {
				return this._onItemChanges(listener);
			}
		}
	};

	var RangeAccessor = function(source, bounds) {
		this._source = source;
		this._bounds = bounds;
	};
	RangeAccessor.prototype = {
		keys: function() {
			var self = this,
				value = this._source.keys();
			return value.slice(self._bounds.from, self._bounds.to);
		},
		value: function() {
			var self = this,
				value = this._source.value();
			return value.slice(self._bounds.from, self._bounds.to);
		},
		item: function(key) {
			return this._source.item(key);
		},
		_onValue: function(cb) {
			var self = this;
			return this._source.onValue(function() {
				cb(self.value());
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

	var Store = compose(CompositeStateful);
	Store.prototype.item = function(key) {
		return new this._itemAccessorFactory(this, key);
	};
	Store.prototype.add = function(value, key) {
		return this.patch([{
			type: 'added',
			key: key,
			value: value
		}]);
	};
	Store.prototype.remove = function(key) {
		return this.patch([{
			type: 'removed',
			key: key
		}]);
	};
	Store.prototype.filter = function(filterFn) {
		return new FilterAccessor(this, filterFn);
	};
	Store.prototype.sort = function(compareFn) {
		return new SortedAccessor(this, compareFn);
	};
	Store.prototype.keys = function() {
		return Object.keys(this._getValue());
	};
	return Store;
});
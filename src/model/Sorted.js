define([
	'compose',
	'./Store',
], function(
	compose,
	Store
){
	function toLocaleString (s) {
		if (s === undefined) { return ''; }
		if (s === null) { return ''; }
		return s+'';
	}
	function compareFn (a, b) {
		return toLocaleString(a).localeCompare(toLocaleString(b));
	}
	var Sorted = compose(function(store, sortKey, order) {
		this._store = store;
		this._sortKey = sortKey;
		this._sortOrder = order;
	}, {
		value: function() {
			var sortKey = this._sortKey;
			var storeValue = this._store.value();
			return Object.keys(storeValue).sort(function(key1, key2) {
				return compareFn(storeValue[key1][sortKey], storeValue[key2][sortKey]);
			});
		},
		_computeDiff: function(initial, target) {
			var ret = [],
				initialCopy = initial.slice();
			initial.forEach(function(key){
				if (target.indexOf(key) < 0) {
					var index = initialCopy.indexOf(key);
					ret.push({
						type: 'remove',
						index: index,
						value: key,
					});
					initialCopy.splice(index, 1);
				}
			});
			// insert new elements and move current elements
			target.forEach(function(key, index) {
				var currentItem = initialCopy[index];

				if (currentItem !== key) {
					var initialIndex = initialCopy.indexOf(key);
					if (initialIndex < 0) {
						ret.push({
							type: 'add',
							index: index,
							value: key,
							beforeKey: currentItem,
						});
						initialCopy.splice(index, 0, key);
					} else {
						ret.push({
							type: 'move',
							from: initialIndex,
							to: index,
							key: key,
							beforeKey: currentItem,
						});
						initialCopy.splice(initialIndex, 1);
						initialCopy.splice(index, 0, key);
					}
				}
			});
			return ret;
		},
		onChange: function(listener) {
			var sortKey = this._sortKey;
			var self = this;
			var oldValue = this.value();
			var oldLenght = Object.keys(oldValue).length;
			return this._store.onChange(function(change) {
				// évite de recalculer l'ordre de tri à chaque changement, ne le fait que lorsque le nombre d'éléments change (un en plus ou un en moins) et quand un élément change de valeur pour la propriété triée
				var newLength = Object.keys(self._store.value()).length;
				if (change[1] === sortKey || newLength !== oldLenght) {
					var newValue = self.value();
					var changes = self._computeDiff(oldValue, newValue);
					changes.length && listener(changes);
					oldValue = newValue;
					oldLenght = newLength;
				}
			});
		},
		// TODO: à enlever lorsque l'on reverra l'API de ItemList. Cela devrait être fait par le itemFactory.
		item: function(key) {
			return new Store(this._store, key);
		},
	});
	return Sorted;
});
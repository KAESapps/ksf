define([
	'compose',
], function(
	compose
){
	var Filtered = compose(function(store, filterKey, filterValue) {
		this._store = store;
		this._filterKey = filterKey;
		this._filterValue = filterValue;
	}, {
		// retourne la liste des id des éléments qui passent le filtre (et non pas le cache filtré)
		value: function() {
			var filterValue = this._filterValue;
			var filterKey = this._filterKey;
			var storeValue = this._store.value();
			return Object.keys(storeValue).filter(function(key) {
				return storeValue[key][filterKey] === filterValue;
			});
		},
		onChange: function(cb) {
			// TODO: filtrer les changes
			return this._store.onChange(cb);
		},
	});
	return Filtered;
});
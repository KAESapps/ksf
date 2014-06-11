define([
	'compose',
], function(
	compose
){
	var Store = compose(function(store, key) {
		this._store = store;
		this._key = key; // TODO: permettre de donner un path plutôt qu'un seul niveau
	}, {
		value: function() {
			var key = this._key;
			var storeValue = this._store.value();
			return (storeValue && key in storeValue) ? storeValue[key] : null;
		},
		change: function(change) {
			change.unshift(this._key);
			return this._store.change(change);
		},
		onChange: function(cb) {
			var key = this._key;
			return this._store.onChange(function(change) {
				if (change[0] === key) {
					cb(change.slice(1));
				}
			});
		},
	});
	return Store;
});
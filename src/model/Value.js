define([
	'compose',
], function(
	compose
){
	var Value = compose(function(store, key) {
		this._store = store;
		this._key = key; // TODO: permettre de donner un path plutôt qu'un seul niveau
	}, {
		value: function(value) {
			if (arguments.length) {
				return this.change(value);
			}
			var key = this._key;
			var storeValue = this._store.value();
			return (storeValue && key in storeValue) ? storeValue[key] : null;
		},
		change: function(value) {
			return this._store.change([this._key, value]);
		},
		onChange: function(cb) {
			var key = this._key;
			return this._store.onChange(function(change) {
				if (change[0] === key) {
					cb(change[1]);
				}
			});
		},
	});
	return Value;
});
define([
	'compose',
], function(
	compose
){
	var StoreAPI = {
		// méthodes de mutation
		add: function(value, key) {
			var changeArg = {};
			changeArg[key] = {add: value};
			return this._change(changeArg);
		},
		// méthode de créatin d'accesseur
		item: function(key) {
			return new this._itemAccessorFactory(this, key);
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
	});

	var Store = compose(function(itemAPI) {
		this.ctr = compose(StoreAPI, {
			_itemAccessorFactory: compose(itemAPI, ItemAccessor),
		});
	});
	return Store;
});